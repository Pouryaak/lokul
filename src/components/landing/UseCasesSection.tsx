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
    icon: <Shield className="h-12 w-12 text-[#FF6B35]" />,
    headline: '"I don\'t trust cloud AI with my thoughts"',
    body: [
      "Writers, therapists, lawyers, and anyone working with sensitive information.",
      "Your journal entries, client notes, and private thoughts stay private.",
      "Because they never leave your device.",
    ],
    quote: '"I use Lokul for therapy journaling. Finally, an AI I can actually trust."',
    attribution: "- Sarah K., Clinical Psychologist",
  },
  {
    icon: <Plane className="h-12 w-12 text-[#FF6B35]" />,
    headline: '"I need AI that works anywhere"',
    body: [
      "Travelers, remote workers, and people with unreliable internet.",
      "Write blog posts on flights. Code at the beach. Plan trips in remote cafes.",
      "Download once at home. Use everywhere.",
    ],
    quote: '"Wrote my entire newsletter on a 14-hour flight. Zero WiFi needed."',
    attribution: "- Marcus T., Digital Nomad",
  },
  {
    icon: <Wallet className="h-12 w-12 text-[#FF6B35]" />,
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
    <section className="bg-white py-20 md:py-32">
      <div className="mx-auto max-w-[860px] px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-[#1A1A1A] md:text-5xl">Who Uses Lokul?</h2>
        </div>

        {/* Use Cases Grid */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {useCases.map((useCase, index) => (
            <Card key={index} hover className="flex h-full flex-col border border-gray-100 p-8">
              {/* Icon */}
              <div className="mb-6">{useCase.icon}</div>

              {/* Headline */}
              <h3 className="mb-4 text-xl leading-tight font-bold text-[#1A1A1A]">
                {useCase.headline}
              </h3>

              {/* Body */}
              <div className="mb-6 flex-1 space-y-2">
                {useCase.body.map((paragraph, pIndex) => (
                  <p key={pIndex} className="leading-relaxed text-gray-600">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Quote */}
              <div className="border-t border-gray-100 pt-4">
                <p className="mb-2 text-gray-500 italic">{useCase.quote}</p>
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
