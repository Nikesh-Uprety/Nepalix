import { Router, type IRouter, type Response } from "express";
import { db, ordersTable, customersTable } from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";

const router: IRouter = Router();
router.use(authMiddleware, requireAdminPage("orders"));

const listQuery = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

router.get("/", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const { status, paymentStatus, limit, offset } = parsed.data;
  const filters = [];
  if (storeId) filters.push(eq(ordersTable.storeId, storeId));
  if (status) filters.push(eq(ordersTable.status, status));
  if (paymentStatus) filters.push(eq(ordersTable.paymentStatus, paymentStatus));

  const where = filters.length ? and(...filters) : undefined;

  const rowsQ = db
    .select({
      id: ordersTable.id,
      orderNumber: ordersTable.orderNumber,
      customerId: ordersTable.customerId,
      customerName: sql<string>`COALESCE(${customersTable.firstName} || ' ' || ${customersTable.lastName}, 'Guest')`,
      customerEmail: customersTable.email,
      items: ordersTable.items,
      subtotal: ordersTable.subtotal,
      tax: ordersTable.tax,
      total: ordersTable.total,
      currency: ordersTable.currency,
      status: ordersTable.status,
      paymentStatus: ordersTable.paymentStatus,
      createdAt: ordersTable.createdAt,
    })
    .from(ordersTable)
    .leftJoin(customersTable, eq(ordersTable.customerId, customersTable.id))
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit)
    .offset(offset);
  const totalQ = db
    .select({ count: sql<number>`count(*)::int` })
    .from(ordersTable);

  const [rows, totalRows] = await Promise.all([
    where ? rowsQ.where(where) : rowsQ,
    where ? totalQ.where(where) : totalQ,
  ]);

  res.json({ orders: rows, total: totalRows[0]?.count ?? 0 });
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  let customer = null;
  if (row.customerId) {
    const [c] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, row.customerId))
      .limit(1);
    customer = c ?? null;
  }
  res.json({ order: row, customer });
});

const updateSchema = z.object({
  status: z
    .enum(["pending", "processing", "shipped", "delivered", "cancelled", "refunded"])
    .optional(),
  paymentStatus: z.enum(["unpaid", "paid", "refunded", "failed"]).optional(),
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [row] = await db
    .update(ordersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(ordersTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json({ order: row });
});

export default router;
