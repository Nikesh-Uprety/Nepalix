import { motion } from "framer-motion";
import { Search, BookOpen, Zap, Code, CreditCard, ShoppingCart, Package, BarChart3, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { GradientButton } from "@/components/ui-custom/GradientButton";
import { EnterprisePageHero } from "@/components/sections/EnterprisePageHero";

const categories = [
  { icon: Zap, title: "Getting Started", desc: "Set up your store in under an hour", color: "#06B6D4", articles: 8 },
  { icon: ShoppingCart, title: "Online Store", desc: "Products, collections, checkout flows", color: "#8B5CF6", articles: 24 },
  { icon: CreditCard, title: "Payments", desc: "eSewa, Khalti, bank transfers & more", color: "#EC4899", articles: 15 },
  { icon: Package, title: "Inventory", desc: "Stock management, suppliers, alerts", color: "#84CC16", articles: 18 },
  { icon: BarChart3, title: "Analytics", desc: "Reports, dashboards, exports", color: "#3B82F6", articles: 12 },
  { icon: Code, title: "Plugins & API", desc: "Webhooks, REST API, SDK reference", color: "#F59E0B", articles: 30 },
];

const popularArticles = [
  "How to set up your eSewa payment gateway",
  "Importing products from Excel in bulk",
  "Setting up your first POS terminal",
  "Understanding your sales analytics dashboard",
  "Multi-location inventory sync guide",
  "Connecting your Daraz store to NEPALIX",
];

export default function Docs() {
  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <SectionWrapper withGlow>
        <EnterprisePageHero
          badge="Documentation"
          title="Everything you need to"
          highlight="build on NEPALIX"
          description="Guides, API references, tutorials, and examples — all written for real Nepali business contexts."
          primaryCta={{ label: "Book Demo", href: "/book-demo" }}
          secondaryCta={{ label: "Contact Support", href: "/contact" }}
          className="mb-12"
        />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="relative max-w-xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-gray-500 text-base focus:outline-none focus:border-[#06B6D4]/60 transition-colors"
              placeholder="Search docs — e.g. 'eSewa setup', 'POS terminal', 'bulk import'..."
            />
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <GlassCard className="group cursor-pointer" hoverEffect>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold font-heading mb-1 group-hover:text-cyan-400 transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">{cat.desc}</p>
                      <span className="text-xs text-gray-600">{cat.articles} articles</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <GlassCard>
            <div className="flex items-center gap-3 mb-5">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white font-heading">Popular Articles</h2>
            </div>
            <ul className="space-y-3">
              {popularArticles.map((article, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-300 hover:text-cyan-400 cursor-pointer transition-colors group">
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                  {article}
                </li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white font-heading">Developer API</h2>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Build custom integrations, automate workflows, and extend NEPALIX with our REST API and webhook
                system. Full OpenAPI spec included.
              </p>
              <div className="bg-[#070B14] rounded-xl p-4 font-mono text-sm text-green-400 mb-6">
                <span className="text-gray-500">curl </span>
                <span className="text-cyan-400">https://api.nepalix.com/v1/</span>
                <span className="text-gray-300">orders</span>
                <br />
                <span className="text-gray-500">  -H </span>
                <span className="text-yellow-400">"Authorization: Bearer YOUR_KEY"</span>
              </div>
            </div>
            <GradientButton href="/docs" variant="ghost" className="self-start">
              View API Reference
            </GradientButton>
          </GlassCard>
        </div>

        <div className="text-center">
          <p className="text-gray-500 mb-4">Can't find what you're looking for?</p>
          <GradientButton href="/contact">Contact Support</GradientButton>
        </div>
      </SectionWrapper>
    </div>
  );
}
