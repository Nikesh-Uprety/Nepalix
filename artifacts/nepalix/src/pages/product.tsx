import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Monitor, Package, CreditCard, BarChart3,
  Globe, Smartphone, Layers, Shield, Zap, Clock, Users
} from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { GradientButton } from "@/components/ui-custom/GradientButton";
import { EnterprisePageHero } from "@/components/sections/EnterprisePageHero";

const modules = [
  {
    id: "online-store",
    icon: ShoppingCart,
    label: "Online Store",
    color: "#06B6D4",
    headline: "Sell to all of Nepal — and beyond",
    description:
      "Build a stunning, conversion-optimized online store in minutes. No coding required. Choose from dozens of templates, customize your brand, and start accepting orders from Day 1.",
    features: [
      { icon: Globe, text: "Custom domain with free SSL" },
      { icon: Smartphone, text: "Mobile-first storefront" },
      { icon: Layers, text: "Drag & drop page builder" },
      { icon: Shield, text: "Built-in fraud detection" },
    ],
    stats: [{ label: "Avg conversion boost", value: "+34%" }, { label: "Setup time", value: "< 1hr" }],
  },
  {
    id: "pos",
    icon: Monitor,
    label: "POS Terminal",
    color: "#8B5CF6",
    headline: "A complete point-of-sale — in your pocket",
    description:
      "Accept payments in-store with a slick POS system that runs on any Android tablet or smartphone. Ring up orders, manage staff, and sync inventory in real-time.",
    features: [
      { icon: CreditCard, text: "eSewa, Khalti, cash, card" },
      { icon: Users, text: "Staff roles & permissions" },
      { icon: Clock, text: "Offline mode support" },
      { icon: Zap, text: "Instant receipt printing" },
    ],
    stats: [{ label: "Checkout speed", value: "< 5s" }, { label: "Uptime", value: "99.9%" }],
  },
  {
    id: "inventory",
    icon: Package,
    label: "Inventory",
    color: "#84CC16",
    headline: "Never run out. Never overstock.",
    description:
      "NEPALIX Inventory gives you real-time visibility across every product, variant, and location. Set reorder alerts, track suppliers, and sync stock across your physical and online stores automatically.",
    features: [
      { icon: Layers, text: "Multi-location stock sync" },
      { icon: Zap, text: "Low-stock alerts" },
      { icon: Shield, text: "Supplier management" },
      { icon: BarChart3, text: "Stock forecasting" },
    ],
    stats: [{ label: "Avg stock accuracy", value: "99.7%" }, { label: "Time saved", value: "8hr/wk" }],
  },
  {
    id: "payments",
    icon: CreditCard,
    label: "Payments",
    color: "#EC4899",
    headline: "Every Nepali payment method. One integration.",
    description:
      "Accept payments from eSewa, Khalti, FonePay, IME Pay, ConnectIPS, NIC Asia, and all major banks — without juggling multiple accounts. NEPALIX handles the compliance, you handle the growth.",
    features: [
      { icon: Shield, text: "PCI-DSS compliant" },
      { icon: Clock, text: "T+1 settlements" },
      { icon: Globe, text: "Multi-currency support" },
      { icon: Zap, text: "Instant payment links" },
    ],
    stats: [{ label: "Transaction fee", value: "1.5%" }, { label: "Settlement time", value: "24hr" }],
  },
  {
    id: "analytics",
    icon: BarChart3,
    label: "Analytics",
    color: "#3B82F6",
    headline: "Data that drives real decisions",
    description:
      "From daily sales reports to customer lifetime value, NEPALIX Analytics gives you every number you need. See which products fly, which locations struggle, and which campaigns convert.",
    features: [
      { icon: BarChart3, text: "Real-time dashboards" },
      { icon: Users, text: "Customer segmentation" },
      { icon: Globe, text: "Geographic heat maps" },
      { icon: Layers, text: "Exportable reports" },
    ],
    stats: [{ label: "Data latency", value: "< 1min" }, { label: "Report types", value: "40+" }],
  },
];

export default function Product() {
  const [active, setActive] = useState("online-store");
  const activeModule = modules.find((m) => m.id === active)!;
  const Icon = activeModule.icon;

  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <SectionWrapper withGlow>
        <EnterprisePageHero
          badge="The Platform"
          title="Every tool your"
          highlight="business needs"
          description="Five modules. One platform. Built for Nepal's fastest-growing businesses."
          primaryCta={{ label: "Book Demo", href: "/book-demo" }}
          secondaryCta={{ label: "Start Free Trial", href: "/book-demo" }}
        />

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {modules.map((m) => {
            const MIcon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setActive(m.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  active === m.id
                    ? "text-white border-transparent shadow-lg"
                    : "text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                }`}
                style={
                  active === m.id
                    ? { backgroundColor: `${m.color}20`, borderColor: `${m.color}50`, color: m.color }
                    : {}
                }
              >
                <MIcon className="w-4 h-4" />
                {m.label}
              </button>
            );
          })}
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: `${activeModule.color}20` }}
            >
              <Icon className="w-7 h-7" style={{ color: activeModule.color }} />
            </div>
            <h2 className="text-4xl font-bold text-white font-heading mb-4">{activeModule.headline}</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">{activeModule.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {activeModule.features.map((f, i) => {
                const FIcon = f.icon;
                return (
                  <div key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                    <FIcon className="w-4 h-4 flex-shrink-0" style={{ color: activeModule.color }} />
                    {f.text}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-6 mb-8">
              {activeModule.stats.map((s, i) => (
                <div key={i}>
                  <div
                    className="text-3xl font-bold font-heading"
                    style={{ color: activeModule.color }}
                  >
                    {s.value}
                  </div>
                  <div className="text-gray-500 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
            <GradientButton href="/book-demo" size="lg">
              Book a Demo
            </GradientButton>
          </div>
          <div
            className="rounded-2xl border p-8 min-h-[400px] flex flex-col justify-center items-center text-center"
            style={{
              background: `linear-gradient(135deg, ${activeModule.color}10, transparent)`,
              borderColor: `${activeModule.color}30`,
            }}
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
              style={{ backgroundColor: `${activeModule.color}15` }}
            >
              <Icon className="w-12 h-12" style={{ color: activeModule.color }} />
            </div>
            <h3 className="text-2xl font-bold text-white font-heading mb-3">{activeModule.label}</h3>
            <p className="text-gray-400 max-w-xs">
              Preview available in the full demo — schedule yours today and see it in action.
            </p>
          </div>
        </motion.div>
      </SectionWrapper>

      <SectionWrapper withGrid className="bg-[#0F172A]/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white font-heading mb-4">Everything works together</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            All five modules share a single data layer. Orders from your online store instantly update inventory,
            your POS syncs with payments, and analytics pulls from all sources — no integrations needed.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {modules.map((m) => {
            const MIcon = m.icon;
            return (
              <GlassCard key={m.id} className="flex flex-col items-center text-center p-6" hoverEffect>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${m.color}20` }}
                >
                  <MIcon className="w-6 h-6" style={{ color: m.color }} />
                </div>
                <span className="text-white font-medium text-sm">{m.label}</span>
              </GlassCard>
            );
          })}
        </div>
      </SectionWrapper>
    </div>
  );
}
