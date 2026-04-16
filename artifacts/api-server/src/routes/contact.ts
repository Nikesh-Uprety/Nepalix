import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  contactMessagesTable,
  contactMessageRequestSchema,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

router.post("/", async (req: Request, res: Response) => {
  const parsed = contactMessageRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  try {
    const [msg] = await db
      .insert(contactMessagesTable)
      .values({ ...parsed.data, status: "unread" })
      .returning();

    res.status(201).json({ message: msg });
  } catch (err) {
    throw err;
  }
});

router.get(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const messages = await db
      .select()
      .from(contactMessagesTable)
      .orderBy(desc(contactMessagesTable.createdAt));

    res.json({ messages });
  }
);

router.patch(
  "/:id/status",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { id } = req.params;
    const { status } = req.body as { status: string };

    const [updated] = await db
      .update(contactMessagesTable)
      .set({ status })
      .where(eq(contactMessagesTable.id, id))
      .returning();

    res.json({ message: updated });
  }
);

export default router;
