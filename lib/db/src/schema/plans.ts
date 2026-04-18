import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export type PlanSlug =
  | "trial"
  | "starter"
  | "growth"
  | "pro"
  | "elite";

export type PlanFeatures = {
  ordersPerYear: number | null;
  products: number | null;
  staff: number | null;
  locations: number | null;
  pos: boolean;
  advancedInventory: boolean;
  abandonedCart: boolean;
  funnelBuilder: boolean;
  upsellCrossSell: boolean;
  analyticsLevel: "basic" | "advanced" | "enterprise";
  prioritySupport: boolean;
  customIntegrations: boolean;
  dedicatedManager: boolean;
};

export const plansTable = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  yearlyPrice: integer("yearly_price").notNull(),
  monthlyPrice: integer("monthly_price"),
  trialDays: integer("trial_days").notNull().default(0),
  features: jsonb("features").$type<PlanFeatures>().notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Plan = typeof plansTable.$inferSelect;
export type InsertPlan = typeof plansTable.$inferInsert;
