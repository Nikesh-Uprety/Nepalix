import { motion } from "framer-motion";
import { CreditCard, MessageSquare, Truck, Globe, BarChart3, ShieldCheck, Zap, Package } from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { GradientButton } from "@/components/ui-custom/GradientButton";

const categories = ["All", "Payments", "Shipping", "Marketing", "Analytics", "Security"];

const plugins = [
  {
    name: "eSewa",
    category: "Payments",
    icon: CreditCard,
    color: "#84CC16",
    description: "Nepal's most popular digital wallet. Accept eSewa payments on web, mobile, and POS.",
    badge: "Official Partner",
    badgeColor: "#84CC16",
    installed: true,
  },
  {
    name: "Khalti",
    category: "Payments",
    icon: CreditCard,
    color: "#8B5CF6",
    description: "Fast and secure payments via Khalti wallet, debit/credit card, and bank transfer.",
    badge: "Official Partner",
    badgeColor: "#8B5CF6",
    installed: false,
  },
  {
    name: "FonePay",
    category: "Payments",
    icon: CreditCard,
    color: "#06B6D4",
    description: "QR-based payments accepted across all Nepal Rastra Bank member banks.",
    badge: "Certified",
    badgeColor: "#06B6D4",
    installed: false,
  },
  {
    name: "IME Pay",
    category: "Payments",
    icon: CreditCard,
    color: "#F59E0B",
    description: "Digital payments and remittances via IME Pay wallet.",
    badge: null,
    badgeColor: null,
    installed: false,
  },
  {
    name: "ConnectIPS",
    category: "Payments",
    icon: ShieldCheck,
    color: "#3B82F6",
    description: "Real-time bank-to-bank transfers via Nepal Clearing House.",
    badge: "NRB Certified",
    badgeColor: "#3B82F6",
    installed: false,
  },
  {
    name: "Pathao",
    category: "Shipping",
    icon: Truck,
    color: "#EC4899",
    description: "Same-day and next-day delivery in Kathmandu, Pokhara, and 20+ cities.",
    badge: "Recommended",
    badgeColor: "#EC4899",
    installed: false,
  },
  {
    name: "Bhojdeals",
    category: "Shipping",
    icon: Truck,
    color: "#10B981",
    description: "Food and grocery delivery integration across major cities in Nepal.",
    badge: null,
    badgeColor: null,
    installed: false,
  },
  {
    name: "Daraz",
    category: "Marketing",
    icon: Globe,
    color: "#EF4444",
    description: "Sync your NEPALIX catalog with Daraz and manage orders from one dashboard.",
    badge: "Marketplace",
    badgeColor: "#EF4444",
    installed: false,
  },
  {
    name: "NTC SMS",
    category: "Marketing",
    icon: MessageSquare,
    color: "#F59E0B",
    description: "Send order confirmations, promotional SMSes, and OTPs via Nepal Telecom.",
    badge: null,
    badgeColor: null,
    installed: false,
  },
  {
    name: "Ncell SMS",
    category: "Marketing",
    icon: MessageSquare,
    color: "#8B5CF6",
    description: "Reach Ncell subscribers with transactional and promotional SMS campaigns.",
    badge: null,
    badgeColor: null,
    installed: false,
  },
  {
    name: "Google Analytics",
    category: "Analytics",
    icon: BarChart3,
    color: "#3B82F6",
    description: "Connect GA4 to your NEPALIX store for advanced web analytics and conversion tracking.",
    badge: null,
    badgeColor: null,
    installed: false,
  },
  {
    name: "Meta Pixel",
    category: "Marketing",
    icon: Zap,
    color: "#1877F2",
    description: "Fire purchase events to Meta Pixel for Facebook and Instagram ad optimization.",
    badge: null,
    badgeColor: null,
    installed: false,
  },
];

export default function Plugins() {
  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <SectionWrapper withGlow>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm font-medium text-cyan-400">
              Plugin Marketplace
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
              Connect the tools{" "}
              <span className="bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] bg-clip-text text-transparent">
                you already use
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              One-click integrations with Nepal's most popular payment, delivery, and marketing tools.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((c) => (
            <button
              key={c}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                c === "All"
                  ? "bg-[#06B6D4]/20 border-[#06B6D4]/50 text-cyan-400"
                  : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plugins.map((plugin, i) => {
            const Icon = plugin.icon;
            return (
              <motion.div
                key={plugin.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <GlassCard className="h-full relative" hoverEffect>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${plugin.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: plugin.color }} />
                    </div>
                    {plugin.badge && (
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${plugin.badgeColor}20`,
                          color: plugin.badgeColor ?? undefined,
                        }}
                      >
                        {plugin.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white font-heading mb-1">{plugin.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{plugin.category}</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">{plugin.description}</p>
                  <button
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all border ${
                      plugin.installed
                        ? "border-green-500/30 text-green-400 bg-green-500/10"
                        : "border-white/10 text-gray-300 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {plugin.installed ? "Installed" : "Install Plugin"}
                  </button>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-white/10 bg-white/5">
            <Package className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-300 text-sm">
              Building a custom integration?{" "}
              <a href="/docs" className="text-cyan-400 underline underline-offset-2">
                Read our Plugin API docs
              </a>
            </span>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white font-heading mb-4">Request an Integration</h2>
          <p className="text-gray-400 mb-8">
            Don't see what you need? Our plugin team ships new integrations monthly. Submit a request and vote on
            what gets built next.
          </p>
          <GradientButton href="/contact" size="lg">
            Request an Integration
          </GradientButton>
        </div>
      </SectionWrapper>
    </div>
  );
}
