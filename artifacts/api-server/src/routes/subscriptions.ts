import { Router, type IRouter, type Response } from "express";
import {
  db,
  plansTable,
  subscriptionsTable,
  paymentsTable,
  type PlanSlug,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth.js";
import {
  loadSubscription,
  type SubscriptionRequest,
} from "../middlewares/subscription.js";

const router: IRouter = Router();

router.use(authMiddleware, loadSubscription);

router.get("/current", async (req: SubscriptionRequest, res: Response) => {
  if (!req.subscription) {
    res.json({ subscription: null });
    return;
  }
  const [plan] = await db
    .select()
    .from(plansTable)
    .where(eq(plansTable.slug, req.subscription.planSlug))
    .limit(1);

  res.json({
    subscription: {
      ...req.subscription,
      plan,
    },
  });
});

router.get("/payments", async (req: SubscriptionRequest, res: Response) => {
  const rows = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.userId, req.user!.id))
    .orderBy(desc(paymentsTable.createdAt))
    .limit(50);
  res.json({ payments: rows });
});

router.post("/cancel", async (req: SubscriptionRequest, res: Response) => {
  if (!req.subscription) {
    res.status(404).json({ error: "No active subscription" });
    return;
  }
  const now = new Date();
  await db
    .update(subscriptionsTable)
    .set({ status: "canceled", canceledAt: now, updatedAt: now })
    .where(eq(subscriptionsTable.id, req.subscription.id));
  res.json({ success: true });
});

export async function createTrialSubscription(userId: string): Promise<void> {
  const trialDays = Number(process.env.TRIAL_DAYS ?? 14);
  const [trialPlan] = await db
    .select()
    .from(plansTable)
    .where(eq(plansTable.slug, "trial" satisfies PlanSlug))
    .limit(1);
  if (!trialPlan) {
    throw new Error("Trial plan not seeded");
  }
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
  await db.insert(subscriptionsTable).values({
    userId,
    planId: trialPlan.id,
    status: "trialing",
    trialStartedAt: now,
    trialEndsAt,
    currentPeriodStart: now,
    currentPeriodEnd: trialEndsAt,
  });
}

export default router;
