import {
  db,
  plansTable,
  storeDomainsTable,
  storeMembershipsTable,
  storesTable,
  storeSubscriptionsTable,
  usersTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);
}

async function nextUniqueStoreSlug(seed: string): Promise<string> {
  const base = slugify(seed) || "store";
  let idx = 0;
  while (idx < 1000) {
    const candidate = idx === 0 ? base : `${base}-${idx}`;
    const [exists] = await db
      .select({ id: storesTable.id })
      .from(storesTable)
      .where(eq(storesTable.slug, candidate))
      .limit(1);
    if (!exists) return candidate;
    idx += 1;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function provisionStoreForUser(args: {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}): Promise<{ storeId: string; storeSlug: string }> {
  const displayName = `${args.firstName} ${args.lastName}`.trim() || args.email;
  const storeSlug = await nextUniqueStoreSlug(displayName);
  const storeName = `${displayName}'s Store`;

  const [store] = await db
    .insert(storesTable)
    .values({
      slug: storeSlug,
      name: storeName,
      legalName: storeName,
      createdByUserId: args.userId,
      planCode: "free",
      settings: { currency: "NPR", locale: "en-NP", timezone: "Asia/Kathmandu" },
    })
    .returning({ id: storesTable.id, slug: storesTable.slug });

  await db.insert(storeMembershipsTable).values({
    storeId: store.id,
    userId: args.userId,
    role: "owner",
    status: "active",
  });

  await db
    .update(usersTable)
    .set({
      storeId: store.id,
      activeStoreId: store.id,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, args.userId));

  const rootDomain = process.env.TENANT_ROOT_DOMAIN?.trim();
  if (rootDomain) {
    const hostname = `${storeSlug}.${rootDomain}`;
    await db.insert(storeDomainsTable).values({
      storeId: store.id,
      hostname,
      isPrimary: true,
      isVerified: false,
    });
  }

  const [freePlan] = await db
    .select({ id: plansTable.id })
    .from(plansTable)
    .where(eq(plansTable.slug, "free"))
    .limit(1);
  if (freePlan) {
    await db.insert(storeSubscriptionsTable).values({
      storeId: store.id,
      planId: freePlan.id,
      status: "active",
      billingCycle: "yearly",
      currentPeriodStart: new Date(),
    });
  } else {
    logger.warn({ storeId: store.id }, "Free plan not found, skipping subscription");
  }

  return { storeId: store.id, storeSlug: store.slug };
}
