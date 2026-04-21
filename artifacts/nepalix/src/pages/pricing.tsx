import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, Zap, Rocket, Crown, Building2, Tag, Shield, ArrowRight, MessageCircle } from "lucide-react";
import { GradientButton } from "@/components/ui-custom/GradientButton";

const plans = [
  {
    name: "Base",
    tagline: "Try NEPALIX Risk-Free",
    hook: "Get online with the essentials",
    icon: Sparkles,
    color: "#22D3EE",
    yearlyPrice: 9990,
    monthlyPrice: 999,
    popular: false,
    cta: "Start With Base",
    features: [
      { label: "Orders per Month", value: "500" },
      { label: "Products", value: "50" },
      { label: "Staff Accounts", value: "1" },
      { label: "Free Domain Connection", value: true },
      { label: "Basic Analytics", value: true },
      { label: "Light Inventory", value: true },
      { label: "Online Store Customization", value: true },
      { label: "Branding Tools", value: true },
      { label: "Marketing Tools", value: true },
      { label: "SMS Notifications", value: true },
      { label: "Customer Care Tools", value: true },
      { label: "Payment Gateway", value: false },
      { label: "WhatsApp Support", value: false },
      { label: "POS (Point of Sale)", value: false },
    ],
    bonuses: [
      "Store setup checklist",
      "3 starter themes",
      "Email onboarding guide",
    ],
    worth: "Rs 18,000+ tools",
  },
  {
    name: "Starter",
    tagline: "For New Online Sellers",
    hook: "Launch your online business in 1 day",
    icon: Zap,
    color: "#06B6D4",
    yearlyPrice: 18000,
    monthlyPrice: 2199,
    popular: false,
    cta: "Start With Starter",
    features: [
      { label: "Orders per Year", value: "10,000" },
      { label: "Products", value: "100" },
      { label: "Staff Accounts", value: "2" },
      { label: "Free Domain Connection", value: true },
      { label: "Basic Analytics", value: true },
      { label: "Light Inventory", value: true },
      { label: "Online Store Customization", value: true },
      { label: "Branding Tools", value: true },
      { label: "Marketing Tools", value: true },
      { label: "SMS Notifications", value: true },
      { label: "Customer Care Tools", value: true },
      { label: "Payment Gateway", value: false },
      { label: "WhatsApp Support", value: false },
      { label: "POS (Point of Sale)", value: false },
      { label: "Inventory Platinum", value: false },
    ],
    bonuses: [
      "Store setup checklist",
      "5 high-converting themes",
      "Email onboarding support",
    ],
    worth: "Rs 32,000+ tools",
  },
  {
    name: "Growth",
    tagline: "For Scaling Businesses",
    hook: "Everything you need to grow fast",
    icon: Rocket,
    color: "#8B5CF6",
    yearlyPrice: 28000,
    monthlyPrice: 2699,
    popular: true,
    cta: "Choose Growth",
    features: [
      { label: "Orders per Year", value: "20,000" },
      { label: "Products", value: "1,000" },
      { label: "Staff Accounts", value: "8" },
      { label: "Free Domain Connection", value: true },
      { label: "Advanced Analytics", value: true },
      { label: "Light Inventory", value: true },
      { label: "Inventory Platinum", value: true },
      { label: "Online Store Customization", value: true },
      { label: "Branding Tools", value: true },
      { label: "Marketing Tools", value: true },
      { label: "SMS Notifications", value: true },
      { label: "Customer Care Tools", value: true },
      { label: "Payment + QR Integration", value: true },
      { label: "WhatsApp Support", value: true },
      { label: "POS (Point of Sale)", value: true },
      { label: "Abandoned Cart Recovery", value: true },
      { label: "Multi-Location (3)", value: true },
    ],
    bonuses: [
      "Conversion-optimized templates",
      "Abandoned cart recovery system",
      "Email + WhatsApp automation starter",
    ],
    worth: "Rs 65,000+ tools",
  },
  {
    name: "Pro",
    tagline: "Revenue Multiplier",
    hook: "Built for brands ready to dominate",
    icon: Crown,
    color: "#F59E0B",
    yearlyPrice: 39000,
    monthlyPrice: null,
    popular: false,
    cta: "Choose Pro",
    features: [
      { label: "Orders per Year", value: "50,000" },
      { label: "Products", value: "2,500" },
      { label: "Staff Accounts", value: "25" },
      { label: "Free Domain Connection", value: true },
      { label: "Advanced Analytics", value: true },
      { label: "Light Inventory", value: true },
      { label: "Inventory Platinum", value: true },
      { label: "Online Store Customization", value: true },
      { label: "Branding Tools", value: true },
      { label: "Marketing Tools", value: true },
      { label: "SMS Notifications", value: true },
      { label: "Customer Care Tools", value: true },
      { label: "All Payment Methods", value: true },
      { label: "Priority Support", value: true },
      { label: "POS (Point of Sale)", value: true },
      { label: "Funnel Builder", value: true },
      { label: "Upsell & Cross-sell System", value: true },
    ],
    bonuses: [
      "Funnel builder (landing pages)",
      "Upsell & cross-sell system",
      "Customer segmentation tools",
    ],
    worth: "Rs 85,000+ tools",
  },
  {
    name: "Elite",
    tagline: "For Serious Businesses",
    hook: "Enterprise power without enterprise pricing",
    icon: Building2,
    color: "#EC4899",
    yearlyPrice: 49000,
    monthlyPrice: null,
    popular: false,
    cta: "Book Enterprise Demo",
    features: [
      { label: "Orders per Year", value: "Unlimited" },
      { label: "Products", value: "5,000+" },
      { label: "Staff Accounts", value: "50" },
      { label: "Free Domain Connection", value: true },
      { label: "Enterprise Analytics", value: true },
      { label: "Light Inventory", value: true },
      { label: "Inventory Platinum", value: true },
      { label: "Online Store Customization", value: true },
      { label: "Branding Tools", value: true },
      { label: "Marketing Tools", value: true },
      { label: "SMS Notifications", value: true },
      { label: "Customer Care Tools", value: true },
      { label: "All Payment Methods", value: true },
      { label: "Dedicated Support", value: true },
      { label: "Unlimited POS Terminals", value: true },
      { label: "Multi-Outlet Management", value: true },
      { label: "Custom Integrations", value: true },
      { label: "Monthly Growth Consultation", value: true },
    ],
    bonuses: [
      "Dedicated account manager",
      "Custom integrations",
      "Monthly growth consultation",
    ],
    worth: "Rs 1,20,000+ tools",
  },
];

