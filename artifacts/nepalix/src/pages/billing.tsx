import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldAlert,
  Loader2,
  Receipt,
  Crown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  type Plan,
  type PlanSlug,
  type Payment,
  type SubscriptionStatus,
} from "@/lib/api";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { useToast } from "@/hooks/use-toast";

type Provider = "khalti" | "esewa";

function formatNPR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function statusChipClasses(status: SubscriptionStatus | Payment["status"]): string {
  switch (status) {
    case "trialing":
      return "bg-amber-500/10 border-amber-500/30 text-amber-300";
    case "active":
    case "verified":
      return "bg-green-500/10 border-green-500/30 text-green-300";
    case "past_due":
      return "bg-orange-500/10 border-orange-500/30 text-orange-300";
    case "pending":
      return "bg-cyan-500/10 border-cyan-500/30 text-cyan-300";
    case "failed":
      return "bg-red-500/10 border-red-500/30 text-red-300";
    case "canceled":
    case "expired":
    default:
      return "bg-gray-500/10 border-gray-500/30 text-gray-300";
  }
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const label =
    status === "trialing"
      ? "Trial"
      : status === "active"
        ? "Active"
        : status === "past_due"
          ? "Past due"
          : status === "canceled"
            ? "Canceled"
            : "Expired";
  const Icon =
    status === "trialing"
      ? Clock
      : status === "active"
        ? CheckCircle2
        : status === "past_due"
          ? AlertTriangle
          : XCircle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${statusChipClasses(
        status,
      )}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: Payment["status"] }) {
  const label =
    status === "verified" ? "Verified" : status === "pending" ? "Pending" : "Failed";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${statusChipClasses(
        status,
      )}`}
    >
      {label}
    </span>
  );
}

function buildFeatureBullets(plan: Plan): string[] {
  const f = plan.features;
  const bullets: string[] = [];
  bullets.push(
    f.ordersPerYear === null
      ? "Unlimited orders / year"
      : `${f.ordersPerYear.toLocaleString()} orders / year`,
  );
  bullets.push(
    f.products === null
      ? "Unlimited products"
      : `${f.products.toLocaleString()} products`,
  );
  bullets.push(
    f.staff === null ? "Unlimited staff" : `${f.staff} staff accounts`,
  );
  bullets.push(
    f.locations === null
      ? "Unlimited locations"
      : `${f.locations} location${f.locations === 1 ? "" : "s"}`,
  );
  if (f.pos) bullets.push("Point of Sale (POS)");
  if (f.advancedInventory) bullets.push("Advanced inventory");
  if (f.abandonedCart) bullets.push("Abandoned cart recovery");
  if (f.funnelBuilder) bullets.push("Funnel builder");
  if (f.upsellCrossSell) bullets.push("Upsell & cross-sell");
  bullets.push(`${f.analyticsLevel[0]!.toUpperCase()}${f.analyticsLevel.slice(1)} analytics`);
  if (f.prioritySupport) bullets.push("Priority support");
  if (f.customIntegrations) bullets.push("Custom integrations");
  if (f.dedicatedManager) bullets.push("Dedicated account manager");
  return bullets;
}

function submitEsewaForm(formUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = formUrl;
  form.style.display = "none";
  for (const [key, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  // Leaving the form in the DOM is fine — the page navigates away on submit,
  // but clean up in case the browser blocks the navigation.
  setTimeout(() => {
    form.remove();
  }, 2000);
}

export default function Billing() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pendingCheckout, setPendingCheckout] = useState<{
    planSlug: PlanSlug;
    provider: Provider;
  } | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthLoading, isAuthenticated, setLocation]);

  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: () => api.plans.list(),
    enabled: isAuthenticated,
  });

  const subscriptionQuery = useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () => api.subscriptions.current(),
    enabled: isAuthenticated,
  });

  const paymentsQuery = useQuery({
    queryKey: ["subscription", "payments"],
    queryFn: () => api.subscriptions.payments(),
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.subscriptions.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", "current"] });
      queryClient.invalidateQueries({ queryKey: ["subscription", "payments"] });
      toast({
        title: "Subscription canceled",
        description:
          "Your subscription has been canceled. You'll retain access until the end of the current period.",
      });
    },
    onError: (err: unknown) => {
      toast({
        title: "Could not cancel",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => setCancelling(false),
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const subscription = subscriptionQuery.data?.subscription ?? null;
  const plans = (plansQuery.data?.plans ?? [])
    .filter((p) => p.slug !== "trial" && p.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const payments = paymentsQuery.data?.payments ?? [];

  const currentSlug = subscription?.plan?.slug ?? null;
  const canCancel =
    subscription && (subscription.status === "trialing" || subscription.status === "active");

  const trialDaysLeft =
    subscription?.status === "trialing" && subscription.trialEndsAt
      ? daysBetween(new Date(), new Date(subscription.trialEndsAt))
      : null;

  async function handleCheckout(planSlug: PlanSlug, provider: Provider) {
    setPendingCheckout({ planSlug, provider });
    try {
      const result = await api.payments.initiate({ planSlug, provider });
      if (result.provider === "khalti") {
        window.location.href = result.paymentUrl;
        return;
      }
      submitEsewaForm(result.formUrl, result.fields);
    } catch (err: unknown) {
      toast({
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      setPendingCheckout(null);
    }
  }

  function handleCancel() {
    const ok = window.confirm(
      "Cancel your subscription? You'll keep access until the end of your current billing period.",
    );
    if (!ok) return;
    setCancelling(true);
    cancelMutation.mutate();
  }

  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white font-heading mb-2">
              Billing &amp; Subscription
            </h1>
            <p className="text-gray-400">
              Manage your plan, payments and billing history.
              {user?.email && (
                <>
                  {" "}
                  Signed in as{" "}
                  <span className="text-gray-300">{user.email}</span>.
                </>
              )}
            </p>
          </div>

          {/* Current plan */}
          <GlassCard className="mb-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#06B6D4]/15 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Current plan
                  </p>
                  {subscriptionQuery.isLoading ? (
                    <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
                  ) : subscription ? (
                    <>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-semibold text-white">
                          {subscription.plan?.name ?? subscription.planSlug}
                        </h2>
                        <StatusBadge status={subscription.status} />
                      </div>
                      <div className="mt-2 text-sm text-gray-400 space-y-0.5">
                        {subscription.status === "trialing" &&
                          subscription.trialEndsAt && (
                            <p>
                              Trial ends {formatDate(subscription.trialEndsAt)} —{" "}
                              <span className="text-amber-300">
                                {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left
                              </span>
                            </p>
                          )}
                        {subscription.status !== "trialing" &&
                          subscription.currentPeriodEnd && (
                            <p>
                              {subscription.status === "canceled"
                                ? "Access ends "
                                : "Renews on "}
                              {formatDate(subscription.currentPeriodEnd)}
                            </p>
                          )}
                        {subscription.plan && (
                          <p className="text-gray-500">
                            {formatNPR(subscription.plan.yearlyPrice)} / year
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold text-white">
                        No active subscription
                      </h2>
                      <p className="mt-2 text-sm text-gray-400">
                        Start your free trial and pick a plan below to unlock
                        Nepalix.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {!subscription && (
                <a
                  href="#plans"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-px"
                  style={{
                    background: "linear-gradient(135deg, #06B6D4, #3B82F6)",
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Start your free trial
                </a>
              )}
            </div>
          </GlassCard>

          {/* Plans grid */}
          <div id="plans" className="mb-10">
            <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Available plans
                </h2>
                <p className="text-sm text-gray-400">
                  Pay securely with Khalti or eSewa.
                </p>
              </div>
            </div>

            {plansQuery.isLoading ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-80 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : plansQuery.isError ? (
              <GlassCard>
                <p className="text-sm text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Could not load plans. Please refresh.
                </p>
              </GlassCard>
            ) : plans.length === 0 ? (
              <GlassCard>
                <p className="text-sm text-gray-400">
                  No plans are available right now. Please check back soon.
                </p>
              </GlassCard>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => {
                  const isCurrent = currentSlug === plan.slug;
                  const bullets = buildFeatureBullets(plan);
                  const khaltiLoading =
                    pendingCheckout?.planSlug === plan.slug &&
                    pendingCheckout?.provider === "khalti";
                  const esewaLoading =
                    pendingCheckout?.planSlug === plan.slug &&
                    pendingCheckout?.provider === "esewa";
                  const anyLoading = pendingCheckout !== null;

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl p-6 border flex flex-col ${
                        isCurrent
                          ? "border-[#06B6D4]/60 bg-[#0F172A] shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                          : "border-white/10 bg-[#0F172A]"
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute -top-3 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-white text-xs font-semibold shadow-lg">
                          <Crown className="w-3.5 h-3.5" />
                          Current plan
                        </span>
                      )}

                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          {plan.name}
                        </h3>
                        {plan.tagline && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {plan.tagline}
                          </p>
                        )}
                      </div>

                      <div className="mb-5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-white">
                            {formatNPR(plan.yearlyPrice)}
                          </span>
                          <span className="text-sm text-gray-500">/ year</span>
                        </div>
                        {plan.monthlyPrice !== null && (
                          <p className="text-xs text-gray-500 mt-1">
                            or {formatNPR(plan.monthlyPrice)} / month
                          </p>
                        )}
                      </div>

                      <ul className="space-y-2 mb-6 flex-1">
                        {bullets.map((b) => (
                          <li
                            key={b}
                            className="flex items-start gap-2 text-sm text-gray-300"
                          >
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      {isCurrent ? (
                        <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-center text-gray-300">
                          You're on this plan
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={anyLoading}
                            onClick={() => handleCheckout(plan.slug, "khalti")}
                            className="px-3 py-2.5 rounded-xl text-white font-medium text-sm transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-purple-600/80 hover:bg-purple-600 border border-purple-500/30"
                          >
                            {khaltiLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Pay with Khalti"
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={anyLoading}
                            onClick={() => handleCheckout(plan.slug, "esewa")}
                            className="px-3 py-2.5 rounded-xl text-white font-medium text-sm transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-green-600/80 hover:bg-green-600 border border-green-500/30"
                          >
                            {esewaLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Pay with eSewa"
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment history */}
          <GlassCard className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Payment history
                </h2>
                <p className="text-xs text-gray-400">
                  Your last {payments.length > 0 ? payments.length : ""} payment
                  {payments.length === 1 ? "" : "s"}.
                </p>
              </div>
            </div>

            {paymentsQuery.isLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-lg bg-white/[0.03] animate-pulse"
                  />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400">No payments yet.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Once you subscribe to a plan, your payments will show up here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-white/5">
                      <th className="pb-3 pr-4 font-medium">Date</th>
                      <th className="pb-3 pr-4 font-medium">Provider</th>
                      <th className="pb-3 pr-4 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="py-3 pr-4 text-gray-300 capitalize">
                          {p.provider}
                        </td>
                        <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                          {formatNPR(p.amount)}
                        </td>
                        <td className="py-3">
                          <PaymentStatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          {/* Danger zone */}
          {canCancel && (
            <div className="rounded-2xl p-6 border border-red-500/30 bg-red-500/[0.03]">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Danger zone
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Cancel your subscription. You'll retain access until{" "}
                    {formatDate(
                      subscription?.trialEndsAt ??
                        subscription?.currentPeriodEnd ??
                        null,
                    )}
                    .
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling || cancelMutation.isPending}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2 bg-red-500/15 border border-red-500/40 text-red-300 hover:bg-red-500/25"
              >
                {cancelling || cancelMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  "Cancel subscription"
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
