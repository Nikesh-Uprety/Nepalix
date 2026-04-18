import { Router, type IRouter, type Request, type Response } from "express";
import { db, plansTable } from "@workspace/db";
import { asc, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req: Request, res: Response) => {
  const plans = await db
    .select()
    .from(plansTable)
    .where(eq(plansTable.isActive, true))
    .orderBy(asc(plansTable.displayOrder));
  res.json({ plans });
});

router.get("/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  if (Array.isArray(slug)) {
    res.status(400).json({ error: "Invalid slug" });
    return;
  }
  const [plan] = await db
    .select()
    .from(plansTable)
    .where(eq(plansTable.slug, slug))
    .limit(1);
  if (!plan) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }
  res.json({ plan });
});

export default router;
