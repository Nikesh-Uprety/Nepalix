import { Router, type IRouter, type Request, type Response } from "express";
import { createHash, randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { uploadMediaAsset } from "../lib/media-upload.js";
import { db } from "@workspace/db";
import {
  emailVerificationCodesTable,
  impersonationAuditLogsTable,
  productImagesTable,
  productsTable,
  subscriptionsTable,
  usersTable,
  sessionsTable,
  storefrontPagesTable,
  storeMembershipsTable,
  storeSettingsTable,
  storesTable,
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
    activeStoreId: user.activeStoreId ?? null,
    adminPageAccess: user.adminPageAccess ?? null,
    canAccessAdmin: canAccessAdminPanel(user.role),
    allowedAdminPages: getAdminAllowedPages(user.role, user.adminPageAccess),
    onboardingCompletedAt: user.onboardingCompletedAt ?? null,
    createdAt: user.createdAt,
  };
}
import { and, desc, eq, isNull } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { createTrialSubscription } from "./subscriptions.js";
import { logger } from "../lib/logger.js";
import { provisionStoreForUser } from "../lib/tenant.js";
import { sendVerificationCodeEmail, sendWelcomeEmail, isEmailConfigured } from "../lib/email.js";

const router: IRouter = Router();

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const IMPERSONATION_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const EMAIL_VERIFICATION_MAX_AGE = 10 * 60 * 1000; // 10 minutes
const EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const EMAIL_VERIFICATION_MAX_ATTEMPTS = 5;
const EMAIL_VERIFICATION_LOCK_MS = 10 * 60 * 1000; // 10 minutes

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashVerificationCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

async function createAndSendVerificationCode(input: {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
}) {
  const normalizedEmail = input.email.toLowerCase();
  const code = generateOtpCode();
  const codeHash = hashVerificationCode(code);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_MAX_AGE);
  const now = new Date();

  await db.delete(emailVerificationCodesTable).where(eq(emailVerificationCodesTable.email, normalizedEmail));
  await db.insert(emailVerificationCodesTable).values({
    email: normalizedEmail,
    codeHash,
    firstName: input.firstName,
    lastName: input.lastName,
    passwordHash: input.passwordHash,
    expiresAt,
    attempts: 0,
    lockedUntil: null,
    lastSentAt: now,
  });

  await sendVerificationCodeEmail({
    to: normalizedEmail,
    firstName: input.firstName,
    code,
  });
}

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);
}

function setSessionCookie(res: Response, token: string) {
  res.cookie("session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

function toAuthUserResponseWithSession(user: User, session?: typeof sessionsTable.$inferSelect) {
  const base = toAuthUserResponse(user);
  if (!session?.impersonatorUserId || !session.impersonatedStoreId || !session.impersonationExpiresAt) {
    return { ...base, impersonation: null };
  }
  return {
    ...base,
    impersonation: {
      active: true,
      impersonatorUserId: session.impersonatorUserId,
      storeId: session.impersonatedStoreId,
      expiresAt: session.impersonationExpiresAt,
    },
  };
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

    const normalizedEmail = email.toLowerCase();

    try {
      await createAndSendVerificationCode({
        email: normalizedEmail,
        firstName,
        lastName,
        passwordHash,
      });
    } catch (err) {
      await db.delete(emailVerificationCodesTable).where(eq(emailVerificationCodesTable.email, normalizedEmail));
      logger.error({ err, email: normalizedEmail }, "Failed to send registration verification email");
      res.status(502).json({ error: "Could not send verification email. Please try again." });
      return;
    }

    if (!isEmailConfigured?.()) {
      const [verification] = await db
        .select()
        .from(emailVerificationCodesTable)
        .where(eq(emailVerificationCodesTable.email, normalizedEmail))
        .limit(1);

logger.info({ email: normalizedEmail }, "Auto-creating verified user");
      const [user] = await db
        .insert(usersTable)
        .values({
          email: normalizedEmail,
          passwordHash,
          firstName,
          lastName,
          role: "user",
        })
        .returning();

      if (verification) {
        await db
          .update(emailVerificationCodesTable)
          .set({ consumedAt: new Date() })
          .where(eq(emailVerificationCodesTable.id, verification.id));
      }

      // Skip store provisioning for now - will create during onboarding
      // try { await provisionStoreForUser({ userId: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }); } catch (e) { logger.error({ err: e }, "Failed to provision store"); }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE);
      await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt });
      setSessionCookie(res, token);
      res.status(201).json({ user: toAuthUserResponse(user) });
      return;
    }

    res.status(201).json({
      requiresVerification: true,
      email: normalizedEmail,
      expiresInSeconds: Math.floor(EMAIL_VERIFICATION_MAX_AGE / 1000),
    });
  } catch (err) {
    throw err;
  }
});

