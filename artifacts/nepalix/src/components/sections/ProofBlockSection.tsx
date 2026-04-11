import { GlassCard } from "@/components/ui-custom/GlassCard";

const stats = [
  { value: "5,000+", label: "Active merchants" },
  { value: "NPR 2B+", label: "Annual GMV processed" },
  { value: "99.9%", label: "Platform uptime" },
  { value: "50+", label: "Districts served" },
];

const logos = ["Goldstar", "Daraz", "Foodmandu", "Pathao", "Khalti", "Sastodeal"];

export function ProofBlockSection() {
  return (
    <section className="py-12 border-y border-white/5 bg-[#0F172A]/30">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-center text-xs md:text-sm font-medium text-gray-500 uppercase tracking-[0.18em] mb-8">
          Trusted by Nepal&apos;s fastest-growing businesses
        </p>

        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 mb-10">
          {logos.map((logo) => (
            <span key={logo} className="font-heading font-bold text-lg md:text-2xl text-white">
              {logo}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((item) => (
            <GlassCard key={item.label} className="text-center p-4 md:p-5">
              <div className="text-2xl md:text-3xl font-bold font-heading text-white mb-1">{item.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
