/**
 * UseCasesSection Component - Bento grid use cases
 *
 * Features a premium bento grid layout with images from public folder
 * and animated hover effects.
 */

import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Use case data
 */
const useCases = [
  {
    id: "privacy",
    name: "Privacy First",
    description: "Writers, therapists, lawyers. Your sensitive data never leaves your device.",
    image: "/icon-privacy.webp",
    className: "col-span-3 lg:col-span-1",
    quote: '"I use Lokul for therapy journaling. Finally, an AI I can actually trust."',
    attribution: "Sarah K., Clinical Psychologist",
  },
  {
    id: "nomad",
    name: "Digital Nomads",
    description: "Write on flights, code at the beach, plan in remote cafes. No WiFi needed.",
    image: "/icon-airplane.webp",
    className: "col-span-3 lg:col-span-2",
    quote: '"Wrote my entire newsletter on a 14-hour flight. Zero WiFi needed."',
    attribution: "Marcus T., Digital Nomad",
  },
  {
    id: "budget",
    name: "Budget Conscious",
    description:
      "Students, freelancers, anyone tired of $20/month subscriptions. Same quality, zero cost.",
    image: "/icon-save-money.webp",
    className: "col-span-3 lg:col-span-2",
    quote: '"Canceled my ChatGPT subscription. Haven\'t looked back."',
    attribution: "David L., Freelance Developer",
  },
  {
    id: "cta",
    name: "Ready to Start?",
    description: "Join thousands who've made the switch to private AI.",
    image: "",
    className: "col-span-3 lg:col-span-1",
    quote: "",
    attribution: "",
    isCTA: true,
  },
];

/**
 * Custom BentoCard wrapper with image support
 */
function UseCaseCard({
  useCase,
  index,
  isVisible,
  onCTAClick,
}: {
  useCase: (typeof useCases)[0];
  index: number;
  isVisible: boolean;
  onCTAClick: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (useCase.isCTA) {
    return (
      <div
        className={`group relative col-span-3 flex flex-col justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-700 hover:shadow-[0_8px_30px_rgba(255,107,53,0.12)] lg:col-span-1 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        {/* Gradient accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF6B35] to-[#FFB84D]" />

        <div className="relative z-10 text-center">
          <h3 className="mb-2 text-xl font-bold text-white">{useCase.name}</h3>
          <p className="mb-4 text-sm text-gray-400">{useCase.description}</p>
          <Button variant="cta" size="sm" onClick={onCTAClick}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative col-span-3 overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-700 hover:shadow-[0_8px_30px_rgba(255,107,53,0.12)] lg:col-span-${
        useCase.className.includes("col-span-2") ? "2" : "1"
      } ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Gradient top accent */}
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[#FF6B35] to-[#FFB84D]" />

      {/* Image section - natural size */}
      <div className="relative flex items-center justify-center bg-[#151515] p-6">
        <img
          src={useCase.image}
          alt={useCase.name}
          className={`h-auto max-h-48 w-auto max-w-full object-contain transition-all duration-700 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Content */}
      <div className="relative p-6">
        <div className="mb-4">
          <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-[#FF6B35]">
            {useCase.name}
          </h3>
          <p className="text-sm text-gray-300">{useCase.description}</p>
        </div>

        {/* Quote */}
        <div className="border-t border-gray-100 pt-4">
          <p className="mb-2 text-sm text-gray-400 italic">{useCase.quote}</p>
          <p className="text-xs text-gray-500">{useCase.attribution}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Use Cases section with bento grid layout
 */
export function UseCasesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
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
    <section
      id="use-cases"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#070707] py-16 md:py-24"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-[#FF6B35]/5 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-[#FFB84D]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4">
        {/* Header */}
        <div
          className={`mb-12 text-center transition-all duration-700 md:mb-16 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 bg-[#111111] px-4 py-2 shadow-sm">
            <Sparkles className="h-4 w-4 text-[#FF6B35]" />
            <span className="text-sm font-medium text-[#FF6B35]">Use Cases</span>
          </div>

          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Who Uses{" "}
            <span className="relative">
              <span className="relative z-10">Lokul?</span>
              <span className="absolute right-0 bottom-1 left-0 h-3 bg-[#FF6B35]/20" />
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-300">
            Real people, real use cases. See how others are using private AI.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid auto-rows-auto grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <UseCaseCard
              key={useCase.id}
              useCase={useCase}
              index={index}
              isVisible={isVisible}
              onCTAClick={scrollToCTA}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
