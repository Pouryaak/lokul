/**
 * HeroSection Component - Main landing page hero
 *
 * Features spark logo, headline, gradient CTA, trust indicators,
 * and WebGPU detection with browser compatibility warnings.
 */

import { Button } from "@/components/ui/Button";
import {
  checkWebGPUSupport,
  getRecommendedBrowsers,
  getUnsupportedBrowserMessage,
} from "@/lib/performance/gpu-detection";
import type { GPUInfo, RecommendedBrowser } from "@/types/index";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [gpuInfo, setGpuInfo] = useState<GPUInfo | null>(null);
  const [browsers, setBrowsers] = useState<RecommendedBrowser[]>([]);

  useEffect(() => {
    // Check WebGPU support on mount
    const info = checkWebGPUSupport();
    setGpuInfo(info);
    setBrowsers(getRecommendedBrowsers().filter((b) => !b.likelyInstalled));
  }, []);

  const scrollToNext = () => {
    const nextSection = document.getElementById("problem-solution");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FFF8F0] to-[#FFF0E6] px-4 py-20">
      {/* Animated ember particles (subtle background effect) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-2 w-2 animate-pulse rounded-full bg-[#FF6B35]/20" />
        <div className="absolute top-1/3 right-1/3 h-3 w-3 animate-pulse rounded-full bg-[#FFB84D]/20 delay-300" />
        <div className="absolute bottom-1/3 left-1/3 h-2 w-2 animate-pulse rounded-full bg-[#FF6B35]/20 delay-700" />
      </div>

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

        {/* WebGPU Error State */}
        {gpuInfo && !gpuInfo.supported ? (
          <div className="mx-auto mb-8 max-w-xl rounded-xl border-2 border-red-200 bg-red-50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-red-600">
              Your browser doesn&apos;t support WebGPU
            </h3>
            <p className="mb-4 text-red-500">{getUnsupportedBrowserMessage()}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {browsers.map((browser) => (
                <a
                  key={browser.name}
                  href={browser.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg border border-red-200 bg-white px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
                >
                  Download {browser.name}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Primary CTA */}
            <div className="mb-6">
              <Button variant="primary" size="xl" onClick={onStart} className="text-lg">
                Start Chatting - Free
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
          </>
        )}

        {/* Scroll indicator */}
        <button
          onClick={scrollToNext}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer text-[#FF6B35] transition-colors hover:text-[#FF6B35]/80"
          aria-label="Scroll to learn more"
        >
          <ChevronDown className="h-8 w-8" />
        </button>
      </div>
    </section>
  );
}
