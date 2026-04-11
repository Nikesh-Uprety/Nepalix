import { SectionWrapper } from "../ui-custom/SectionWrapper";
import { FeatureCard } from "../ui-custom/FeatureCard";
import { Globe2, Smartphone, Zap, Shield, Blocks, Headset } from "lucide-react";

const features = [
  {
    icon: <Globe2 />,
    title: "Global Standards, Local Context",
    description: "Built to global SaaS standards but designed specifically for Nepali business workflows and logistics."
  },
  {
    icon: <Smartphone />,
    title: "Mobile-First Design",
    description: "Over 80% of Nepali shoppers buy on mobile. Our storefronts are optimized for perfect mobile experiences."
  },
  {
    icon: <Zap />,
    title: "Lightning Fast",
    description: "Hosted on edge networks for instant load times, ensuring you never lose a sale to a slow connection."
  },
  {
    icon: <Shield />,
    title: "Bank-Grade Security",
    description: "Your data and your customers' payments are protected by enterprise-level encryption and security."
  },
  {
    icon: <Blocks />,
    title: "Powerful Integrations",
    description: "Connect with Daraz, local delivery partners, accounting software, and SMS gateways effortlessly."
  },
  {
    icon: <Headset />,
    title: "24/7 Local Support",
    description: "Real help from our Kathmandu-based team who understands your business context, not just a chatbot."
  }
];

export function FeaturesGridSection() {
  return (
    <SectionWrapper withGlow id="features">
      <div className="mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-2xl">Why Nepal's top brands choose NEPALIX.</h2>
        <p className="text-lg text-gray-400 max-w-2xl">We didn't just build a tool. We built an operating system designed to help you scale.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <FeatureCard 
            key={i}
            icon={f.icon}
            title={f.title}
            description={f.description}
            delay={i * 0.1}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
