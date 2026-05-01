import {
  pgTable,
  index,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  pgEnum,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { categoriesTable } from "./categories";

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

export const productsTable = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug"),
    description: text("description"),
    sku: text("sku"),
    price: integer("price").notNull().default(0),
    compareAtPrice: integer("compare_price"),
    costPrice: integer("cost_price"),
    currency: text("currency").notNull().default("NPR"),
    categoryId: uuid("category_id").references(() => categoriesTable.id, {
      onDelete: "set null",
    }),
    weight: integer("weight"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    featuredImageUrl: text("featured_image_url"),
    stock: integer("stock").notNull().default(0),
    totalStock: integer("total_stock").notNull().default(0),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    status: productStatusEnum("status").notNull().default("active"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    storeCreatedIdx: index("products_store_created_idx").on(
      table.storeId,
      table.createdAt,
    ),
    storeStatusIdx: index("products_store_status_idx").on(
      table.storeId,
      table.status,
    ),
    storeCategoryIdx: index("products_store_category_idx").on(
      table.storeId,
      table.categoryId,
    ),
    storePriceIdx: index("products_store_price_idx").on(
      table.storeId,
      table.price,
    ),
    storeSlugUnique: uniqueIndex("products_store_slug_unique").on(
      table.storeId,
      table.slug,
    ),
  }),
);

export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = typeof productsTable.$inferInsert;