const loyaltyData = [
  { plan: "Base", y1: "9,990", y2: "~8,991", y3: "~7,493" },
  { plan: "Starter", y1: "18,000", y2: "~16,200", y3: "~13,500" },
  { plan: "Growth", y1: "28,000", y2: "~25,200", y3: "~21,000" },
  { plan: "Pro", y1: "39,000", y2: "~35,100", y3: "~29,250" },
  { plan: "Elite", y1: "49,000", y2: "~44,100", y3: "~36,750" },
];

const outletAddons = [
  {
    name: "One-time Outlet Setup",
    price: "Rs 15,000",
    sub: "Per outlet",
    items: [
      "POS installation & configuration",
      "Inventory mapping",
      "Staff permission setup",
      "Testing & go-live support",
    ],
    color: "#06B6D4",
  },
  {
    name: "Yearly Outlet License",
    price: "Rs 5,000",
    sub: "Per outlet / year",
    items: [
      "Inventory sync across outlets",
      "Outlet-wise reporting",
      "System maintenance",
      "Platform updates",
    ],
    color: "#8B5CF6",
  },
];

const notPromised = [
  "We don't guarantee sales",
  "We don't run ads unless separately contracted",
  "Sales depend on your product & marketing",
  "We provide infrastructure — not shortcuts",
];

const faqs = [
  { q: "Is there a free trial?", a: "Yes — all plans include a 14-day free trial, no credit card required. Start selling within minutes." },
  { q: "Can I switch plans later?", a: "Absolutely. Upgrade or downgrade at any time from your dashboard. Changes apply immediately." },
  { q: "What payment methods can my customers use?", a: "eSewa, Khalti, FonePay, IME Pay, ConnectIPS, and bank transfers — all natively integrated." },
  { q: "Is there a setup fee?", a: "No setup fees ever. Pay only for your yearly plan — and save 20%+ compared to monthly." },
  { q: "Do you offer discounts for NGOs?", a: "Yes. Special pricing for registered NGOs, cooperatives, and government bodies. Contact our sales team." },
];

