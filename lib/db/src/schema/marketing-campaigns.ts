import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const marketingCampaignsTable = pgTable("marketing_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  name: text("name").notNull(),
  channel: text("channel").notNull().default("email"),
  status: text("status").notNull().default("draft"),
  subject: text("subject"),
  content: text("content"),
  audience: jsonb("audience"),
  sentCount: integer("sent_count").notNull().default(0),
  openCount: integer("open_count").notNull().default(0),
  clickCount: integer("click_count").notNull().default(0),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type MarketingCampaign = typeof marketingCampaignsTable.$inferSelect;
export type InsertMarketingCampaign =
  typeof marketingCampaignsTable.$inferInsert;
