import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { subscriptionsTable } from "./subscriptions";

export type PaymentProvider = "khalti" | "esewa" | "mock";
export type PaymentStatus = "pending" | "verified" | "failed";

export const paymentsTable = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id")
    .references(() => subscriptionsTable.id, { onDelete: "set null" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").notNull(),
  provider: text("provider").$type<PaymentProvider>().notNull(),
  providerTxnId: text("provider_txn_id").unique(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("NPR"),
  status: text("status").$type<PaymentStatus>().notNull().default("pending"),
  rawResponse: jsonb("raw_response"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Payment = typeof paymentsTable.$inferSelect;
export type InsertPayment = typeof paymentsTable.$inferInsert;
