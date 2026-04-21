import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api, type AdminPromoCode, type AdminPromoCodeInput } from "@/lib/api";

const empty: AdminPromoCodeInput = {
  code: "",
  discountType: "percent",
  discountValue: 10,
  minOrderAmount: 0,
  isActive: true,
};

function CreateModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState<AdminPromoCodeInput>(empty);
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      await api.admin.promoCodes.create(form);
      toast({ title: "Promo code created" });
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
          <h3 className="font-semibold">New promo code</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-white/60" /></button>
        </div>
        <div className="space-y-3">
          <Input
            placeholder="CODE"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value as "percent" | "fixed" })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="percent">% off</option>
              <option value="fixed">Rs off</option>
            </select>
            <Input
              type="number"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
              placeholder="Value"
            />
          </div>
          <Input
            type="number"
            value={form.minOrderAmount ?? 0}
            onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
            placeholder="Min order amount (Rs)"
          />
          <Input
            placeholder="Description (optional)"
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.code}>{saving ? "Saving…" : "Create"}</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPromoCodes() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminPromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { promoCodes } = await api.admin.promoCodes.list();
      setItems(promoCodes);
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (p: AdminPromoCode) => {
    try {
      await api.admin.promoCodes.update(p.id, { isActive: !p.isActive });
      load();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const remove = async (p: AdminPromoCode) => {
    if (!confirm(`Delete ${p.code}?`)) return;
    try {
      await api.admin.promoCodes.remove(p.id);
      load();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout
      title="Promo codes"
      subtitle="Discount codes for your store"
      actions={
        <Button size="sm" onClick={() => setShow(true)}>
          <Plus className="h-4 w-4 mr-1" /> New code
        </Button>
      }
    >
      <div className="rounded-2xl border border-white/5 bg-[#0B1220] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-white/60 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Discount</th>
              <th className="text-left px-4 py-3">Min order</th>
              <th className="text-right px-4 py-3">Used</th>
              <th className="text-left px-4 py-3">Active</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-white/50">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-white/50">No promo codes yet.</td></tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono">{p.code}</td>
                  <td className="px-4 py-3">
                    {p.discountType === "percent" ? `${p.discountValue}%` : `Rs ${p.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {p.minOrderAmount ? `Rs ${p.minOrderAmount}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">{p.usageCount}{p.usageLimit ? ` / ${p.usageLimit}` : ""}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(p)}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        p.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-white/50"
                      }`}
                    >
                      {p.isActive ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(p)} className="text-rose-300 hover:text-rose-200 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {show && <CreateModal onClose={() => setShow(false)} onSaved={() => { setShow(false); load(); }} />}
    </AdminLayout>
  );
}
