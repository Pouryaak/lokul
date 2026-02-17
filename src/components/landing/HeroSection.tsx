/**
 * HeroSection Component - Main landing page hero
 *
 * Features spark logo, headline, gradient CTA, trust indicators,
 * and WebGPU detection with browser compatibility warnings.
 */

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  checkWebGPUSupport,
  getRecommendedBrowsers,
  getUnsupportedBrowserMessage,
} from "@/lib/performance/gpu-detection";
import type { GPUInfo, RecommendedBrowser } from "@/types/index";

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
    <section className="relative min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#FFF0E6] flex flex-col items-center justify-center px-4 py-20">
      {/* Animated ember particles (subtle background effect) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#FF6B35]/20 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-[#FFB84D]/20 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-[#FF6B35]/20 rounded-full animate-pulse delay-700" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Spark Logo with pulsing glow */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#FF6B35]/30 blur-3xl rounded-full animate-pulse" />
            {/* Logo */}
            <img
              src="/spark-logo.svg"
              alt="Lokul"
              className="relative w-24 h-24 md:w-32 md:h-32 drop-shadow-lg"
            />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-7xl font-bold text-[#1A1A1A] mb-4 tracking-tight">
          Lokul
        </h1>

        {/* Subheadline */}
        <p className="text-2xl md:text-3xl font-medium text-gray-600 mb-6">
          Your AI. Your browser. Your privacy.
        </p>

        {/* Description */}
        <p className="text-xl text-[#1A1A1A] leading-relaxed mb-10 max-w-2xl mx-auto">
          ChatGPT-quality AI running 100% in your browser.
          <br />
          No servers. No tracking. Works offline.
        </p>

        {/* WebGPU Error State */}
        {gpuInfo && !gpuInfo.supported ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 max-w-xl mx-auto">
            <h3 className="text-red-600 font-semibold text-lg mb-2">
              Your browser doesn&apos;t support WebGPU
            </h3>
            <p className="text-red-500 mb-4">
              {getUnsupportedBrowserMessage()}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {browsers.map((browser) => (
                <a
                  key={browser.name}
                  href={browser.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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
              <Button
                variant="primary"
                size="xl"
                onClick={onStart}
                className="text-lg"
              >
                Start Chatting - Free
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 mb-8">
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
            <p className="text-sm text-gray-400 mb-12">
              &#9733; 12,847 developers trust Lokul
            </p>
          </>
        )}

        {/* Scroll indicator */}
        <button
          onClick={scrollToNext}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#FF6B35] animate-bounce cursor-pointer hover:text-[#FF6B35]/80 transition-colors"
          aria-label="Scroll to learn more"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </div>
    </section>
  );
}
