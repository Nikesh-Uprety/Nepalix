import { motion } from "framer-motion";
import { GradientButton } from "../ui-custom/GradientButton";
import { AnimatedCounter } from "../ui-custom/AnimatedCounter";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#06B6D4]/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 z-0 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 text-sm font-medium text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              NEPALIX OS 2.0 is Live
            </div>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The Commerce OS Built for <span className="text-gradient">Nepal</span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Power your online store, point-of-sale, inventory, and payments with a global-standard platform rooted in Kathmandu.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GradientButton href="/book-demo" size="lg" className="w-full sm:w-auto">
              Book a Demo
            </GradientButton>
            <GradientButton href="/contact" variant="ghost" size="lg" className="w-full sm:w-auto">
              Watch Video
            </GradientButton>
          </motion.div>
        </div>

        <motion.div 
          className="mt-20 relative mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.2)] bg-[#0F172A]">
            <div className="h-8 bg-[#070B14] border-b border-white/10 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <img 
              src="/hero-dashboard.png" 
              alt="Nepalix Dashboard" 
              className="w-full h-auto"
            />
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              <AnimatedCounter end={5000} suffix="+" />
            </div>
            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Merchants</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              <AnimatedCounter end={2} prefix="NPR " suffix="B+" />
            </div>
            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Processed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              <AnimatedCounter end={99.9} suffix="%" />
            </div>
            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              <AnimatedCounter end={50} suffix="+" />
            </div>
            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Districts</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
