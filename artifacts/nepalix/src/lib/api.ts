const rawApiUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API_BASE = rawApiUrl ? `${rawApiUrl}/api` : "/api";

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
  createdAt: string;
};

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
};
