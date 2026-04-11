import { Suspense, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GradientButton } from "../ui-custom/GradientButton";
import { AnimatedCounter } from "../ui-custom/AnimatedCounter";
import { HeroScene } from "../3d/HeroScene";
import { SceneErrorBoundary } from "../3d/SceneErrorBoundary";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setSupported(!!ctx);
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

const stats = [
  { end: 5000, suffix: "+", label: "Merchants" },
  { end: 2, prefix: "NPR ", suffix: "B+", label: "Processed" },
  { end: 99.9, suffix: "%", label: "Uptime" },
  { end: 50, suffix: "+", label: "Districts" },
];

export function HeroSection() {
  const reducedMotion = useReducedMotion();
  const isMobile = useMobile();
  const webGLSupported = useWebGLSupport();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  const show3D = !isMobile && !reducedMotion && webGLSupported === true;

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden bg-[#070B14]">
      {/* Background radial glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#06B6D4]/12 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#8B5CF6]/10 rounded-full blur-[120px] translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#EC4899]/8 rounded-full blur-[100px] -translate-x-1/4" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-0 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
          {/* Left: Text */}
          <motion.div style={reducedMotion ? {} : { y: textY }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[#06B6D4]/30 mb-8 text-sm font-medium text-cyan-400 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                NEPALIX OS 2.0 is Live
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.05] font-heading"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              The Commerce OS{" "}
              <span
                className="inline-block"
                style={{
                  background: "linear-gradient(135deg, #06B6D4, #3B82F6, #8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Built for Nepal
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Power your online store, point-of-sale, inventory, and payments with a
              global-standard platform rooted in Kathmandu.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-start gap-4 mb-12"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GradientButton href="/book-demo" size="lg">
                Book a Free Demo
              </GradientButton>
              <GradientButton href="/product" variant="ghost" size="lg">
                Explore Platform
              </GradientButton>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="text-2xl md:text-3xl font-bold text-white font-heading">
                    <AnimatedCounter end={s.end} prefix={s.prefix} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: 3D Scene or Static Fallback */}
          <motion.div
            className="relative h-[500px] lg:h-[620px]"
            style={reducedMotion ? {} : { y: sceneY, opacity: sceneOpacity }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {show3D ? (
              <SceneErrorBoundary fallback={<StaticHeroFallback />}>
                <Suspense fallback={<StaticHeroFallback />}>
                  <HeroScene className="rounded-2xl" />
                </Suspense>
              </SceneErrorBoundary>
            ) : (
              <StaticHeroFallback />
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070B14] to-transparent pointer-events-none z-20" />
    </section>
  );
}

function StaticHeroFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full max-w-md">
        {/* Mock dashboard card */}
        <div className="rounded-2xl border border-[#06B6D4]/20 bg-[#0F172A]/80 backdrop-blur-xl p-6 shadow-[0_0_60px_rgba(6,182,212,0.15)]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">Today's Revenue</div>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <div
            className="text-4xl font-bold mb-1 font-heading"
            style={{
              background: "linear-gradient(135deg, #06B6D4, #8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            NPR 1,24,350
          </div>
          <div className="text-green-400 text-sm mb-6">+23.4% vs yesterday</div>
          {/* Bar chart mock */}
          <div className="flex items-end gap-1.5 h-16">
            {[40, 65, 45, 80, 70, 90, 75].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background:
                    i === 5
                      ? "linear-gradient(180deg, #06B6D4, #3B82F6)"
                      : "rgba(255,255,255,0.08)",
                }}
              />
            ))}
          </div>
        </div>
        {/* Floating mini cards */}
        <div className="absolute -top-8 -right-8 rounded-xl border border-white/10 bg-[#111827]/80 backdrop-blur-xl p-4 shadow-lg">
          <div className="text-xs text-gray-500 mb-1">Orders Today</div>
          <div className="text-xl font-bold text-white font-heading">284</div>
          <div className="text-green-400 text-xs">+12 last hr</div>
        </div>
        <div className="absolute -bottom-6 -left-6 rounded-xl border border-white/10 bg-[#111827]/80 backdrop-blur-xl p-4 shadow-lg">
          <div className="text-xs text-gray-500 mb-1">Active Merchants</div>
          <div className="text-xl font-bold text-white font-heading">5,247</div>
          <div className="text-cyan-400 text-xs">🇳🇵 Across Nepal</div>
        </div>
      </div>
    </div>
  );
}
