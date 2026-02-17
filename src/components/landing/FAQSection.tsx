/**
 * FAQSection Component - Accordion FAQ with 6 questions
 *
 * Expandable accordion items for common questions.
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
        <p>
          The AI models we use (Phi, Llama, Mistral) are open source and free to
          use.
        </p>
        <p>The code is open source and free to use.</p>
        <p>
          There's no server to pay for (because there is no server).
        </p>
        <p>
          We might add optional premium features later, but the core product will
          ALWAYS be free.
        </p>
        <p className="font-medium text-[#1A1A1A]">
          This isn't a free trial. It's just free.
        </p>
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
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Good for simple questions</li>
              <li>Faster than ChatGPT</li>
              <li>Works anywhere</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[#1A1A1A]">Smart Mode (2.8GB):</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Comparable to ChatGPT 3.5</li>
              <li>Great for most tasks</li>
              <li>Still works offline</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[#1A1A1A]">Genius Mode (6.4GB):</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Approaching ChatGPT 4</li>
              <li>Best for complex reasoning</li>
              <li>Requires powerful device</li>
            </ul>
          </div>
        </div>
        <p className="font-medium text-[#1A1A1A] mt-4">
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
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Chrome 113+ or Edge 113+</li>
          <li>4GB+ of available RAM</li>
          <li>A graphics card (even integrated graphics)</li>
        </ul>
        <p className="font-medium text-[#1A1A1A] mt-4">Then yes, it'll work.</p>
        <p>We've tested on:</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>MacBooks (M1, M2, M3, Intel)</li>
          <li>Windows laptops (HP, Dell, Lenovo)</li>
          <li>Linux desktops</li>
        </ul>
        <p className="mt-4">
          Try Quick Mode first (works on almost anything). Smart Mode needs more
          power.
        </p>
      </div>
    ),
  },
  {
    question: "Can you see my conversations?",
    content: (
      <div className="space-y-3 text-gray-600">
        <p className="font-medium text-[#1A1A1A]">No. And we can prove it.</p>
        <ol className="list-decimal list-inside ml-4 space-y-1">
          <li>Open browser developer tools (F12)</li>
          <li>Go to Network tab</li>
          <li>Use Lokul</li>
          <li>Watch: Zero network requests</li>
        </ol>
        <p className="mt-4">
          Your conversations never leave your browser. We literally CAN'T see
          them.
        </p>
        <p>Plus, we're open source. Audit the code yourself.</p>
        <p className="font-medium text-[#1A1A1A]">
          If you find tracking, we'll give you $10,000. (Spoiler: You won't find
          any.)
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
          Lokul stores everything locally in your browser. Clear browser data =
          conversations gone.
        </p>
        <p>This is by design. Privacy means you're in control.</p>
        <p className="font-medium text-[#1A1A1A] mt-4">
          Want to keep conversations?
        </p>
        <p>Export them before clearing:</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
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
        <p>
          The AI models we use are open source and licensed for commercial use:
        </p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Phi (Microsoft - MIT License)</li>
          <li>Llama (Meta - Llama License)</li>
          <li>Mistral (Mistral AI - Apache 2.0)</li>
        </ul>
        <p className="mt-4">
          This isn't piracy. This is how open source is supposed to work.
        </p>
        <p>
          The big AI companies want you to think AI requires massive servers and
          subscriptions.
        </p>
        <p className="font-medium text-[#1A1A1A]">It doesn't.</p>
        <p>Your laptop is powerful enough.</p>
      </div>
    ),
  },
];

/**
 * FAQ Accordion Item component
 */
interface AccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ item, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors px-4 -mx-4"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-[#1A1A1A] flex items-center gap-3">
          <span className="text-[#FF6B35]">❓</span>
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-[1000px] pb-6" : "max-h-0"
        }`}
      >
        <div className="pl-8 pr-4">{item.content}</div>
      </div>
    </div>
  );
}

/**
 * FAQ section with accordion
 */
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-32 bg-[#FFF8F0]">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Questions?
          </h2>
        </div>

        {/* Accordion */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Bottom CTAs */}
        <div className="text-center">
          <p className="text-gray-600 mb-6">Still have questions?</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => window.open("https://discord.gg/lokul", "_blank")}
              className="px-6 py-3 border-2 border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/10 transition-colors"
            >
              Join Discord
            </button>
            <button
              onClick={() => window.open("mailto:hello@lokul.app", "_blank")}
              className="px-6 py-3 border-2 border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/10 transition-colors"
            >
              Email Us
            </button>
            <button
              onClick={() => window.open("https://docs.lokul.app", "_blank")}
              className="px-6 py-3 border-2 border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/10 transition-colors"
            >
              Read Docs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
