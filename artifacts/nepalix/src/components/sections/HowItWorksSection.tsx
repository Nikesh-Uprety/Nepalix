import { SectionWrapper } from "../ui-custom/SectionWrapper";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Connect & Setup",
    desc: "Import your inventory or add products easily. Connect your local payment gateways."
  },
  {
    num: "02",
    title: "Design Storefront",
    desc: "Choose from premium themes and customize to match your brand identity perfectly."
  },
  {
    num: "03",
    title: "Start Selling",
    desc: "Launch your store, connect your POS, and manage orders from one dashboard."
  }
];

export function HowItWorksSection() {
  return (
    <SectionWrapper>
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">From idea to enterprise.</h2>
        <p className="text-lg text-gray-400">Launch faster than you thought possible.</p>
      </div>

      <div className="relative">
        {/* Connecting Line */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              <div className="w-20 h-20 rounded-full bg-[#0F172A] border border-white/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                <span className="text-2xl font-bold text-gradient">{step.num}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
