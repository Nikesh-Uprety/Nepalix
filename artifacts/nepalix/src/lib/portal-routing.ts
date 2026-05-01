import type { AuthUser } from "@/lib/api";

export function isSuperAdminRole(role: string | null | undefined) {
  return role?.toLowerCase() === "superadmin";
}

export function getAdminHomeRoute(user: AuthUser | null | undefined) {
  return isSuperAdminRole(user?.role) ? "/admin/platform" : "/admin/dashboard";
}

export function getAuthenticatedHomeRoute(user: AuthUser | null | undefined) {
  if (!user) return "/";
  if (isSuperAdminRole(user.role)) return "/admin/platform";
  const isFreshUser =
    !user.onboardingCompletedAt && !user.storeId && !user.activeStoreId;
  if (isFreshUser) return "/onboarding";
  if (user.canAccessAdmin) return "/admin/dashboard";
  return "/billing";
}
