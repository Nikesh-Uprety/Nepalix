export const ADMIN_PANEL_ROLES = [
  "superadmin",
  "owner",
  "admin",
  "manager",
  "staff",
  "sales",
  "csr",
  "marketing",
] as const;

export const ADMIN_PAGE_KEYS = [
  "dashboard",
  "products",
  "orders",
  "customers",
  "analytics",
  "store-users",
  "billing",
  "inventory",
  "promo-codes",
  "marketing",
  "notifications",
  "messages",
  "bills",
  "profile",
] as const;

export type AdminPanelRole = (typeof ADMIN_PANEL_ROLES)[number];
export type AdminPageKey = (typeof ADMIN_PAGE_KEYS)[number];

const ALL_PAGES: readonly AdminPageKey[] = ADMIN_PAGE_KEYS;

const ADMIN_PAGE_ACCESS: Record<AdminPanelRole, readonly AdminPageKey[]> = {
  superadmin: ALL_PAGES,
  owner: ALL_PAGES,
  admin: [
    "dashboard",
    "products",
    "orders",
    "customers",
    "analytics",
    "store-users",
    "inventory",
    "promo-codes",
    "marketing",
    "notifications",
    "messages",
    "bills",
    "profile",
  ],
  manager: [
    "dashboard",
    "products",
    "orders",
    "customers",
    "analytics",
    "inventory",
    "promo-codes",
    "marketing",
    "notifications",
    "messages",
    "profile",
  ],
  staff: [
    "dashboard",
    "products",
    "orders",
    "customers",
    "inventory",
    "notifications",
    "profile",
  ],
  sales: ["dashboard", "orders", "customers", "notifications", "profile"],
  csr: ["dashboard", "orders", "customers", "messages", "notifications", "profile"],
  marketing: [
    "dashboard",
    "customers",
    "analytics",
    "marketing",
    "promo-codes",
    "notifications",
    "messages",
    "profile",
  ],
};

const OVERRIDE_RESTRICTED_PAGES_BY_ROLE: Partial<
  Record<AdminPanelRole, readonly AdminPageKey[]>
> = {
  manager: ["store-users", "billing"],
  staff: ["store-users", "billing"],
  csr: ["store-users", "billing"],
  sales: ["store-users", "billing"],
  marketing: ["store-users", "billing"],
};

export function normalizeAdminRole(
  role: string | null | undefined,
): AdminPanelRole | null {
  if (!role) return null;
  const normalized = role.toLowerCase() as AdminPanelRole;
  return ADMIN_PANEL_ROLES.includes(normalized) ? normalized : null;
}

export function canAccessAdminPanel(role: string | null | undefined): boolean {
  return normalizeAdminRole(role) !== null;
}

export function normalizeAdminPageKey(
  page: string | null | undefined,
): AdminPageKey | null {
  if (!page) return null;
  return ADMIN_PAGE_KEYS.includes(page as AdminPageKey)
    ? (page as AdminPageKey)
    : null;
}

export function normalizeAdminPageList(
  pages: Array<string | null | undefined> | null | undefined,
): AdminPageKey[] {
  const normalized = (pages ?? [])
    .map((page) => normalizeAdminPageKey(page))
    .filter((page): page is AdminPageKey => Boolean(page));
  return Array.from(new Set(normalized));
}

export function sanitizeAdminPageOverrides(
  role: string | null | undefined,
  overrides: Array<string | null | undefined> | null | undefined,
): AdminPageKey[] {
  const normalizedRole = normalizeAdminRole(role);
  if (!normalizedRole) return [];

  const normalizedOverrides = normalizeAdminPageList(overrides);
  const restricted = new Set(OVERRIDE_RESTRICTED_PAGES_BY_ROLE[normalizedRole] ?? []);
  if (restricted.size === 0) return normalizedOverrides;

  return normalizedOverrides.filter((p) => !restricted.has(p));
}

export function getAdminAllowedPages(
  role: string | null | undefined,
  overrides?: Array<string | null | undefined> | null,
): AdminPageKey[] {
  const normalizedRole = normalizeAdminRole(role);
  if (!normalizedRole) return [];
  const base = [...ADMIN_PAGE_ACCESS[normalizedRole]];
  const extras = sanitizeAdminPageOverrides(normalizedRole, overrides);
  return Array.from(new Set([...base, ...extras]));
}

export function canAccessAdminPage(
  role: string | null | undefined,
  page: AdminPageKey,
  overrides?: Array<string | null | undefined> | null,
): boolean {
  return getAdminAllowedPages(role, overrides).includes(page);
}
