import { Router, type IRouter, type Response } from "express";
import { db, notificationsTable } from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";

const router: IRouter = Router();
router.use(authMiddleware, requireAdminPage("notifications"));

router.get("/", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  const where = storeId ? eq(notificationsTable.storeId, storeId) : undefined;
  const q = db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt))
    .limit(100);
  const rows = where ? await q.where(where) : await q;
  const unreadFilters = [eq(notificationsTable.isRead, false)];
  if (storeId) unreadFilters.push(eq(notificationsTable.storeId, storeId));
  const [unread] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notificationsTable)
    .where(and(...unreadFilters));
  res.json({ notifications: rows, unread: unread?.count ?? 0 });
});

router.post("/:id/read", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const [row] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json({ notification: row });
});

router.post("/read-all", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  const where = storeId ? eq(notificationsTable.storeId, storeId) : undefined;
  if (where) {
    await db.update(notificationsTable).set({ isRead: true }).where(where);
  } else {
    await db.update(notificationsTable).set({ isRead: true });
  }
  res.json({ success: true });
});

const createSchema = z.object({
  type: z.enum(["info", "success", "warning", "error"]).default("info"),
  title: z.string().min(1),
  body: z.string().optional(),
  link: z.string().optional(),
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  if (!storeId) {
    res.status(400).json({ error: "User has no store assigned" });
    return;
  }
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [row] = await db
    .insert(notificationsTable)
    .values({ ...parsed.data, storeId, userId: req.user?.id })
    .returning();
  res.status(201).json({ notification: row });
});

export default router;
