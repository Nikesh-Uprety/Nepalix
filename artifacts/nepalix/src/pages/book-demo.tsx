import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Video, Users, Zap } from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { GradientButton } from "@/components/ui-custom/GradientButton";

const perks = [
  { icon: Video, text: "30-minute live demo tailored to your business" },
  { icon: Users, text: "One-on-one with a Nepal commerce expert" },
  { icon: Zap, text: "See real data from businesses like yours" },
  { icon: Clock, text: "No commitment — cancel anytime" },
];

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

const businessTypes = [
  "Retail Store", "Restaurant / Cafe", "Fashion & Apparel", "Electronics",
  "Grocery / Supermarket", "Pharmacy", "Online Store Only", "Other",
];

export default function BookDemo() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <SectionWrapper withGlow>
        <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm font-medium text-cyan-400">
              Book a Demo
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 font-heading">
              See NEPALIX in{" "}
              <span className="bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] bg-clip-text text-transparent">
                15 minutes
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-10">
              Schedule a personalized walkthrough with our team and see exactly how NEPALIX fits your business —
              not a generic product tour.
            </p>
            <div className="space-y-4 mb-10">
              {perks.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-gray-300">{p.text}</span>
                  </motion.div>
                );
              })}
            </div>
            <GlassCard className="border-[#06B6D4]/20">
              <div className="text-sm text-gray-400 mb-2">Trusted by</div>
              <div className="flex flex-wrap gap-3">
                {["Himalayan Roasters", "KTM Apparel", "TechHub Nepal", "Everest Electronics"].map((b) => (
                  <span key={b} className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-300 border border-white/10">
                    {b}
                  </span>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            {submitted ? (
              <GlassCard className="text-center py-16">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white font-heading mb-3">Demo Booked!</h2>
                <p className="text-gray-400 mb-6">
                  We've sent a confirmation to your email. Our team will see you soon!
                </p>
                <GradientButton href="/">Back to Home</GradientButton>
              </GlassCard>
            ) : (
              <GlassCard>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">First Name</label>
                      <input
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#06B6D4]/60 transition-colors"
                        placeholder="Aarav"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Last Name</label>
                      <input
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#06B6D4]/60 transition-colors"
                        placeholder="Sharma"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Work Email</label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#06B6D4]/60 transition-colors"
                      placeholder="aarav@yourshop.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Phone (WhatsApp preferred)</label>
                    <input
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#06B6D4]/60 transition-colors"
                      placeholder="+977 98XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Business Type</label>
                    <select
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-[#06B6D4]/60 transition-colors"
                    >
                      <option value="">Select your business type</option>
                      {businessTypes.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Preferred Time</label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 rounded-lg text-xs font-medium transition-all border ${
                            selectedSlot === slot
                              ? "bg-[#06B6D4]/20 border-[#06B6D4]/60 text-cyan-400"
                              : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <GradientButton className="w-full justify-center" size="lg">
                    Book My Demo
                  </GradientButton>
                  <p className="text-center text-xs text-gray-500">
                    No spam. No sales pressure. Just a genuine walkthrough.
                  </p>
                </form>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
}
