import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, BarChart3, CheckCircle2, ChevronDown, LayoutDashboard, Lock, Package, ShoppingBag, ShieldCheck, Zap } from "lucide-react";

function useDepth(mouseX: MotionValue<number>, mouseY: MotionValue<number>, depth: number) {
  const x = useTransform(mouseX, [-0.5, 0.5], [-depth, depth]);
  const y = useTransform(mouseY, [-0.5, 0.5], [depth, -depth]);
  return { x, y };
}

function AnalyticsCard({ mouseX, mouseY }: { mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const depth = useDepth(mouseX, mouseY, 34);

  return (
    <motion.div
      initial={{ opacity: 0, x: -90, rotateY: 18 }}
      animate={{ opacity: 1, x: 0, rotateY: 12 }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ x: depth.x, y: depth.y, transformStyle: "preserve-3d" }}
      className="pointer-events-none absolute left-[-2rem] top-[8.5rem] hidden w-[330px] rounded-[1.35rem] border border-white/10 bg-[#0b1428]/70 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:block xl:left-[1rem]"
    >
      <div className="absolute inset-0 rounded-[1.35rem] bg-gradient-to-br from-cyan-400/10 via-transparent to-blue-500/10" />
      <div className="relative flex gap-4">
        <div className="w-[74px] shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="mb-5 text-[11px] font-medium text-slate-300">Analytics</p>
          {["Overview", "Sales", "Products", "Customers", "Reports"].map((item, index) => (
            <div
              key={item}
              className={`mb-2 rounded-lg px-2 py-1.5 text-[8px] ${index === 0 ? "bg-blue-500/20 text-blue-200" : "text-slate-500"}`}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Dashboard</p>
              <p className="mt-1 text-[10px] text-slate-500">Fashion retail performance</p>
            </div>
            <LayoutDashboard className="h-4 w-4 text-cyan-300" />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[9px] text-slate-500">Total Sales</p>
              <p className="mt-1 text-sm font-bold text-white">Rs 1,248,000</p>
              <p className="text-[9px] text-emerald-300">+12.8%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[9px] text-slate-500">Total Orders</p>
              <p className="mt-1 text-sm font-bold text-white">1,429</p>
              <p className="text-[9px] text-emerald-300">+8.4%</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] text-slate-400">Sales Overview</p>
              <BarChart3 className="h-3.5 w-3.5 text-blue-300" />
            </div>
            <svg viewBox="0 0 220 92" className="h-[92px] w-full overflow-visible">
              <defs>
                <linearGradient id="hero-chart" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              {[20, 44, 68].map((line) => (
                <line key={line} x1="0" x2="220" y1={line} y2={line} stroke="rgba(255,255,255,0.06)" />
              ))}
              <motion.path
                d="M2 76 C 28 68, 35 48, 58 55 S 88 70, 108 45 S 143 40, 158 49 S 189 37, 218 22"
                fill="none"
                stroke="url(#hero-chart)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, delay: 0.8, ease: "easeOut" }}
              />
              <path d="M2 76 C 28 68, 35 48, 58 55 S 88 70, 108 45 S 143 40, 158 49 S 189 37, 218 22 L218 92 L2 92 Z" fill="url(#hero-chart)" opacity="0.08" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InventoryCard({ mouseX, mouseY }: { mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const depth = useDepth(mouseX, mouseY, -34);
  const rows = [
    ["T-Shirt", "In Stock", "124"],
    ["Jeans", "Low Stock", "8"],
    ["Jacket", "In Stock", "45"],
    ["Sneakers", "In Stock", "67"],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 90, rotateY: -18 }}
      animate={{ opacity: 1, x: 0, rotateY: -12 }}
      transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ x: depth.x, y: depth.y, transformStyle: "preserve-3d" }}
      className="pointer-events-none absolute right-[-2rem] top-[8.5rem] hidden w-[330px] rounded-[1.35rem] border border-white/10 bg-[#0b1428]/70 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:block xl:right-[1rem]"
    >
      <div className="absolute inset-0 rounded-[1.35rem] bg-gradient-to-bl from-purple-400/10 via-transparent to-blue-500/10" />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Inventory Overview</p>
              <p className="text-[10px] text-slate-500">Real-time stock control</p>
            </div>
          </div>
          <div className="h-7 w-7 rounded-full border border-white/10 bg-gradient-to-br from-cyan-300 to-purple-400" />
        </div>
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            ["Total Products", "2,456", "text-white"],
            ["Low Stock", "23", "text-rose-300"],
            ["Out of Stock", "5", "text-orange-300"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[8px] text-slate-500">{label}</p>
              <p className={`mt-1 text-sm font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="mb-3 text-[10px] text-slate-400">Recent Activity</p>
          <div className="space-y-2.5">
            {rows.map(([name, status, count]) => (
              <div key={name} className="flex items-center justify-between rounded-lg bg-black/10 px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-[10px] text-slate-300">{name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] ${status === "Low Stock" ? "text-orange-300" : "text-emerald-300"}`}>{status}</span>
                  <span className="w-5 text-right text-[10px] text-slate-400">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseX = useSpring(rawMouseX, { stiffness: 90, damping: 24, mass: 0.4 });
  const mouseY = useSpring(rawMouseY, { stiffness: 90, damping: 24, mass: 0.4 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
  const glowX = useTransform(mouseX, [-0.5, 0.5], [35, 65]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [30, 58]);
  const glowLeft = useTransform(glowX, (v) => `${v}%`);
  const glowTop = useTransform(glowY, (v) => `${v}%`);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0.42]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    rawMouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    rawMouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    rawMouseX.set(0);
    rawMouseY.set(0);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative isolate min-h-[calc(100vh-1px)] overflow-hidden bg-[#050914] pt-28 text-white md:pt-32"
      style={{ perspective: "1400px" }}
    >
      <motion.div className="absolute inset-0 -z-20" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(25,76,180,0.30),transparent_38%),linear-gradient(180deg,#081225_0%,#050914_56%,#03050a_100%)]" />
        <motion.div
          className="absolute h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-[120px]"
          style={{ left: glowLeft, top: glowTop }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:22px_22px]" />
      </motion.div>

      <div className="absolute left-0 right-0 top-[55%] -z-10 h-40 bg-gradient-to-r from-purple-500/60 via-cyan-400/80 to-blue-500/70 blur-3xl opacity-25" />
      <div className="absolute bottom-0 left-0 right-0 z-10 h-24 bg-gradient-to-t from-white to-transparent" />
      <div className="absolute bottom-0 left-1/2 z-10 h-24 w-[120vw] -translate-x-1/2 rounded-t-[100%] border-t border-cyan-300/30 bg-white shadow-[0_-22px_70px_rgba(59,130,246,0.35)]" />

      <motion.div
        className="container relative z-20 mx-auto max-w-7xl px-4 pb-36"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <AnalyticsCard mouseX={mouseX} mouseY={mouseY} />
        <InventoryCard mouseX={mouseX} mouseY={mouseY} />

        <motion.div
          style={{ y: contentY, opacity: contentOpacity, transformStyle: "preserve-3d" }}
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200 shadow-[0_0_32px_rgba(6,182,212,0.12)] backdrop-blur-xl"
            style={{ transform: "translateZ(62px)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
            Nepal's Commerce Operating System
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl font-heading text-[clamp(3.4rem,7.2vw,6.25rem)] font-black leading-[0.96] tracking-[-0.055em] text-white drop-shadow-[0_22px_46px_rgba(0,0,0,0.35)]"
            style={{ transform: "translateZ(88px)" }}
          >
            Run Your Entire Fashion Retail
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              From One System
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: "easeOut" }}
            className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg"
            style={{ transform: "translateZ(70px)" }}
          >
            Powering next-generation retail experiences. Unify your online store, POS, inventory, orders, and analytics in one system built for Nepal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: "easeOut" }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ transform: "translateZ(92px)" }}
          >
            <motion.a
              whileHover={{ scale: 1.05, boxShadow: "0 0 44px rgba(59,130,246,0.55)" }}
              whileTap={{ scale: 0.98 }}
              href="/book-demo"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_18px_46px_rgba(37,99,235,0.36)] transition-shadow"
            >
              Book a Demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05, boxShadow: "0 0 34px rgba(255,255,255,0.10)" }}
              whileTap={{ scale: 0.98 }}
              href="/product"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-xl transition-colors hover:bg-white/[0.07]"
            >
              Explore Product
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.48, ease: "easeOut" }}
            className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-3"
            style={{ transform: "translateZ(48px)" }}
          >
            {[
              [Zap, "Fast Implementation", "Go live in days, not months"],
              [ShieldCheck, "Nepal-First", "Built for local businesses"],
              [Lock, "24/7 Support", "Always here to help"],
            ].map(([Icon, title, subtitle]) => {
              const ItemIcon = Icon as typeof Zap;
              return (
                <div key={title as string} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 backdrop-blur-xl">
                  <ItemIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                  <div>
                    <p className="text-xs font-semibold text-white">{title as string}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{subtitle as string}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-lg md:flex"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
        All-in-one platform
        <ChevronDown className="h-3.5 w-3.5" />
      </motion.div>
    </section>
  );
}
