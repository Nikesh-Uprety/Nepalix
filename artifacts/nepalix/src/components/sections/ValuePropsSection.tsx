import { SectionWrapper } from "../ui-custom/SectionWrapper";
import { Store, CreditCard, Package, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const props = [
  {
    icon: <Store size={32} className="text-cyan-400" />,
    title: "Online Store",
    desc: "Build a beautiful, high-converting eCommerce site in minutes.",
    color: "from-cyan-500/20 to-transparent"
  },
  {
    icon: <CreditCard size={32} className="text-blue-400" />,
    title: "Payments",
    desc: "Accept eSewa, Khalti, cards, and bank transfers seamlessly.",
    color: "from-blue-500/20 to-transparent"
  },
  {
    icon: <Package size={32} className="text-purple-400" />,
    title: "Inventory",
    desc: "Sync stock across online and offline channels instantly.",
    color: "from-purple-500/20 to-transparent"
  },
  {
    icon: <BarChart3 size={32} className="text-pink-400" />,
    title: "POS Terminal",
    desc: "Power your retail locations with our blazing-fast POS.",
    color: "from-pink-500/20 to-transparent"
  }
];

export function ValuePropsSection() {
  return (
    <SectionWrapper withGrid>
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to sell.</h2>
        <p className="text-lg text-gray-400">One unified platform to run your entire commerce business, tailored for the Nepali market.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {props.map((prop, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative p-6 rounded-2xl border border-white/10 bg-[#0F172A]/40 backdrop-blur-sm overflow-hidden group hover:border-white/20 transition-colors"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${prop.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10">
              <div className="mb-6">{prop.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-white">{prop.title}</h3>
              <p className="text-gray-400 leading-relaxed">{prop.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
