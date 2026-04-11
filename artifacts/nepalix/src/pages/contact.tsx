import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, MessageSquare, CheckCircle } from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { GradientButton } from "@/components/ui-custom/GradientButton";

const contactInfo = [
  { icon: MapPin, label: "Address", value: "Hattisar, Kathmandu 44600, Nepal" },
  { icon: Phone, label: "Phone", value: "+977 01-4234567" },
  { icon: Mail, label: "Email", value: "hello@nepalix.com" },
  { icon: MessageSquare, label: "WhatsApp", value: "+977 9801234567" },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <SectionWrapper withGlow>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
              Let's{" "}
              <span className="bg-gradient-to-r from-[#06B6D4] to-[#EC4899] bg-clip-text text-transparent">
                talk
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              Have a question about NEPALIX? Our team is based in Kathmandu and responds within 2 business hours.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {contactInfo.map((c, i) => {
                const Icon = c.icon;
                return (
                  <GlassCard key={i} className="flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">{c.label}</div>
                      <div className="text-white text-sm font-medium">{c.value}</div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0F172A]/60 h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Hattisar, Kathmandu</p>
                <p className="text-gray-600 text-xs mt-1">Near Naxal Intersection</p>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            {submitted ? (
              <GlassCard className="h-full flex flex-col items-center justify-center text-center py-16">
                <CheckCircle className="w-16 h-16 text-green-400 mb-6" />
                <h2 className="text-2xl font-bold text-white font-heading mb-3">Message Sent!</h2>
                <p className="text-gray-400">We'll get back to you within 2 business hours.</p>
              </GlassCard>
            ) : (
              <GlassCard>
                <h2 className="text-2xl font-bold text-white font-heading mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Name</label>
                      <input
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#06B6D4]/60 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                      <input
                        required
                        type="email"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#06B6D4]/60 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Subject</label>
                    <input
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#06B6D4]/60 transition-colors"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#06B6D4]/60 transition-colors resize-none"
                      placeholder="Tell us more about your business and what you need..."
                    />
                  </div>
                  <GradientButton className="w-full justify-center" size="lg">
                    Send Message
                  </GradientButton>
                </form>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
}
