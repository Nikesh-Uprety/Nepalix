import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function CaseStudies() {
  return (
    <div className="pt-24 min-h-[100dvh]">
      <SectionWrapper>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Success Stories</h1>
          <p className="text-xl text-gray-400">See how Nepali brands are scaling with Nepalix.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <GlassCard className="p-0 overflow-hidden">
            <img src="/case-study-1.png" alt="Coffee Shop" className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Himalayan Roasters</h3>
              <p className="text-gray-400">Increased online orders by 150% in 3 months.</p>
            </div>
          </GlassCard>
          <GlassCard className="p-0 overflow-hidden">
            <img src="/case-study-2.png" alt="Fashion Boutique" className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">KTM Apparel</h3>
              <p className="text-gray-400">Unified 5 retail locations with one POS system.</p>
            </div>
          </GlassCard>
          <GlassCard className="p-0 overflow-hidden">
            <img src="/case-study-3.png" alt="Electronics Store" className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">TechHub Nepal</h3>
              <p className="text-gray-400">Streamlined inventory across web and physical stores.</p>
            </div>
          </GlassCard>
        </div>
      </SectionWrapper>
    </div>
  );
}
