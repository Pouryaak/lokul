/**
 * ComparisonSection Component - Lokul vs ChatGPT comparison table
 *
 * Shows a feature comparison between Lokul and ChatGPT Plus.
 */

import { X, Check, AlertCircle } from "lucide-react";
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
      subtext: "Your data sent to OpenAI's servers",
    },
    lokul: {
      icon: "check",
      label: "100% Local",
      subtext: "Stays in your browser. Period.",
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
      subtext: "Runs on your device (faster)",
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
  const baseClasses = "w-5 h-5";

  if (type === "x") {
    return (
      <X
        className={`${baseClasses} ${highlight ? "text-red-500" : "text-gray-400"}`}
      />
    );
  }

  if (type === "check") {
    return (
      <Check
        className={`${baseClasses} ${highlight ? "text-green-500" : "text-gray-400"}`}
      />
    );
  }

  return (
    <AlertCircle
      className={`${baseClasses} ${highlight ? "text-yellow-500" : "text-gray-400"}`}
    />
  );
}

/**
 * Comparison section with Lokul vs ChatGPT table
 */
export function ComparisonSection() {
  const scrollToCTA = () => {
    const ctaSection = document.getElementById("final-cta");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 md:py-32 bg-[#FFF8F0]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Lokul vs. ChatGPT
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            We won't bad-mouth ChatGPT. It's great.
            <br />
            But if you value privacy, here's what's different:
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
            <div className="p-4 font-semibold text-gray-700">Feature</div>
            <div className="p-4 font-semibold text-gray-700 text-center">
              ChatGPT Plus
            </div>
            <div className="p-4 font-semibold text-[#FF6B35] text-center bg-orange-50">
              Lokul
            </div>
          </div>

          {/* Table Rows */}
          {comparisons.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="p-4 font-medium text-gray-700 flex items-center">
                {row.feature}
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <ComparisonIcon type={row.chatGPT.icon} />
                  <span className="font-medium text-gray-700">
                    {row.chatGPT.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{row.chatGPT.subtext}</p>
              </div>
              <div className="p-4 text-center bg-orange-50/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <ComparisonIcon type={row.lokul.icon} highlight />
                  <span className="font-medium text-[#FF6B35]">
                    {row.lokul.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{row.lokul.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-600 mb-8">
          Both are good. Choose what matters to you.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={scrollToCTA}>
            Try Lokul Free
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              window.open("https://openai.com/chatgpt", "_blank")
            }
          >
            Learn More About ChatGPT →
          </Button>
        </div>
      </div>
    </section>
  );
}
