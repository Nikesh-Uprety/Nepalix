import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingBag, Clock, ArrowRight, Quote } from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { GradientButton } from "@/components/ui-custom/GradientButton";

const caseStudies = [
  {
    company: "Himalayan Roasters",
    industry: "Cafe & Coffee",
    location: "Thamel, Kathmandu",
    logo: "HR",
    logoColor: "#F59E0B",
    summary: "Went from zero online presence to 150% growth in online orders within 3 months of launching with NEPALIX.",
    quote: "NEPALIX didn't just give us a website — it gave us a whole commerce system. Our baristas now focus on coffee, not spreadsheets.",
    quoteName: "Priya Maharjan",
    quoteRole: "Co-founder",
    metrics: [
      { icon: TrendingUp, value: "+150%", label: "Online Orders" },
      { icon: Users, value: "3,200+", label: "Monthly Customers" },
      { icon: Clock, value: "2hr", label: "Setup Time" },
    ],
    color: "#F59E0B",
    tags: ["Online Store", "eSewa Payments", "QR Ordering"],
  },
  {
    company: "KTM Apparel",
    industry: "Fashion & Retail",
    location: "New Road & Durbar Marg",
    logo: "KA",
    logoColor: "#EC4899",
    summary: "Unified 5 retail locations across Kathmandu with a single POS and inventory system, eliminating stock discrepancies.",
    quote: "We used to spend 4 hours every morning reconciling stock between stores. With NEPALIX POS, it's real-time. We got our mornings back.",
    quoteName: "Bikash Shrestha",
    quoteRole: "Operations Manager",
    metrics: [
      { icon: ShoppingBag, value: "5", label: "Locations Unified" },
      { icon: TrendingUp, value: "-78%", label: "Stock Errors" },
      { icon: Clock, value: "4hr/day", label: "Time Saved" },
    ],
    color: "#EC4899",
    tags: ["Multi-Location POS", "Inventory Sync", "Staff Management"],
  },
  {
    company: "TechHub Nepal",
    industry: "Electronics",
    location: "Putalisadak, Kathmandu",
    logo: "TH",
    logoColor: "#3B82F6",
    summary: "Scaled from a single shop to an e-commerce powerhouse with serial number tracking and warranty management built-in.",
    quote: "Every other platform we tried was built for foreign markets. NEPALIX actually understands Nepal — the payment gateways just work.",
    quoteName: "Aarav Singh",
    quoteRole: "CEO",
    metrics: [
      { icon: TrendingUp, value: "3x", label: "Revenue Growth" },
      { icon: Users, value: "12k+", label: "Online Customers" },
      { icon: ShoppingBag, value: "99.7%", label: "Inventory Accuracy" },
    ],
    color: "#3B82F6",
    tags: ["Online Store", "Serial Tracking", "Khalti + eSewa"],
  },
  {
    company: "Pokhara Threads",
    industry: "Fashion Boutique",
    location: "Lakeside, Pokhara",
    logo: "PT",
    logoColor: "#8B5CF6",
    summary: "A tourist-focused boutique that grew from walk-in only to shipping handmade crafts globally through NEPALIX.",
    quote: "We now ship to 20+ countries. NEPALIX handles the local payments in NPR and international orders seamlessly.",
    quoteName: "Sita Gurung",
    quoteRole: "Owner",
    metrics: [
      { icon: TrendingUp, value: "20+", label: "Countries Reached" },
      { icon: Users, value: "+220%", label: "Revenue Growth" },
      { icon: ShoppingBag, value: "100%", label: "Uptime" },
    ],
    color: "#8B5CF6",
    tags: ["International Shipping", "Online Store", "Custom Storefront"],
  },
];

export default function CaseStudies() {
  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <SectionWrapper withGlow>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm font-medium text-cyan-400">
              Success Stories
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
              Real businesses.{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #06B6D4, #8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Real results.
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              See how Nepali businesses of every size are scaling with NEPALIX.
            </p>
          </motion.div>
        </div>

        <div className="space-y-10 mb-16">
          {caseStudies.map((cs, i) => (
            <motion.div
              key={cs.company}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-2xl border border-white/10 bg-[#0F172A]/60 overflow-hidden grid lg:grid-cols-5 ${i % 2 === 1 ? "lg:direction-rtl" : ""}`}
            >
              {/* Left: Company + Quote */}
              <div className="lg:col-span-3 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg font-heading flex-shrink-0"
                      style={{ backgroundColor: `${cs.color}25`, border: `1px solid ${cs.color}40` }}
                    >
                      <span style={{ color: cs.color }}>{cs.logo}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white font-heading">{cs.company}</h3>
                      <div className="text-sm text-gray-500">
                        {cs.industry} · {cs.location}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-6">{cs.summary}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {cs.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${cs.color}15`, color: cs.color, border: `1px solid ${cs.color}30` }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <blockquote className="border-l-2 pl-4" style={{ borderColor: cs.color }}>
                  <Quote className="w-5 h-5 mb-2" style={{ color: cs.color }} />
                  <p className="text-gray-300 text-sm italic mb-2">"{cs.quote}"</p>
                  <cite className="text-sm not-italic">
                    <span className="text-white font-medium">{cs.quoteName}</span>
                    <span className="text-gray-500"> — {cs.quoteRole}, {cs.company}</span>
                  </cite>
                </blockquote>
              </div>

              {/* Right: Metrics */}
              <div
                className="lg:col-span-2 p-8 flex flex-col justify-center gap-6"
                style={{ background: `linear-gradient(135deg, ${cs.color}08, transparent)` }}
              >
                {cs.metrics.map((m, mi) => {
                  const MIcon = m.icon;
                  return (
                    <div key={mi} className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${cs.color}20` }}
                      >
                        <MIcon className="w-5 h-5" style={{ color: cs.color }} />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white font-heading" style={{ color: cs.color }}>
                          {m.value}
                        </div>
                        <div className="text-gray-500 text-sm">{m.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-500 mb-6">Ready to write your own success story?</p>
          <GradientButton href="/book-demo" size="lg">
            <span className="flex items-center gap-2">
              Book a Demo <ArrowRight className="w-5 h-5" />
            </span>
          </GradientButton>
        </div>
      </SectionWrapper>
    </div>
  );
}