function FeatureRow({ label, value }: { label: string; value: string | boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      {typeof value === "boolean" ? (
        value ? (
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
        ) : (
          <X className="w-4 h-4 text-gray-600 flex-shrink-0" />
        )
      ) : (
        <span className="text-white text-sm font-medium">{value}</span>
      )}
    </li>
  );
}

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-[#070B14] min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.3) 0%, rgba(6,182,212,0.1) 40%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm font-medium text-purple-400">
              Pricing
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 font-heading leading-[1.05]">
              Simple Pricing.
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Built For Serious Businesses.
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-lg mx-auto">
              Choose the plan that fits your current stage. Upgrade anytime as your business grows.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <GradientButton href="/book-demo" size="lg">
                Book Free Demo
              </GradientButton>
              <a
                href="https://wa.me/9779801234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                Talk To Sales
              </a>
            </div>

            {/* Urgency + Guarantee strip */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <Shield className="w-4 h-4" />
                30-Day Money Back Guarantee
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <Tag className="w-4 h-4" />
                Free bonuses for first 100 signups
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                Launch offer — save up to 25% annually
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Plans */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 text-sm font-medium text-gray-400">
              Plans
            </div>
            <h2 className="text-4xl font-bold text-white font-heading mb-3">Core Plans</h2>
            <p className="text-gray-400">Choose the plan that matches your business needs.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {plans.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative rounded-2xl flex flex-col ${
                    plan.popular
                      ? "border-[#8B5CF6]/60 bg-gradient-to-b from-[#8B5CF6]/10 to-[#0F172A] shadow-[0_0_40px_rgba(139,92,246,0.2)]"
                      : "border-white/10 bg-[#0F172A]/80"
                  } border`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-bold whitespace-nowrap">
                      Most Popular
                    </div>
                  )}

                  <div className="p-6 pb-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${plan.color}25` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: plan.color }} />
                      </div>
                      <div>
                        <div className="text-white font-bold font-heading">{plan.name}</div>
                        <div className="text-gray-500 text-xs">{plan.tagline}</div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-extrabold text-white font-heading">
                          Rs {plan.yearlyPrice.toLocaleString()}
                        </span>
                        <span className="text-gray-500 pb-1">/Year</span>
                      </div>
                      {plan.monthlyPrice && (
                        <div className="text-gray-500 text-xs mt-0.5">
                          Rs {plan.monthlyPrice.toLocaleString()}/mo if billed monthly
                        </div>
                      )}
                    </div>

                    <div
                      className="text-sm font-medium italic mb-4 pb-4 border-b border-white/[0.06]"
                      style={{ color: plan.color }}
                    >
                      "{plan.hook}"
                    </div>

                    {/* Anchor value */}
                    <div className="flex items-center gap-1.5 mb-4 text-xs text-gray-500">
                      <Tag className="w-3 h-3" />
                      Worth {plan.worth} included
                    </div>
                  </div>

                  {/* Features */}
                  <div className="px-6 flex-1">
                    <ul>
                      {plan.features.map((f, fi) => (
                        <FeatureRow key={fi} label={f.label} value={f.value} />
                      ))}
                    </ul>
                  </div>

                  {/* Bonuses */}
                  <div className="px-6 mt-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Bonuses Included
                    </div>
                    <ul className="space-y-1.5 mb-5">
                      {plan.bonuses.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2 text-xs text-gray-300">
                          <span className="text-green-400 flex-shrink-0">✓</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 pt-0 mt-auto">
                    <a
                      href="/book-demo"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
                      style={
                        plan.popular
                          ? { background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", color: "#fff" }
                          : { background: `${plan.color}20`, color: plan.color, border: `1px solid ${plan.color}40` }
                      }
                    >
                      {plan.cta} <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Risk reducers */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-500">
            {[
              "30-Day Money Back Guarantee",
              "No coding required",
              "Setup in under 30 minutes",
              "Cancel anytime",
            ].map((t, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {t}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-outlet Expansion */}
      <section className="py-16 border-t border-white/[0.06]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 text-sm font-medium text-gray-400">
              Expansion
            </div>
            <h2 className="text-4xl font-bold text-white font-heading mb-3">Scaling To Multiple Stores?</h2>
            <p className="text-gray-400">Additional outlet pricing for Elite plan</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {outletAddons.map((addon, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-[#0F172A]/60 p-6"
              >
                <div className="mb-4">
                  <div className="text-gray-500 text-sm">{addon.sub}</div>
                  <div className="text-3xl font-extrabold text-white font-heading" style={{ color: addon.color }}>
                    {addon.price}
                  </div>
                  <div className="text-white font-semibold mt-1">{addon.name}</div>
                </div>
                <ul className="space-y-2">
                  {addon.items.map((item, ii) => (
                    <li key={ii} className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty table */}
      <section className="py-16 border-t border-white/[0.06]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 text-sm font-medium text-[#84CC16]">
              Loyalty
            </div>
            <h2 className="text-4xl font-bold text-white font-heading mb-3">Long-Term Clients Pay Less — Not More</h2>
            <p className="text-gray-400">We reward loyalty with significant renewal discounts</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Plan</th>
                    <th className="text-center px-4 py-4 text-gray-400 text-sm font-medium">Year 1</th>
                    <th className="text-center px-4 py-4 text-sm font-medium">
                      <span className="text-[#84CC16]">Year 2</span>
                      <span className="block text-gray-600 text-xs font-normal">10% off</span>
                    </th>
                    <th className="text-center px-4 py-4 text-sm font-medium">
                      <span className="text-[#06B6D4]">Year 3+</span>
                      <span className="block text-gray-600 text-xs font-normal">Up to 25% off</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loyaltyData.map((row, i) => (
                    <tr key={i} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium text-sm">{row.plan}</td>
                      <td className="px-4 py-4 text-center text-gray-300 text-sm">Rs {row.y1}</td>
                      <td className="px-4 py-4 text-center text-[#84CC16] text-sm font-medium">Rs {row.y2}</td>
                      <td className="px-4 py-4 text-center text-[#06B6D4] text-sm font-medium">Rs {row.y3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-center mt-6">
              <GradientButton href="/contact" variant="ghost">
                Become a Long-Term Partner
              </GradientButton>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-16 border-t border-white/[0.06]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-2xl border border-[#8B5CF6]/30 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent p-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm font-medium text-gray-400">
              Enterprise
            </div>
            <h2 className="text-3xl font-bold text-white font-heading mb-3">Got Bigger Business Goals?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Custom-coded infrastructure, dedicated support, and scalable architecture designed for high-volume operations.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto mb-8">
              {[
                "Custom coded website infrastructure",
                "Custom business features & workflows",
                "Advanced API & webhook integrations",
                "Dedicated SMS sender ID",
                "Dedicated server & database (optional)",
                "Priority year-round technical support",
                "High-volume order optimization",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <a
              href="https://wa.me/9779801234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
            >
              <MessageCircle className="w-5 h-5" />
              Talk To Enterprise Team
            </a>
          </div>
        </div>
      </section>

      {/* What We DON'T Promise — Transparency */}
      <section className="py-16 border-t border-white/[0.06]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white font-heading mb-3">What NEPALIX Does NOT Promise</h2>
            <p className="text-gray-500 mb-8 text-sm">We believe in complete transparency with our clients.</p>
            <div className="space-y-3 mb-8">
              {notPromised.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#0F172A]/60 px-5 py-3 text-left">
                  <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[#84CC16]/30 bg-[#84CC16]/5 px-6 py-4 text-sm text-gray-400">
              💡 This transparency actually <span className="text-[#84CC16] font-medium">increases trust</span> and ensures you invest in the right platform for your goals.
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-white/[0.06]">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-white font-heading text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-[#0F172A]/60 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-white font-medium text-sm">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.2 }} className="text-gray-400 text-xl leading-none flex-shrink-0">+</motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white font-heading mb-3">Ready To Build Your Business On NEPALIX?</h2>
          <p className="text-gray-400 mb-8">Join 5,000+ Nepali businesses who are already growing with us.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <GradientButton href="/book-demo" size="lg">Book Free Demo</GradientButton>
            <a
              href="https://wa.me/9779801234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-green-400" /> Talk To Sales on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
