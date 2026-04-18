import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { api, type CurrentSubscription, type Payment } from "@/lib/api";

type Status = "verifying" | "success" | "failure";

type VerifyResult = {
  success: boolean;
  subscription: CurrentSubscription;
  payment: Payment;
};

export default function BillingCallback() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>("verifying");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const paymentId = qs.get("payment_id");
    const provider = qs.get("provider");

    if (!paymentId || !provider || (provider !== "khalti" && provider !== "esewa")) {
      setStatus("failure");
      setError("Invalid callback URL");
      return;
    }

    const payload =
      provider === "khalti"
        ? {
            paymentId,
            provider: "khalti" as const,
            pidx: qs.get("pidx") ?? undefined,
          }
        : {
            paymentId,
            provider: "esewa" as const,
            transactionUuid: paymentId,
          };

    (async () => {
      try {
        const data = await api.payments.verify(payload);
        setResult(data);
        setStatus("success");
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        queryClient.invalidateQueries({ queryKey: ["payments"] });
      } catch (err) {
        setStatus("failure");
        setError(err instanceof Error ? err.message : "Payment verification failed");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    const t = setTimeout(() => {
      setLocation("/billing");
    }, 5000);
    return () => clearTimeout(t);
  }, [status, setLocation]);

  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="relative overflow-hidden">
            {status === "verifying" && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-[#06B6D4]/15 flex items-center justify-center mb-4">
                  <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
                </div>
                <h1 className="text-xl font-bold text-white font-heading mb-1">
                  Verifying your payment...
                </h1>
                <p className="text-sm text-gray-400">
                  Please don't close this page while we confirm your transaction.
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-green-400/15 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-green-400" />
                </div>
                <h1 className="text-xl font-bold text-white font-heading mb-1">
                  Payment successful!
                </h1>
                <p className="text-sm text-gray-400 mb-5">
                  Your subscription is now active. Redirecting you to billing...
                </p>

                {result && (
                  <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-5 space-y-2">
                    {result.subscription?.plan?.name && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Plan</span>
                        <span className="font-medium text-white">
                          {result.subscription.plan.name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Amount paid</span>
                      <span className="font-medium text-white">
                        Rs. {result.payment.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Provider</span>
                      <span className="font-medium text-white capitalize">
                        {result.payment.provider}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setLocation("/billing")}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium bg-[#06B6D4]/15 text-cyan-400 border border-[#06B6D4]/20 hover:bg-[#06B6D4]/25 transition-all"
                >
                  Go to billing
                </button>
              </div>
            )}

            {status === "failure" && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-red-400/15 flex items-center justify-center mb-4">
                  <XCircle className="w-7 h-7 text-red-400" />
                </div>
                <h1 className="text-xl font-bold text-white font-heading mb-1">
                  Payment verification failed
                </h1>
                <p className="text-sm text-gray-400 mb-5">
                  {error || "We couldn't confirm your payment. Please try again."}
                </p>

                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={() => setLocation("/billing")}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium bg-[#06B6D4]/15 text-cyan-400 border border-[#06B6D4]/20 hover:bg-[#06B6D4]/25 transition-all"
                  >
                    Back to billing
                  </button>
                  <a
                    href="/billing#plans"
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    Try again
                  </a>
                </div>
              </div>
            )}

            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#06B6D4]/5 blur-2xl pointer-events-none" />
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
