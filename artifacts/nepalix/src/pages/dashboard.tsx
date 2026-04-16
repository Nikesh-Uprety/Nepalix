import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  Calendar,
  Settings,
  LogOut,
  Store,
  BarChart3,
  Bell,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { Link } from "wouter";

const stats = [
  {
    label: "Total Revenue",
    value: "Rs. 2,84,500",
    change: "+12.5%",
    positive: true,
    icon: TrendingUp,
  },
  {
    label: "Orders Today",
    value: "48",
    change: "+8.2%",
    positive: true,
    icon: ShoppingCart,
  },
  {
    label: "Active Products",
    value: "312",
    change: "+3",
    positive: true,
    icon: Package,
  },
  {
    label: "Customers",
    value: "1,847",
    change: "+24 this month",
    positive: true,
    icon: Users,
  },
];

const recentOrders = [
  {
    id: "#NP-2410",
    customer: "Anjali Tamang",
    items: 3,
    total: "Rs. 4,200",
    status: "Delivered",
  },
  {
    id: "#NP-2409",
    customer: "Bikash Rai",
    items: 1,
    total: "Rs. 1,800",
    status: "Processing",
  },
  {
    id: "#NP-2408",
    customer: "Deepa Shrestha",
    items: 5,
    total: "Rs. 8,750",
    status: "Shipped",
  },
  {
    id: "#NP-2407",
    customer: "Ganesh Karki",
    items: 2,
    total: "Rs. 3,100",
    status: "Delivered",
  },
  {
    id: "#NP-2406",
    customer: "Hritu Magar",
    items: 4,
    total: "Rs. 6,400",
    status: "Delivered",
  },
];

const statusColors: Record<string, string> = {
  Delivered: "text-green-400 bg-green-400/10",
  Processing: "text-yellow-400 bg-yellow-400/10",
  Shipped: "text-blue-400 bg-blue-400/10",
  Cancelled: "text-red-400 bg-red-400/10",
};

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: ShoppingCart, label: "Orders", href: null },
  { icon: Package, label: "Products", href: null },
  { icon: Users, label: "Customers", href: null },
  { icon: Store, label: "Stores", href: null },
  { icon: BarChart3, label: "Analytics", href: null },
  { icon: Calendar, label: "Bookings", href: null },
  { icon: User, label: "Account", href: "/account" },
  { icon: Settings, label: "Settings", href: null },
];

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  async function handleLogout() {
    await logout();
    setLocation("/");
  }

  return (
    <div className="min-h-screen bg-[#070B14] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.06] bg-[#0A0F1E] shrink-0">
        <div className="p-6 border-b border-white/[0.06]">
          <img
            src="/nepalix-logo.png"
            alt="Nepalix"
            className="h-8 w-auto object-contain"
          />
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const cls = `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              item.active
                ? "bg-[#06B6D4]/15 text-cyan-400 border border-[#06B6D4]/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`;
            return item.href ? (
              <Link key={item.label} href={item.href} className={cls}>
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            ) : (
              <button key={item.label} className={cls}>
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-400/5 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#070B14]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-xl font-bold text-white font-heading">
              Dashboard
            </h1>
            <p className="text-sm text-gray-400">
              Welcome back, {user?.firstName}!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#06B6D4]" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center text-white text-sm font-semibold">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <GlassCard className="relative overflow-hidden">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/15 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          stat.positive
                            ? "text-green-400 bg-green-400/10"
                            : "text-red-400 bg-red-400/10"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white mb-0.5">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#06B6D4]/5 blur-xl" />
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          {/* Recent orders */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white font-heading">
                  Recent Orders
                </h2>
                <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  View all
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {["Order ID", "Customer", "Items", "Total", "Status"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-2 text-sm font-mono text-cyan-400">
                          {order.id}
                        </td>
                        <td className="py-3 px-2 text-sm text-white">
                          {order.customer}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-400">
                          {order.items} item{order.items !== 1 ? "s" : ""}
                        </td>
                        <td className="py-3 px-2 text-sm font-medium text-white">
                          {order.total}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[order.status]
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <GlassCard>
              <h2 className="text-lg font-semibold text-white font-heading mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    icon: Package,
                    label: "Add Product",
                    color: "text-purple-400 bg-purple-400/10",
                  },
                  {
                    icon: ShoppingCart,
                    label: "New Order",
                    color: "text-blue-400 bg-blue-400/10",
                  },
                  {
                    icon: Users,
                    label: "Add Customer",
                    color: "text-green-400 bg-green-400/10",
                  },
                  {
                    icon: BarChart3,
                    label: "View Report",
                    color: "text-cyan-400 bg-cyan-400/10",
                  },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm text-gray-300">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
