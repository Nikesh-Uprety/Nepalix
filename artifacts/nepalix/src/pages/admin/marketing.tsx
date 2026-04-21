import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api, type AdminMarketingCampaign, type AdminMarketingCampaignInput } from "@/lib/api";

const empty: AdminMarketingCampaignInput = { name: "", channel: "email", status: "draft" };

function CreateModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState<AdminMarketingCampaignInput>(empty);
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      await api.admin.marketing.create(form);
      toast({ title: "Campaign created" });
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
          <h3 className="font-semibold">New campaign</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-white/60" /></button>
        </div>
        <div className="space-y-3">
          <Input
            placeholder="Campaign name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value as AdminMarketingCampaignInput["channel"] })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="push">Push</option>
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as AdminMarketingCampaignInput["status"] })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="paused">Paused</option>
              <option value="sent">Sent</option>
            </select>
          </div>
          <Input
            placeholder="Subject (for email)"
            value={form.subject ?? ""}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <textarea
            placeholder="Message body"
            rows={4}
            value={form.content ?? ""}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.name}>{saving ? "Saving…" : "Create"}</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMarketing() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminMarketingCampaign[]>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const { campaigns } = await api.admin.marketing.list();
      setItems(campaigns);
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (c: AdminMarketingCampaign) => {
    if (!confirm(`Delete ${c.name}?`)) return;
    await api.admin.marketing.remove(c.id);
    load();
  };

  return (
    <AdminLayout
      title="Campaigns"
      subtitle="Email, SMS, WhatsApp & Push campaigns"
      actions={
        <Button size="sm" onClick={() => setShow(true)}>
          <Plus className="h-4 w-4 mr-1" /> New campaign
        </Button>
      }
    >
      <div className="rounded-2xl border border-white/5 bg-[#0B1220] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-white/60 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Channel</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Sent</th>
              <th className="text-right px-4 py-3">Opens</th>
              <th className="text-right px-4 py-3">Clicks</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/50">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/50">No campaigns yet.</td></tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3 capitalize">{c.channel}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 capitalize">{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{c.sentCount}</td>
                  <td className="px-4 py-3 text-right">{c.openCount}</td>
                  <td className="px-4 py-3 text-right">{c.clickCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(c)} className="text-rose-300 hover:text-rose-200 p-1">
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
