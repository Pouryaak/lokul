/**
 * TestimonialsSection Component - Three testimonial cards
 *
 * Shows quotes from satisfied users with star ratings.
 */

import { Star } from "lucide-react";
import { Card } from "@/components/ui/Card";

/**
 * Testimonial data structure
 */
interface Testimonial {
  stars: number;
  quote: string;
  name: string;
  title: string;
}

/**
 * Testimonials data
 */
const testimonials: Testimonial[] = [
  {
    stars: 5,
    quote:
      "Finally, an AI I can trust with my therapy journal. It's not about hiding from OpenAI. It's about having a truly private space for my thoughts.",
    name: "Sarah K.",
    title: "Clinical Psychologist",
  },
  {
    stars: 5,
    quote:
      "Wrote an entire blog post on a 14-hour flight to Tokyo. Zero WiFi. Zero problems. This is the future.",
    name: "Marcus T.",
    title: "Digital Nomad & Writer",
  },
  {
    stars: 5,
    quote:
      "Canceled my ChatGPT Plus subscription. Saved $240/year. Lokul does everything I need. And it's FASTER.",
    name: "David L.",
    title: "Freelance Developer",
  },
];

/**
 * Star rating component
 */
function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          className="w-5 h-5 fill-[#FF6B35] text-[#FF6B35]"
        />
      ))}
    </div>
  );
}

/**
 * Testimonials section with 3 quote cards
 */
export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Don't Just Take Our Word For It
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              hover
              className="p-8 flex flex-col h-full border border-gray-100"
            >
              {/* Stars */}
              <div className="mb-4">
                <StarRating count={testimonial.stars} />
              </div>

              {/* Quote */}
              <blockquote className="text-lg text-[#1A1A1A] leading-relaxed mb-6 flex-1 italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Attribution */}
              <div className="pt-4 border-t border-gray-100">
                <p className="font-medium text-[#1A1A1A]">
                  - {testimonial.name}
                </p>
                <p className="text-sm text-gray-500">{testimonial.title}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-2">
            Join 12,847 developers who trust Lokul
          </p>
          <p className="text-gray-500">
            <span className="text-[#FF6B35]">★★★★★</span> Rated 4.9/5 on GitHub
          </p>
        </div>
      </div>
    </section>
  );
}
