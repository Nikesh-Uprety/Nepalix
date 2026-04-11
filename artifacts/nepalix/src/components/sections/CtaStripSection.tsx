import { SectionWrapper } from "../ui-custom/SectionWrapper";
import { GradientButton } from "../ui-custom/GradientButton";

export function CtaStripSection() {
  return (
    <SectionWrapper className="!py-0 mb-24">
      <div className="relative rounded-3xl overflow-hidden border border-white/20 bg-gradient-to-br from-[#06B6D4]/20 via-[#3B82F6]/20 to-[#8B5CF6]/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        <div className="absolute inset-0 backdrop-blur-xl bg-[#070B14]/40" />
        
        <div className="relative z-10 px-8 py-20 md:py-24 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to grow your business?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of Nepali businesses scaling with NEPALIX. Try it free for 14 days. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <GradientButton href="/book-demo" size="lg">
              Start Free Trial
            </GradientButton>
            <GradientButton href="/contact" variant="ghost" size="lg">
              Talk to Sales
            </GradientButton>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