router.post("/register/resend", async (req: Request, res: Response) => {
  const email = String((req.body as { email?: unknown })?.email ?? "").trim().toLowerCase();
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const [verification] = await db
    .select()
    .from(emailVerificationCodesTable)
    .where(and(eq(emailVerificationCodesTable.email, email), isNull(emailVerificationCodesTable.consumedAt)))
    .orderBy(desc(emailVerificationCodesTable.createdAt))
    .limit(1);

  if (!verification) {
    res.status(404).json({ error: "No pending verification request for this email" });
    return;
  }

  const now = Date.now();
  const lastSentAtMs = verification.lastSentAt?.getTime() ?? 0;
  const remainingMs = EMAIL_VERIFICATION_RESEND_COOLDOWN_MS - (now - lastSentAtMs);
  if (remainingMs > 0) {
    res.status(429).json({
      error: "Please wait before requesting another code",
      retryAfterSeconds: Math.ceil(remainingMs / 1000),
    });
    return;
  }

  try {
    await createAndSendVerificationCode({
      email: verification.email,
      firstName: verification.firstName,
      lastName: verification.lastName,
      passwordHash: verification.passwordHash,
    });
  } catch (err) {
    logger.error({ err, email }, "Failed to resend verification email");
    res.status(502).json({ error: "Could not resend verification email. Please try again." });
    return;
  }

  res.json({
    requiresVerification: true,
    email,
    expiresInSeconds: Math.floor(EMAIL_VERIFICATION_MAX_AGE / 1000),
  });
});

router.post("/register/verify", async (req: Request, res: Response) => {
  const parsed = verifyCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const normalizedEmail = parsed.data.email.toLowerCase();
  const { code } = parsed.data;

  const [verification] = await db
    .select()
    .from(emailVerificationCodesTable)
    .where(
      and(
        eq(emailVerificationCodesTable.email, normalizedEmail),
        isNull(emailVerificationCodesTable.consumedAt),
      ),
    )
    .orderBy(desc(emailVerificationCodesTable.createdAt))
    .limit(1);

  if (!verification) {
    res.status(400).json({ error: "No pending verification request for this email" });
    return;
  }

  if (verification.expiresAt <= new Date()) {
    res.status(400).json({ error: "Verification code expired. Please register again." });
    return;
  }

  if (verification.lockedUntil && verification.lockedUntil > new Date()) {
    res.status(429).json({
      error: "Too many invalid attempts. Please wait before trying again.",
      retryAfterSeconds: Math.ceil((verification.lockedUntil.getTime() - Date.now()) / 1000),
    });
    return;
  }

  if (verification.codeHash !== hashVerificationCode(code)) {
    const nextAttempts = (verification.attempts ?? 0) + 1;
    const shouldLock = nextAttempts >= EMAIL_VERIFICATION_MAX_ATTEMPTS;
    await db
      .update(emailVerificationCodesTable)
      .set({
        attempts: nextAttempts,
        lockedUntil: shouldLock ? new Date(Date.now() + EMAIL_VERIFICATION_LOCK_MS) : null,
      })
      .where(eq(emailVerificationCodesTable.id, verification.id));
    res.status(400).json({ error: "Invalid verification code" });
    return;
  }

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);
  if (existing) {
    await db
      .update(emailVerificationCodesTable)
      .set({ consumedAt: new Date() })
      .where(eq(emailVerificationCodesTable.id, verification.id));
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

const [user] = await db
    .insert(usersTable)
    .values({
      email: normalizedEmail,
      passwordHash: verification.passwordHash,
      firstName: verification.firstName,
      lastName: verification.lastName,
      role: "user",
    })
    .returning();

  await db
    .update(emailVerificationCodesTable)
    .set({ consumedAt: new Date() })
    .where(eq(emailVerificationCodesTable.id, verification.id));

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE);

  await db.insert(sessionsTable).values({
    userId: user.id,
    token,
    expiresAt,
  });

  setSessionCookie(res, token);
  res.status(201).json({ user: toAuthUserResponse(user), token });
});

const onboardingUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().regex(/^image\//),
  dataBase64: z.string().min(1),
});

router.post("/onboarding/upload", authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsed = onboardingUploadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid upload payload", details: parsed.error.flatten() });
    return;
  }
  const user = req.user!;
  const storeId = user.activeStoreId ?? user.storeId ?? `onboarding-${user.id}`;
  // Normalize image/jpg → image/jpeg (Cloudinary and S3 require the canonical type)
  const contentType =
    parsed.data.contentType === "image/jpg" ? "image/jpeg" : parsed.data.contentType;
  try {
    const uploaded = await uploadMediaAsset({
      storeId,
      fileName: parsed.data.fileName,
      contentType,
      dataBase64: parsed.data.dataBase64,
    });
    res.status(201).json({ url: uploaded.url });
  } catch (e) {
    logger.error({ err: e, userId: user.id }, "Failed to upload onboarding image");
    res.status(500).json({ error: "Image upload failed" });
  }
});

const onboardingSchema = z.object({
  storeName: z.string().trim().min(2).max(120),
  storeCategory: z.string().trim().min(2).max(64),
  location: z.string().trim().min(2).max(120),
  logoUrl: z.string().url().optional(),
  primaryProductName: z.string().trim().min(2).max(120),
  primaryProductImageUrl: z.string().url(),
  extraProductImageUrls: z.array(z.string().url()).max(8).default([]),
});

