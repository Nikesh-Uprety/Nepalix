import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { productsTable } from "./products";
import { storesTable } from "./stores";
import { usersTable } from "./users";

export const productVariantsTable = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => storesTable.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    sku: text("sku"),
    title: text("title").notNull(),
    attributes: jsonb("attributes").$type<Record<string, string>>().notNull().default({}),
    position: integer("position").notNull().default(0),
    price: integer("price").notNull().default(0),
    compareAtPrice: integer("compare_price"),
    costPrice: integer("cost_price"),
    currency: text("currency").notNull().default("NPR"),
    stock: integer("stock").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    storeProductIdx: index("product_variants_store_product_idx").on(
      table.storeId,
      table.productId,
    ),
    storeProductPositionIdx: index("product_variants_store_product_position_idx").on(
      table.storeId,
      table.productId,
      table.position,
    ),
    storeStockIdx: index("product_variants_store_stock_idx").on(
      table.storeId,
      table.stock,
    ),
    storeSkuUnique: uniqueIndex("product_variants_store_sku_unique").on(
      table.storeId,
      table.sku,
    ),
  }),
);

export const productImagesTable = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => storesTable.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariantsTable.id, {
      onDelete: "set null",
    }),
    url: text("url").notNull(),
    altText: text("alt"),
    position: integer("sort_order").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    storeProductSortIdx: index("product_images_store_product_sort_idx").on(
      table.storeId,
      table.productId,
      table.position,
    ),
    storeVariantIdx: index("product_images_store_variant_idx").on(
      table.storeId,
      table.variantId,
    ),
  }),
);

export const inventoryMovementsTable = pgTable(
  "inventory_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => storesTable.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariantsTable.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    stockBefore: integer("stock_before").notNull(),
    stockAfter: integer("stock_after").notNull(),
    reason: text("reason").notNull(),
    note: text("note"),
    referenceType: text("reference_type"),
    referenceId: text("reference_id"),
    createdByUserId: uuid("created_by_user_id").references(() => usersTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    storeVariantCreatedIdx: index("inventory_movements_store_variant_created_idx").on(
      table.storeId,
      table.variantId,
      table.createdAt,
    ),
  }),
);

export type ProductVariant = typeof productVariantsTable.$inferSelect;
export type InsertProductVariant = typeof productVariantsTable.$inferInsert;
export type ProductImage = typeof productImagesTable.$inferSelect;
export type InsertProductImage = typeof productImagesTable.$inferInsert;
export type InventoryMovement = typeof inventoryMovementsTable.$inferSelect;
export type InsertInventoryMovement = typeof inventoryMovementsTable.$inferInsert;
