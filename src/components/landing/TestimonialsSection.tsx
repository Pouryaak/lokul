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
        <Star key={i} className="h-5 w-5 fill-[#FF6B35] text-[#FF6B35]" />
      ))}
    </div>
  );
}

/**
 * Testimonials section with 3 quote cards
 */
export function TestimonialsSection() {
  return (
    <section className="bg-white py-20 md:py-32">
      <div className="mx-auto max-w-[860px] px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-[#1A1A1A] md:text-5xl">
            Don't Just Take Our Word For It
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} hover className="flex h-full flex-col border border-gray-100 p-8">
              {/* Stars */}
              <div className="mb-4">
                <StarRating count={testimonial.stars} />
              </div>

              {/* Quote */}
              <blockquote className="mb-6 flex-1 text-lg leading-relaxed text-[#1A1A1A] italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Attribution */}
              <div className="border-t border-gray-100 pt-4">
                <p className="font-medium text-[#1A1A1A]">- {testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.title}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="text-center">
          <p className="mb-2 text-lg text-gray-600">Join 12,847 developers who trust Lokul</p>
          <p className="text-gray-500">
            <span className="text-[#FF6B35]">★★★★★</span> Rated 4.9/5 on GitHub
          </p>
        </div>
      </div>
    </section>
  );
}
