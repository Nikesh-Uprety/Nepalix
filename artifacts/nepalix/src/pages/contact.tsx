import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { SectionWrapper } from "@/components/ui-custom/SectionWrapper";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { GradientButton } from "@/components/ui-custom/GradientButton";
import { api } from "@/lib/api";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(4, "Subject must be at least 4 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const contactInfo = [
  { icon: MapPin, label: "Address", value: "Hattisar, Kathmandu 44600, Nepal" },
  { icon: Phone, label: "Phone", value: "+977 01-4234567" },
  { icon: Mail, label: "Email", value: "hello@nepalix.com" },
  { icon: MessageSquare, label: "WhatsApp", value: "+977 9801234567" },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactFormValues) {
    setServerError("");
    try {
      await api.contact.send(data);
      setSubmitted(true);
    } catch (e: unknown) {
      setServerError(
        e instanceof Error ? e.message : "Something went wrong. Please try again."
      );
    }
  }

  function FieldError({ name }: { name: keyof ContactFormValues }) {
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
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
              Let's{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #06B6D4, #EC4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                talk
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              Have a question about NEPALIX? Our team is based in Kathmandu and responds within 2 business hours.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {contactInfo.map((c, i) => {
                const Icon = c.icon;
                return (
                  <GlassCard key={i} className="flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">{c.label}</div>
                      <div className="text-white text-sm font-medium">{c.value}</div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0F172A]/60 overflow-hidden h-60 relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <MapPin className="w-10 h-10 text-cyan-400 mb-3" />
                <p className="text-white font-medium">Hattisar, Kathmandu</p>
                <p className="text-gray-500 text-sm mt-1">Near Naxal Intersection</p>
                <p className="text-gray-600 text-xs mt-3">Office hours: Sun–Fri, 9AM–6PM NPT</p>
              </div>
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
            </div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            {submitted ? (
              <GlassCard className="h-full flex flex-col items-center justify-center text-center py-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-20 h-20 text-green-400 mb-6" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white font-heading mb-3">Message Sent!</h2>
                <p className="text-gray-400 max-w-xs">
                  We'll get back to you within 2 business hours. Namaste!
                </p>
              </GlassCard>
            ) : (
              <GlassCard>
                <h2 className="text-2xl font-bold text-white font-heading mb-6">Send a Message</h2>
                {serverError && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {serverError}
                  </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Name *</label>
                      <input
                        {...register("name")}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${
                          errors.name ? "border-red-500/50" : "border-white/10 focus:border-[#06B6D4]/60"
                        }`}
                        placeholder="Your name"
                      />
                      <FieldError name="name" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Email *</label>
                      <input
                        {...register("email")}
                        type="email"
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${
                          errors.email ? "border-red-500/50" : "border-white/10 focus:border-[#06B6D4]/60"
                        }`}
                        placeholder="you@example.com"
                      />
                      <FieldError name="email" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Subject *</label>
                    <input
                      {...register("subject")}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${
                        errors.subject ? "border-red-500/50" : "border-white/10 focus:border-[#06B6D4]/60"
                      }`}
                      placeholder="How can we help?"
                    />
                    <FieldError name="subject" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Message *</label>
                    <textarea
                      {...register("message")}
                      rows={5}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors resize-none ${
                        errors.message ? "border-red-500/50" : "border-white/10 focus:border-[#06B6D4]/60"
                      }`}
                      placeholder="Tell us more about your business and what you need..."
                    />
                    <FieldError name="message" />
                  </div>
                  <GradientButton className="w-full justify-center" size="lg">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </GradientButton>
                </form>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
}
