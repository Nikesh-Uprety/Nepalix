import { motion } from "framer-motion";
import { ShoppingBag, Coffee, Shirt, Cpu, ShoppingCart, Pill, Utensils, Bike } from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { GradientButton } from "@/components/ui-custom/GradientButton";
import { EnterprisePageHero } from "@/components/sections/EnterprisePageHero";

const industries = [
  {
    icon: ShoppingBag,
    name: "Retail",
    description: "Multi-location retail with unified inventory, POS, and online store synced in real-time.",
    color: "#06B6D4",
    stats: "2,400+ Retail Stores",
    features: ["Barcode scanning", "Multi-branch sync", "Staff management", "Loyalty programs"],
  },
  {
    icon: Coffee,
    name: "Cafes & Coffee",
    description: "From single-location cafes to franchise chains — order management, recipes, and table-side POS.",
    color: "#8B5CF6",
    stats: "600+ Cafes",
    features: ["Table management", "Kitchen display", "Recipe costing", "Delivery integration"],
  },
  {
    icon: Utensils,
    name: "Restaurants",
    description: "Full-service dining, cloud kitchens, and QSRs. Accept online orders + dine-in simultaneously.",
    color: "#EC4899",
    stats: "1,100+ Restaurants",
    features: ["Online menu", "Order queuing", "Pathao / Bhoji integration", "Split billing"],
  },
  {
    icon: Shirt,
    name: "Fashion & Apparel",
    description: "Manage size variants, seasonal collections, and returns across online and offline channels.",
    color: "#84CC16",
    stats: "800+ Fashion Brands",
    features: ["Size/color variants", "Lookbook pages", "Return management", "Instagram sync"],
  },
  {
    icon: Cpu,
    name: "Electronics",
    description: "Serial number tracking, warranty management, and repair ticket systems for tech retailers.",
    color: "#3B82F6",
    stats: "350+ Tech Stores",
    features: ["Serial tracking", "Warranty management", "Repair tickets", "IMEI lookup"],
  },
  {
    icon: ShoppingCart,
    name: "Grocery & FMCG",
    description: "High-volume, expiry-tracked inventory with reorder automation for grocery and wholesale.",
    color: "#F59E0B",
    stats: "500+ Grocers",
    features: ["Expiry tracking", "Bulk ordering", "Auto-reorder", "Supplier EDI"],
  },
  {
    icon: Pill,
    name: "Pharmacy",
    description: "Drug inventory with expiry alerts, prescription management, and Nepal Pharmacy Board compliance.",
    color: "#10B981",
    stats: "200+ Pharmacies",
    features: ["Rx management", "Expiry alerts", "Batch tracking", "NMC compliance"],
  },
  {
    icon: Bike,
    name: "Delivery & Logistics",
    description: "Dispatch management, rider tracking, and hub-level inventory for delivery-first businesses.",
    color: "#EF4444",
    stats: "100+ Logistics Co.",
    features: ["Rider dispatch", "GPS tracking", "Hub inventory", "Route optimization"],
  },
];

export default function Solutions() {
  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <SectionWrapper withGlow>
        <EnterprisePageHero
          badge="Solutions by Industry"
          title="Built for"
          highlight="your industry"
          description="NEPALIX isn't generic software — it's tailored for how Nepali businesses actually operate."
          primaryCta={{ label: "Book Demo", href: "/book-demo" }}
          secondaryCta={{ label: "Explore Product", href: "/product" }}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {industries.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <GlassCard className="h-full" hoverEffect>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${ind.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: ind.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-white font-heading mb-2">{ind.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{ind.description}</p>
                  <div className="text-xs font-medium mb-4" style={{ color: ind.color }}>
                    {ind.stats}
                  </div>
                  <ul className="space-y-1">
                    {ind.features.map((f) => (
                      <li key={f} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: ind.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#06B6D4]/10 to-[#8B5CF6]/10 p-12 text-center">
          <h2 className="text-3xl font-bold text-white font-heading mb-4">Don't see your industry?</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            NEPALIX is flexible enough for any retail or service business. Talk to our team and we'll show you how it
            fits your workflow.
          </p>
          <GradientButton href="/book-demo" size="lg">
            Talk to Sales
          </GradientButton>
        </div>
      </SectionWrapper>
    </div>
  );
}
