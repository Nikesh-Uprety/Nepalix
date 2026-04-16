import { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import {
  Calendar,
  MessageSquare,
  Users,
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  Clock,
  CheckCheck,
  Inbox,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type DemoBooking, type ContactMessage, type AdminUser } from "@/lib/api";
import { GlassCard } from "@/components/ui-custom/GlassCard";

type Tab = "bookings" | "messages" | "users";

const statusColors: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  confirmed: "text-green-400 bg-green-400/10 border-green-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
  unread: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  read: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  replied: "text-green-400 bg-green-400/10 border-green-400/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NP", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Admin() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("bookings");
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
    if (!isLoading && isAuthenticated && user?.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [b, m, u] = await Promise.all([
        api.demoBookings.list(),
        api.contact.list(),
        api.account.listUsers(),
      ]);
      setBookings(b.bookings);
      setMessages(m.messages);
      setUsers(u.users);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      loadData();
    }
  }, [isAuthenticated, user, loadData]);

  async function updateContactStatus(id: string, status: string) {
    try {
      await api.contact.updateStatus(id, status);
      setMessages((msgs) =>
        msgs.map((m) => (m.id === id ? { ...m, status } : m))
      );
    } catch {}
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") return null;

  const tabs: { id: Tab; label: string; icon: typeof Calendar; count: number }[] = [
    { id: "bookings", label: "Demo Bookings", icon: Calendar, count: bookings.length },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      count: messages.filter((m) => m.status === "unread").length,
    },
    { id: "users", label: "Users", icon: Users, count: users.length },
  ];

  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white font-heading">
              Admin Panel
            </h1>
            <p className="text-gray-400">Manage bookings, messages, and users</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/[0.06] pb-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                  tab === t.id
                    ? "text-cyan-400 border-cyan-400"
                    : "text-gray-400 hover:text-white border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {t.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      tab === t.id
                        ? "bg-cyan-400/20 text-cyan-400"
                        : "bg-white/10 text-gray-400"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Demo Bookings */}
        {tab === "bookings" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {bookings.length === 0 ? (
              <GlassCard className="text-center py-16">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No demo bookings yet.</p>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <GlassCard key={booking.id} className="group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/15 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-white">
                              {booking.firstName} {booking.lastName}
                            </p>
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                                statusColors[booking.status] ??
                                "text-gray-400 bg-gray-400/10 border-gray-400/20"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {booking.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {booking.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {booking.businessType}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {booking.timeSlot}
                            </span>
                          </div>
                          {booking.message && (
                            <p className="mt-2 text-sm text-gray-500 italic">
                              "{booking.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 flex-shrink-0">
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Contact Messages */}
        {tab === "messages" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {messages.length === 0 ? (
              <GlassCard className="text-center py-16">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No messages yet.</p>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <GlassCard
                    key={msg.id}
                    className={msg.status === "unread" ? "border-blue-500/20" : ""}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-white">{msg.name}</p>
                            <span className="text-gray-400 text-sm">{msg.email}</span>
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                                statusColors[msg.status] ??
                                "text-gray-400 bg-gray-400/10 border-gray-400/20"
                              }`}
                            >
                              {msg.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-200 mb-1">
                            {msg.subject}
                          </p>
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="text-xs text-gray-600">
                          {formatDate(msg.createdAt)}
                        </p>
                        <div className="flex gap-1.5">
                          {msg.status !== "read" && (
                            <button
                              onClick={() => updateContactStatus(msg.id, "read")}
                              title="Mark as read"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 hover:bg-green-400/10 transition-all"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </button>
                          )}
                          {msg.status !== "replied" && (
                            <button
                              onClick={() =>
                                updateContactStatus(msg.id, "replied")
                              }
                              title="Mark as replied"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                            >
                              <Inbox className="w-4 h-4" />
                            </button>
                          )}
                          {msg.status !== "unread" && (
                            <button
                              onClick={() =>
                                updateContactStatus(msg.id, "unread")
                              }
                              title="Mark as unread"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Users */}
        {tab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {["Name", "Email", "Role", "Member Since"].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {u.firstName[0]}
                              {u.lastName[0]}
                            </div>
                            <span className="text-sm text-white font-medium">
                              {u.firstName} {u.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-400">
                          {u.email}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                              u.role === "admin"
                                ? "text-purple-400 bg-purple-400/10 border-purple-400/20"
                                : "text-gray-400 bg-gray-400/10 border-gray-400/20"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-500">
                          {formatDate(u.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
