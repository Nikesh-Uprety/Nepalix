import { Router, type IRouter, type Response } from "express";
import { db, productsTable } from "@workspace/db";
import { and, asc, eq, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";

const router: IRouter = Router();
router.use(authMiddleware, requireAdminPage("inventory"));

const listQuery = z.object({
  threshold: z.coerce.number().int().min(0).default(10),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

router.get("/", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const { limit } = parsed.data;
  const where = storeId ? eq(productsTable.storeId, storeId) : undefined;
  const rowsQ = db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      sku: productsTable.sku,
      stock: productsTable.stock,
      price: productsTable.price,
      status: productsTable.status,
    })
    .from(productsTable)
    .orderBy(asc(productsTable.stock))
    .limit(limit);
  const rows = where ? await rowsQ.where(where) : await rowsQ;
  res.json({ items: rows });
});

router.get("/low-stock", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  const parsed = listQuery.safeParse(req.query);
  const threshold = parsed.success ? parsed.data.threshold : 10;
  const filters = [lte(productsTable.stock, threshold)];
  if (storeId) filters.push(eq(productsTable.storeId, storeId));
  const rows = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      sku: productsTable.sku,
      stock: productsTable.stock,
    })
    .from(productsTable)
    .where(and(...filters))
    .orderBy(asc(productsTable.stock))
    .limit(200);
  res.json({ items: rows, threshold });
});

const adjustSchema = z.object({
  delta: z.coerce.number().int(),
});

router.post("/:id/adjust", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const parsed = adjustSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [row] = await db
    .update(productsTable)
    .set({
      stock: sql`GREATEST(0, ${productsTable.stock} + ${parsed.data.delta})`,
      updatedAt: new Date(),
    })
    .where(eq(productsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ product: row });
});

const setSchema = z.object({ stock: z.coerce.number().int().min(0) });
router.post("/:id/set", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const parsed = setSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [row] = await db
    .update(productsTable)
    .set({ stock: parsed.data.stock, updatedAt: new Date() })
    .where(eq(productsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ product: row });
});

export default router;
