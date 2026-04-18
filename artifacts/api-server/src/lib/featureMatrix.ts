import type { PlanFeatures, PlanSlug } from "@workspace/db";

export const FEATURE_MATRIX: Record<PlanSlug, PlanFeatures> = {
  trial: {
    ordersPerYear: 100,
    products: 20,
    staff: 1,
    locations: 1,
    pos: false,
    advancedInventory: false,
    abandonedCart: false,
    funnelBuilder: false,
    upsellCrossSell: false,
    analyticsLevel: "basic",
    prioritySupport: false,
    customIntegrations: false,
    dedicatedManager: false,
  },
  starter: {
    ordersPerYear: 1000,
    products: 100,
    staff: 2,
    locations: 1,
    pos: false,
    advancedInventory: false,
    abandonedCart: false,
    funnelBuilder: false,
    upsellCrossSell: false,
    analyticsLevel: "basic",
    prioritySupport: false,
    customIntegrations: false,
    dedicatedManager: false,
  },
  growth: {
    ordersPerYear: 20000,
    products: 1000,
    staff: 8,
    locations: 3,
    pos: true,
    advancedInventory: true,
    abandonedCart: true,
    funnelBuilder: false,
    upsellCrossSell: false,
    analyticsLevel: "advanced",
    prioritySupport: true,
    customIntegrations: false,
    dedicatedManager: false,
  },
  pro: {
    ordersPerYear: 50000,
    products: 2500,
    staff: 25,
    locations: 10,
    pos: true,
    advancedInventory: true,
    abandonedCart: true,
    funnelBuilder: true,
    upsellCrossSell: true,
    analyticsLevel: "advanced",
    prioritySupport: true,
    customIntegrations: false,
    dedicatedManager: false,
  },
  elite: {
    ordersPerYear: null,
    products: null,
    staff: 50,
    locations: null,
    pos: true,
    advancedInventory: true,
    abandonedCart: true,
    funnelBuilder: true,
    upsellCrossSell: true,
    analyticsLevel: "enterprise",
    prioritySupport: true,
    customIntegrations: true,
    dedicatedManager: true,
  },
};

export type FeatureKey = keyof PlanFeatures;

export function hasFeature(
  slug: PlanSlug | string | null | undefined,
  feature: FeatureKey,
): boolean {
  if (!slug) return false;
  const matrix = FEATURE_MATRIX[slug as PlanSlug];
  if (!matrix) return false;
  const value = matrix[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return Boolean(value);
}

export function minimumPlanFor(feature: FeatureKey): PlanSlug | null {
  const order: PlanSlug[] = ["trial", "starter", "growth", "pro", "elite"];
  for (const slug of order) {
    if (hasFeature(slug, feature)) return slug;
  }
  return null;
}
