import { Fragment } from "react";
import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GradientButton } from "@/components/ui-custom/GradientButton";

const competitors = [
  { name: "NEPALIX", highlight: true, color: "#06B6D4" },
  { name: "WooCommerce", highlight: false, color: "#9CA3AF" },
  { name: "Daraz Seller", highlight: false, color: "#9CA3AF" },
  { name: "Manual / Excel", highlight: false, color: "#9CA3AF" },
];

type FeatureValue = true | false | "partial";

const features: { category: string; items: { name: string; values: FeatureValue[] }[] }[] = [
  {
    category: "Online Commerce",
    items: [
      { name: "Custom branded store", values: [true, true, false, false] },
      { name: "Mobile-optimized storefront", values: [true, "partial", false, false] },
      { name: "SEO tools & meta control", values: [true, true, false, false] },
      { name: "Product variants (size, color)", values: [true, true, true, false] },
      { name: "Digital product support", values: [true, true, false, false] },
    ],
  },
  {
    category: "Nepal Payments",
    items: [
      { name: "eSewa integration", values: [true, "partial", true, false] },
      { name: "Khalti integration", values: [true, "partial", false, false] },
      { name: "FonePay / ConnectIPS", values: [true, false, false, false] },
      { name: "T+1 settlement to bank", values: [true, false, "partial", false] },
      { name: "Payment link generation", values: [true, false, false, false] },
    ],
  },
  {
    category: "Physical Retail",
    items: [
      { name: "Built-in POS terminal", values: [true, false, false, false] },
      { name: "Offline POS mode", values: [true, false, false, false] },
      { name: "Multi-location inventory", values: [true, "partial", false, false] },
      { name: "Staff roles & permissions", values: [true, "partial", false, false] },
      { name: "Table management (restaurants)", values: [true, false, false, false] },
    ],
  },
  {
    category: "Analytics & Growth",
    items: [
      { name: "Real-time sales dashboard", values: [true, "partial", "partial", false] },
      { name: "Customer lifetime value", values: [true, "partial", false, false] },
      { name: "Geographic heat maps", values: [true, false, false, false] },
      { name: "Inventory forecasting", values: [true, false, false, false] },
    ],
  },
  {
    category: "Support & Compliance",
    items: [
      { name: "Nepal-based customer support", values: [true, false, false, false] },
      { name: "Nepali language interface", values: [true, false, false, false] },
      { name: "VAT / IRD compliance", values: [true, false, false, false] },
      { name: "SLA guarantee", values: [true, false, false, false] },
    ],
  },
];

function FeatureIcon({ value }: { value: FeatureValue }) {
  if (value === true) return <Check className="w-5 h-5 text-green-400 mx-auto" />;
  if (value === false) return <X className="w-5 h-5 text-gray-600 mx-auto" />;
  return <Minus className="w-5 h-5 text-yellow-500 mx-auto" />;
}

export default function Compare() {
  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <SectionWrapper withGlow>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm font-medium text-cyan-400">
              How We Stack Up
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
              NEPALIX vs{" "}
              <span className="bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] bg-clip-text text-transparent">
                the alternatives
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              See why 5,000+ Nepali businesses chose NEPALIX over stitching together generic tools.
            </p>
          </motion.div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                <th className="text-left py-4 pr-6 text-gray-400 font-normal text-sm w-1/3">Feature</th>
                {competitors.map((c) => (
                  <th key={c.name} className="text-center py-4 px-4">
                    {c.highlight ? (
                      <div className="inline-flex flex-col items-center">
                        <span
                          className="text-lg font-bold font-heading px-4 py-2 rounded-xl"
                          style={{
                            color: c.color,
                            backgroundColor: `${c.color}20`,
                            border: `1px solid ${c.color}40`,
                          }}
                        >
                          {c.name}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">Best for Nepal</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 font-medium">{c.name}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((group) => (
                <Fragment key={group.category}>
                  <tr>
                    <td
                      colSpan={competitors.length + 1}
                      className="py-4 pt-8 text-xs font-semibold text-cyan-400 uppercase tracking-widest"
                    >
                      {group.category}
                    </td>
                  </tr>
                  {group.items.map((item, i) => (
                    <tr
                      key={item.name}
                      className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                    >
                      <td className="py-3 pr-6 text-gray-300 text-sm">{item.name}</td>
                      {item.values.map((val, vi) => (
                        <td
                          key={vi}
                          className={`py-3 px-4 text-center ${vi === 0 ? "bg-[#06B6D4]/5" : ""}`}
                        >
                          <FeatureIcon value={val} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-8">
            <Minus className="w-4 h-4 text-yellow-500 inline mr-1" /> = Partial support via third-party plugins or limited functionality
          </p>
          <GradientButton href="/book-demo" size="lg">
            See NEPALIX in Action
          </GradientButton>
        </div>
      </SectionWrapper>
    </div>
  );
}
