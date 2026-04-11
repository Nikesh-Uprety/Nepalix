import { GlassCard } from "./GlassCard";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  company: string;
  avatar: string;
  rating?: number;
}

export function TestimonialCard({ quote, name, company, avatar, rating = 5 }: TestimonialCardProps) {
  return (
    <GlassCard className="flex flex-col justify-between h-full">
      <div>
        <div className="flex gap-1 mb-6">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} size={16} className="fill-[#84CC16] text-[#84CC16]" />
          ))}
        </div>
        <p className="text-gray-300 text-lg italic mb-8">"{quote}"</p>
      </div>
      <div className="flex items-center gap-4">
        <img 
          src={avatar} 
          alt={name} 
          className="w-12 h-12 rounded-full object-cover border border-[rgba(148,163,184,0.18)]"
        />
        <div>
          <h4 className="font-heading font-semibold text-white">{name}</h4>
          <p className="text-sm text-[#06B6D4] flex items-center gap-1">
            {company} 🇳🇵
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
