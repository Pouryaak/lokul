/**
 * TechnicalTrustSection Component - Dark section with proof points
 *
 * Shows technical proof of privacy: open source, zero network, architecture.
 */

import { GitBranch, WifiOff, Cpu, Check } from "lucide-react";

/**
 * Proof point data structure
 */
interface ProofPoint {
  icon: React.ReactNode;
  title: string;
  points: string[];
  buttonText: string;
  buttonAction: () => void;
}

/**
 * Proof points data
 */
const proofPoints: ProofPoint[] = [
  {
    icon: <GitBranch className="h-8 w-8 text-[#FF6B35]" />,
    title: "All Code is Public",
    points: [
      "Every line of code is on GitHub.",
      "Audit it yourself. Fork it. Modify it.",
      "No hidden tracking. No secret servers.",
      "What you see is what you get.",
    ],
    buttonText: "View Source Code →",
    buttonAction: () => window.open("https://github.com/lokul/lokul", "_blank"),
  },
  {
    icon: <WifiOff className="h-8 w-8 text-[#FF6B35]" />,
    title: "Test It Yourself",
    points: [
      "1. Open browser dev tools",
      "2. Go to Network tab",
      "3. Use Lokul",
      "4. Watch: Zero requests sent",
      "Your browser doesn't lie. If data was being sent, you'd see it.",
    ],
    buttonText: "See How to Test →",
    buttonAction: () => {
      const faqSection = document.getElementById("faq");
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: "smooth" });
      }
    },
  },
  {
    icon: <Cpu className="h-8 w-8 text-[#FF6B35]" />,
    title: "Can't Send Data (By Design)",
    points: [
      "There's no server to send data to.",
      "Everything runs client-side.",
      "WebGPU processes AI in your browser.",
      "IndexedDB stores conversations locally.",
      "It's not about trust. It's about math.",
    ],
    buttonText: "Read Technical Docs →",
    buttonAction: () => window.open("https://docs.lokul.app", "_blank"),
  },
];

/**
 * Technical Trust section with dark theme and proof points
 */
export function TechnicalTrustSection() {
  return (
    <section className="bg-[#1A1A1A] py-20 md:py-32">
      <div className="mx-auto max-w-[860px] px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            "How Do I Know It's Really Private?"
          </h2>
          <p className="text-xl text-gray-400">Fair question. Here's the proof:</p>
        </div>

        {/* Proof Points Grid */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {proofPoints.map((proof, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-700 bg-[#262626] p-8 transition-colors hover:border-[#FF6B35]/50"
            >
              {/* Icon */}
              <div className="mb-4">{proof.icon}</div>

              {/* Title */}
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                <Check className="h-5 w-5 text-green-500" />
                {proof.title}
              </h3>

              {/* Points */}
              <ul className="mb-6 space-y-2">
                {proof.points.map((point, pIndex) => (
                  <li key={pIndex} className="text-sm text-gray-400">
                    {point}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                onClick={proof.buttonAction}
                className="cursor-pointer rounded-lg border border-[#FF6B35] px-4 py-2 text-sm text-white transition-colors hover:bg-[#FF6B35]/10"
              >
                {proof.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-12 text-center">
          <p className="mb-6 text-gray-400">
            Still skeptical? Good. That's the right attitude for privacy.
          </p>
          <button
            onClick={() => window.open("https://discord.gg/lokul", "_blank")}
            className="cursor-pointer rounded-lg border border-[#FF6B35] px-6 py-3 text-[#FF6B35] transition-colors hover:bg-[#FF6B35]/10"
          >
            Join Our Discord - Ask us anything
          </button>
        </div>
      </div>
    </section>
  );
}
