/**
 * HeroSection Component - Main landing page hero
 *
 * Features spark logo, headline, gradient CTA, trust indicators.
 */

import { Button } from "@/components/ui/Button";
import { PerspectiveGrid } from "@/components/ui/perspective-grid";
import { ChevronDown, Github, Sparkles } from "lucide-react";

/**
 * Props for HeroSection
 */
export interface HeroSectionProps {
  /** Callback when user clicks Start Chatting */
  onStart: () => void;
}

/**
 * Hero section with spark logo, headline, and CTA
 */
export function HeroSection({ onStart }: HeroSectionProps) {
  const scrollToNext = () => {
    const nextSection = document.getElementById("problem-solution");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-[#FFF8F0] px-4 py-20">
      {/* Perspective grid background */}
      <PerspectiveGrid
        className="absolute inset-0 z-0 bg-[#FFF8F0]"
        backgroundColor="#FFF8F0"
        gridSize={35}
        fadeRadius={75}
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-[860px] text-center">
        {/* Spark Logo with pulsing glow */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 animate-pulse rounded-full bg-[#FF6B35]/30 blur-3xl" />
            {/* Logo */}
            <img
              src="/lokul-logo.png"
              alt="Lokul"
              className="relative h-25 w-25 drop-shadow-lg md:h-50 md:w-50"
            />
          </div>
        </div>

        {/* Headline */}
        <h1 className="mb-4 text-6xl font-bold tracking-tight text-[#1A1A1A] md:text-7xl">Lokul</h1>

        {/* Subheadline */}
        <p className="mb-6 text-2xl font-medium text-gray-600 md:text-3xl">
          Your AI. Your browser. Your privacy.
        </p>

        {/* Description */}
        <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-[#1A1A1A]">
          ChatGPT-quality AI running 100% in your browser.
          <br />
          No servers. No tracking. Works offline.
        </p>

        {/* Primary CTA */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
          <Button variant="cta" size="xl" onClick={onStart} className="text-lg">
            <Sparkles className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
            Start Chatting — Free
          </Button>
          <Button
            variant="secondary"
            size="xl"
            onClick={() => window.open("https://github.com/pouryaak/lokul", "_blank")}
            className="text-lg"
          >
            <Github className="mr-2 h-5 w-5" />
            Star on GitHub
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-[#FF6B35]">&#10003;</span>
            No account needed
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[#FF6B35]">&#10003;</span>
            Free forever
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[#FF6B35]">&#10003;</span>
            Open source
          </span>
        </div>

        {/* Social Proof */}
        <p className="mb-12 text-sm text-gray-400">&#9733; 12,847 developers trust Lokul</p>

        {/* Scroll indicator */}
        <button
          onClick={scrollToNext}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer text-[#FF6B35] transition-colors hover:text-[#FF6B35]/80"
          aria-label="Scroll to learn more"
        >
          <ChevronDown className="h-8 w-8" />
        </button>
      </div>
    </section>
  );
}