router.post("/onboarding/complete", authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid onboarding payload", details: parsed.error.flatten() });
    return;
  }

  const user = req.user!;
  let storeId = user.activeStoreId ?? user.storeId;

  // If user has no store, create one first
  if (!storeId) {
    logger.info({ userId: user.id }, "Creating store for user during onboarding");
    try {
      const result = await provisionStoreForUser({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      storeId = result.storeId;
      
      // Refresh user to get updated storeId
      const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
      if (updatedUser) {
        req.user = updatedUser;
        storeId = updatedUser.activeStoreId ?? updatedUser.storeId;
      }
    } catch (e) {
      logger.error({ err: e, userId: user.id }, "Failed to create store during onboarding");
      res.status(500).json({ error: "Failed to create store. Please try again." });
      return;
    }
  }

  if (!storeId) {
    res.status(400).json({ error: "No active store selected for onboarding" });
    return;
  }

  const {
    storeName,
    storeCategory,
    location,
    logoUrl,
    primaryProductName,
    primaryProductImageUrl,
    extraProductImageUrls,
  } = parsed.data;

  const normalizedCategory = storeCategory.toLowerCase();
  const templateId = normalizedCategory.includes("coffee") || normalizedCategory.includes("bakery")
    ? "himalayan-brew"
    : normalizedCategory.includes("fashion") || normalizedCategory.includes("luxury")
      ? "maison-noir"
      : "north-atelier";

  const [existingStore] = await db
    .select({ settings: storesTable.settings })
    .from(storesTable)
    .where(eq(storesTable.id, storeId))
    .limit(1);
  if (!existingStore) {
    res.status(404).json({ error: "Store not found" });
    return;
  }

  const [store] = await db
    .update(storesTable)
    .set({
      name: storeName,
      legalName: storeName,
      launchedAt: new Date(),
      updatedAt: new Date(),
      settings: {
        ...(existingStore.settings ?? {}),
        location,
        category: storeCategory,
      } as Record<string, unknown>,
    })
    .where(eq(storesTable.id, storeId))
    .returning();

  const [existingSettings] = await db
    .select()
    .from(storeSettingsTable)
    .where(eq(storeSettingsTable.storeId, storeId))
    .limit(1);

  const settingsPayload = {
    storeId,
    logoUrl: logoUrl ?? existingSettings?.logoUrl ?? null,
    faviconUrl: existingSettings?.faviconUrl ?? null,
    primaryColor: existingSettings?.primaryColor ?? "#1A0D00",
    fontFamily: existingSettings?.fontFamily ?? "Inter",
    navbarMenu: existingSettings?.navbarMenu ?? [
      { label: "Home", url: "/" },
      { label: "Products", url: "/products" },
      { label: "About", url: "/about" },
    ],
    footerLinks: existingSettings?.footerLinks ?? [
      { label: "Privacy", url: "/privacy" },
      { label: "Contact", url: "/contact" },
    ],
    socialLinks: existingSettings?.socialLinks ?? {},
    landingTemplateId: templateId,
    updatedAt: new Date(),
  };

  if (existingSettings) {
    await db.update(storeSettingsTable).set(settingsPayload).where(eq(storeSettingsTable.storeId, storeId));
  } else {
    await db.insert(storeSettingsTable).values(settingsPayload);
  }

  const [product] = await db
    .insert(productsTable)
    .values({
      storeId,
      name: primaryProductName,
      slug: toSlug(primaryProductName),
      description: `${primaryProductName} by ${storeName}`,
      price: 0,
      currency: "NPR",
      stock: 100,
      status: "active",
      isActive: true,
    })
    .returning();

  const imageUrls = [primaryProductImageUrl, ...extraProductImageUrls].slice(0, 9);
  if (imageUrls.length > 0) {
    await db.insert(productImagesTable).values(
      imageUrls.map((url, idx) => ({
        storeId,
        productId: product.id,
        url,
        altText: `${primaryProductName} image ${idx + 1}`,
        position: idx,
        isPrimary: idx === 0,
      })),
    );
  }

  const heroImage = logoUrl ?? primaryProductImageUrl;
  const sections = [
    {
      id: randomUUID(),
      type: "hero",
      props: {
        heading: `${storeName}`,
        subtext: `${storeCategory} from ${location}. Built with Nepalix.`,
        buttonLabel: "Shop now",
        bgImage: heroImage,
      },
    },
    {
      id: randomUUID(),
      type: "productGrid",
      props: {
        title: `Featured in ${storeName}`,
        productIds: [product.id],
      },
    },
    {
      id: randomUUID(),
      type: "imageText",
      props: {
        imageUrl: primaryProductImageUrl,
        text: `${primaryProductName} is ready. Customize this page any time from your editor.`,
      },
    },
  ];

  const [existingHomePage] = await db
    .select()
    .from(storefrontPagesTable)
    .where(and(eq(storefrontPagesTable.storeId, storeId), eq(storefrontPagesTable.slug, "home")))
    .limit(1);

  const [page] = existingHomePage
    ? await db
        .update(storefrontPagesTable)
        .set({
          title: `${storeName} Home`,
          templatePresetId: templateId,
          sections,
          isPublished: true,
          updatedAt: new Date(),
        })
        .where(eq(storefrontPagesTable.id, existingHomePage.id))
        .returning()
    : await db
        .insert(storefrontPagesTable)
        .values({
          storeId,
          slug: "home",
          title: `${storeName} Home`,
          content: { schemaVersion: 1 },
          sections,
          templatePresetId: templateId,
          isPublished: true,
        })
        .returning();

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      onboardingCompletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, user.id))
    .returning();

  // Auto-start 14-day trial if user has no subscription yet
  const [existingSub] = await db
    .select({ id: subscriptionsTable.id })
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, user.id))
    .limit(1);
  if (!existingSub) {
    try {
      await createTrialSubscription(user.id);
    } catch (e) {
      logger.warn({ err: e, userId: user.id }, "Could not auto-start trial during onboarding");
    }
  }

  res.json({
    user: toAuthUserResponseWithSession(updatedUser, req.session),
    store: { id: store.id, slug: store.slug, name: store.name },
    page: { id: page.id, slug: page.slug, isPublished: page.isPublished },
    generatedProductId: product.id,
  });
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

    res.json({ user: toAuthUserResponse(user), token });
  } catch (err) {
    throw err;
  }
});

router.post("/logout", authMiddleware, async (req: AuthRequest, res: Response) => {
  if (
    req.session &&
    req.session.impersonatorUserId &&
    req.session.impersonatedStoreId &&
    !req.session.impersonationEndedAt
  ) {
    await db.insert(impersonationAuditLogsTable).values({
      sessionId: req.session.id,
      actorUserId: req.session.impersonatorUserId,
      targetUserId: req.session.userId,
      storeId: req.session.impersonatedStoreId,
      eventType: "impersonation_ended",
      metadata: { reason: "logout" },
    });
  }
  if (req.sessionToken) {
    await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.token, req.sessionToken));
  }

  res.clearCookie("session_token", { path: "/", secure: true, sameSite: "none" });
  res.clearCookie("impersonator_session_token", { path: "/", secure: true, sameSite: "none" });
  res.json({ success: true });
});

