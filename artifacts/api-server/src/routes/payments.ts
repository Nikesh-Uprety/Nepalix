import { Router, type IRouter, type Response } from "express";
import { z } from "zod";
import {
  db,
  plansTable,
  subscriptionsTable,
  paymentsTable,
  type PlanSlug,
  type Subscription,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import {
  khaltiInitiate,
  khaltiLookup,
  type KhaltiLookupResult,
} from "../lib/khalti.js";
import { esewaInitiate, esewaLookup } from "../lib/esewa.js";

const router: IRouter = Router();

router.use(authMiddleware);

const PLAN_SLUGS: readonly PlanSlug[] = [
  "trial",
  "starter",
  "growth",
  "pro",
  "elite",
] as const;

const providerSchema = z.enum(["khalti", "esewa"]);

const initiateSchema = z.object({
  planSlug: z.enum(PLAN_SLUGS as unknown as [PlanSlug, ...PlanSlug[]]),
  provider: providerSchema,
});

const verifySchema = z
  .object({
    paymentId: z.string().uuid(),
    provider: providerSchema,
    pidx: z.string().optional(),
    transactionUuid: z.string().optional(),
  })
  .refine(
    (v) =>
      (v.provider === "khalti" && !!v.pidx) ||
      (v.provider === "esewa" && !!v.transactionUuid),
    { message: "pidx required for khalti, transactionUuid required for esewa" },
  );

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

router.post("/initiate", async (req: AuthRequest, res: Response) => {
  const parsed = initiateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const { planSlug, provider } = parsed.data;
  const user = req.user!;

  const [plan] = await db
    .select()
    .from(plansTable)
    .where(eq(plansTable.slug, planSlug))
    .limit(1);

  if (!plan || !plan.isActive) {
    res.status(404).json({ error: "Plan not found or inactive" });
    return;
  }

  const [payment] = await db
    .insert(paymentsTable)
    .values({
      userId: user.id,
      planId: plan.id,
      provider,
      amount: plan.yearlyPrice,
      status: "pending",
    })
    .returning();

  const returnUrl = `${FRONTEND_URL}/billing/callback?payment_id=${payment.id}&provider=${provider}`;

  try {
    if (provider === "khalti") {
      const result = await khaltiInitiate({
        amount: plan.yearlyPrice * 100,
        purchaseOrderId: payment.id,
        purchaseOrderName: plan.name,
        returnUrl,
        websiteUrl: FRONTEND_URL,
        customerInfo: {
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
        },
      });

      await db
        .update(paymentsTable)
        .set({ providerTxnId: result.pidx, updatedAt: new Date() })
        .where(eq(paymentsTable.id, payment.id));

      res.json({
        paymentId: payment.id,
        paymentUrl: result.paymentUrl,
        pidx: result.pidx,
      });
      return;
    }

    const result = esewaInitiate({
      amount: plan.yearlyPrice,
      transactionUuid: payment.id,
      successUrl: `${returnUrl}&status=success`,
      failureUrl: `${returnUrl}&status=failed`,
    });

    res.json({
      paymentId: payment.id,
      formUrl: result.formUrl,
      fields: result.fields,
    });
  } catch (err) {
    await db
      .update(paymentsTable)
      .set({
        status: "failed",
        rawResponse: { error: (err as Error).message },
        updatedAt: new Date(),
      })
      .where(eq(paymentsTable.id, payment.id));
    res.status(502).json({ error: (err as Error).message });
  }
});

router.post("/verify", async (req: AuthRequest, res: Response) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const { paymentId, provider, pidx, transactionUuid } = parsed.data;
  const user = req.user!;

  const [payment] = await db
    .select()
    .from(paymentsTable)
    .where(
      and(eq(paymentsTable.id, paymentId), eq(paymentsTable.userId, user.id)),
    )
    .limit(1);

  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  if (payment.status === "verified") {
    const [existing] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, user.id))
      .limit(1);
    res.json({ success: true, subscription: existing ?? null, payment });
    return;
  }

  let success = false;
  let lookupResult: unknown = null;
  let providerTxnId: string | null = null;
  let failureReason = "Verification failed";

  try {
    if (provider === "khalti") {
      if (!pidx) {
        res.status(400).json({ error: "pidx required" });
        return;
      }
      const lookup: KhaltiLookupResult = await khaltiLookup(pidx);
      lookupResult = lookup;
      providerTxnId = lookup.pidx;
      success =
        lookup.status === "Completed" &&
        lookup.totalAmount === payment.amount * 100;
      if (!success) {
        failureReason = `Khalti status=${lookup.status}, amount mismatch or not completed`;
      }
    } else {
      if (!transactionUuid) {
        res.status(400).json({ error: "transactionUuid required" });
        return;
      }
      const lookup = await esewaLookup(transactionUuid, payment.amount);
      lookupResult = lookup;
      providerTxnId = lookup.refId;
      success = lookup.status === "COMPLETE";
      if (!success) {
        failureReason = `eSewa status=${lookup.status}`;
      }
    }
  } catch (err) {
    await db
      .update(paymentsTable)
      .set({
        status: "failed",
        rawResponse: { error: (err as Error).message },
        updatedAt: new Date(),
      })
      .where(eq(paymentsTable.id, payment.id));
    res.status(502).json({ error: (err as Error).message });
    return;
  }

  if (!success) {
    await db
      .update(paymentsTable)
      .set({
        status: "failed",
        rawResponse: lookupResult as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(paymentsTable.id, payment.id));
    res.status(400).json({ success: false, error: failureReason });
    return;
  }

  const now = new Date();
  const periodEnd = new Date(now.getTime());
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const [existingSub] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, user.id))
    .limit(1);

  let subscription: Subscription;
  if (existingSub) {
    const [updated] = await db
      .update(subscriptionsTable)
      .set({
        planId: payment.planId,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        canceledAt: null,
        updatedAt: now,
      })
      .where(eq(subscriptionsTable.id, existingSub.id))
      .returning();
    subscription = updated;
  } else {
    const [inserted] = await db
      .insert(subscriptionsTable)
      .values({
        userId: user.id,
        planId: payment.planId,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      })
      .returning();
    subscription = inserted;
  }

  const [updatedPayment] = await db
    .update(paymentsTable)
    .set({
      status: "verified",
      providerTxnId: providerTxnId ?? payment.providerTxnId,
      subscriptionId: subscription.id,
      rawResponse: lookupResult as Record<string, unknown>,
      updatedAt: now,
    })
    .where(eq(paymentsTable.id, payment.id))
    .returning();

  res.json({
    success: true,
    subscription,
    payment: updatedPayment,
  });
});

export default router;
