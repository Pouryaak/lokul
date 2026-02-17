/**
 * HowItWorksSection Component - Three step cards
 *
 * Shows the simple 3-step process to get started with Lokul.
 */

import { Globe, Download, MessageCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Step data structure
 */
interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  points: string[];
  footer: string;
}

/**
 * Steps data
 */
const steps: Step[] = [
  {
    number: "1",
    icon: <Globe className="h-8 w-8 text-[#FF6B35]" />,
    title: "Visit Lokul",
    points: ["No download needed", "No account required", "Just open browser"],
    footer: "Takes 5 seconds",
  },
  {
    number: "2",
    icon: <Download className="h-8 w-8 text-[#FF6B35]" />,
    title: "Choose Your AI",
    points: ["Quick: 80MB, Fast", "Smart: 2.8GB, Better", "Genius: 6.4GB, Best"],
    footer: "Download once, use forever",
  },
  {
    number: "3",
    icon: (
      <div className="relative">
        <MessageCircle className="h-8 w-8 text-[#FF6B35]" />
        <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-[#FFB84D]" />
      </div>
    ),
    title: "Start Chatting",
    points: ["Instant responses", "Complete privacy", "Works offline"],
    footer: "That's it. Really.",
  },
];

/**
 * How It Works section with 3 step cards
 */
export function HowItWorksSection() {
  const scrollToCTA = () => {
    const ctaSection = document.getElementById("final-cta");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="bg-white py-20 md:py-32">
      <div className="mx-auto max-w-[860px] px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-[#1A1A1A] md:text-5xl">
            Three Steps to Private AI
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} accent hover className="flex flex-col p-8 text-center">
              {/* Icon */}
              <div className="mb-6 flex justify-center">{step.icon}</div>

              {/* Number and Title */}
              <h3 className="mb-4 text-2xl font-bold text-[#1A1A1A]">
                {step.number} {step.title}
              </h3>

              {/* Points */}
              <ul className="mb-6 flex-1 space-y-2">
                {step.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="text-gray-600">
                    {point}
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-[#FF6B35]">{step.footer}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Text */}
        <div className="text-center">
          <p className="mb-8 text-lg text-gray-600">
            The whole setup takes about 30 seconds. Then it&apos;s yours. Forever.
          </p>
          <Button variant="primary" size="lg" onClick={scrollToCTA}>
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
}
