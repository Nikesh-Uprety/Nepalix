import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Video, Users, Zap, AlertCircle } from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { GradientButton } from "@/components/ui-custom/GradientButton";

const demoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  businessType: z.string().min(1, "Please select your business type"),
  timeSlot: z.string().min(1, "Please select a preferred time"),
  message: z.string().optional(),
});

type DemoFormValues = z.infer<typeof demoSchema>;

const perks = [
  { icon: Video, text: "30-minute live demo tailored to your business" },
  { icon: Users, text: "One-on-one with a Nepal commerce expert" },
  { icon: Zap, text: "See real data from businesses like yours" },
  { icon: Clock, text: "No commitment — cancel anytime" },
];

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

const businessTypes = [
  "Retail Store", "Restaurant / Cafe", "Fashion & Apparel", "Electronics",
  "Grocery / Supermarket", "Pharmacy", "Online Store Only", "Other",
];

export default function BookDemo() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DemoFormValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: { timeSlot: "" },
  });

  const selectedSlot = watch("timeSlot");

  function onSubmit(_data: DemoFormValues) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setSubmitted(true);
        resolve();
      }, 800);
    });
  }

  function FieldError({ name }: { name: keyof DemoFormValues }) {
    const error = errors[name];
    if (!error) return null;
    return (
      <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error.message as string}
      </p>
    );
  }

  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <SectionWrapper withGlow>
        <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm font-medium text-cyan-400">
              Book a Demo
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 font-heading">
              See NEPALIX in{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #06B6D4, #8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                15 minutes
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-10">
              Schedule a personalized walkthrough with our team and see exactly how NEPALIX fits your
              business — not a generic product tour.
            </p>
            <div className="space-y-5 mb-10">
              {perks.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-gray-300">{p.text}</span>
                  </motion.div>
                );
              })}
            </div>
            <GlassCard className="border-[#06B6D4]/20">
              <div className="text-sm text-gray-400 mb-3">Trusted by</div>
              <div className="flex flex-wrap gap-2">
                {["Himalayan Roasters", "KTM Apparel", "TechHub Nepal", "Everest Electronics", "Nepal Grocers"].map(
                  (b) => (
                    <span
                      key={b}
                      className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-300 border border-white/10"
                    >
                      {b}
                    </span>
                  )
                )}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            {submitted ? (
              <GlassCard className="text-center py-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white font-heading mb-3">Demo Booked!</h2>
                <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                  We've sent a confirmation to your email. Our team looks forward to meeting you!
                </p>
                <GradientButton href="/">Back to Home</GradientButton>
              </GlassCard>
            ) : (
              <GlassCard>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">First Name *</label>
                      <input
                        {...register("firstName")}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${
                          errors.firstName ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#06B6D4]/60"
                        }`}
                        placeholder="Aarav"
                      />
                      <FieldError name="firstName" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Last Name *</label>
                      <input
                        {...register("lastName")}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${
                          errors.lastName ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#06B6D4]/60"
                        }`}
                        placeholder="Sharma"
                      />
                      <FieldError name="lastName" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Work Email *</label>
                    <input
                      {...register("email")}
                      type="email"
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${
                        errors.email ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#06B6D4]/60"
                      }`}
                      placeholder="aarav@yourshop.com"
                    />
                    <FieldError name="email" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Phone (WhatsApp preferred) *</label>
                    <input
                      {...register("phone")}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${
                        errors.phone ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#06B6D4]/60"
                      }`}
                      placeholder="+977 98XXXXXXXX"
                    />
                    <FieldError name="phone" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Business Type *</label>
                    <select
                      {...register("businessType")}
                      className={`w-full px-4 py-3 rounded-xl bg-[#0F172A] border text-gray-300 text-sm focus:outline-none transition-colors ${
                        errors.businessType ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#06B6D4]/60"
                      }`}
                    >
                      <option value="">Select your business type</option>
                      {businessTypes.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <FieldError name="businessType" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Preferred Time *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setValue("timeSlot", slot, { shouldValidate: true })}
                          className={`py-2 rounded-lg text-xs font-medium transition-all border ${
                            selectedSlot === slot
                              ? "bg-[#06B6D4]/20 border-[#06B6D4]/60 text-cyan-400"
                              : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    {errors.timeSlot && (
                      <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.timeSlot.message}
                      </p>
                    )}
                    <input type="hidden" {...register("timeSlot")} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Tell us about your business (optional)</label>
                    <textarea
                      {...register("message")}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#06B6D4]/60 transition-colors resize-none"
                      placeholder="What's your biggest challenge right now?"
                    />
                  </div>
                  <GradientButton className="w-full justify-center" size="lg">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Booking...
                      </span>
                    ) : (
                      "Book My Demo"
                    )}
                  </GradientButton>
                  <p className="text-center text-xs text-gray-500">
                    No spam. No sales pressure. Just a genuine walkthrough.
                  </p>
                </form>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
}
