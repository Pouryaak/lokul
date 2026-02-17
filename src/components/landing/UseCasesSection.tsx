/**
 * UseCasesSection Component - Three persona cards
 *
 * Shows use cases for Privacy-Conscious, Digital Nomad, and Budget-Conscious users.
 */

import { Shield, Plane, Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Use case data structure
 */
interface UseCase {
  icon: React.ReactNode;
  headline: string;
  body: string[];
  quote: string;
  attribution: string;
}

/**
 * Use cases data
 */
const useCases: UseCase[] = [
  {
    icon: <Shield className="w-12 h-12 text-[#FF6B35]" />,
    headline: "\"I don't trust cloud AI with my thoughts\"",
    body: [
      "Writers, therapists, lawyers, and anyone working with sensitive information.",
      "Your journal entries, client notes, and private thoughts stay private.",
      "Because they never leave your device.",
    ],
    quote:
      '"I use Lokul for therapy journaling. Finally, an AI I can actually trust."',
    attribution: "- Sarah K., Clinical Psychologist",
  },
  {
    icon: <Plane className="w-12 h-12 text-[#FF6B35]" />,
    headline: '"I need AI that works anywhere"',
    body: [
      "Travelers, remote workers, and people with unreliable internet.",
      "Write blog posts on flights. Code at the beach. Plan trips in remote cafes.",
      "Download once at home. Use everywhere.",
    ],
    quote:
      '"Wrote my entire newsletter on a 14-hour flight. Zero WiFi needed."',
    attribution: "- Marcus T., Digital Nomad",
  },
  {
    icon: <Wallet className="w-12 h-12 text-[#FF6B35]" />,
    headline: '"I\'m tired of $20/month subscriptions"',
    body: [
      "Students, freelancers, and anyone who thinks AI shouldn't require subscriptions.",
      "ChatGPT Plus: $240/year",
      "Claude Pro: $240/year",
      "Lokul: $0/year",
      "Same quality. Zero cost.",
    ],
    quote: '"Canceled my ChatGPT subscription. Haven\'t looked back."',
    attribution: "- David L., Freelance Developer",
  },
];

/**
 * Use Cases section with 3 persona cards
 */
export function UseCasesSection() {
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
            Who Uses Lokul?
          </h2>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {useCases.map((useCase, index) => (
            <Card
              key={index}
              hover
              className="p-8 flex flex-col h-full border border-gray-100"
            >
              {/* Icon */}
              <div className="mb-6">{useCase.icon}</div>

              {/* Headline */}
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4 leading-tight">
                {useCase.headline}
              </h3>

              {/* Body */}
              <div className="space-y-2 mb-6 flex-1">
                {useCase.body.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-gray-600 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Quote */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-gray-500 italic mb-2">{useCase.quote}</p>
                <p className="text-sm text-gray-400">{useCase.attribution}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="primary" size="lg" onClick={scrollToCTA}>
            See If Lokul Is For You
          </Button>
        </div>
      </div>
    </section>
  );
}
