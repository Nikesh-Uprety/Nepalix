import { Response, NextFunction } from "express";
import { db } from "@workspace/db";
import {
  subscriptionsTable,
  plansTable,
  type PlanSlug,
  type SubscriptionStatus,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import type { AuthRequest } from "./auth.js";
import { FEATURE_MATRIX, type FeatureKey, minimumPlanFor } from "../lib/featureMatrix.js";

export interface SubscriptionRequest extends AuthRequest {
  subscription?: {
    id: string;
    planSlug: PlanSlug;
    status: SubscriptionStatus;
    trialEndsAt: Date | null;
    currentPeriodEnd: Date | null;
  };
}

export async function loadSubscription(
  req: SubscriptionRequest,
  _res: Response,
  next: NextFunction,
) {
  if (!req.user) return next();
  try {
    const [row] = await db
      .select({
        id: subscriptionsTable.id,
        status: subscriptionsTable.status,
        trialEndsAt: subscriptionsTable.trialEndsAt,
        currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
        planSlug: plansTable.slug,
      })
      .from(subscriptionsTable)
      .innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
      .where(eq(subscriptionsTable.userId, req.user.id))
      .limit(1);

    if (row) {
      const now = new Date();
      let status = row.status as SubscriptionStatus;
      if (status === "trialing" && row.trialEndsAt && row.trialEndsAt < now) {
        status = "expired";
        await db
          .update(subscriptionsTable)
          .set({ status: "expired", updatedAt: now })
          .where(eq(subscriptionsTable.id, row.id));
      }
      req.subscription = {
        id: row.id,
        planSlug: row.planSlug as PlanSlug,
        status,
        trialEndsAt: row.trialEndsAt,
        currentPeriodEnd: row.currentPeriodEnd,
      };
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function requireActiveSubscription(
  req: SubscriptionRequest,
  res: Response,
  next: NextFunction,
) {
  const sub = req.subscription;
  if (!sub) {
    res.status(402).json({ error: "No subscription found", upgrade_required: true });
    return;
  }
  if (sub.status === "trialing" || sub.status === "active") {
    return next();
  }
  res.status(402).json({
    error: "Your subscription is not active",
    upgrade_required: true,
    status: sub.status,
  });
}

export function requireFeature(feature: FeatureKey) {
  return (req: SubscriptionRequest, res: Response, next: NextFunction) => {
    const sub = req.subscription;
    if (!sub) {
      res.status(402).json({ error: "No subscription found", upgrade_required: true });
      return;
    }
    const matrix = FEATURE_MATRIX[sub.planSlug];
    const value = matrix?.[feature];
    const ok = typeof value === "boolean" ? value : typeof value === "number" ? value > 0 : Boolean(value);
    if (ok) return next();
    res.status(403).json({
      error: "This feature is not included in your current plan",
      upgrade_required: true,
      feature,
      plan_needed: minimumPlanFor(feature),
      current_plan: sub.planSlug,
    });
  };
}
