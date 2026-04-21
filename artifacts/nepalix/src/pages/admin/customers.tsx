import { useEffect, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api, type AdminCustomer, type AdminCustomerInput } from "@/lib/api";

const empty: AdminCustomerInput = { firstName: "", lastName: "", email: "" };

function NewCustomerModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState<AdminCustomerInput>(empty);
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      await api.admin.customers.create(form);
      toast({ title: "Customer added" });
      onSaved();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-[#0B1220] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">New customer</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Phone (optional)"
            value={form.phone ?? ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <textarea
            placeholder="Notes"
            rows={3}
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={saving || !form.firstName || !form.lastName || !form.email}
          >
            {saving ? "Saving…" : "Add customer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCustomers() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminCustomer[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { customers } = await api.admin.customers.list({ q: q || undefined });
      setItems(customers);
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (c: AdminCustomer) => {
    if (!confirm(`Delete ${c.firstName} ${c.lastName}?`)) return;
    try {
      await api.admin.customers.remove(c.id);
      load();
    } catch (e) {
      toast({ title: "Delete failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout
      title="Customers"
      subtitle="Your customer directory"
      actions={
        <Button size="sm" onClick={() => setShow(true)}>
          <Plus className="h-4 w-4 mr-1" /> New customer
        </Button>
      }
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search by name or email…"
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={load}>Search</Button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0B1220] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-white/60 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-right px-4 py-3">Orders</th>
              <th className="text-right px-4 py-3">Spent</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-white/50">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-white/50">No customers yet.</td></tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3 text-white/70">{c.email}</td>
                  <td className="px-4 py-3 text-white/60">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{c.ordersCount}</td>
                  <td className="px-4 py-3 text-right">Rs {c.totalSpent.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(c)}
                      className="text-rose-300 hover:text-rose-200 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {show && <NewCustomerModal onClose={() => setShow(false)} onSaved={() => { setShow(false); load(); }} />}
    </AdminLayout>
  );
}
