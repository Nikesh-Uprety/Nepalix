import { Suspense, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GradientButton } from "../ui-custom/GradientButton";
import { AnimatedCounter } from "../ui-custom/AnimatedCounter";
import { HeroScene } from "../3d/HeroScene";
import { SceneErrorBoundary } from "../3d/SceneErrorBoundary";

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

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

const stats = [
  { end: 5000, suffix: "+",   label: "Merchants",  prefix: "" },
  { end: 2,    suffix: "B+",  label: "Processed",  prefix: "NPR " },
  { end: 99.9, suffix: "%",   label: "Uptime",     prefix: "" },
  { end: 50,   suffix: "+",   label: "Districts",  prefix: "" },
];

// Static animated fallback when WebGL is unavailable
function StaticGlobeFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Simulated glowing orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
        {/* Outer glow rings */}
        {[380, 300, 220].map((size, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: size,
              height: size,
              borderColor: ["rgba(6,182,212,0.15)", "rgba(59,130,246,0.12)", "rgba(139,92,246,0.1)"][i],
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: [20, 15, 25][i], repeat: Infinity, ease: "linear" }}
          />
        ))}
        {/* Pulsing center globe */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, #0e4a6e, #040d1a)",
            boxShadow: "0 0 60px rgba(6,182,212,0.3), 0 0 120px rgba(6,182,212,0.1)",
          }}
          animate={{ scale: [1, 1.04, 1], boxShadow: ["0 0 60px rgba(6,182,212,0.3)", "0 0 80px rgba(6,182,212,0.5)", "0 0 60px rgba(6,182,212,0.3)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Central gem */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10"
          style={{
            background: "linear-gradient(135deg, #06B6D4, #3B82F6)",
            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          }}
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
        />
        {/* Orbiting dots */}
        {[
          { orbit: 150, speed: 6, color: "#06B6D4", size: 8 },
          { orbit: 110, speed: -9, color: "#8B5CF6", size: 6 },
          { orbit: 185, speed: 14, color: "#EC4899", size: 5 },
        ].map((dot, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{ width: dot.size, height: dot.size, background: dot.color, marginTop: -dot.size / 2, marginLeft: dot.orbit - dot.size / 2 }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: Math.abs(dot.speed), repeat: Infinity, ease: "linear", direction: dot.speed < 0 ? "reverse" : "normal" }}
            transformOrigin={`-${dot.orbit - dot.size / 2}px center`}
          />
        ))}
      </div>
      {/* Scattered stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.4 + 0.1,
          }}
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}
    </div>
  );
}

export function HeroSection() {
  const webGLSupported = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const show3D = !reducedMotion && webGLSupported === true;

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        backgroundColor: "#070B14",
      }}
    >
      {/* ── Full-screen 3D canvas / fallback ── */}
      <div className="absolute inset-0 z-[1]">
        {show3D ? (
          <SceneErrorBoundary fallback={<StaticGlobeFallback />}>
            <Suspense fallback={<StaticGlobeFallback />}>
              <HeroScene className="w-full h-full" />
            </Suspense>
          </SceneErrorBoundary>
        ) : (
          <StaticGlobeFallback />
        )}
      </div>

      {/* ── Hero content centered on top ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-32 pb-16 w-full max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10 text-xs font-semibold uppercase tracking-[0.12em]"
          style={{
            background: "rgba(6,182,212,0.07)",
            border: "1px solid rgba(6,182,212,0.22)",
            color: "#67e8f9",
          }}
        >
          <motion.span
            className="w-[7px] h-[7px] rounded-full bg-[#06B6D4]"
            animate={{ opacity: [1, 0.4, 1], boxShadow: ["0 0 6px #06B6D4", "0 0 0px #06B6D4", "0 0 6px #06B6D4"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          NEPALIX OS 2.0 is Live
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading font-extrabold text-white mb-7 leading-[1.04]"
          style={{ fontSize: "clamp(3.2rem, 7vw, 5.8rem)", letterSpacing: "-0.02em" }}
        >
          The Commerce OS
          <br />
          <span
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

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl leading-[1.72] mb-14 max-w-xl"
          style={{ color: "rgba(255,255,255,0.42)" }}
        >
          Power your online store, point-of-sale, inventory, and payments with a
          global-standard platform rooted in Kathmandu.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-4 flex-wrap justify-center mb-20"
        >
          <GradientButton href="/book-demo" size="lg">
            Book a Free Demo
          </GradientButton>
          <GradientButton href="/product" variant="ghost" size="lg">
            Explore Platform
          </GradientButton>
        </motion.div>

        {/* Stats strip — glassmorphism panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 w-full max-w-[760px] overflow-hidden rounded-[18px]"
          style={{
            border: "1px solid rgba(148,163,184,0.2)",
            background: "rgba(13,20,36,0.6)",
            backdropFilter: "blur(24px)",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="py-7 px-5 text-center"
              style={{
                borderRight: i < stats.length - 1 ? "1px solid rgba(148,163,184,0.12)" : undefined,
              }}
            >
              <div
                className="font-heading text-[30px] font-extrabold leading-none mb-[7px]"
                style={{
                  background: "linear-gradient(135deg, #06B6D4, #8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <AnimatedCounter end={s.end} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div
                className="text-[11px] uppercase tracking-[0.12em] mt-[7px]"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient blend into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070B14] to-transparent pointer-events-none z-20" />
    </section>
  );
}
