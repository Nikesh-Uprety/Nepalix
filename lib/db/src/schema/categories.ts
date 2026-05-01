import {
  AnyPgColumn,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { storesTable } from "./stores";

export const categoriesTable = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => storesTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    parentId: uuid("parent_id").references((): AnyPgColumn => categoriesTable.id, {
      onDelete: "set null",
    }),
    imageUrl: text("image_url"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    storeParentPositionIdx: index("categories_store_parent_position_idx").on(
      table.storeId,
      table.parentId,
      table.position,
    ),
    storeSlugUnique: uniqueIndex("categories_store_slug_unique").on(
      table.storeId,
      table.slug,
    ),
  }),
);

export type Category = typeof categoriesTable.$inferSelect;
export type InsertCategory = typeof categoriesTable.$inferInsert;
