/**
 * FAQSection Component - Premium interactive FAQ with stunning design
 *
 * Features animated accordion, scroll-triggered reveals, and premium CTAs.
 */

import { useEffect, useRef, useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, Mail, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * FAQ item data structure
 */
interface FAQItem {
  question: string;
  content: React.ReactNode;
}

/**
 * FAQ data
 */
const faqItems: FAQItem[] = [
  {
    question: "Is it really free? What's the catch?",
    content: (
      <div className="space-y-3 text-gray-600">
        <p className="font-medium text-[#1A1A1A]">Yes. Actually free. No catch.</p>
        <p>The AI models we use (Phi, Llama, Mistral) are open source and free to use.</p>
        <p>The code is open source and free to use.</p>
        <p>There's no server to pay for (because there is no server).</p>
        <p>
          We might add optional premium features later, but the core product will ALWAYS be free.
        </p>
        <p className="font-medium text-[#1A1A1A]">This isn't a free trial. It's just free.</p>
      </div>
    ),
  },
  {
    question: "How good is it compared to ChatGPT?",
    content: (
      <div className="space-y-3 text-gray-600">
        <p className="font-medium text-[#1A1A1A]">Honest answer: It depends.</p>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-[#1A1A1A]">Quick Mode (80MB):</p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Good for simple questions</li>
              <li>Faster than ChatGPT</li>
              <li>Works anywhere</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[#1A1A1A]">Smart Mode (2.8GB):</p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Comparable to ChatGPT 3.5</li>
              <li>Great for most tasks</li>
              <li>Still works offline</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[#1A1A1A]">Genius Mode (6.4GB):</p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Approaching ChatGPT 4</li>
              <li>Best for complex reasoning</li>
              <li>Requires powerful device</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 font-medium text-[#1A1A1A]">
          The gap is closing fast. Try both. Decide for yourself.
        </p>
      </div>
    ),
  },
  {
    question: "Will this work on my computer?",
    content: (
      <div className="space-y-3 text-gray-600">
        <p className="font-medium text-[#1A1A1A]">If you have:</p>
        <ul className="ml-4 list-inside list-disc space-y-1">
          <li>Chrome 113+ or Edge 113+</li>
          <li>4GB+ of available RAM</li>
          <li>A graphics card (even integrated graphics)</li>
        </ul>
        <p className="mt-4 font-medium text-[#1A1A1A]">Then yes, it'll work.</p>
        <p>We've tested on:</p>
        <ul className="ml-4 list-inside list-disc space-y-1">
          <li>MacBooks (M1, M2, M3, Intel)</li>
          <li>Windows laptops (HP, Dell, Lenovo)</li>
          <li>Linux desktops</li>
        </ul>
        <p className="mt-4">
          Try Quick Mode first (works on almost anything). Smart Mode needs more power.
        </p>
      </div>
    ),
  },
  {
    question: "Can you see my conversations?",
    content: (
      <div className="space-y-3 text-gray-600">
        <p className="font-medium text-[#1A1A1A]">No. And we can prove it.</p>
        <ol className="ml-4 list-inside list-decimal space-y-1">
          <li>Open browser developer tools (F12)</li>
          <li>Go to Network tab</li>
          <li>Use Lokul</li>
          <li>Watch: Zero network requests</li>
        </ol>
        <p className="mt-4">
          Your conversations never leave your browser. We literally CAN'T see them.
        </p>
        <p>Plus, we're open source. Audit the code yourself.</p>
        <p className="font-medium text-[#1A1A1A]">
          If you find tracking, we'll give you $10,000. (Spoiler: You won't find any.)
        </p>
      </div>
    ),
  },
  {
    question: "What happens to my conversations if I clear my browser?",
    content: (
      <div className="space-y-3 text-gray-600">
        <p className="font-medium text-[#1A1A1A]">They're deleted. Forever.</p>
        <p>
          Lokul stores everything locally in your browser. Clear browser data = conversations gone.
        </p>
        <p>This is by design. Privacy means you're in control.</p>
        <p className="mt-4 font-medium text-[#1A1A1A]">Want to keep conversations?</p>
        <p>Export them before clearing:</p>
        <ul className="ml-4 list-inside list-disc space-y-1">
          <li>Markdown (.md)</li>
          <li>Text (.txt)</li>
          <li>JSON (for backup)</li>
        </ul>
        <p>You can also import them back later.</p>
      </div>
    ),
  },
  {
    question: "Is this legal?",
    content: (
      <div className="space-y-3 text-gray-600">
        <p className="font-medium text-[#1A1A1A]">Yes! 100% legal.</p>
        <p>The AI models we use are open source and licensed for commercial use:</p>
        <ul className="ml-4 list-inside list-disc space-y-1">
          <li>Phi (Microsoft - MIT License)</li>
          <li>Llama (Meta - Llama License)</li>
          <li>Mistral (Mistral AI - Apache 2.0)</li>
        </ul>
        <p className="mt-4">This isn't piracy. This is how open source is supposed to work.</p>
        <p>The big AI companies want you to think AI requires massive servers and subscriptions.</p>
        <p className="font-medium text-[#1A1A1A]">It doesn't.</p>
        <p>Your laptop is powerful enough.</p>
      </div>
    ),
  },
];

/**
 * FAQ Accordion Item component with premium animations
 */
interface AccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  isVisible: boolean;
}

function AccordionItem({ item, isOpen, onToggle, index, isVisible }: AccordionItemProps) {
  return (
    <div
      className={`transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div
        className={`group rounded-2xl border-2 transition-all duration-300 ${
          isOpen
            ? "border-[#FF6B35]/30 bg-white shadow-[0_8px_30px_rgba(255,107,53,0.12)]"
            : "border-transparent bg-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:border-[#FF6B35]/20 hover:bg-white hover:shadow-[0_8px_30px_rgba(255,107,53,0.08)]"
        }`}
      >
        <button
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center justify-between p-6 text-left"
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-4">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                isOpen
                  ? "bg-[#FF6B35] text-white shadow-[0_4px_15px_rgba(255,107,53,0.4)]"
                  : "bg-[#FF6B35]/10 text-[#FF6B35] group-hover:bg-[#FF6B35]/20"
              }`}
            >
              <HelpCircle className="h-5 w-5" />
            </div>
            <span
              className={`text-lg font-semibold transition-colors duration-200 ${
                isOpen ? "text-[#1A1A1A]" : "text-gray-700 group-hover:text-[#1A1A1A]"
              }`}
            >
              {item.question}
            </span>
          </span>
          <div
            className={`ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
              isOpen
                ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                : "bg-gray-100 text-gray-400 group-hover:bg-[#FF6B35]/10 group-hover:text-[#FF6B35]"
            }`}
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
        <div
          className={`grid transition-all duration-300 ${
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-gray-100 px-6 pb-6 pt-4">
              <div className="pl-14">{item.content}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Premium FAQ section with animated accordion
 */
export function FAQSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const scrollToCTA = () => {
    const ctaSection = document.getElementById("final-cta");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#FFF8F0] py-16 md:py-24"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-[#FF6B35]/5 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-[#FFB84D]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[900px] px-4">
        {/* Header */}
        <div
          className={`mb-12 text-center transition-all duration-700 md:mb-16 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-white px-4 py-2 shadow-sm">
            <HelpCircle className="h-4 w-4 text-[#FF6B35]" />
            <span className="text-sm font-medium text-[#FF6B35]">FAQ</span>
          </div>

          <h2 className="mb-4 text-4xl font-bold text-[#1A1A1A] md:text-5xl">
            Questions?{" "}
            <span className="relative">
              <span className="relative z-10">Answered.</span>
              <span className="absolute right-0 bottom-1 left-0 h-3 bg-[#FF6B35]/20" />
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-600">
            Everything you need to know about Lokul. Can&apos;t find what you&apos;re looking for?
            Reach out to our community.
          </p>
        </div>

        {/* Accordion */}
        <div className="mb-16 space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Bottom CTAs - Premium Support Cards */}
        <div
          className={`transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="mb-8 text-center">
            <p className="text-lg font-medium text-[#1A1A1A]">Still have questions?</p>
            <p className="text-gray-500">We&apos;re here to help. Choose your preferred way to connect.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Discord Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,107,53,0.15)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF6B35] to-[#FFB84D]" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35] transition-all duration-300 group-hover:bg-[#FF6B35] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(255,107,53,0.4)]">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-[#1A1A1A]">Join Discord</h3>
              <p className="mb-4 text-sm text-gray-500">Get help from the community and team</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open("https://discord.gg/lokul", "_blank")}
              >
                Join Server
              </Button>
            </div>

            {/* Email Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,107,53,0.15)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF6B35] to-[#FFB84D]" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35] transition-all duration-300 group-hover:bg-[#FF6B35] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(255,107,53,0.4)]">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-[#1A1A1A]">Email Us</h3>
              <p className="mb-4 text-sm text-gray-500">Private support for sensitive questions</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open("mailto:hello@lokul.app", "_blank")}
              >
                Send Email
              </Button>
            </div>

            {/* Docs Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,107,53,0.15)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF6B35] to-[#FFB84D]" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35] transition-all duration-300 group-hover:bg-[#FF6B35] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(255,107,53,0.4)]">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-[#1A1A1A]">Read Docs</h3>
              <p className="mb-4 text-sm text-gray-500">Detailed guides and API reference</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open("https://docs.lokul.app", "_blank")}
              >
                View Docs
              </Button>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-12 text-center">
            <Button variant="cta" size="lg" onClick={scrollToCTA}>
              Try Lokul Free — No Signup
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
