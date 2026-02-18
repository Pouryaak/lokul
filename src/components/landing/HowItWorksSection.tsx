/**
 * HowItWorksSection Component - Premium vertical step experience
 *
 * Features scroll-triggered reveals, floating images, and elegant
 * transitions that guide users through the 3-step process.
 */

import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Step data structure
 */
interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
  detail: string;
  image: string;
}

/**
 * Steps data
 */
const steps: Step[] = [
  {
    id: "visit",
    number: "01",
    title: "Open Your Browser",
    description: "No downloads. No accounts. Just visit Lokul.",
    detail: "Works instantly in Chrome, Edge, or any WebGPU-enabled browser.",
    image: "/icon-1.webp",
  },
  {
    id: "download",
    number: "02",
    title: "Pick Your AI",
    description: "Choose from three models, download once.",
    detail: "Quick (80MB) for speed, Smart (2.8GB) for balance, or Genius (6.4GB) for power.",
    image: "/icon-2.webp",
  },
  {
    id: "chat",
    number: "03",
    title: "Start Chatting",
    description: "Private AI that works offline, forever.",
    detail: "Your conversations never leave your device. No subscriptions. No limits.",
    image: "/icon-3.webp",
  },
];

/**
 * Single step component with scroll-triggered animation
 */
function StepItem({ step, index }: { step: Step; index: number }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3, rootMargin: "-50px" }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={itemRef}
      className={`relative grid min-h-[350px] items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16 ${
        isEven ? "" : "md:direction-rtl"
      }`}
    >
      {/* Content Side */}
      <div
        className={`relative z-10 ${isEven ? "md:text-left" : "md:order-2 md:text-left"}`}
        style={{ direction: "ltr" }}
      >
        {/* Step Number - Large Background */}
        <div
          className={`absolute -top-8 ${
            isEven ? "-left-4 md:-left-8" : "-left-4 md:-right-8 md:left-auto"
          } text-[120px] leading-none font-bold text-[#FF6B35]/5 transition-all duration-1000 select-none md:text-[180px] ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {step.number}
        </div>

        {/* Content */}
        <div
          className={`relative transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "150ms" }}
        >
          {/* Step Label */}
          <div className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#FF6B35]">
            <span className="h-px w-8 bg-[#FF6B35]" />
            Step {step.number}
          </div>

          {/* Title */}
          <h3 className="mb-4 text-3xl font-bold text-[#1A1A1A] md:text-4xl lg:text-5xl">
            {step.title}
          </h3>

          {/* Description */}
          <p className="mb-4 text-xl text-gray-600 md:text-2xl">{step.description}</p>

          {/* Detail */}
          <p className="text-base text-gray-500 md:text-lg">{step.detail}</p>
        </div>
      </div>

      {/* Image Side */}
      <div className={`relative ${isEven ? "" : "md:order-1"}`} style={{ direction: "ltr" }}>
        {/* Image Container with Float Animation */}
        <div
          className={`relative transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          {/* Clean Image - no decorations */}
          <img src={step.image} alt={step.title} className="h-80 w-80 object-cover" />
        </div>
      </div>

      {/* Connecting Line (except last item) */}
      {index < steps.length - 1 && (
        <div
          className={`absolute bottom-0 left-1/2 hidden h-24 w-px -translate-x-1/2 translate-y-full bg-gradient-to-b from-[#FF6B35]/30 to-transparent md:block ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "600ms" }}
        />
      )}
    </div>
  );
}

/**
 * How It Works section with vertical scroll experience
 */
export function HowItWorksSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToCTA = () => {
    const ctaSection = document.getElementById("final-cta");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-white">
      {/* Subtle diagonal pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #FF6B35,
            #FF6B35 1px,
            transparent 1px,
            transparent 20px
          )`,
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-4 py-16 md:py-24">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`mb-12 text-center transition-all duration-700 md:mb-16 ${
            headerVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-white px-4 py-2 shadow-sm">
            <Sparkles className="h-4 w-4 text-[#FF6B35]" />
            <span className="text-sm font-medium text-[#FF6B35]">How It Works</span>
          </div>

          {/* Title */}
          <h2 className="mx-auto mb-4 max-w-2xl text-4xl leading-tight font-bold text-[#1A1A1A] md:text-5xl lg:text-6xl">
            Three Steps to{" "}
            <span className="relative">
              <span className="relative z-10">Freedom</span>
              <span className="absolute right-0 bottom-1 left-0 h-3 bg-[#FF6B35]/20" />
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mx-auto max-w-xl text-lg text-gray-600">
            From zero to private AI in under a minute. No tech skills required.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-16 md:space-y-20">
          {steps.map((step, index) => (
            <StepItem key={step.id} step={step} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`mt-16 text-center transition-all duration-700 md:mt-20 ${
            headerVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          {/* Speed Indicator */}
          <div className="mb-8 flex items-center justify-center gap-3">
            {/* Animated speed lines */}
            <div className="flex items-center gap-1">
              <span className="h-2 w-1 animate-pulse rounded-full bg-[#FF6B35]/30" style={{ animationDelay: "0ms" }} />
              <span className="h-3 w-1 animate-pulse rounded-full bg-[#FF6B35]/50" style={{ animationDelay: "150ms" }} />
              <span className="h-4 w-1 animate-pulse rounded-full bg-[#FF6B35]" style={{ animationDelay: "300ms" }} />
            </div>

            {/* Lightning bolt */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B35]/10">
              <Zap className="h-5 w-5 fill-[#FF6B35] text-[#FF6B35]" />
            </div>

            {/* Speed text */}
            <div className="text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Setup time
              </p>
              <p className="text-lg font-bold text-[#1A1A1A]">
                Less than a minute
              </p>
            </div>

            {/* Animated speed lines (right) */}
            <div className="flex items-center gap-1">
              <span className="h-4 w-1 animate-pulse rounded-full bg-[#FF6B35]" style={{ animationDelay: "300ms" }} />
              <span className="h-3 w-1 animate-pulse rounded-full bg-[#FF6B35]/50" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-1 animate-pulse rounded-full bg-[#FF6B35]/30" style={{ animationDelay: "0ms" }} />
            </div>
          </div>

          {/* CTA Button */}
          <div>
            <Button variant="cta" size="xl" onClick={scrollToCTA}>
              <span>Get Started Free</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
