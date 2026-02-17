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
    icon: <Globe className="w-8 h-8 text-[#FF6B35]" />,
    title: "Visit Lokul",
    points: ["No download needed", "No account required", "Just open browser"],
    footer: "Takes 5 seconds",
  },
  {
    number: "2",
    icon: <Download className="w-8 h-8 text-[#FF6B35]" />,
    title: "Choose Your AI",
    points: [
      "Quick: 80MB, Fast",
      "Smart: 2.8GB, Better",
      "Genius: 6.4GB, Best",
    ],
    footer: "Download once, use forever",
  },
  {
    number: "3",
    icon: (
      <div className="relative">
        <MessageCircle className="w-8 h-8 text-[#FF6B35]" />
        <Sparkles className="w-4 h-4 text-[#FFB84D] absolute -top-1 -right-1" />
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
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Three Steps to Private AI
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <Card
              key={index}
              accent
              hover
              className="text-center p-8 flex flex-col"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">{step.icon}</div>

              {/* Number and Title */}
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                {step.number} {step.title}
              </h3>

              {/* Points */}
              <ul className="space-y-2 mb-6 flex-1">
                {step.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="text-gray-600">
                    {point}
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-[#FF6B35]">
                  {step.footer}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Text */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-8">
            The whole setup takes about 30 seconds. Then it&apos;s yours.
            Forever.
          </p>
          <Button variant="primary" size="lg" onClick={scrollToCTA}>
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
}
