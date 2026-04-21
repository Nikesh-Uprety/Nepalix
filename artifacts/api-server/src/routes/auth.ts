import { Router, type IRouter, type Request, type Response } from "express";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import {
  usersTable,
  sessionsTable,
  registerSchema,
  loginSchema,
  getAdminAllowedPages,
  canAccessAdminPanel,
  type User,
} from "@workspace/db";

export function toAuthUserResponse(user: User) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    storeId: user.storeId ?? null,
    adminPageAccess: user.adminPageAccess ?? null,
    canAccessAdmin: canAccessAdminPanel(user.role),
    allowedAdminPages: getAdminAllowedPages(user.role, user.adminPageAccess),
    createdAt: user.createdAt,
  };
}
import { eq } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { createTrialSubscription } from "./subscriptions.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setSessionCookie(res: Response, token: string) {
  res.cookie("session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

router.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const { email, password, firstName, lastName } = parsed.data;

  try {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(usersTable)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: "user",
      })
      .returning();

    try {
      await createTrialSubscription(user.id);
    } catch (err) {
      logger.warn(
        { err, userId: user.id },
        "Failed to create trial subscription for new user"
      );
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE);

    await db.insert(sessionsTable).values({
      userId: user.id,
      token,
      expiresAt,
    });

    setSessionCookie(res, token);

    res.status(201).json({ user: toAuthUserResponse(user) });
  } catch (err) {
    throw err;
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE);

    await db.insert(sessionsTable).values({
      userId: user.id,
      token,
      expiresAt,
    });

    setSessionCookie(res, token);

    res.json({ user: toAuthUserResponse(user) });
  } catch (err) {
    throw err;
  }
});

router.post("/logout", authMiddleware, async (req: AuthRequest, res: Response) => {
  if (req.sessionToken) {
    await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.token, req.sessionToken));
  }

  res.clearCookie("session_token", { path: "/", secure: true, sameSite: "none" });
  res.json({ success: true });
});

router.get("/me", authMiddleware, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  res.json({ user: toAuthUserResponse(user) });
});

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ??
  "http://localhost:3000/api/auth/google/callback";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

router.get("/google", (_req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID) {
    res.status(501).json({ error: "Google OAuth not configured" });
    return;
  }
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get("/google/callback", async (req: Request, res: Response) => {
  const { code, error } = req.query as Record<string, string>;

  if (error || !code || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    res.redirect(`${FRONTEND_URL}?google_auth=error`);
    return;
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const tokens = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
    };

    if (!tokens.access_token) {
      res.redirect(`${FRONTEND_URL}?google_auth=error`);
      return;
    }

    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const googleUser = (await userInfoRes.json()) as {
      id: string;
      email: string;
      given_name?: string;
      family_name?: string;
    };

    if (!googleUser.email) {
      res.redirect(`${FRONTEND_URL}?google_auth=error`);
      return;
    }

    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, googleUser.email.toLowerCase()))
      .limit(1);

    if (!user) {
      [user] = await db
        .insert(usersTable)
        .values({
          email: googleUser.email.toLowerCase(),
          passwordHash: `GOOGLE:${googleUser.id}`,
          firstName: googleUser.given_name ?? "User",
          lastName: googleUser.family_name ?? "",
          role: "user",
          googleId: googleUser.id,
        })
        .returning();

      try {
        await createTrialSubscription(user.id);
      } catch (err) {
        logger.warn(
          { err, userId: user.id },
          "Failed to create trial subscription for new Google user"
        );
      }
    } else if (!user.googleId) {
      [user] = await db
        .update(usersTable)
        .set({ googleId: googleUser.id })
        .where(eq(usersTable.id, user.id))
        .returning();
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE);
    await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt });

    setSessionCookie(res, token);
    res.redirect(`${FRONTEND_URL}?google_auth=success`);
  } catch (_err) {
    res.redirect(`${FRONTEND_URL}?google_auth=error`);
  }
});

export default router;
