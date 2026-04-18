import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingBag, Clock, ArrowRight, Quote, ExternalLink } from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { GradientButton } from "@/components/ui-custom/GradientButton";

const caseStudies = [
  {
    company: "Rare Atelier",
    industry: "High-End Fashion Retail",
    location: "Kathmandu & Online",
    logo: "RA",
    logoColor: "#06B6D4",
    image: "/hero-dashboard.png",
    summary: "Rare Atelier runs their entire fashion retail operation on NEPALIX. From their visual canvas storefront to physical POS, inventory tracking, and billing—all orchestrated through a single unified commerce OS.",
    quote: "We don't need multiple disconnected apps anymore. NEPALIX gives us a complete infrastructure to scale our fashion brand natively in Nepal.",
    quoteName: "Founding Team",
    quoteRole: "Rare Atelier",
    metrics: [
      { icon: ShoppingBag, value: "100%", label: "Omnichannel Sync" },
      { icon: Users, value: "Unified", label: "Customer Profiles" },
      { icon: TrendingUp, value: "Zero", label: "Overselling" },
    ],
    color: "#06B6D4",
    tags: ["Canvas Customization", "POS", "Inventory", "Live E-commerce"],
    link: "https://rare-np-production.up.railway.app/",
  },
  {
    company: "Himalayan Roasters",
    industry: "Cafe & Coffee",
    location: "Thamel, Kathmandu",
    logo: "HR",
    logoColor: "#F59E0B",
    image: "/case-study-1.png",
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
    image: "/hero-dashboard.png",
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
    image: "/hero-dashboard.png",
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
  }
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
              See how Nepali businesses of every size are scaling with NEPALIX. From high-end fashion boutiques to bustling electronics stores.
            </p>
          </motion.div>
        </div>

        <div className="space-y-12 mb-16">
          {caseStudies.map((cs, i) => (
            <motion.div
              key={cs.company}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-3xl border border-white/10 bg-[#0F172A]/60 overflow-hidden grid lg:grid-cols-5 ${i % 2 === 1 ? "lg:direction-rtl" : ""}`}
            >
              {/* Left: Company + Quote */}
              <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl font-heading flex-shrink-0"
                      style={{ backgroundColor: `${cs.color}25`, border: `1px solid ${cs.color}40` }}
                    >
                      <span style={{ color: cs.color }}>{cs.logo}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white font-heading">{cs.company}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {cs.industry} · {cs.location}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed mb-8">{cs.summary}</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {cs.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${cs.color}15`, color: cs.color, border: `1px solid ${cs.color}30` }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {cs.link && (
                    <div className="mb-8">
                      <a 
                        href={cs.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                        style={{ color: cs.color }}
                      >
                        View Live Store <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                </div>
                <blockquote className="border-l-2 pl-5 py-2" style={{ borderColor: cs.color }}>
                  <Quote className="w-6 h-6 mb-3" style={{ color: cs.color }} />
                  <p className="text-gray-300 text-base italic mb-3">"{cs.quote}"</p>
                  <cite className="text-sm not-italic">
                    <span className="text-white font-medium">{cs.quoteName}</span>
                    <span className="text-gray-500"> — {cs.quoteRole}, {cs.company}</span>
                  </cite>
                </blockquote>
              </div>

              {/* Right: Image */}
              {cs.image ? (
                <div className="lg:col-span-2 relative h-[350px] lg:h-auto">
                  <img src={cs.image} alt={`${cs.company} showcase`} className="absolute inset-0 w-full h-full object-cover lg:object-contain" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#070B14] to-transparent">
                    <div className="grid grid-cols-3 gap-2">
                      {cs.metrics.map((m, mi) => (
                        <div key={mi} className="text-center bg-[#070B14]/80 backdrop-blur-md rounded-lg p-2 border border-white/10">
                          <div className="text-lg font-bold text-white font-heading" style={{ color: cs.color }}>
                            {m.value}
                          </div>
                          <div className="text-gray-400 text-xs">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center gap-8"
                  style={{ background: `linear-gradient(135deg, ${cs.color}08, transparent)` }}
                >
                  {cs.metrics.map((m, mi) => {
                    const MIcon = m.icon;
                    return (
                      <div key={mi} className="flex items-center gap-5">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${cs.color}20` }}
                        >
                          <MIcon className="w-6 h-6" style={{ color: cs.color }} />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-white font-heading mb-1" style={{ color: cs.color }}>
                            {m.value}
                          </div>
                          <div className="text-gray-400 text-sm">{m.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-500 mb-6 text-lg">Ready to write your own success story?</p>
          <GradientButton href="/book-demo" size="lg">
            <span className="flex items-center gap-2 text-base">
              Book a Demo <ArrowRight className="w-5 h-5" />
            </span>
          </GradientButton>
        </div>
      </SectionWrapper>
    </div>
  );
}
