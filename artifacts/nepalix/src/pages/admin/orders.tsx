import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { api, type AdminOrderListItem } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  processing: "bg-cyan-500/15 text-cyan-300",
  shipped: "bg-blue-500/15 text-blue-300",
  delivered: "bg-emerald-500/15 text-emerald-300",
  cancelled: "bg-rose-500/15 text-rose-300",
  refunded: "bg-purple-500/15 text-purple-300",
};

const PAY_COLORS: Record<string, string> = {
  unpaid: "bg-rose-500/15 text-rose-300",
  paid: "bg-emerald-500/15 text-emerald-300",
  refunded: "bg-purple-500/15 text-purple-300",
  failed: "bg-rose-500/15 text-rose-300",
};

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const { orders } = await api.admin.orders.list({ status: filter || undefined });
      setOrders(orders);
    } catch (e) {
      toast({ title: "Failed to load orders", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.admin.orders.update(id, { status });
      setOrders((arr) => arr.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (e) {
      toast({ title: "Update failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout title="Orders" subtitle="Track and fulfil customer orders">
      <div className="mb-4 flex flex-wrap gap-2">
        {["", "pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs capitalize border ${
              filter === s
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200"
                : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white"
            }`}
          >
            {s || "all"}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0B1220] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-white/60 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Payment</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-white/50">
                  Loading…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-white/50">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div className="text-white">{o.customerName}</div>
                    {o.customerEmail && (
                      <div className="text-xs text-white/40">{o.customerEmail}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    Rs {o.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${
                        PAY_COLORS[o.paymentStatus] ?? "bg-white/5 text-white/60"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={`text-xs rounded-full px-2 py-1 capitalize border-0 ${
                        STATUS_COLORS[o.status] ?? "bg-white/5 text-white/60"
                      }`}
                    >
                      {["pending", "processing", "shipped", "delivered", "cancelled", "refunded"].map((s) => (
                        <option key={s} value={s} className="bg-[#0B1220] text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
