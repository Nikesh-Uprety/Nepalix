import "dotenv/config";
import { db, pool, plansTable, type PlanFeatures, type PlanSlug } from "@workspace/db";

// NOTE: Kept in sync manually with
// artifacts/api-server/src/lib/featureMatrix.ts
// Do not cross-import from api-server to avoid coupling scripts to its build.
const FEATURE_MATRIX: Record<PlanSlug, PlanFeatures> = {
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

type PlanSeed = {
  slug: PlanSlug;
  name: string;
  tagline: string;
  yearlyPrice: number;
  monthlyPrice: number | null;
  trialDays: number;
  displayOrder: number;
};

const PLAN_SEEDS: PlanSeed[] = [
  {
    slug: "trial",
    name: "Trial",
    tagline: "14-day free trial",
    yearlyPrice: 0,
    monthlyPrice: null,
    trialDays: 14,
    displayOrder: 0,
  },
  {
    slug: "starter",
    name: "Starter",
    tagline: "For new sellers",
    yearlyPrice: 9999,
    monthlyPrice: 999,
    trialDays: 0,
    displayOrder: 1,
  },
  {
    slug: "growth",
    name: "Growth",
    tagline: "For growing stores",
    yearlyPrice: 29999,
    monthlyPrice: 2999,
    trialDays: 0,
    displayOrder: 2,
  },
  {
    slug: "pro",
    name: "Pro",
    tagline: "For serious operators",
    yearlyPrice: 79999,
    monthlyPrice: 7999,
    trialDays: 0,
    displayOrder: 3,
  },
  {
    slug: "elite",
    name: "Elite",
    tagline: "Enterprise-grade",
    yearlyPrice: 199999,
    monthlyPrice: 19999,
    trialDays: 0,
    displayOrder: 4,
  },
];

async function main() {
  const now = new Date();
  let inserted = 0;

  for (const seed of PLAN_SEEDS) {
    const features = FEATURE_MATRIX[seed.slug];

    const result = await db
      .insert(plansTable)
      .values({
        slug: seed.slug,
        name: seed.name,
        tagline: seed.tagline,
        yearlyPrice: seed.yearlyPrice,
        monthlyPrice: seed.monthlyPrice,
        trialDays: seed.trialDays,
        features,
        displayOrder: seed.displayOrder,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: plansTable.slug,
        set: {
          name: seed.name,
          tagline: seed.tagline,
          yearlyPrice: seed.yearlyPrice,
          monthlyPrice: seed.monthlyPrice,
          trialDays: seed.trialDays,
          features,
          displayOrder: seed.displayOrder,
          isActive: true,
          updatedAt: now,
        },
      })
      .returning({ slug: plansTable.slug });

    if (result.length > 0) inserted += 1;
    console.log(`upserted plan: ${seed.slug}`);
  }

  console.log(`\nSeeded ${inserted}/${PLAN_SEEDS.length} plans successfully.`);
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("seed-plans failed:", err);
    await pool.end().catch(() => {});
    process.exit(1);
  });
