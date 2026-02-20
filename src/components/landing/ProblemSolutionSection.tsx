/**
 * ProblemSolutionSection Component - Premium pain points vs solutions
 *
 * Features a unified design with floating cards, animated reveals,
 * and a visual "transformation" narrative that feels premium.
 */

import { ArrowRight, Check, Lock, Shield, Sparkles, Wallet, WifiOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Comparison item data structure
 */
interface ComparisonItem {
  id: string;
  painHeadline: string;
  painSubtext: string;
  solutionHeadline: string;
  solutionSubtext: string;
  icon: typeof Wallet;
}

/**
 * Comparison data - problem paired with solution
 */
const comparisons: ComparisonItem[] = [
  {
    id: "price",
    painHeadline: "$20/month for ChatGPT",
    painSubtext: "$240/year just for conversations",
    solutionHeadline: "$0. Forever.",
    solutionSubtext: "Open source models, no fees",
    icon: Wallet,
  },
  {
    id: "privacy",
    painHeadline: "Your data trains their AI",
    painSubtext: "Every prompt you write belongs to them",
    solutionHeadline: "Your data never leaves",
    solutionSubtext: "100% local. 100% yours.",
    icon: Shield,
  },
  {
    id: "offline",
    painHeadline: "Stops working offline",
    painSubtext: "No WiFi? No AI. Simple as that.",
    solutionHeadline: "Works on airplanes",
    solutionSubtext: "Download once, use anywhere",
    icon: WifiOff,
  },
  {
    id: "trust",
    painHeadline: 'Privacy is a "promise"',
    painSubtext: "Trust them with your private thoughts?",
    solutionHeadline: "Privacy by architecture",
    solutionSubtext: "Open source. Audit the code.",
    icon: Lock,
  },
];

/**
 * Single comparison card component
 */
function ComparisonCard({
  item,
  index,
  isVisible,
}: {
  item: ComparisonItem;
  index: number;
  isVisible: boolean;
}) {
  const Icon = item.icon;

  return (
    <div
      className={`group relative transition-all duration-700 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Card container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(255,107,53,0.16)]">
        {/* Top accent line */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#FF6B35] via-[#FF8C42] to-[#FFB84D]" />

        <div className="p-6 md:p-8">
          {/* Icon header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB84D]/10">
              <Icon className="h-6 w-6 text-[#FF6B35]" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B35]/10">
              <ArrowRight className="h-4 w-4 text-[#FF6B35] transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Pain point - subtle, strikethrough style */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <X className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-400/80 line-through">The Old Way</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-500 line-through decoration-red-300/50">
              {item.painHeadline}
            </h3>
            <p className="mt-1 text-sm text-gray-600 line-through">{item.painSubtext}</p>
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Solution - highlighted */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Check className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-sm font-medium text-[#FF6B35]">With Lokul</span>
            </div>
            <h3 className="text-xl font-bold text-white transition-colors group-hover:text-[#FF6B35]">
              {item.solutionHeadline}
            </h3>
            <p className="mt-1 text-base text-gray-300">{item.solutionSubtext}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Problem/Solution section with premium card layout
 */
export function ProblemSolutionSection() {
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

  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="problem-solution"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#070707] py-24 pb-0 md:py-32"
    >
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orb top right */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#FF6B35]/5 blur-3xl" />
        {/* Gradient orb bottom left */}
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#FFB84D]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          className={`mb-16 text-center transition-all duration-700 ease-out md:mb-20 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 bg-[#111111] px-4 py-2 shadow-sm">
            <Sparkles className="h-4 w-4 text-[#FF6B35]" />
            <span className="text-sm font-medium text-[#FF6B35]">Tired of This?</span>
          </div>

          <h2 className="mx-auto mb-4 max-w-2xl text-4xl leading-tight font-bold text-white md:text-5xl">
            Stop Paying for{" "}
            <span className="relative">
              <span className="relative z-10">Privacy</span>
              <span className="absolute right-0 bottom-1 left-0 h-3 bg-[#FF6B35]/20" />
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-300">
            Four reasons why people are ditching cloud AI for something better.
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {comparisons.map((item, index) => (
            <ComparisonCard key={item.id} item={item} index={index} isVisible={isVisible} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`mt-16 text-center transition-all duration-700 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <button
            onClick={scrollToDemo}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF6B35] px-8 py-4 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FF6B35]/90 hover:shadow-lg"
          >
            <span className="font-medium">See It In Action</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
