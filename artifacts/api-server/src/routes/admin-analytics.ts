import { Router, type IRouter, type Response } from "express";
import { db, ordersTable, productsTable, customersTable } from "@workspace/db";
import { and, eq, gte, sql } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";

const router: IRouter = Router();
router.use(authMiddleware, requireAdminPage("analytics"));

router.get("/overview", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  const storeWhere = storeId ? eq(ordersTable.storeId, storeId) : undefined;
  const custWhere = storeId ? eq(customersTable.storeId, storeId) : undefined;
  const prodWhere = storeId ? eq(productsTable.storeId, storeId) : undefined;

  const ordersAggQ = db
    .select({
      orders: sql<number>`COUNT(*)::int`,
      revenue: sql<number>`COALESCE(SUM(${ordersTable.total}),0)::int`,
    })
    .from(ordersTable);
  const custCountQ = db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(customersTable);
  const prodCountQ = db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(productsTable);

  const [ordersAgg, custCount, prodCount] = await Promise.all([
    storeWhere ? ordersAggQ.where(storeWhere) : ordersAggQ,
    custWhere ? custCountQ.where(custWhere) : custCountQ,
    prodWhere ? prodCountQ.where(prodWhere) : prodCountQ,
  ]);

  res.json({
    orders: ordersAgg[0]?.orders ?? 0,
    revenue: ordersAgg[0]?.revenue ?? 0,
    customers: custCount[0]?.count ?? 0,
    products: prodCount[0]?.count ?? 0,
  });
});

router.get("/orders-trend", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  const days = Number(req.query.days ?? 30);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const filters = [gte(ordersTable.createdAt, since)];
  if (storeId) filters.push(eq(ordersTable.storeId, storeId));

  const rows = await db
    .select({
      day: sql<string>`DATE(${ordersTable.createdAt})::text`,
      orders: sql<number>`COUNT(*)::int`,
      revenue: sql<number>`COALESCE(SUM(${ordersTable.total}),0)::int`,
    })
    .from(ordersTable)
    .where(and(...filters))
    .groupBy(sql`DATE(${ordersTable.createdAt})`)
    .orderBy(sql`DATE(${ordersTable.createdAt})`);

  res.json({ days, series: rows });
});

router.get("/top-products", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  const where = storeId ? eq(productsTable.storeId, storeId) : undefined;
  const q = db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      price: productsTable.price,
      stock: productsTable.stock,
    })
    .from(productsTable)
    .orderBy(sql`${productsTable.stock} DESC`)
    .limit(10);
  const rows = where ? await q.where(where) : await q;
  res.json({ products: rows });
});

export default router;
