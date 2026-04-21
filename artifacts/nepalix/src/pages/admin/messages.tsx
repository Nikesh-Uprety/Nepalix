import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { api, type ContactMessage } from "@/lib/api";

export default function AdminMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.contact
      .list()
      .then((r) => setMessages(r.messages))
      .catch((e) => toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <AdminLayout title="Messages" subtitle="Inbound contact form messages">
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-white/40 py-10 text-center">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#0B1220] p-10 text-center text-white/50">
            No messages yet.
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-white/5 bg-[#0B1220] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-sm">{m.subject}</div>
                  <div className="text-xs text-white/60 mt-0.5">
                    {m.name} · <span className="text-white/40">{m.email}</span>
                  </div>
                </div>
                <span className="text-[11px] text-white/40">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-white/80 mt-3 whitespace-pre-wrap">{m.message}</p>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
