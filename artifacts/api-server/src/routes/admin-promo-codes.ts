import { Router, type IRouter, type Response } from "express";
import { db, promoCodesTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";

const router: IRouter = Router();
router.use(authMiddleware, requireAdminPage("promo-codes"));

router.get("/", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  const where = storeId ? eq(promoCodesTable.storeId, storeId) : undefined;
  const q = db
    .select()
    .from(promoCodesTable)
    .orderBy(desc(promoCodesTable.createdAt))
    .limit(200);
  const rows = where ? await q.where(where) : await q;
  res.json({ promoCodes: rows });
});

const upsertSchema = z.object({
  code: z.string().min(2).transform((s) => s.toUpperCase()),
  description: z.string().optional(),
  discountType: z.enum(["percent", "fixed"]).default("percent"),
  discountValue: z.coerce.number().int().min(0),
  minOrderAmount: z.coerce.number().int().min(0).default(0),
  usageLimit: z.coerce.number().int().min(0).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const storeId = req.user?.storeId;
  if (!storeId) {
    res.status(400).json({ error: "User has no store assigned" });
    return;
  }
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const [row] = await db
    .insert(promoCodesTable)
    .values({ ...parsed.data, storeId })
    .returning();
  res.status(201).json({ promoCode: row });
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const parsed = upsertSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [row] = await db
    .update(promoCodesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(promoCodesTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Promo code not found" });
    return;
  }
  res.json({ promoCode: row });
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  await db.delete(promoCodesTable).where(eq(promoCodesTable.id, id));
  res.json({ success: true });
});

void and;
export default router;
