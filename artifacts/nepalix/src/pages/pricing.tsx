import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, Building2, Rocket, Tag } from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { GradientButton } from "@/components/ui-custom/GradientButton";
import { EnterprisePageHero } from "@/components/sections/EnterprisePageHero";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    monthlyPrice: 999,
    yearlyPrice: 799,
    description: "Perfect for new businesses launching online in Nepal.",
    color: "#06B6D4",
    features: [
      { name: "1 Online Store", included: true },
      { name: "Up to 100 Products", included: true },
      { name: "eSewa & Khalti Payments", included: true },
      { name: "Basic Inventory", included: true },
      { name: "Email Support", included: true },
      { name: "POS Terminal", included: false },
      { name: "Multi-Location", included: false },
      { name: "Analytics Dashboard", included: false },
      { name: "Custom Domain", included: false },
      { name: "Priority Support", included: false },
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    icon: Rocket,
    monthlyPrice: 3999,
    yearlyPrice: 3199,
    description: "For growing businesses ready to scale across Nepal.",
    color: "#8B5CF6",
    features: [
      { name: "3 Online Stores", included: true },
      { name: "Unlimited Products", included: true },
      { name: "All Payment Methods", included: true },
      { name: "Advanced Inventory", included: true },
      { name: "Priority Email & Chat", included: true },
      { name: "1 POS Terminal", included: true },
      { name: "Multi-Location (3)", included: true },
      { name: "Analytics Dashboard", included: true },
      { name: "Custom Domain", included: true },
      { name: "Priority Support", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    icon: Building2,
    monthlyPrice: null,
    yearlyPrice: null,
    description: "Full power for large enterprises and national chains.",
    color: "#EC4899",
    features: [
      { name: "Unlimited Stores", included: true },
      { name: "Unlimited Products", included: true },
      { name: "All Payment Methods", included: true },
      { name: "Enterprise Inventory", included: true },
      { name: "24/7 Dedicated Support", included: true },
      { name: "Unlimited POS Terminals", included: true },
      { name: "Unlimited Locations", included: true },
      { name: "Advanced Analytics & Reports", included: true },
      { name: "Custom Domain & Branding", included: true },
      { name: "SLA Guarantee", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes — all plans include a 14-day free trial, no credit card required. You can start selling immediately.",
  },
  {
    q: "What payment methods are supported?",
    a: "NEPALIX supports eSewa, Khalti, FonePay, IME Pay, ConnectIPS, NIC Asia, and major bank transfers natively.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade your plan at any time from your dashboard. Changes apply immediately.",
  },
  {
    q: "Is there a setup fee?",
    a: "No setup fees, ever. Pay only for your monthly or annual plan — and save 20% with annual billing.",
  },
  {
    q: "Do you offer discounts for NGOs or government entities?",
    a: "Yes. NEPALIX offers special pricing for registered NGOs, cooperatives, and government institutions. Contact our sales team.",
  },
];

function PriceDisplay({ plan, yearly }: { plan: typeof plans[0]; yearly: boolean }) {
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  if (!price) {
    return <span className="text-5xl font-extrabold text-white font-heading">Custom</span>;
  }
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={yearly ? "yearly" : "monthly"}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="flex items-end gap-1"
      >
        <span className="text-5xl font-extrabold text-white font-heading">
          NPR {price.toLocaleString()}
        </span>
        <span className="text-gray-400 pb-1">/mo</span>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <SectionWrapper withGlow>
        <EnterprisePageHero
          badge="Simple Pricing"
          title="Invest in"
          highlight="your growth"
          description="Transparent pricing designed for Nepal's businesses — from street shops to national chains."
          primaryCta={{ label: "Book Demo", href: "/book-demo" }}
          secondaryCta={{ label: "Explore Product", href: "/product" }}
          className="mb-10"
        />

        {/* Billing toggle */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 p-1.5 rounded-xl bg-white/5 border border-white/10 mb-2">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                !yearly ? "bg-white/10 text-white shadow" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                yearly ? "bg-white/10 text-white shadow" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-1">
                <Tag className="w-3 h-3" /> Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 border flex flex-col ${
                  plan.popular
                    ? "border-[#8B5CF6]/60 bg-gradient-to-b from-[#8B5CF6]/10 to-[#0F172A]/80 shadow-[0_0_40px_rgba(139,92,246,0.2)]"
                    : "border-white/10 bg-[#0F172A]/60"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-sm font-semibold whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${plan.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: plan.color }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-heading">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                </div>
                <div className="mb-2">
                  <PriceDisplay plan={plan} yearly={yearly} />
                </div>
                {plan.monthlyPrice && yearly && (
                  <div className="text-xs text-green-400 mb-4 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />
                    Saves NPR {((plan.monthlyPrice - (plan.yearlyPrice ?? 0)) * 12).toLocaleString()} per year
                  </div>
                )}
                {!plan.monthlyPrice && <div className="h-6 mb-4" />}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.name} className="flex items-center gap-3 text-sm">
                      {f.included ? (
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                      <span className={f.included ? "text-gray-200" : "text-gray-500"}>{f.name}</span>
                    </li>
                  ))}
                </ul>
                <GradientButton
                  href="/book-demo"
                  variant={plan.popular ? "primary" : "ghost"}
                  className="w-full justify-center"
                >
                  {plan.cta}
                </GradientButton>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white font-heading text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-[#0F172A]/60 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-white font-medium">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400 flex-shrink-0 text-xl leading-none"
                  >
                    +
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
