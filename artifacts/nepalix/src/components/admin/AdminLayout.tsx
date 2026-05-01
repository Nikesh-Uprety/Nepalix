import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  FolderTree,
  Image,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  MonitorSmartphone,
  Package,
  PanelTopOpen,
  Settings,
  Shield,
  Tag,
  Ticket,
  UserCircle,
  UserCog,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { AuthStore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getAuthenticatedHomeRoute, isSuperAdminRole } from "@/lib/portal-routing";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  page?: string;
  badge?: string;
};

const STORE_ITEMS: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
  { to: "/admin/products", label: "Products", icon: Package, page: "products" },
  { to: "/admin/orders", label: "Orders", icon: Package, page: "orders", badge: "18" },
  { to: "/admin/pos", label: "Point of Sale", icon: MonitorSmartphone, page: "pos" },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes, page: "inventory" },
  { to: "/admin/customers", label: "Customers", icon: Users, page: "customers" },
  { to: "/admin/landing-page", label: "Online Store", icon: PanelTopOpen, page: "landing-page" },
  { to: "/admin/store-users", label: "Staff & Roles", icon: Shield, page: "store-users" },
  { to: "/admin/marketing", label: "Marketing", icon: Megaphone, page: "marketing" },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, page: "analytics" },
  { to: "/billing", label: "Billing & Plan", icon: CircleDollarSign, badge: "TRIAL" },
  { to: "/admin/profile", label: "Settings", icon: Settings, page: "profile" },
];

const STORE_EXPANSION_ITEMS: NavItem[] = [
  { to: "/admin/promo-codes", label: "Promo Codes", icon: Tag, page: "promo-codes" },
  { to: "/admin/notifications", label: "Notifications", icon: Bell, page: "notifications" },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare, page: "messages" },
  { to: "/admin/images", label: "Images", icon: Image, page: "images" },
  { to: "/admin/buckets", label: "Buckets", icon: FolderTree, page: "buckets" },
  { to: "/admin/storefront-images", label: "Storefront Images", icon: Image, page: "storefront-images" },
  { to: "/admin/canvas", label: "Canvas", icon: WandSparkles, page: "landing-page" },
  { to: "/admin/profile", label: "Profile", icon: UserCircle, page: "profile" },
];

const SUPER_ITEMS: NavItem[] = [
  { to: "/admin/platform", label: "All Stores", icon: Building2 },
  { to: "/admin/platform/analytics", label: "Platform Analytics", icon: BarChart3 },
  { to: "/admin/platform/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/admin/platform/support", label: "Support Tickets", icon: Ticket, badge: "2" },
  { to: "/admin/platform/flags", label: "Feature Flags", icon: WandSparkles },
  { to: "/admin/store-users", label: "Super Admin Users", icon: UserCog },
  { to: "/admin/profile", label: "Platform Settings", icon: Settings },
];

function SidebarLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.to}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold tracking-wide transition-all duration-150 group relative",
        active
          ? "bg-[#5B4FF9] text-white"
          : "text-white/60 hover:bg-white/8 hover:text-white",
      )}
    >
      <Icon className="h-[15px] w-[15px] flex-shrink-0" />
      {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
      {!collapsed && item.badge && (
        <span
          className={cn(
            "text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded-full",
            active ? "bg-white/20 text-white" : "bg-[#5B4FF9]/80 text-white",
          )}
        >
          {item.badge}
        </span>
      )}
      {collapsed && active && (
        <span className="absolute left-full ml-2 px-2 py-1 bg-[#1F2937] text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {item.label}
        </span>
      )}
    </Link>
  );
}

