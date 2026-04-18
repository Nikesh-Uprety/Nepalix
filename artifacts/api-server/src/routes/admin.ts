import { Router, type IRouter, type Response, type NextFunction } from "express";
import {
  db,
  usersTable,
  subscriptionsTable,
  plansTable,
  paymentsTable,
  normalizeAdminRole,
  sanitizeAdminPageOverrides,
} from "@workspace/db";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { requireAdminPanel } from "../middlewares/admin.js";

const router: IRouter = Router();

router.use(authMiddleware, requireAdminPanel);

function requireSuperadminOrOwner(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const role = normalizeAdminRole(req.user?.role);
  if (role !== "superadmin" && role !== "owner") {
    res.status(403).json({ error: "Superadmin or owner role required" });
    return;
  }
  next();
}

function omitPasswordHash<T extends { passwordHash?: string | null }>(
  user: T,
): Omit<T, "passwordHash"> {
  const { passwordHash: _unused, ...rest } = user;
  void _unused;
  return rest;
}

const listUsersQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

router.get(
  "/users",
  requireSuperadminOrOwner,
  async (req: AuthRequest, res: Response) => {
    const parsed = listUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
      return;
    }
    const { q, limit, offset } = parsed.data;

    const searchCondition = q
      ? or(
          ilike(usersTable.email, `%${q}%`),
          ilike(usersTable.firstName, `%${q}%`),
          ilike(usersTable.lastName, `%${q}%`),
        )
      : undefined;

    const rowsQuery = db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        role: usersTable.role,
        storeId: usersTable.storeId,
        adminPageAccess: usersTable.adminPageAccess,
        googleId: usersTable.googleId,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable);

    const [rows, totalRows] = await Promise.all([
      searchCondition ? rowsQuery.where(searchCondition) : rowsQuery,
      searchCondition ? countQuery.where(searchCondition) : countQuery,
    ]);

    res.json({
      users: rows,
      total: totalRows[0]?.count ?? 0,
    });
  },
);

const patchUserBodySchema = z.object({
  role: z.string().min(1).optional(),
  adminPageAccess: z.array(z.string()).optional(),
  storeId: z.string().uuid().nullable().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

router.patch(
  "/users/:id",
  requireSuperadminOrOwner,
  async (req: AuthRequest, res: Response) => {
    const parsed = patchUserBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    const body = parsed.data;
    const rawId = req.params.id;
    const targetId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!targetId) {
      res.status(400).json({ error: "Missing user id" });
      return;
    }

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, targetId))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const actorRole = normalizeAdminRole(req.user?.role);
    const isActorSuperadmin = actorRole === "superadmin";

    const existingNormalizedRole = normalizeAdminRole(existing.role);

    let finalRole: string = existing.role;
    if (body.role !== undefined) {
      const normalized = normalizeAdminRole(body.role);
      if (!normalized) {
        res.status(400).json({ error: "Invalid role" });
        return;
      }
      if (normalized === "superadmin" && !isActorSuperadmin) {
        res
          .status(403)
          .json({ error: "Only a superadmin can assign the superadmin role" });
        return;
      }
      if (existingNormalizedRole === "superadmin" && !isActorSuperadmin && normalized !== "superadmin") {
        res
          .status(403)
          .json({ error: "Only a superadmin can demote a superadmin" });
        return;
      }
      finalRole = normalized;
    } else if (
      existingNormalizedRole === "superadmin" &&
      !isActorSuperadmin &&
      (body.adminPageAccess !== undefined ||
        body.storeId !== undefined ||
        body.firstName !== undefined ||
        body.lastName !== undefined)
    ) {
      // Non-superadmin attempting to modify a superadmin's record.
      res
        .status(403)
        .json({ error: "Only a superadmin can modify a superadmin account" });
      return;
    }

    const updates: Partial<typeof usersTable.$inferInsert> & {
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (body.role !== undefined) {
      updates.role = finalRole;
    }
    if (body.adminPageAccess !== undefined) {
      updates.adminPageAccess = sanitizeAdminPageOverrides(
        finalRole,
        body.adminPageAccess,
      );
    }
    if (body.storeId !== undefined) {
      updates.storeId = body.storeId ?? undefined;
      if (body.storeId === null) {
        // explicit null clears storeId
        (updates as Record<string, unknown>).storeId = null;
      }
    }
    if (body.firstName !== undefined) {
      updates.firstName = body.firstName;
    }
    if (body.lastName !== undefined) {
      updates.lastName = body.lastName;
    }

    const [updated] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, targetId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "User not found after update" });
      return;
    }

    res.json({ user: omitPasswordHash(updated) });
  },
);

const listSubscriptionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

router.get(
  "/subscriptions",
  requireSuperadminOrOwner,
  async (req: AuthRequest, res: Response) => {
    const parsed = listSubscriptionsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid query", details: parsed.error.flatten() });
      return;
    }
    const { limit, offset } = parsed.data;

    const rows = await db
      .select({
        id: subscriptionsTable.id,
        userId: subscriptionsTable.userId,
        userEmail: usersTable.email,
        planId: subscriptionsTable.planId,
        planSlug: plansTable.slug,
        status: subscriptionsTable.status,
        trialStartedAt: subscriptionsTable.trialStartedAt,
        trialEndsAt: subscriptionsTable.trialEndsAt,
        currentPeriodStart: subscriptionsTable.currentPeriodStart,
        currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
        canceledAt: subscriptionsTable.canceledAt,
        createdAt: subscriptionsTable.createdAt,
        updatedAt: subscriptionsTable.updatedAt,
      })
      .from(subscriptionsTable)
      .leftJoin(usersTable, eq(subscriptionsTable.userId, usersTable.id))
      .leftJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
      .orderBy(desc(subscriptionsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const totalRows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(subscriptionsTable);

    res.json({
      subscriptions: rows,
      total: totalRows[0]?.count ?? 0,
    });
  },
);

router.get(
  "/stats",
  requireSuperadminOrOwner,
  async (_req: AuthRequest, res: Response) => {
    const [usersCountRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable);

    const [activeRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.status, "active"));

    const [trialingRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.status, "trialing"));

    const [revenueRow] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${paymentsTable.amount}), 0)::int`,
      })
      .from(paymentsTable)
      .where(eq(paymentsTable.status, "verified"));

    res.json({
      usersCount: usersCountRow?.count ?? 0,
      activeSubscriptions: activeRow?.count ?? 0,
      trialingSubscriptions: trialingRow?.count ?? 0,
      totalRevenueNpr: revenueRow?.total ?? 0,
    });
  },
);

// Silence unused `and` import warning — retained for future compound filters.
void and;

export default router;
export { router as adminRouter };