router.get("/me", authMiddleware, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  if (!user.storeId && !user.activeStoreId) {
    logger.warn({ userId: user.id, email: user.email }, "User has no storeId set");
  }
  res.json({ user: toAuthUserResponseWithSession(user, req.session) });
});

router.get("/stores", authMiddleware, async (req: AuthRequest, res: Response) => {
  const scopedStoreId = req.session?.impersonatedStoreId ?? null;
  const stores = await db
    .select({
      id: storesTable.id,
      slug: storesTable.slug,
      name: storesTable.name,
      role: storeMembershipsTable.role,
      status: storeMembershipsTable.status,
    })
    .from(storeMembershipsTable)
    .innerJoin(storesTable, eq(storeMembershipsTable.storeId, storesTable.id))
    .where(
      and(
        eq(storeMembershipsTable.userId, req.user!.id),
        eq(storeMembershipsTable.status, "active"),
        ...(scopedStoreId ? [eq(storeMembershipsTable.storeId, scopedStoreId)] : []),
      ),
    );

  res.json({
    stores: stores.map((store) => ({
      ...store,
      isActive: store.id === (req.user!.activeStoreId ?? req.user!.storeId ?? null),
    })),
  });
});

router.post("/active-store", authMiddleware, async (req: AuthRequest, res: Response) => {
  if (req.session?.impersonatorUserId) {
    res.status(403).json({ error: "Cannot switch stores while impersonating" });
    return;
  }
  const storeId = typeof req.body?.storeId === "string" ? req.body.storeId : "";
  if (!storeId) {
    res.status(400).json({ error: "storeId is required" });
    return;
  }

  const [membership] = await db
    .select({ storeId: storeMembershipsTable.storeId })
    .from(storeMembershipsTable)
    .where(
      and(
        eq(storeMembershipsTable.userId, req.user!.id),
        eq(storeMembershipsTable.storeId, storeId),
        eq(storeMembershipsTable.status, "active"),
      ),
    )
    .limit(1);

  if (!membership) {
    res.status(403).json({ error: "Store membership required" });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({
      storeId,
      activeStoreId: storeId,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, req.user!.id))
    .returning();

  res.json({ user: toAuthUserResponseWithSession(user, req.session) });
});

router.post("/impersonation/start", authMiddleware, async (req: AuthRequest, res: Response) => {
  if (req.user?.role?.toLowerCase() !== "superadmin") {
    res.status(403).json({ error: "Superadmin role required" });
    return;
  }
  if (req.session?.impersonatorUserId) {
    res.status(400).json({ error: "Nested impersonation is not allowed" });
    return;
  }
  const targetUserId = typeof req.body?.userId === "string" ? req.body.userId : "";
  const requestedStoreId = typeof req.body?.storeId === "string" ? req.body.storeId : "";
  if (!targetUserId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }
  if (targetUserId === req.user.id) {
    res.status(400).json({ error: "Cannot impersonate your own account" });
    return;
  }

  const [targetUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, targetUserId))
    .limit(1);
  if (!targetUser) {
    res.status(404).json({ error: "Target user not found" });
    return;
  }
  if (targetUser.role?.toLowerCase() === "superadmin") {
    res.status(403).json({ error: "Cannot impersonate another superadmin" });
    return;
  }

  const effectiveStoreId = requestedStoreId || targetUser.activeStoreId || targetUser.storeId;
  if (!effectiveStoreId) {
    res.status(400).json({ error: "Target store scope is required" });
    return;
  }

  const [membership] = await db
    .select({
      role: storeMembershipsTable.role,
      status: storeMembershipsTable.status,
    })
    .from(storeMembershipsTable)
    .where(
      and(
        eq(storeMembershipsTable.userId, targetUser.id),
        eq(storeMembershipsTable.storeId, effectiveStoreId),
        eq(storeMembershipsTable.status, "active"),
      ),
    )
    .limit(1);
  const role = membership?.role?.toLowerCase();
  if (!membership || (role !== "owner" && role !== "admin")) {
    res.status(403).json({ error: "Target must be an active store admin for the selected store" });
    return;
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + IMPERSONATION_MAX_AGE);
  const [session] = await db
    .insert(sessionsTable)
    .values({
      userId: targetUser.id,
      token,
      expiresAt,
      impersonatorUserId: req.user.id,
      impersonatedStoreId: effectiveStoreId,
      originalSessionToken: req.sessionToken,
      impersonationExpiresAt: expiresAt,
    })
    .returning();

  await db.insert(impersonationAuditLogsTable).values({
    sessionId: session.id,
    actorUserId: req.user.id,
    targetUserId: targetUser.id,
    storeId: effectiveStoreId,
    eventType: "impersonation_started",
    metadata: {
      originalSessionTokenPersisted: Boolean(req.sessionToken),
    },
  });

  setSessionCookie(res, token);
  res.cookie("impersonator_session_token", req.sessionToken ?? "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: IMPERSONATION_MAX_AGE,
    path: "/",
  });
  res.json({ user: toAuthUserResponseWithSession(targetUser, session) });
});