export function AdminLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [location] = useLocation();
  const { user, logout, listStores, setActiveStore } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [stores, setStores] = useState<AuthStore[]>([]);
  const [switchingStore, setSwitchingStore] = useState(false);
  const superAdmin = isSuperAdminRole(user?.role);
  const allowed = new Set(user?.allowedAdminPages ?? []);
  const activeStore =
    stores.find((store) => store.id === user?.activeStoreId) ??
    stores.find((store) => store.isActive);

  const navItems = useMemo(() => {
    if (superAdmin) return SUPER_ITEMS;
    return [...STORE_ITEMS, ...STORE_EXPANSION_ITEMS].filter(
      (item) => !item.page || allowed.has(item.page),
    );
  }, [allowed, superAdmin]);

  const activeLabel =
    navItems.find((item) => location === item.to || location.startsWith(`${item.to}/`))?.label ??
    title;

  async function handleLogout() {
    await logout();
    setProfileOpen(false);
    window.location.assign("/?auth=login");
  }

  useEffect(() => {
    if (!user || superAdmin) {
      setStores([]);
      return;
    }

    let cancelled = false;
    listStores()
      .then((nextStores) => {
        if (!cancelled) {
          setStores(nextStores);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStores([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [listStores, superAdmin, user]);

  async function handleStoreChange(storeId: string) {
    if (!storeId || storeId === user?.activeStoreId) return;

    setSwitchingStore(true);
    try {
      await setActiveStore(storeId);
      const nextStores = await listStores();
      setStores(nextStores);
      setMobileOpen(false);
      setProfileOpen(false);
      window.location.href = "/admin/dashboard";
    } finally {
      setSwitchingStore(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7FA] text-[#111827]">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[80] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 sidebar-bg z-[90] flex flex-col transition-transform duration-300 lg:hidden bg-[#0F1117] border-r border-white/6 w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center px-4 py-4 border-b border-white/7">
          <div className="w-8 h-8 rounded-lg bg-[#5B4FF9] flex items-center justify-center shadow-md shadow-[#5B4FF9]/25">
            <span className="text-white font-black text-sm">N</span>
          </div>
          <div className="ml-2.5 min-w-0">
            <p className="text-sm font-black text-white tracking-tight truncate">NEPALIX</p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#5B4FF9]/80 truncate">
              {superAdmin ? "Super Admin" : "Store Admin"}
            </p>
          </div>
          <button
            className="ml-auto text-white/70 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!collapsed && !superAdmin && user?.activeStoreId && (
          <div className="mx-3 mt-3 p-2.5 rounded-lg bg-white/5 border border-white/7">
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.18em] mb-0.5">
              Active Store
            </p>
            <p className="text-xs font-bold text-white truncate">
              {activeStore?.name ?? `${user.firstName}'s Store`}
            </p>
            <p className="text-[10px] text-white/35 truncate">
              {activeStore ? `/${activeStore.slug}` : "Powered by Nepalix"}
            </p>
            {stores.length > 1 ? (
              <select
                className="mt-2 h-8 w-full rounded-md border border-white/10 bg-white/5 px-2 text-[11px] text-white outline-none"
                value={user.activeStoreId ?? ""}
                onChange={(e) => void handleStoreChange(e.target.value)}
                disabled={switchingStore}
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id} className="text-[#111827]">
                    {store.name}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map((item) => (
            <SidebarLink
              key={`${item.label}-${item.to}`}
              item={item}
              active={location === item.to || location.startsWith(`${item.to}/`)}
              collapsed={false}
              onNavigate={() => {
                setMobileOpen(false);
                setProfileOpen(false);
              }}
            />
          ))}
        </div>

        <div className="px-2 pb-3 pt-2 border-t border-white/7 space-y-0.5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:bg-red-500/15 hover:text-red-300 transition-all text-[12px] font-semibold"
          >
            <LogOut className="h-[15px] w-[15px]" />
            Sign Out
          </button>
        </div>
      </div>

      <div
        className={cn(
          "hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-out bg-[#0F1117] border-r border-white/6",
          collapsed ? "w-[60px]" : "w-[228px]",
        )}
      >
        <div className={cn("flex items-center py-4 border-b border-white/7", collapsed ? "px-3 justify-center" : "px-4")}>
          <div className="w-8 h-8 rounded-lg bg-[#5B4FF9] flex items-center justify-center shadow-md shadow-[#5B4FF9]/25">
            <span className="text-white font-black text-sm">N</span>
          </div>
          {!collapsed && (
            <div className="ml-2.5 min-w-0">
              <p className="text-sm font-black text-white tracking-tight truncate">NEPALIX</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#5B4FF9]/80 truncate">
                {superAdmin ? "Super Admin" : "Store Admin"}
              </p>
            </div>
          )}
        </div>

        {!collapsed && !superAdmin && user?.activeStoreId && (
          <div className="mx-3 mt-3 p-2.5 rounded-lg bg-white/5 border border-white/7">
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.18em] mb-0.5">
              Active Store
            </p>
            <p className="text-xs font-bold text-white truncate">
              {activeStore?.name ?? `${user.firstName}'s Store`}
            </p>
            <p className="text-[10px] text-white/35 truncate">
              {activeStore ? `/${activeStore.slug}` : "Powered by Nepalix"}
            </p>
            {stores.length > 1 ? (
              <select
                className="mt-2 h-8 w-full rounded-md border border-white/10 bg-white/5 px-2 text-[11px] text-white outline-none"
                value={user.activeStoreId ?? ""}
                onChange={(e) => void handleStoreChange(e.target.value)}
                disabled={switchingStore}
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id} className="text-[#111827]">
                    {store.name}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map((item) => (
            <SidebarLink
              key={`${item.label}-${item.to}`}
              item={item}
              active={location === item.to || location.startsWith(`${item.to}/`)}
              collapsed={collapsed}
              onNavigate={() => setProfileOpen(false)}
            />
          ))}
        </div>

        <div className="px-2 pb-3 pt-2 border-t border-white/7 space-y-0.5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:bg-red-500/15 hover:text-red-300 transition-all text-[12px] font-semibold"
          >
            <LogOut className="h-[15px] w-[15px]" />
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB]/80 flex items-center px-4 gap-3 flex-shrink-0 sticky top-0 z-40 shadow-sm shadow-black/[0.03]">
          <button
            className="lg:hidden text-[#6B7280] hover:text-[#374151] flex-shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>
          <button
            className="hidden lg:flex text-[#9CA3AF] hover:text-[#6B7280] w-7 h-7 items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-all flex-shrink-0"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <ChevronRight className="h-[14px] w-[14px]" /> : <ChevronLeft className="h-[14px] w-[14px]" />}
          </button>

          <div className="flex items-center gap-1.5 text-xs min-w-0 flex-1">
            <span className="font-semibold text-[#9CA3AF] hidden sm:inline">
              {superAdmin ? "Super Admin" : "Nepalix"}
            </span>
            <ChevronRight className="h-[10px] w-[10px] text-[#D1D5DB] hidden sm:inline flex-shrink-0" />
            <span className="font-bold text-[#111827] truncate">{activeLabel}</span>
            {(title !== activeLabel || subtitle) && (
              <>
                <ChevronRight className="h-[10px] w-[10px] text-[#D1D5DB] hidden md:inline flex-shrink-0" />
                <span className="font-medium text-[#6B7280] truncate hidden md:inline">
                  {title}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
            {!superAdmin && (
              <Link
                href={activeStore ? `/store/${activeStore.slug}` : "/"}
                className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#F3F4F6] text-[#6B7280] text-xs font-medium hover:bg-[#E5E7EB] transition-all"
              >
                View Store
              </Link>
            )}
            <button className="w-8 h-8 rounded-lg border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:bg-[#F9FAFB] relative transition-all">
              <Bell className="h-[14px] w-[14px]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-black flex items-center justify-center">
                3
              </span>
            </button>

            <div className="relative">
              <button
                className="w-8 h-8 rounded-full border-2 border-[#5B4FF9] bg-[#5B4FF9] flex items-center justify-center font-black text-xs text-white"
                onClick={() => setProfileOpen((value) => !value)}
              >
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white rounded-xl border border-[#E5E7EB] shadow-xl z-[60] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#F3F4F6]">
                    <p className="text-xs font-bold text-[#111827]">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] truncate">{user?.email}</p>
                    <span className="inline-block mt-1 rounded-full bg-[#F3F0FF] text-[#5B4FF9] px-2 py-0.5 text-[10px] font-bold capitalize">
                      {superAdmin ? "Super Admin" : user?.role}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      href={getAuthenticatedHomeRoute(user)}
                      onClick={() => setProfileOpen(false)}
                      className="w-full px-4 py-2 text-xs text-[#374151] hover:bg-[#F9FAFB] text-left flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-3 w-3" />
                      Dashboard
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setProfileOpen(false)}
                      className="w-full px-4 py-2 text-xs text-[#374151] hover:bg-[#F9FAFB] text-left flex items-center gap-2"
                    >
                      <UserCircle className="h-3 w-3" />
                      Account
                    </Link>
                    <Link
                      href="/billing"
                      onClick={() => setProfileOpen(false)}
                      className="w-full px-4 py-2 text-xs text-[#374151] hover:bg-[#F9FAFB] text-left flex items-center gap-2"
                    >
                      <CreditCard className="h-3 w-3" />
                      Billing
                    </Link>
                  </div>
                  <div className="border-t border-[#F3F4F6] p-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-xs text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg text-left flex items-center gap-2 font-medium"
                    >
                      <LogOut className="h-3 w-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 sm:p-7 md:p-8">
          <div className="fade-in max-w-[1280px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
