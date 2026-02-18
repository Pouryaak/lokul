/**
 * ComparisonSection Component - Premium Lokul vs ChatGPT comparison table
 *
 * Features a stunning table design with animated reveals,
 * gradient accents, and premium visual hierarchy.
 */

import { useEffect, useRef, useState } from "react";
import { X, Check, AlertCircle, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Comparison row data structure
 */
interface ComparisonRow {
  feature: string;
  chatGPT: {
    icon: "x" | "check" | "warning";
    label: string;
    subtext: string;
  };
  lokul: {
    icon: "x" | "check" | "warning";
    label: string;
    subtext: string;
  };
}

/**
 * Comparison data
 */
const comparisons: ComparisonRow[] = [
  {
    feature: "Privacy",
    chatGPT: {
      icon: "x",
      label: "Cloud",
      subtext: "Your data sent to OpenAI",
    },
    lokul: {
      icon: "check",
      label: "100% Local",
      subtext: "Stays in your browser",
    },
  },
  {
    feature: "Offline",
    chatGPT: {
      icon: "x",
      label: "No",
      subtext: "Needs internet",
    },
    lokul: {
      icon: "check",
      label: "Yes",
      subtext: "Works on airplanes",
    },
  },
  {
    feature: "Cost",
    chatGPT: {
      icon: "x",
      label: "$20/month",
      subtext: "$240/year",
    },
    lokul: {
      icon: "check",
      label: "Free",
      subtext: "$0. Forever.",
    },
  },
  {
    feature: "Speed",
    chatGPT: {
      icon: "warning",
      label: "Network",
      subtext: "Depends on connection",
    },
    lokul: {
      icon: "check",
      label: "Instant",
      subtext: "Runs on your device",
    },
  },
  {
    feature: "Open Source",
    chatGPT: {
      icon: "x",
      label: "No",
      subtext: "Black box",
    },
    lokul: {
      icon: "check",
      label: "Yes",
      subtext: "Audit it yourself",
    },
  },
];

/**
 * Icon component for comparison table
 */
function ComparisonIcon({
  type,
  highlight = false,
}: {
  type: "x" | "check" | "warning";
  highlight?: boolean;
}) {
  if (type === "x") {
    return (
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          highlight ? "bg-red-100" : "bg-gray-100"
        }`}
      >
        <X className={`h-4 w-4 ${highlight ? "text-red-500" : "text-gray-400"}`} />
      </div>
    );
  }

  if (type === "check") {
    return (
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          highlight ? "bg-[#FF6B35]/10" : "bg-gray-100"
        }`}
      >
        <Check
          className={`h-4 w-4 ${highlight ? "text-[#FF6B35]" : "text-gray-400"}`}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full ${
        highlight ? "bg-yellow-100" : "bg-gray-100"
      }`}
    >
      <AlertCircle
        className={`h-4 w-4 ${highlight ? "text-yellow-600" : "text-gray-400"}`}
      />
    </div>
  );
}

/**
 * Premium comparison section with animated table
 */
export function ComparisonSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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
      ref={sectionRef}
      className="relative overflow-hidden bg-[#1A1A1A] py-16 md:py-24"
    >
      {/* Warm gradient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#FF6B35]/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-[#FFB84D]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1000px] px-4">
        {/* Header */}
        <div
          className={`mb-12 text-center transition-all duration-700 md:mb-16 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-[#FF6B35]" />
            <span className="text-sm font-medium text-[#FF6B35]">
              Comparison
            </span>
          </div>

          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Lokul{" "}
            <span className="text-gray-500">vs</span>{" "}
            <span className="relative">
              <span className="relative z-10">ChatGPT</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#FF6B35]/30" />
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-400">
            We won't bad-mouth ChatGPT. It's great.
            But if you value privacy, here's what's different:
          </p>
        </div>

        {/* Comparison Table */}
        <div
          className={`mb-12 overflow-hidden rounded-3xl border border-gray-800 bg-[#1A1A1A] shadow-[0_8px_40px_rgba(0,0,0,0.3)] transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="flex items-center justify-center p-6 text-center">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Feature
              </span>
            </div>
            <div className="flex items-center justify-center border-l border-gray-800 bg-gray-900/30 p-6 text-center">
              <span className="font-semibold text-gray-400">ChatGPT Plus</span>
            </div>
            <div className="relative flex items-center justify-center border-l border-gray-800 bg-[#FF6B35]/10 p-6 text-center">
              {/* Trophy badge */}
              <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#FF6B35] px-3 py-1 text-xs font-bold text-white shadow-lg">
                <Trophy className="h-3 w-3" />
                Winner
              </div>
              <span className="font-bold text-[#FF6B35]">Lokul</span>
            </div>
          </div>

          {/* Table Rows */}
          {comparisons.map((row, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 border-b border-gray-800 transition-all duration-300 last:border-b-0 ${
                hoveredRow === index ? "bg-gray-900/30" : ""
              }`}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {/* Feature name */}
              <div className="flex items-center justify-center p-6 text-center">
                <span className="font-semibold text-white">{row.feature}</span>
              </div>

              {/* ChatGPT column */}
              <div className="border-l border-gray-800 bg-gray-900/20 p-6">
                <div className="flex flex-col items-center gap-3">
                  <ComparisonIcon type={row.chatGPT.icon} />
                  <div className="text-center">
                    <p className="font-semibold text-gray-400">
                      {row.chatGPT.label}
                    </p>
                    <p className="text-sm text-gray-500">{row.chatGPT.subtext}</p>
                  </div>
                </div>
              </div>

              {/* Lokul column */}
              <div className="relative border-l border-gray-800 bg-[#FF6B35]/5 p-6">
                {/* Highlight bar on hover */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-[#FF6B35] transition-opacity duration-300 ${
                    hoveredRow === index ? "opacity-100" : "opacity-0"
                  }`}
                />
                <div className="flex flex-col items-center gap-3">
                  <ComparisonIcon type={row.lokul.icon} highlight />
                  <div className="text-center">
                    <p className="font-bold text-[#FF6B35]">
                      {row.lokul.label}
                    </p>
                    <p className="text-sm text-gray-400">{row.lokul.subtext}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <p className="mb-6 text-gray-500">
            Both are powerful. Choose what aligns with your values.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="cta" size="xl" onClick={scrollToCTA}>
              Try Lokul Free
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
