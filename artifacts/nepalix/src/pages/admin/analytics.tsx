import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { useToast } from "@/hooks/use-toast";
import {
  api,
  type AdminAnalyticsOverview,
  type AdminOrdersTrendPoint,
  type AdminProduct,
} from "@/lib/api";

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [overview, setOverview] = useState<AdminAnalyticsOverview | null>(null);
  const [trend, setTrend] = useState<AdminOrdersTrendPoint[]>([]);
  const [top, setTop] = useState<AdminProduct[]>([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    Promise.allSettled([
      api.admin.analytics.overview(),
      api.admin.analytics.ordersTrend(days),
      api.admin.analytics.topProducts(),
    ])
      .then(([ov, tr, tp]) => {
        if (ov.status === "fulfilled") setOverview(ov.value);
        if (tr.status === "fulfilled") setTrend(tr.value.series);
        if (tp.status === "fulfilled") setTop(tp.value.products);
      })
      .catch((e) => toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }));
  }, [days, toast]);

  const maxOrders = Math.max(1, ...trend.map((p) => p.orders));

  return (
    <AdminLayout title="Analytics" subtitle="Performance insights for your store">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue" value={`Rs ${(overview?.revenue ?? 0).toLocaleString()}`} accent="emerald" />
        <StatCard label="Orders" value={(overview?.orders ?? 0).toLocaleString()} accent="cyan" />
        <StatCard label="Customers" value={(overview?.customers ?? 0).toLocaleString()} accent="purple" />
        <StatCard label="Products" value={(overview?.products ?? 0).toLocaleString()} accent="amber" />
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0B1220] p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Orders · last {days} days</h3>
          <div className="flex gap-2">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`text-xs px-2 py-1 rounded ${days === d ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        {trend.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-white/40">No data yet</div>
        ) : (
          <div className="h-40 flex items-end gap-1">
            {trend.map((p) => (
              <div key={p.day} className="flex-1" title={`${p.day} · ${p.orders} orders`}>
                <div
                  className="w-full bg-gradient-to-t from-purple-500/30 to-purple-400/80 rounded-t"
                  style={{ height: `${Math.max(2, (p.orders / maxOrders) * 100)}%` }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0B1220] p-5">
        <h3 className="text-sm font-semibold mb-3">Top products</h3>
        {top.length === 0 ? (
          <div className="text-sm text-white/40">No product data yet</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {top.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <span>{p.name}</span>
                <span className="text-white/60">stock {p.stock} · Rs {p.price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}
