import { Router, type IRouter, type Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@workspace/db";
import { usersTable, sessionsTable } from "@workspace/db";
import { eq, ne } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

const updateProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

router.patch(
  "/profile",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, req.user!.id))
      .returning();

    res.json({
      user: {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
        createdAt: updated.createdAt,
      },
    });
  }
);

router.post(
  "/change-password",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }

    const { currentPassword, newPassword } = parsed.data;

    const valid = await bcrypt.compare(
      currentPassword,
      req.user!.passwordHash
    );
    if (!valid) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await db
      .update(usersTable)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.id));

    await db
      .delete(sessionsTable)
      .where(
        ne(sessionsTable.token, req.sessionToken!)
      );

    res.json({ success: true });
  }
);

router.get(
  "/users",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const users = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(usersTable.createdAt);

    res.json({ users });
  }
);

export default router;