router.post("/impersonation/stop", authMiddleware, async (req: AuthRequest, res: Response) => {
  const activeSession = req.session;
  if (!activeSession?.impersonatorUserId || !activeSession.impersonatedStoreId) {
    res.status(400).json({ error: "No active impersonation session" });
    return;
  }
  const restoreToken =
    activeSession.originalSessionToken ||
    (typeof req.cookies?.impersonator_session_token === "string"
      ? req.cookies.impersonator_session_token
      : "");
  if (!restoreToken) {
    res.status(401).json({ error: "Original session is no longer available" });
    return;
  }

  const [originalSession] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.token, restoreToken))
    .limit(1);
  if (
    !originalSession ||
    originalSession.userId !== activeSession.impersonatorUserId ||
    originalSession.expiresAt <= new Date()
  ) {
    res.status(401).json({ error: "Original session expired or invalid" });
    return;
  }

  await db.insert(impersonationAuditLogsTable).values({
    sessionId: activeSession.id,
    actorUserId: activeSession.impersonatorUserId,
    targetUserId: activeSession.userId,
    storeId: activeSession.impersonatedStoreId,
    eventType: "impersonation_ended",
    metadata: { reason: "manual_stop" },
  });
  await db
    .update(sessionsTable)
    .set({
      impersonationEndedAt: new Date(),
      impersonationEndReason: "manual_stop",
    })
    .where(eq(sessionsTable.id, activeSession.id));
  await db.delete(sessionsTable).where(eq(sessionsTable.id, activeSession.id));

  setSessionCookie(res, restoreToken);
  res.clearCookie("impersonator_session_token", { path: "/", secure: true, sameSite: "none" });

  const [actorUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, activeSession.impersonatorUserId))
    .limit(1);
  if (!actorUser) {
    res.status(404).json({ error: "Impersonator user not found" });
    return;
  }
  res.json({ user: toAuthUserResponseWithSession(actorUser, originalSession) });
});

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const isHostedRuntime =
  process.env.NODE_ENV === "production" ||
  process.env.RAILWAY_ENVIRONMENT !== undefined ||
  process.env.VERCEL === "1";

function getPublicUrlEnv(name: string, localFallback: string, options?: { requiredForHosted?: boolean }) {
  const value = process.env[name]?.replace(/\/$/, "") || localFallback;
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    logger.error({ envVar: name }, "Invalid public URL environment variable");
    return null;
  }

  if (isHostedRuntime && ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
    logger.error({ envVar: name }, "Public URL cannot point to localhost in a hosted environment");
    return options?.requiredForHosted ? null : value;
  }

  return value;
}

const GOOGLE_REDIRECT_URI = getPublicUrlEnv(
  "GOOGLE_REDIRECT_URI",
  "http://localhost:3000/api/auth/google/callback",
  { requiredForHosted: true }
);
const FRONTEND_URL = (getPublicUrlEnv("FRONTEND_URL", "http://localhost:3000") ?? "").replace(/\/$/, "") + "/";

router.get("/google", (_req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
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

  if (error || !code || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    res.redirect(`${FRONTEND_URL ?? "/"}?google_auth=error`);
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
      res.redirect(`${FRONTEND_URL ?? "/"}?google_auth=error`);
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
      res.redirect(`${FRONTEND_URL ?? "/"}?google_auth=error`);
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
        await provisionStoreForUser({
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
      } catch (err) {
        logger.warn(
          { err, userId: user.id },
          "Failed to bootstrap tenant resources for new Google user"
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
    res.redirect(`${FRONTEND_URL ?? "/"}onboarding/?google_auth=success&token=${token}`);
  } catch (_err) {
    res.redirect(`${FRONTEND_URL ?? "/"}?google_auth=error`);
  }
});

export default router;
