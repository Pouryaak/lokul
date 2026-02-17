/**
 * FinalCTASection Component - Orange gradient final CTA
 *
 * Large call-to-action section with orange gradient background.
 */

import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Props for FinalCTASection
 */
export interface FinalCTASectionProps {
  /** Callback when user clicks Start Chatting */
  onStart: () => void;
}

/**
 * Final CTA section with orange gradient
 */
export function FinalCTASection({ onStart }: FinalCTASectionProps) {
  const scrollToTestimonials = () => {
    const testimonialsSection = document.getElementById("testimonials");
    if (testimonialsSection) {
      testimonialsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="final-cta"
      className="bg-gradient-to-br from-[#FF6B35] to-[#FFB84D] py-20 md:py-32"
    >
      <div className="mx-auto max-w-[860px] px-4 text-center">
        {/* Header */}
        <h2 className="mb-6 text-5xl font-bold text-white md:text-6xl">Ready to Own Your AI?</h2>

        {/* Subheader */}
        <p className="mb-10 text-xl text-white/80 md:text-2xl">
          No email. No credit card. No commitment.
          <br />
          Just better AI. In 30 seconds.
        </p>

        {/* CTA Button */}
        <div className="mb-8">
          <Button
            variant="white"
            size="2xl"
            onClick={onStart}
            className="shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          >
            Start Chatting - Free
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-6 text-white/90">
          <span className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Takes 30 seconds
          </span>
          <span className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Works in your browser
          </span>
          <span className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Free forever
          </span>
        </div>

        {/* Social Proof */}
        <p className="mb-4 text-white/70">12,847 developers are already using Lokul.</p>

        {/* Link to testimonials */}
        <button
          onClick={scrollToTestimonials}
          className="cursor-pointer text-white/80 underline underline-offset-4 transition-colors hover:text-white"
        >
          See what they're saying →
        </button>
      </div>
    </section>
  );
}
