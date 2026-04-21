import { Router, type IRouter, type Response } from "express";
import { db, marketingCampaignsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";

const router: IRouter = Router();
router.use(authMiddleware, requireAdminPage("marketing"));

router.get("/", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  const where = storeId ? eq(marketingCampaignsTable.storeId, storeId) : undefined;
  const q = db
    .select()
    .from(marketingCampaignsTable)
    .orderBy(desc(marketingCampaignsTable.createdAt))
    .limit(200);
  const rows = where ? await q.where(where) : await q;
  res.json({ campaigns: rows });
});

const upsertSchema = z.object({
  name: z.string().min(1),
  channel: z.enum(["email", "sms", "whatsapp", "push"]).default("email"),
  status: z.enum(["draft", "scheduled", "sent", "paused"]).default("draft"),
  subject: z.string().optional(),
  content: z.string().optional(),
  scheduledAt: z.coerce.date().optional(),
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
    .insert(marketingCampaignsTable)
    .values({ ...parsed.data, storeId })
    .returning();
  res.status(201).json({ campaign: row });
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const parsed = upsertSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [row] = await db
    .update(marketingCampaignsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(marketingCampaignsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  res.json({ campaign: row });
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  await db
    .delete(marketingCampaignsTable)
    .where(eq(marketingCampaignsTable.id, id));
  res.json({ success: true });
});

export default router;
