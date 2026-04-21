import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ShoppingCart, Users, Package, Wallet, ArrowRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { api, type AdminAnalyticsOverview, type AdminOrdersTrendPoint } from "@/lib/api";

function formatNpr(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<AdminAnalyticsOverview | null>(null);
  const [trend, setTrend] = useState<AdminOrdersTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([api.admin.analytics.overview(), api.admin.analytics.ordersTrend(14)])
      .then(([ovRes, trRes]) => {
        if (cancelled) return;
        if (ovRes.status === "fulfilled") setOverview(ovRes.value);
        else setError(ovRes.reason?.message ?? "Failed to load overview");
        if (trRes.status === "fulfilled") setTrend(trRes.value.series);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const maxRev = Math.max(1, ...trend.map((p) => p.revenue));

  return (
    <AdminLayout title="Dashboard" subtitle="At-a-glance store performance">
      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Revenue"
          value={loading ? "…" : formatNpr(overview?.revenue ?? 0)}
          icon={<Wallet className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          label="Orders"
          value={loading ? "…" : (overview?.orders ?? 0).toLocaleString()}
          icon={<ShoppingCart className="h-5 w-5" />}
          accent="cyan"
        />
        <StatCard
          label="Customers"
          value={loading ? "…" : (overview?.customers ?? 0).toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          accent="purple"
        />
        <StatCard
          label="Products"
          value={loading ? "…" : (overview?.products ?? 0).toLocaleString()}
          icon={<Package className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0B1220] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Revenue · Last 14 days</h2>
              <p className="text-xs text-white/40">Daily revenue trend</p>
            </div>
            <Link
              href="/admin/analytics"
              className="text-xs text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
            >
              View analytics <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {trend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-white/40">
              No order data yet
            </div>
          ) : (
            <div className="h-48 flex items-end gap-1.5">
              {trend.map((p) => {
                const h = (p.revenue / maxRev) * 100;
                return (
                  <div
                    key={p.day}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    title={`${p.day} · ${formatNpr(p.revenue)} · ${p.orders} orders`}
                  >
                    <div className="w-full bg-gradient-to-t from-cyan-500/30 to-cyan-400/80 rounded-t transition-opacity group-hover:opacity-100"
                      style={{ height: `${Math.max(2, h)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0B1220] p-5">
          <h2 className="text-sm font-semibold mb-3">Quick actions</h2>
          <div className="space-y-2">
            {[
              { to: "/admin/products", label: "Add a product" },
              { to: "/admin/orders", label: "View open orders" },
              { to: "/admin/promo-codes", label: "Create a promo code" },
              { to: "/admin/marketing", label: "Plan a campaign" },
              { to: "/admin/inventory", label: "Check inventory" },
            ].map((a) => (
              <Link
                key={a.to}
                href={a.to}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.05] hover:text-white"
              >
                <span>{a.label}</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-60" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
