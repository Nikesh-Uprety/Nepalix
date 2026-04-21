import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api, type AdminProduct, type AdminProductInput } from "@/lib/api";

const empty: AdminProductInput = {
  name: "",
  sku: "",
  description: "",
  price: 0,
  stock: 0,
  status: "active",
  isActive: true,
  images: [],
  currency: "NPR",
};

function ProductFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: AdminProduct | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<AdminProductInput>(
    initial
      ? {
          name: initial.name,
          slug: initial.slug ?? "",
          description: initial.description ?? "",
          sku: initial.sku ?? "",
          price: initial.price,
          comparePrice: initial.comparePrice ?? undefined,
          currency: initial.currency,
          stock: initial.stock,
          images: initial.images,
          status: (initial.status as "active" | "draft" | "archived") ?? "active",
          isActive: initial.isActive,
        }
      : empty,
  );
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      if (initial) await api.admin.products.update(initial.id, form);
      else await api.admin.products.create(form);
      toast({ title: initial ? "Product updated" : "Product created" });
      onSaved();
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-lg rounded-2xl bg-[#0B1220] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{initial ? "Edit product" : "New product"}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/60">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60">SKU</label>
              <Input
                value={form.sku ?? ""}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-white/60">Status</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as "active" | "draft" | "archived" })
                }
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60">Price (Rs)</label>
              <Input
                type="number"
                value={form.price ?? 0}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs text-white/60">Stock</label>
              <Input
                type="number"
                value={form.stock ?? 0}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60">Description</label>
            <textarea
              rows={3}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !form.name.trim()}>
            {saving ? "Saving…" : initial ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { products } = await api.admin.products.list({ q: q || undefined });
      setItems(products);
    } catch (e) {
      toast({ title: "Failed to load products", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (p: AdminProduct) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    try {
      await api.admin.products.remove(p.id);
      toast({ title: "Product deleted" });
      load();
    } catch (e) {
      toast({ title: "Delete failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout
      title="Products"
      subtitle="Manage your store catalog"
      actions={
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> New product
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          Search
        </Button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0B1220] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-white/60 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-right px-4 py-3">Stock</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-white/50">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-white/50">
                  No products yet. Click <span className="text-white">New product</span> to add one.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                    {p.description && (
                      <div className="text-xs text-white/40 truncate max-w-xs">{p.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/60">{p.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-right">Rs {p.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.stock < 5 ? "text-rose-300" : "text-white/80"}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/70 capitalize">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setShowForm(true);
                      }}
                      className="text-white/60 hover:text-white p-1"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(p)}
                      className="text-rose-300 hover:text-rose-200 p-1 ml-1"
                      title="Delete"
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

      {showForm && (
        <ProductFormModal
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
}
