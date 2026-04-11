import { HeroSection } from "@/components/sections/HeroSection";
import { ValuePropsSection } from "@/components/sections/ValuePropsSection";
import { FeaturesGridSection } from "@/components/sections/FeaturesGridSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CtaStripSection } from "@/components/sections/CtaStripSection";

export default function Home() {
  return (
    <div className="pt-20">
      <HeroSection />
      
      {/* LOGO CLOUD */}
      <section className="py-12 border-y border-white/5 bg-[#0F172A]/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-widest mb-8">
            Trusted by Nepal's fastest-growing businesses
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {["Goldstar", "Daraz", "Foodmandu", "Pathao", "Khalti", "Sastodeal", "CG", "IME"].map((logo) => (
              <span key={logo} className="font-heading font-bold text-xl md:text-2xl text-white">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      <ValuePropsSection />
      <FeaturesGridSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CtaStripSection />
    </div>
  );
}
