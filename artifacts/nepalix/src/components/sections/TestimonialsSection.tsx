import { SectionWrapper } from "../ui-custom/SectionWrapper";
import { TestimonialCard } from "../ui-custom/TestimonialCard";

const testimonials = [
  {
    quote: "NEPALIX entirely transformed how we run our retail chain. The POS is instantly responsive, and online inventory syncs perfectly. Best SaaS product in Nepal, hands down.",
    name: "Aayush Shrestha",
    company: "Kathmandu Apparel",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Aayush&backgroundColor=06B6D4"
  },
  {
    quote: "We struggled with WooCommerce and Daraz separately. Now everything is centralized. Payment integrations were a breeze. Our sales are up 40% since switching.",
    name: "Priya Thapa",
    company: "Himalayan Tech",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Priya&backgroundColor=8B5CF6"
  },
  {
    quote: "Finally, a platform that understands Nepali delivery and payment contexts while delivering a world-class interface. The dashboard is a joy to use every day.",
    name: "Siddhant KC",
    company: "Everest Coffee Roasters",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Siddhant&backgroundColor=3B82F6"
  }
];

export function TestimonialsSection() {
  return (
    <SectionWrapper withGrid>
      <div className="mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Trusted by ambitious founders.</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className={i === 1 ? "md:translate-y-8" : ""}>
            <TestimonialCard {...t} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
