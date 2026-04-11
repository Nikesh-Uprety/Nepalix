import { motion } from "framer-motion";
import { GradientButton } from "@/components/ui-custom/GradientButton";

interface EnterprisePageHeroProps {
  badge: string;
  title: string;
  highlight: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
}

export function EnterprisePageHero({
  badge,
  title,
  highlight,
  description,
  primaryCta,
  secondaryCta,
  className = "",
}: EnterprisePageHeroProps) {
  return (
    <div className={`text-center max-w-4xl mx-auto mb-16 ${className}`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm font-medium text-cyan-400">
          {badge}
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading leading-[1.05]">
          {title}{" "}
          <span className="bg-gradient-to-r from-[#06B6D4] via-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
            {highlight}
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">{description}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <GradientButton href={primaryCta.href} size="lg">
            {primaryCta.label}
          </GradientButton>
          {secondaryCta ? (
            <GradientButton href={secondaryCta.href} variant="ghost" size="lg">
              {secondaryCta.label}
            </GradientButton>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
