import { motion } from "framer-motion";
import { Heart, Globe, Users, Target } from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { GradientButton } from "@/components/ui-custom/GradientButton";

const team = [
  { name: "Aarav Sharma", role: "CEO & Co-founder", location: "Kathmandu", initials: "AS" },
  { name: "Priya Thapa", role: "CTO & Co-founder", location: "Lalitpur", initials: "PT" },
  { name: "Rajan KC", role: "Head of Product", location: "Pokhara", initials: "RK" },
  { name: "Sunita Gurung", role: "Head of Operations", location: "Kathmandu", initials: "SG" },
  { name: "Bikram Rai", role: "Head of Engineering", location: "Bhaktapur", initials: "BR" },
  { name: "Aisha Pandey", role: "Head of Design", location: "Kathmandu", initials: "AP" },
];

const values = [
  { icon: Heart, title: "Nepal First", description: "Every product decision starts with the question: does this serve Nepal's businesses?", color: "#EC4899" },
  { icon: Globe, title: "Global Standard", description: "We build to international benchmarks so Nepal's businesses compete on the world stage.", color: "#06B6D4" },
  { icon: Users, title: "Community Driven", description: "Our roadmap is built on feedback from thousands of real Nepali entrepreneurs.", color: "#8B5CF6" },
  { icon: Target, title: "Relentlessly Focused", description: "We say no to most things so we can say yes to the things that matter most.", color: "#84CC16" },
];

const milestones = [
  { year: "2021", event: "NEPALIX founded in Kathmandu with a team of 5" },
  { year: "2022", event: "Launched first beta with 50 pilot merchants in New Road" },
  { year: "2023", event: "Crossed 1,000 active merchants and NPR 500M in transactions" },
  { year: "2024", event: "Raised Series A, expanded to 50+ districts across Nepal" },
  { year: "2025", event: "Launched Enterprise tier and NEPALIX POS hardware" },
  { year: "2026", event: "5,000+ merchants, NPR 2B+ processed, 150+ team members" },
];

export default function About() {
  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <SectionWrapper withGlow>
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm font-medium text-cyan-400">
              Our Story
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
              Built in Nepal,{" "}
              <span className="bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] bg-clip-text text-transparent">
                built for Nepal
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              We started NEPALIX because we watched brilliant Nepali entrepreneurs lose to bigger players — not
              because of their products or hustle, but because they lacked the tools to compete. We're here to change that.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <GlassCard className="text-center" hoverEffect>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${v.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: v.color }} />
                  </div>
                  <h3 className="text-white font-bold font-heading mb-2">{v.title}</h3>
                  <p className="text-gray-400 text-sm">{v.description}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper className="bg-[#0F172A]/50" withGrid>
        <h2 className="text-3xl font-bold text-white font-heading text-center mb-12">Our Journey</h2>
        <div className="max-w-2xl mx-auto">
          {milestones.map((m, i) => (
            <motion.div
              key={m.year}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex gap-6 mb-8"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#06B6D4]/20 border border-[#06B6D4]/40 flex items-center justify-center text-cyan-400 text-xs font-bold flex-shrink-0">
                  {m.year.slice(2)}
                </div>
                {i < milestones.length - 1 && <div className="w-px flex-1 bg-white/10 mt-2" />}
              </div>
              <div className="pb-8">
                <div className="text-cyan-400 text-sm font-medium mb-1">{m.year}</div>
                <p className="text-gray-300">{m.event}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="text-3xl font-bold text-white font-heading text-center mb-12">The Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 font-heading">
                {member.initials}
              </div>
              <div className="text-white font-medium text-sm">{member.name}</div>
              <div className="text-gray-500 text-xs mt-0.5">{member.role}</div>
              <div className="text-gray-600 text-xs">{member.location}</div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <GradientButton href="/contact" size="lg">
            Join Our Team
          </GradientButton>
        </div>
      </SectionWrapper>
    </div>
  );
}
