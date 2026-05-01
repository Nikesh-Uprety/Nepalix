const rawApiUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API_BASE = rawApiUrl ? `${rawApiUrl}/api` : "/api";
export const googleAuthUrl = `${API_BASE}/auth/google`;

const SESSION_TOKEN_KEY = "nepalix_session_token";
export function storeSessionToken(token: string) {
  try { localStorage.setItem(SESSION_TOKEN_KEY, token); } catch {}
}
export function getSessionToken(): string | null {
  try { return localStorage.getItem(SESSION_TOKEN_KEY); } catch { return null; }
}
export function clearSessionToken() {
  try { localStorage.removeItem(SESSION_TOKEN_KEY); } catch {}
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  const storedToken = getSessionToken();

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
        ...headers,
      },
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Network error — please check your connection and try again");
  }

  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Unexpected server response (${res.status})`);
    }
  }

  if (!res.ok) {
    const err = data as Record<string, unknown>;
    throw new ApiError(
      typeof err?.error === "string" ? err.error : `Request failed: ${res.status}`,
      res.status,
    );
  }

  return data as T;
}

async function requestFormData<T>(
  path: string,
  body: FormData,
  options: Omit<RequestOptions, "body"> = {},
): Promise<T> {
  const { method = "POST", headers = {} } = options;
  const storedToken = getSessionToken();

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
        ...headers,
      },
      credentials: "include",
      body,
    });
  } catch {
    throw new Error("Network error — please check your connection and try again");
  }

  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Unexpected server response (${res.status})`);
    }
  }

  if (!res.ok) {
    const err = data as Record<string, unknown>;
    throw new ApiError(
      typeof err?.error === "string" ? err.error : `Request failed: ${res.status}`,
      res.status,
    );
  }

  return data as T;
}

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  storeId: string | null;
  activeStoreId: string | null;
  adminPageAccess: string[] | null;
  canAccessAdmin: boolean;
  allowedAdminPages: string[];
  onboardingCompletedAt: string | null;
  impersonation: {
    active: boolean;
    impersonatorUserId: string;
    storeId: string;
    expiresAt: string;
  } | null;
  createdAt: string;
};

export type AuthStore = {
  id: string;
  slug: string;
  name: string;
  role: string;
  status: string;
  isActive: boolean;
};

export type RegisterStartResult = {
  requiresVerification: boolean;
  email: string;
  expiresInSeconds: number;
};

export type CompleteOnboardingInput = {
  storeName: string;
  storeCategory: string;
  location: string;
  logoUrl?: string;
  primaryProductName: string;
  primaryProductImageUrl: string;
  extraProductImageUrls?: string[];
};

export type PublicStorePage = {
  id: string;
  slug: string;
  title: string;
  content: unknown;
  sections?: Array<{ id: string; type: string; props: Record<string, unknown>; styles?: Record<string, string> }>;
  templatePresetId?: string | null;
  isPublished: boolean;
  updatedAt: string;
};

export type PublicStore = {
  id: string;
  slug: string;
  name: string;
  legalName: string | null;
  planCode: string;
  status: string;
  settings: {
    timezone?: string;
    currency?: string;
    locale?: string;
    contactEmail?: string;
    contactPhone?: string;
  } | null;
};

export type PublicStoreProduct = {
  id: string;
  storeId: string;
  name: string;
  slug: string | null;
  description: string | null;
  sku: string | null;
  price: number;
  comparePrice: number | null;
  currency: string;
  stock: number;
  images: Array<{ id: string; url: string; isPrimary: boolean }>;
  status: string;
  isActive: boolean;
  variants: Array<{ id: string; price: number; stock: number; isActive: boolean }>;
};

