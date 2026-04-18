import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  Edit2,
  X,
  Check,
  ShieldAlert,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type AdminUser } from "@/lib/api";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { useToast } from "@/hooks/use-toast";

const ADMIN_PANEL_ROLES = [
  "superadmin",
  "owner",
  "admin",
  "manager",
  "staff",
  "sales",
  "csr",
  "marketing",
] as const;

const ADMIN_PAGE_KEYS = [
  "dashboard",
  "products",
  "orders",
  "customers",
  "analytics",
  "store-users",
  "billing",
] as const;

type AdminPanelRole = (typeof ADMIN_PANEL_ROLES)[number];
type AdminPageKey = (typeof ADMIN_PAGE_KEYS)[number];

const ROLE_BADGE_COLORS: Record<string, string> = {
  superadmin: "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20",
  owner: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  admin: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  manager: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  staff: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  sales: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  csr: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  marketing: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

const PAGE_LIMIT = 20;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NP", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function roleBadgeClass(role: string): string {
  const key = role?.toLowerCase() ?? "";
  return (
    ROLE_BADGE_COLORS[key] ??
    "text-gray-400 bg-gray-400/10 border-gray-400/20"
  );
}

export default function AdminUsers() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const q = useDebounced(searchInput, 300);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  useEffect(() => {
    setPage(0);
  }, [q]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  const actorRole = (user?.role ?? "").toLowerCase();
  const isActorSuperadmin = actorRole === "superadmin";
  const hasAdminAccess = actorRole === "superadmin" || actorRole === "owner";

  const offset = page * PAGE_LIMIT;

  const usersQuery = useQuery({
    queryKey: ["admin", "users", { q, limit: PAGE_LIMIT, offset }],
    queryFn: () =>
      api.admin.listUsers({
        q: q || undefined,
        limit: PAGE_LIMIT,
        offset,
      }),
    enabled: isAuthenticated && hasAdminAccess,
  });

  const total = usersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const users = usersQuery.data?.users ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  if (!hasAdminAccess) {
    return (
      <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
        <div className="max-w-2xl mx-auto px-4 pb-16">
          <GlassCard className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white font-heading mb-2">
              403 — Access denied
            </h1>
            <p className="text-gray-400 mb-6">
              You do not have permission to manage user accounts. Only
              superadmins and owners can access this page.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-white font-heading">
              Admin · Users
            </h1>
            <p className="text-gray-400">
              Manage user roles and admin page access overrides
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.05] transition-all"
            />
          </div>
        </div>

        {usersQuery.isError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {(usersQuery.error as Error)?.message ?? "Failed to load users"}
          </div>
        )}

        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {[
                    "Email",
                    "Name",
                    "Role",
                    "Store ID",
                    "Admin Pages",
                    "Created",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {usersQuery.isLoading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
                    </td>
                  </tr>
                )}
                {!usersQuery.isLoading && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-sm text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
                {users.map((u) => {
                  const pageCount = (u.adminPageAccess ?? []).length;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {u.firstName?.[0] ?? ""}
                            {u.lastName?.[0] ?? ""}
                          </div>
                          <span className="text-sm text-white font-medium">
                            {u.firstName} {u.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${roleBadgeClass(
                            u.role,
                          )}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 font-mono">
                        {u.storeId ? (
                          <span title={u.storeId}>
                            {u.storeId.slice(0, 8)}…
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {pageCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs">
                            {pageCount} override{pageCount === 1 ? "" : "s"}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setEditing(u)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="text-gray-300">
                  {offset + 1}–{Math.min(offset + PAGE_LIMIT, total)}
                </span>{" "}
                of <span className="text-gray-300">{total}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-xs text-gray-400">
                  Page {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      <AnimatePresence>
        {editing && (
          <EditUserModal
            key={editing.id}
            user={editing}
            isActorSuperadmin={isActorSuperadmin}
            onClose={() => setEditing(null)}
            onSaved={(updated) => {
              toast({
                title: "User updated",
                description: `${updated.email} saved successfully.`,
              });
              queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

type EditUserModalProps = {
  user: AdminUser;
  isActorSuperadmin: boolean;
  onClose: () => void;
  onSaved: (user: AdminUser) => void;
};

function EditUserModal({
  user,
  isActorSuperadmin,
  onClose,
  onSaved,
}: EditUserModalProps) {
  const queryClient = useQueryClient();

  const initialRole = (user.role ?? "").toLowerCase();
  const targetIsSuperadmin = initialRole === "superadmin";
  const locked = targetIsSuperadmin && !isActorSuperadmin;

  const [role, setRole] = useState<string>(initialRole || "staff");
  const [storeId, setStoreId] = useState<string>(user.storeId ?? "");
  const [storeIdCleared, setStoreIdCleared] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [pageAccess, setPageAccess] = useState<string[]>(
    user.adminPageAccess ?? [],
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const togglePage = (key: string) => {
    setPageAccess((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  const patch = useMemo(() => {
    const out: {
      role?: string;
      storeId?: string | null;
      firstName?: string;
      lastName?: string;
      adminPageAccess?: string[];
    } = {};

    if (role && role !== initialRole) out.role = role;

    const originalStore = user.storeId ?? "";
    if (storeIdCleared && user.storeId !== null) {
      out.storeId = null;
    } else if (!storeIdCleared && storeId.trim() !== originalStore) {
      out.storeId = storeId.trim() === "" ? null : storeId.trim();
    }

    if (firstName !== (user.firstName ?? "")) out.firstName = firstName;
    if (lastName !== (user.lastName ?? "")) out.lastName = lastName;

    const originalPages = [...(user.adminPageAccess ?? [])].sort();
    const currentPages = [...pageAccess].sort();
    const pagesChanged =
      originalPages.length !== currentPages.length ||
      originalPages.some((p, i) => p !== currentPages[i]);
    if (pagesChanged) out.adminPageAccess = pageAccess;

    return out;
  }, [
    role,
    initialRole,
    storeId,
    storeIdCleared,
    firstName,
    lastName,
    pageAccess,
    user,
  ]);

  const hasChanges = Object.keys(patch).length > 0;

  const mutation = useMutation({
    mutationFn: () => api.admin.patchUser(user.id, patch),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      onSaved(data.user);
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to save user");
    },
  });

  const handleSave = () => {
    setFormError(null);
    if (!hasChanges) {
      onClose();
      return;
    }
    mutation.mutate();
  };

  const handleClearStore = () => {
    setStoreId("");
    setStoreIdCleared(true);
  };

  const inputsDisabled = locked || mutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => (!mutation.isPending ? onClose() : null)}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0B1020] border border-white/10 shadow-2xl"
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.06] sticky top-0 bg-[#0B1020] z-10">
          <div>
            <h2 className="text-xl font-semibold text-white font-heading">
              Edit user
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {locked && (
            <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Only a superadmin can modify a superadmin.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={inputsDisabled}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400/40 transition-all disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={inputsDisabled}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400/40 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={inputsDisabled}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400/40 transition-all disabled:opacity-50"
            >
              {ADMIN_PANEL_ROLES.map((r) => {
                const disabled =
                  r === "superadmin" && !isActorSuperadmin;
                return (
                  <option
                    key={r}
                    value={r}
                    disabled={disabled}
                    className="bg-[#0B1020]"
                  >
                    {r}
                    {disabled ? " (superadmin only)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
              Store ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={storeIdCleared ? "" : storeId}
                onChange={(e) => {
                  setStoreId(e.target.value);
                  setStoreIdCleared(false);
                }}
                placeholder="UUID or leave empty"
                disabled={inputsDisabled}
                className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/40 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleClearStore}
                disabled={
                  inputsDisabled || (storeIdCleared && storeId === "")
                }
                className="px-3 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
            {storeIdCleared && (
              <p className="text-xs text-amber-400 mt-1.5">
                Store ID will be cleared on save.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Admin page access overrides
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ADMIN_PAGE_KEYS.map((key) => {
                const checked = pageAccess.includes(key);
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all ${
                      checked
                        ? "bg-cyan-400/10 border-cyan-400/40 text-cyan-300"
                        : "bg-white/[0.02] border-white/10 text-gray-300 hover:border-white/20"
                    } ${
                      inputsDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePage(key)}
                      disabled={inputsDisabled}
                      className="sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        checked
                          ? "bg-cyan-400 border-cyan-400"
                          : "border-white/20"
                      }`}
                    >
                      {checked && (
                        <Check className="w-3 h-3 text-[#0B1020]" />
                      )}
                    </span>
                    <span>{key}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {formError && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {formError}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06] sticky bottom-0 bg-[#0B1020]">
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={inputsDisabled || !hasChanges}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] text-white text-sm font-medium hover:shadow-[0_4px_20px_rgba(6,182,212,0.35)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {mutation.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
