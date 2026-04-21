import { Router, type IRouter, type Response } from "express";
import { db, customersTable, ordersTable } from "@workspace/db";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";

const router: IRouter = Router();
router.use(authMiddleware, requireAdminPage("customers"));

const listQuery = z.object({
  q: z.string().trim().min(1).optional(),
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
  const { q, limit, offset } = parsed.data;
  const filters = [];
  if (storeId) filters.push(eq(customersTable.storeId, storeId));
  if (q)
    filters.push(
      or(
        ilike(customersTable.email, `%${q}%`),
        ilike(customersTable.firstName, `%${q}%`),
        ilike(customersTable.lastName, `%${q}%`),
      )!,
    );

  const where = filters.length ? and(...filters) : undefined;

  const rowsQ = db
    .select({
      id: customersTable.id,
      firstName: customersTable.firstName,
      lastName: customersTable.lastName,
      email: customersTable.email,
      phone: customersTable.phone,
      notes: customersTable.notes,
      createdAt: customersTable.createdAt,
      ordersCount: sql<number>`(SELECT COUNT(*)::int FROM ${ordersTable} WHERE ${ordersTable.customerId} = ${customersTable.id})`,
      totalSpent: sql<number>`(SELECT COALESCE(SUM(${ordersTable.total}),0)::int FROM ${ordersTable} WHERE ${ordersTable.customerId} = ${customersTable.id})`,
    })
    .from(customersTable)
    .orderBy(desc(customersTable.createdAt))
    .limit(limit)
    .offset(offset);
  const totalQ = db
    .select({ count: sql<number>`count(*)::int` })
    .from(customersTable);

  const [rows, totalRows] = await Promise.all([
    where ? rowsQ.where(where) : rowsQ,
    where ? totalQ.where(where) : totalQ,
  ]);

  res.json({ customers: rows, total: totalRows[0]?.count ?? 0 });
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const [row] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, id))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.customerId, id))
    .orderBy(desc(ordersTable.createdAt))
    .limit(50);
  res.json({ customer: row, orders });
});

const upsertSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  if (!storeId) {
    res.status(400).json({ error: "User has no store assigned" });
    return;
  }
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [row] = await db
    .insert(customersTable)
    .values({ ...parsed.data, storeId })
    .returning();
  res.status(201).json({ customer: row });
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const parsed = upsertSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [row] = await db
    .update(customersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(customersTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json({ customer: row });
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  await db.delete(customersTable).where(eq(customersTable.id, id));
  res.json({ success: true });
});

export default router;
