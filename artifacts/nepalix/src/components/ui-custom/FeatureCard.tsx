import { ReactNode } from "react";
import { GlassCard } from "./GlassCard";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <GlassCard hoverEffect className="flex flex-col gap-4">
      <div className="w-12 h-12 rounded-lg bg-[#0F172A] border border-[rgba(148,163,184,0.18)] flex items-center justify-center text-[#06B6D4] mb-2">
        {icon}
      </div>
      <h3 className="font-heading font-semibold text-xl text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </GlassCard>
  );
}