export type StoreSettings = {
  storeId: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  fontFamily: string;
  navbarMenu: Array<{ label: string; url: string }>;
  footerLinks: Array<{ label: string; url: string }>;
  socialLinks: Record<string, string>;
  landingTemplateId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ManagedStore = {
  id: string;
  slug: string;
  name: string;
  legalName: string | null;
  status: "active" | "suspended" | "archived";
  role: string;
  isActive: boolean;
  createdAt: string;
};

export type AdminProductStatus = "active" | "draft" | "archived";

export type AdminProduct = {
  id: string;
  storeId: string;
  name: string;
  slug: string | null;
  description: string | null;
  sku: string | null;
  price: number;
  compareAtPrice?: number | null;
  comparePrice: number | null;
  costPrice?: number | null;
  currency: string;
  stock: number;
  totalStock?: number;
  images: string[];
  categoryId?: string | null;
  category?: AdminProductCategory | null;
  firstImage?: AdminProductImage | null;
  variantCount?: number;
  weight?: number | null;
  tags?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  featuredImageUrl?: string | null;
  status: AdminProductStatus | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductVariant = {
  id: string;
  storeId: string;
  productId: string;
  sku: string | null;
  title: string;
  attributes: Record<string, string>;
  position: number;
  price: number;
  compareAtPrice: number | null;
  comparePrice: number | null;
  costPrice: number | null;
  currency: string;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductImage = {
  id: string;
  storeId: string;
  productId: string;
  variantId: string | null;
  url: string;
  altText: string | null;
  alt: string | null;
  position: number;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductCategory = {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  children?: AdminProductCategory[];
};

export type AdminProductsListResponse = {
  products: AdminProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminProductDetailResponse = {
  product: AdminProduct;
  variants: AdminProductVariant[];
  images: AdminProductImage[];
  category: AdminProductCategory | null;
};

export type AdminProductStats = {
  total: number;
  active: number;
  draft: number;
  archived: number;
  outOfStock: number;
};

export type AdminProductInput = {
  name: string;
  slug?: string;
  description?: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  comparePrice?: number;
  costPrice?: number;
  currency?: string;
  stock?: number;
  categoryId?: string | null;
  weight?: number;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  featuredImageUrl?: string | null;
  images?: string[] | Array<{
    url: string;
    altText?: string;
    position?: number;
    isPrimary?: boolean;
    variantId?: string | null;
  }>;
  productImages?: Array<{
    url: string;
    altText?: string;
    position?: number;
    isPrimary?: boolean;
    variantId?: string | null;
  }>;
  variants?: Array<{
    sku?: string;
    title?: string;
    attributes?: Record<string, string>;
    position?: number;
    price?: number;
    compareAtPrice?: number;
    comparePrice?: number;
    costPrice?: number;
    currency?: string;
    stock?: number;
    lowStockThreshold?: number;
    isActive?: boolean;
  }>;
  status?: AdminProductStatus;
  isActive?: boolean;
};

export type AdminProductVariantInput = NonNullable<AdminProductInput["variants"]>[number];

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  items: { productId: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

export type AdminCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
};

export type AdminCustomerInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
};

export type AdminInventoryItem = {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  price: number;
  status: string;
};

export type AdminPromoCode = {
  id: string;
  storeId: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminPromoCodeInput = {
  code: string;
  description?: string;
  discountType?: "percent" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  usageLimit?: number;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
};

export type AdminMarketingCampaign = {
  id: string;
  storeId: string;
  name: string;
  channel: string;
  status: string;
  subject: string | null;
  content: string | null;
  audience: unknown;
  sentCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminMarketingCampaignInput = {
  name: string;
  channel?: "email" | "sms" | "whatsapp" | "push";
  status?: "draft" | "scheduled" | "sent" | "paused";
  subject?: string;
  content?: string;
  scheduledAt?: string;
};

export type AdminNotification = {
  id: string;
  storeId: string;
  userId: string | null;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  meta: unknown;
  isRead: boolean;
  createdAt: string;
};

export type AdminBill = {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  planSlug: string | null;
  planName: string | null;
  provider: string;
  providerTxnId: string | null;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

export type AdminAnalyticsOverview = {
  orders: number;
  revenue: number;
  customers: number;
  products: number;
};

export type AdminOrdersTrendPoint = { day: string; orders: number; revenue: number };

export type DemoBooking = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessType: string;
  timeSlot: string;
  message: string | null;
  status: string;
  createdAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  storeId: string | null;
  adminPageAccess: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminStore = {
  id: string;
  slug: string;
  name: string;
  status: "active" | "suspended" | "archived";
  planCode: string;
  isVerified: boolean;
  createdAt: string;
};

export type AdminFeatureFlags = Record<string, boolean>;

export type AdminMediaBucket = {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminMediaAsset = {
  id: string;
  storeId: string;
  bucketId: string | null;
  title: string | null;
  url: string;
  mimeType: string | null;
  sizeBytes: string | null;
  metadata: unknown;
  isStorefront: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminStorefrontPage = {
  id: string;
  storeId: string;
  slug: string;
  title: string;
  content: unknown;
  sections: Array<{ id: string; type: string; props: Record<string, unknown>; styles?: Record<string, string> }>;
  templatePresetId: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlanSlug = "free" | "starter" | "business" | "enterprise";

export type PlanFeatures = {
  ordersPerYear: number | null;
  products: number | null;
  staff: number | null;
  locations: number | null;
  pos: boolean;
  advancedInventory: boolean;
  abandonedCart: boolean;
  funnelBuilder: boolean;
  upsellCrossSell: boolean;
  analyticsLevel: "basic" | "advanced" | "enterprise";
  prioritySupport: boolean;
  customIntegrations: boolean;
  dedicatedManager: boolean;
};

export type Plan = {
  id: string;
  slug: PlanSlug;
  name: string;
  tagline: string | null;
  yearlyPrice: number;
  monthlyPrice: number | null;
  trialDays: number;
  features: PlanFeatures;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired";

export type CurrentSubscription = {
  id: string;
  planSlug: PlanSlug;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  plan: Plan;
} | null;

export type Payment = {
  id: string;
  subscriptionId: string | null;
  userId: string;
  planId: string;
  provider: "khalti" | "esewa" | "mock";
  providerTxnId: string | null;
  amount: number;
  currency: string;
  status: "pending" | "verified" | "failed";
  rawResponse: unknown;
  createdAt: string;
  updatedAt: string;
};

export type PaymentInitiateKhaltiResult = { paymentId: string; paymentUrl: string; pidx: string; provider: "khalti" };
export type PaymentInitiateEsewaResult = { paymentId: string; formUrl: string; fields: Record<string, string>; provider: "esewa" };
export type PaymentInitiateResult = PaymentInitiateKhaltiResult | PaymentInitiateEsewaResult;

export const api = {
  auth: {
    register: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) =>
      request<RegisterStartResult>("/auth/register", {
        method: "POST",
        body: data,
      }),

    verifyRegistration: (data: { email: string; code: string }) =>
      request<{ user: AuthUser; token: string }>("/auth/register/verify", {
        method: "POST",
        body: data,
      }),
    resendRegistrationCode: (data: { email: string }) =>
      request<RegisterStartResult>("/auth/register/resend", {
        method: "POST",
        body: data,
      }),
    uploadOnboardingImage: (data: { fileName: string; contentType: string; dataBase64: string }) =>
      request<{ url: string }>("/auth/onboarding/upload", {
        method: "POST",
        body: data,
      }),

    completeOnboarding: (data: CompleteOnboardingInput) =>
      request<{
        user: AuthUser;
        store: { id: string; slug: string; name: string };
        page: { id: string; slug: string; isPublished: boolean };
        generatedProductId: string;
      }>("/auth/onboarding/complete", {
        method: "POST",
        body: data,
      }),

    login: (data: { email: string; password: string }) =>
      request<{ user: AuthUser; token: string }>("/auth/login", {
        method: "POST",
        body: data,
      }),

    logout: () =>
      request<{ success: boolean }>("/auth/logout", { method: "POST" }),

    me: () => request<{ user: AuthUser }>("/auth/me"),
    stores: () => request<{ stores: AuthStore[] }>("/auth/stores"),
    setActiveStore: (storeId: string) =>
      request<{ user: AuthUser }>("/auth/active-store", {
        method: "POST",
        body: { storeId },
      }),
    startImpersonation: (data: { userId: string; storeId?: string }) =>
      request<{ user: AuthUser }>("/auth/impersonation/start", {
        method: "POST",
        body: data,
      }),
    stopImpersonation: () =>
      request<{ user: AuthUser }>("/auth/impersonation/stop", {
        method: "POST",
      }),
  },

  demoBookings: {
    create: (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      businessType: string;
      timeSlot: string;
      message?: string;
    }) =>
      request<{ booking: DemoBooking }>("/demo-bookings", {
        method: "POST",
        body: data,
      }),

    list: () =>
      request<{ bookings: DemoBooking[] }>("/demo-bookings"),
  },

  contact: {
    send: (data: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }) =>
      request<{ message: ContactMessage }>("/contact", {
        method: "POST",
        body: data,
      }),

    list: () =>
      request<{ messages: ContactMessage[] }>("/contact"),

    updateStatus: (id: string, status: string) =>
      request<{ message: ContactMessage }>(`/contact/${id}/status`, {
        method: "PATCH",
        body: { status },
      }),
  },

  stores: {
    listMine: () => request<{ stores: ManagedStore[] }>("/stores"),
    create: (payload: {
      name: string;
      slug?: string;
      legalName?: string;
      settings?: Partial<Omit<StoreSettings, "storeId" | "createdAt" | "updatedAt">>;
    }) => request<{ store: ManagedStore; user: AuthUser }>("/stores", { method: "POST", body: payload }),
    update: (id: string, payload: { name?: string; slug?: string; legalName?: string | null }) =>
      request<{ store: ManagedStore }>(`/stores/${id}`, { method: "PATCH", body: payload }),
    archive: (id: string) =>
      request<{ success: boolean; store: ManagedStore }>(`/stores/${id}`, { method: "DELETE" }),
    switch: (id: string) =>
      request<{ user: AuthUser }>(`/stores/${id}/switch`, { method: "POST" }),
    getSettings: (id: string) =>
      request<{ settings: StoreSettings }>(`/stores/${id}/settings`),
    updateSettings: (
      id: string,
      payload: {
        logoUrl?: string | null;
        faviconUrl?: string | null;
        primaryColor?: string;
        fontFamily?: string;
        navbarMenu?: Array<{ label: string; url: string }>;
        footerLinks?: Array<{ label: string; url: string }>;
        socialLinks?: Record<string, string>;
        landingTemplateId?: string | null;
      },
    ) =>
      request<{ settings: StoreSettings }>(`/stores/${id}/settings`, {
        method: "PUT",
        body: payload,
      }),
    getPublic: (slug: string) =>
      request<{ store: PublicStore; settings: StoreSettings | null; pages: PublicStorePage[] }>(
        `/stores/${slug}`,
      ),
    getPublicProducts: (slug: string, ids: string[]) =>
      request<{ products: PublicStoreProduct[] }>(
        `/stores/${slug}/products${ids.length ? `?ids=${encodeURIComponent(ids.join(","))}` : ""}`,
      ),
  },

  account: {
    updateProfile: (data: { firstName: string; lastName: string }) =>
      request<{ user: AuthUser }>("/account/profile", {
        method: "PATCH",
        body: data,
      }),

    changePassword: (data: {
      currentPassword: string;
      newPassword: string;
    }) =>
      request<{ success: boolean }>("/account/change-password", {
        method: "POST",
        body: data,
      }),

    listUsers: () =>
      request<{ users: AdminUser[] }>("/account/users"),
  },

  plans: {
    list: () => request<{ plans: Plan[] }>("/plans"),
    get: (slug: string) => request<{ plan: Plan }>(`/plans/${slug}`),
  },

  subscriptions: {
    current: () => request<{ subscription: CurrentSubscription }>("/subscriptions/current"),
    payments: () => request<{ payments: Payment[] }>("/subscriptions/payments"),
    cancel: () => request<{ success: boolean }>("/subscriptions/cancel", { method: "POST" }),
    startTrial: (planSlug: string) =>
      request<{ success: boolean }>("/subscriptions/trial", { method: "POST", body: { planSlug } }),
  },

  payments: {
    initiate: (data: { planSlug: PlanSlug; provider: "khalti" | "esewa" }) =>
      request<PaymentInitiateResult>("/payments/initiate", { method: "POST", body: data }),
    verify: (data: { paymentId: string; provider: "khalti" | "esewa"; pidx?: string; transactionUuid?: string }) =>
      request<{ success: boolean; subscription: CurrentSubscription; payment: Payment }>(
        "/payments/verify",
        { method: "POST", body: data }
      ),
  },

  admin: {
    listUsers: (params: { q?: string; limit?: number; offset?: number } = {}) => {
      const q = new URLSearchParams();
      if (params.q) q.set("q", params.q);
      if (params.limit !== undefined) q.set("limit", String(params.limit));
      if (params.offset !== undefined) q.set("offset", String(params.offset));
      const qs = q.toString();
      return request<{ users: AdminUser[]; total: number }>(`/admin/users${qs ? `?${qs}` : ""}`);
    },
    patchUser: (id: string, patch: Partial<{
      role: string;
      adminPageAccess: string[];
      storeId: string | null;
      firstName: string;
      lastName: string;
    }>) => request<{ user: AdminUser }>(`/admin/users/${id}`, { method: "PATCH", body: patch }),
    listSubscriptions: (params: { limit?: number; offset?: number } = {}) => {
      const q = new URLSearchParams();
      if (params.limit !== undefined) q.set("limit", String(params.limit));
      if (params.offset !== undefined) q.set("offset", String(params.offset));
      const qs = q.toString();
      return request<{
        subscriptions: Array<{
          id: string;
          userId: string;
          planId: string;
          status: SubscriptionStatus;
          trialStartedAt: string | null;
          trialEndsAt: string | null;
          currentPeriodStart: string | null;
          currentPeriodEnd: string | null;
          canceledAt: string | null;
          createdAt: string;
          updatedAt: string;
          userEmail: string | null;
          planSlug: string | null;
        }>;
        total: number;
      }>(`/admin/subscriptions${qs ? `?${qs}` : ""}`);
    },
    stats: () => request<{
      usersCount: number;
      storesCount: number;
      activeStores: number;
      activeSubscriptions: number;
      trialingSubscriptions: number;
      totalRevenueNpr: number;
    }>("/admin/stats"),
    featureFlags: () => request<{ flags: AdminFeatureFlags }>("/admin/feature-flags"),

    products: {
      list: (
        params: {
          q?: string;
          search?: string;
          status?: string;
          categoryId?: string;
          minPrice?: number;
          maxPrice?: number;
          inStock?: boolean;
          sortBy?: string;
          sortDir?: "asc" | "desc";
          page?: number;
          limit?: number;
          offset?: number;
        } = {},
      ) => {
        const q = new URLSearchParams();
        if (params.q) q.set("q", params.q);
        if (params.search) q.set("search", params.search);
        if (params.status) q.set("status", params.status);
        if (params.categoryId) q.set("categoryId", params.categoryId);
        if (params.minPrice !== undefined) q.set("minPrice", String(params.minPrice));
        if (params.maxPrice !== undefined) q.set("maxPrice", String(params.maxPrice));
        if (params.inStock !== undefined) q.set("inStock", String(params.inStock));
        if (params.sortBy) q.set("sortBy", params.sortBy);
        if (params.sortDir) q.set("sortDir", params.sortDir);
        if (params.page !== undefined) q.set("page", String(params.page));
        if (params.limit !== undefined) q.set("limit", String(params.limit));
        if (params.offset !== undefined) q.set("offset", String(params.offset));
        const qs = q.toString();
        return request<AdminProductsListResponse>(`/admin/products${qs ? `?${qs}` : ""}`);
      },
      stats: () => request<{ stats: AdminProductStats }>("/admin/products/stats"),
      get: (id: string) => request<AdminProductDetailResponse>(`/admin/products/${id}`),
      create: (input: AdminProductInput) =>
        request<AdminProductDetailResponse>("/admin/products", { method: "POST", body: input }),
      update: (id: string, input: Partial<AdminProductInput>) =>
        request<AdminProductDetailResponse>(`/admin/products/${id}`, { method: "PATCH", body: input }),
      replace: (id: string, input: Partial<AdminProductInput>) =>
        request<AdminProductDetailResponse>(`/admin/products/${id}`, { method: "PUT", body: input }),
      bulk: (payload: {
        action: "archive" | "activate" | "delete" | "updateCategory";
        ids: string[];
        payload?: Record<string, unknown>;
      }) =>
        request<{ success: boolean; updated: number; products: AdminProduct[] }>(
          "/admin/products/bulk",
          { method: "POST", body: payload },
        ),
      remove: (id: string) =>
        request<{ success: boolean }>(`/admin/products/${id}`, { method: "DELETE" }),
      listVariants: (productId: string) =>
        request<{ variants: AdminProductVariant[] }>(`/admin/products/${productId}/variants`),
      createVariant: (
        productId: string,
        input: Partial<AdminProductVariantInput>,
      ) =>
        request<{ variant: AdminProductVariant }>(`/admin/products/${productId}/variants`, {
          method: "POST",
          body: input,
        }),
      updateVariant: (
        productId: string,
        variantId: string,
        input: Partial<AdminProductVariantInput>,
      ) =>
        request<{ variant: AdminProductVariant }>(
          `/admin/products/${productId}/variants/${variantId}`,
          { method: "PUT", body: input },
        ),
      removeVariant: (productId: string, variantId: string) =>
        request<{ success: boolean }>(`/admin/products/${productId}/variants/${variantId}`, {
          method: "DELETE",
        }),
      listImages: (productId: string) =>
        request<{ images: AdminProductImage[] }>(`/admin/products/${productId}/images`),
      createImage: (productId: string, input: FormData | {
        url: string;
        altText?: string;
        position?: number;
        isPrimary?: boolean;
        variantId?: string | null;
      }) =>
        input instanceof FormData
          ? requestFormData<{ image: AdminProductImage }>(
              `/admin/products/${productId}/images`,
              input,
            )
          : request<{ image: AdminProductImage }>(`/admin/products/${productId}/images`, {
              method: "POST",
              body: input,
            }),
      updateImage: (
        productId: string,
        imageId: string,
        input: {
          url?: string;
          altText?: string;
          position?: number;
          isPrimary?: boolean;
          variantId?: string | null;
        },
      ) =>
        request<{ image: AdminProductImage }>(
          `/admin/products/${productId}/images/${imageId}`,
          { method: "PUT", body: input },
        ),
      removeImage: (productId: string, imageId: string) =>
        request<{ success: boolean }>(`/admin/products/${productId}/images/${imageId}`, {
          method: "DELETE",
        }),
    },
    categories: {
      list: () => request<{ categories: AdminProductCategory[] }>("/admin/categories"),
      create: (input: {
        name: string;
        slug?: string;
        parentId?: string | null;
        imageUrl?: string | null;
        position?: number;
      }) =>
        request<{ category: AdminProductCategory }>("/admin/categories", {
          method: "POST",
          body: input,
        }),
      update: (
        id: string,
        input: Partial<{
          name: string;
          slug: string;
          parentId: string | null;
          imageUrl: string | null;
          position: number;
        }>,
      ) =>
        request<{ category: AdminProductCategory }>(`/admin/categories/${id}`, {
          method: "PUT",
          body: input,
        }),
      remove: (id: string) =>
        request<{ success: boolean }>(`/admin/categories/${id}`, { method: "DELETE" }),
    },

    orders: {
      list: (params: { status?: string; paymentStatus?: string; limit?: number; offset?: number } = {}) => {
        const q = new URLSearchParams();
        if (params.status) q.set("status", params.status);
        if (params.paymentStatus) q.set("paymentStatus", params.paymentStatus);
        if (params.limit !== undefined) q.set("limit", String(params.limit));
        if (params.offset !== undefined) q.set("offset", String(params.offset));
        const qs = q.toString();
        return request<{ orders: AdminOrderListItem[]; total: number }>(`/admin/orders${qs ? `?${qs}` : ""}`);
      },
      get: (id: string) =>
        request<{ order: AdminOrderListItem; customer: AdminCustomer | null }>(`/admin/orders/${id}`),
      update: (id: string, patch: { status?: string; paymentStatus?: string }) =>
        request<{ order: AdminOrderListItem }>(`/admin/orders/${id}`, { method: "PATCH", body: patch }),
    },

    customers: {
      list: (params: { q?: string; limit?: number; offset?: number } = {}) => {
        const q = new URLSearchParams();
        if (params.q) q.set("q", params.q);
        if (params.limit !== undefined) q.set("limit", String(params.limit));
        if (params.offset !== undefined) q.set("offset", String(params.offset));
        const qs = q.toString();
        return request<{ customers: AdminCustomer[]; total: number }>(`/admin/customers${qs ? `?${qs}` : ""}`);
      },
      get: (id: string) =>
        request<{ customer: AdminCustomer; orders: AdminOrderListItem[] }>(`/admin/customers/${id}`),
      create: (input: AdminCustomerInput) =>
        request<{ customer: AdminCustomer }>("/admin/customers", { method: "POST", body: input }),
      update: (id: string, input: Partial<AdminCustomerInput>) =>
        request<{ customer: AdminCustomer }>(`/admin/customers/${id}`, { method: "PATCH", body: input }),
      remove: (id: string) =>
        request<{ success: boolean }>(`/admin/customers/${id}`, { method: "DELETE" }),
    },

    inventory: {
      list: () => request<{ items: AdminInventoryItem[] }>("/admin/inventory"),
      lowStock: (threshold = 10) =>
        request<{ items: AdminInventoryItem[]; threshold: number }>(
          `/admin/inventory/low-stock?threshold=${threshold}`,
        ),
      adjust: (id: string, delta: number) =>
        request<{ product: AdminProduct }>(`/admin/inventory/${id}/adjust`, {
          method: "POST",
          body: { delta },
        }),
      set: (id: string, stock: number) =>
        request<{ product: AdminProduct }>(`/admin/inventory/${id}/set`, {
          method: "POST",
          body: { stock },
        }),
    },

    promoCodes: {
      list: () => request<{ promoCodes: AdminPromoCode[] }>("/admin/promo-codes"),
      create: (input: AdminPromoCodeInput) =>
        request<{ promoCode: AdminPromoCode }>("/admin/promo-codes", { method: "POST", body: input }),
      update: (id: string, input: Partial<AdminPromoCodeInput>) =>
        request<{ promoCode: AdminPromoCode }>(`/admin/promo-codes/${id}`, { method: "PATCH", body: input }),
      remove: (id: string) =>
        request<{ success: boolean }>(`/admin/promo-codes/${id}`, { method: "DELETE" }),
    },

    analytics: {
      overview: () => request<AdminAnalyticsOverview>("/admin/analytics/overview"),
      ordersTrend: (days = 30) =>
        request<{ days: number; series: AdminOrdersTrendPoint[] }>(`/admin/analytics/orders-trend?days=${days}`),
      topProducts: () =>
        request<{ products: AdminProduct[] }>("/admin/analytics/top-products"),
    },

    marketing: {
      list: () => request<{ campaigns: AdminMarketingCampaign[] }>("/admin/marketing"),
      create: (input: AdminMarketingCampaignInput) =>
        request<{ campaign: AdminMarketingCampaign }>("/admin/marketing", { method: "POST", body: input }),
      update: (id: string, input: Partial<AdminMarketingCampaignInput>) =>
        request<{ campaign: AdminMarketingCampaign }>(`/admin/marketing/${id}`, { method: "PATCH", body: input }),
      remove: (id: string) =>
        request<{ success: boolean }>(`/admin/marketing/${id}`, { method: "DELETE" }),
    },

    notifications: {
      list: () =>
        request<{ notifications: AdminNotification[]; unread: number }>("/admin/notifications"),
      markRead: (id: string) =>
        request<{ notification: AdminNotification }>(`/admin/notifications/${id}/read`, { method: "POST" }),
      markAllRead: () =>
        request<{ success: boolean }>("/admin/notifications/read-all", { method: "POST" }),
      create: (input: { type?: string; title: string; body?: string; link?: string }) =>
        request<{ notification: AdminNotification }>("/admin/notifications", { method: "POST", body: input }),
    },

    bills: {
      list: () =>
        request<{
          bills: AdminBill[];
          summary: { totalRevenue: number; pending: number; verified: number; failed: number };
        }>("/admin/bills"),
    },
    stores: {
      list: (params: { q?: string; limit?: number; offset?: number } = {}) => {
        const q = new URLSearchParams();
        if (params.q) q.set("q", params.q);
        if (params.limit !== undefined) q.set("limit", String(params.limit));
        if (params.offset !== undefined) q.set("offset", String(params.offset));
        const qs = q.toString();
        return request<{ stores: AdminStore[]; total: number }>(`/admin/stores${qs ? `?${qs}` : ""}`);
      },
      updateStatus: (id: string, status: "active" | "suspended" | "archived") =>
        request<{ store: AdminStore }>(`/admin/stores/${id}/status`, {
          method: "PATCH",
          body: { status },
        }),
    },
    pos: {
      products: () =>
        request<{ products: Array<{ id: string; name: string; price: number; stock: number; sku: string | null }> }>(
          "/admin/pos/products",
        ),
      orders: () => request<{ orders: AdminOrderListItem[] }>("/admin/pos/orders"),
      checkout: (payload: {
        items: Array<{ productId: string; name: string; price: number; quantity: number }>;
        tax?: number;
      }) => request<{ order: AdminOrderListItem }>("/admin/pos/checkout", { method: "POST", body: payload }),
    },
    media: {
      listImages: () => request<{ assets: AdminMediaAsset[] }>("/admin/media/images"),
      createImage: (payload: {
        title?: string;
        url: string;
        bucketId?: string;
        mimeType?: string;
        isStorefront?: boolean;
      }) => request<{ asset: AdminMediaAsset }>("/admin/media/images", { method: "POST", body: payload }),
      deleteImage: (id: string) =>
        request<{ success: boolean }>(`/admin/media/images/${id}`, { method: "DELETE" }),
      listBuckets: () => request<{ buckets: AdminMediaBucket[] }>("/admin/media/buckets"),
      createBucket: (payload: { name: string; slug: string }) =>
        request<{ bucket: AdminMediaBucket }>("/admin/media/buckets", { method: "POST", body: payload }),
      listStorefrontImages: () =>
        request<{ assets: AdminMediaAsset[] }>("/admin/media/storefront-images"),
      upload: (payload: {
        fileName: string;
        contentType: string;
        dataBase64: string;
        title?: string;
        bucketId?: string;
        isStorefront?: boolean;
      }) =>
        request<{ asset: AdminMediaAsset; url: string }>("/admin/media/upload", {
          method: "POST",
          body: payload,
        }),
    },
    landing: {
      listPages: () => request<{ pages: AdminStorefrontPage[] }>("/admin/landing/pages"),
      getPage: (id: string) => request<{ page: AdminStorefrontPage }>(`/admin/landing/pages/${id}`),
      listTemplates: () =>
        request<{ templates: Array<{ id: string; name: string; pageTitle: string }> }>(
          "/admin/landing/templates",
        ),
      applyTemplate: (payload: { templateId: string; pageId?: string; slug?: string }) =>
        request<{ page: AdminStorefrontPage }>("/admin/landing/templates/apply", {
          method: "POST",
          body: payload,
        }),
      createPage: (payload: {
        slug: string;
        title: string;
        content?: unknown;
        sections?: Array<{ id: string; type: string; props: Record<string, unknown>; styles?: Record<string, string> }>;
        templatePresetId?: string | null;
        isPublished?: boolean;
      }) =>
        request<{ page: AdminStorefrontPage }>("/admin/landing/pages", { method: "POST", body: payload }),
      updatePage: (
        id: string,
        payload: Partial<{
          slug: string;
          title: string;
          content: unknown;
          sections: Array<{ id: string; type: string; props: Record<string, unknown>; styles?: Record<string, string> }>;
          templatePresetId: string | null;
          isPublished: boolean;
        }>,
      ) =>
        request<{ page: AdminStorefrontPage }>(`/admin/landing/pages/${id}`, {
          method: "PATCH",
          body: payload,
        }),
      deletePage: (id: string) =>
        request<{ success: boolean }>(`/admin/landing/pages/${id}`, { method: "DELETE" }),
    },
    logs: {
      recent: () =>
        request<{ events: Array<{ type: string; id: string; label: string; createdAt: string }> }>(
          "/admin/logs/recent",
        ),
    },
  },
};
