import { HeroSection } from "@/components/sections/HeroSection";
import { ValuePropsSection } from "@/components/sections/ValuePropsSection";
import { FeaturesGridSection } from "@/components/sections/FeaturesGridSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CtaStripSection } from "@/components/sections/CtaStripSection";
import { ProofBlockSection } from "@/components/sections/ProofBlockSection";

export default function Home() {
  return (
    <div className="pt-20">
      <HeroSection />
      
      <ProofBlockSection />

      <ValuePropsSection />
      <FeaturesGridSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CtaStripSection />
    </div>
  );
}
