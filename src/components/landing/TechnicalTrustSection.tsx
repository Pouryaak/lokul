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
    icon: <GitBranch className="w-8 h-8 text-[#FF6B35]" />,
    title: "All Code is Public",
    points: [
      "Every line of code is on GitHub.",
      "Audit it yourself. Fork it. Modify it.",
      "No hidden tracking. No secret servers.",
      "What you see is what you get.",
    ],
    buttonText: "View Source Code →",
    buttonAction: () =>
      window.open("https://github.com/lokul/lokul", "_blank"),
  },
  {
    icon: <WifiOff className="w-8 h-8 text-[#FF6B35]" />,
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
    icon: <Cpu className="w-8 h-8 text-[#FF6B35]" />,
    title: "Can't Send Data (By Design)",
    points: [
      "There's no server to send data to.",
      "Everything runs client-side.",
      "WebGPU processes AI in your browser.",
      "IndexedDB stores conversations locally.",
      "It's not about trust. It's about math.",
    ],
    buttonText: "Read Technical Docs →",
    buttonAction: () =>
      window.open("https://docs.lokul.app", "_blank"),
  },
];

/**
 * Technical Trust section with dark theme and proof points
 */
export function TechnicalTrustSection() {
  return (
    <section className="py-20 md:py-32 bg-[#1A1A1A]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            "How Do I Know It's Really Private?"
          </h2>
          <p className="text-xl text-gray-400">
            Fair question. Here's the proof:
          </p>
        </div>

        {/* Proof Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {proofPoints.map((proof, index) => (
            <div
              key={index}
              className="bg-[#262626] rounded-xl p-8 border border-gray-700 hover:border-[#FF6B35]/50 transition-colors"
            >
              {/* Icon */}
              <div className="mb-4">{proof.icon}</div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                {proof.title}
              </h3>

              {/* Points */}
              <ul className="space-y-2 mb-6">
                {proof.points.map((point, pIndex) => (
                  <li key={pIndex} className="text-gray-400 text-sm">
                    {point}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                onClick={proof.buttonAction}
                className="text-white border border-[#FF6B35] px-4 py-2 rounded-lg hover:bg-[#FF6B35]/10 transition-colors text-sm"
              >
                {proof.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="text-center border-t border-gray-700 pt-12">
          <p className="text-gray-400 mb-6">
            Still skeptical? Good. That's the right attitude for privacy.
          </p>
          <button
            onClick={() =>
              window.open("https://discord.gg/lokul", "_blank")
            }
            className="text-[#FF6B35] border border-[#FF6B35] px-6 py-3 rounded-lg hover:bg-[#FF6B35]/10 transition-colors"
          >
            Join Our Discord - Ask us anything
          </button>
        </div>
      </div>
    </section>
  );
}
