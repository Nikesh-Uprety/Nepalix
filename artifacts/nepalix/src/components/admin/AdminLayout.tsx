import { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  Tag,
  BarChart3,
  Megaphone,
  Bell,
  CreditCard,
  MessageSquare,
  UserCog,
  UserCircle,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  page: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3, page: "analytics" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { to: "/admin/products", label: "Products", icon: Package, page: "products" },
      { to: "/admin/inventory", label: "Inventory", icon: Boxes, page: "inventory" },
    ],
  },
  {
    label: "Sales",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ShoppingCart, page: "orders" },
      { to: "/admin/customers", label: "Customers", icon: Users, page: "customers" },
      { to: "/admin/bills", label: "Bills", icon: CreditCard, page: "bills" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { to: "/admin/promo-codes", label: "Promo Codes", icon: Tag, page: "promo-codes" },
      { to: "/admin/marketing", label: "Campaigns", icon: Megaphone, page: "marketing" },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/notifications", label: "Notifications", icon: Bell, page: "notifications" },
      { to: "/admin/messages", label: "Messages", icon: MessageSquare, page: "messages" },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/admin/store-users", label: "Store Users", icon: UserCog, page: "store-users" },
      { to: "/admin/profile", label: "Profile", icon: UserCircle, page: "profile" },
    ],
  },
];

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
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const allowed = new Set(user?.allowedAdminPages ?? []);
  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => allowed.has(i.page)),
  })).filter((g) => g.items.length > 0);

  const isActive = (to: string) => location === to || location.startsWith(to + "/");

  return (
    <div className="min-h-screen flex bg-[#070B14] text-white">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-[#0B1220] border-r border-white/5 transition-transform lg:translate-x-0 lg:static lg:inset-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold">
              N
            </div>
            <span className="font-semibold tracking-tight">Nepalix Admin</span>
          </Link>
          <button
            className="lg:hidden text-white/70 hover:text-white"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-5 overflow-y-auto h-[calc(100vh-4rem)]">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="px-3 mb-2 text-xs uppercase tracking-wider text-white/40">
                {g.label}
              </div>
              <ul className="space-y-1">
                {g.items.map((it) => {
                  const Icon = it.icon;
                  const active = isActive(it.to);
                  return (
                    <li key={it.to}>
                      <Link
                        href={it.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:text-white hover:bg-white/5",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{it.label}</span>
                        {active && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-[#0B1220]/80 backdrop-blur sticky top-0 z-20 flex items-center px-4 lg:px-8 gap-4">
          <button
            className="lg:hidden text-white/70"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-white/50 truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-xs">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[10px] font-bold">
                {user?.firstName?.[0] ?? "U"}
              </div>
              <span className="text-white/80">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-cyan-300 capitalize">{user?.role}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
