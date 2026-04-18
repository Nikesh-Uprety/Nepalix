const rawApiUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API_BASE = rawApiUrl ? `${rawApiUrl}/api` : "/api";
export const googleAuthUrl = `${API_BASE}/auth/google`;

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
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
    throw new Error(typeof err?.error === "string" ? err.error : `Request failed: ${res.status}`);
  }

  return data as T;
}

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
};

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

export type PlanSlug = "trial" | "starter" | "growth" | "pro" | "elite";

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
      request<{ user: AuthUser }>("/auth/register", {
        method: "POST",
        body: data,
      }),

    login: (data: { email: string; password: string }) =>
      request<{ user: AuthUser }>("/auth/login", {
        method: "POST",
        body: data,
      }),

    logout: () =>
      request<{ success: boolean }>("/auth/logout", { method: "POST" }),

    me: () => request<{ user: AuthUser }>("/auth/me"),
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
      activeSubscriptions: number;
      trialingSubscriptions: number;
      totalRevenueNpr: number;
    }>("/admin/stats"),
  },
};
