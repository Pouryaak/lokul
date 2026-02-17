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
    return <X className={`${baseClasses} ${highlight ? "text-red-500" : "text-gray-400"}`} />;
  }

  if (type === "check") {
    return <Check className={`${baseClasses} ${highlight ? "text-green-500" : "text-gray-400"}`} />;
  }

  return (
    <AlertCircle className={`${baseClasses} ${highlight ? "text-yellow-500" : "text-gray-400"}`} />
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
    <section className="bg-[#FFF8F0] py-20 md:py-32">
      <div className="mx-auto max-w-[860px] px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-[#1A1A1A] md:text-5xl">Lokul vs. ChatGPT</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            We won't bad-mouth ChatGPT. It's great.
            <br />
            But if you value privacy, here's what's different:
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mb-12 overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Table Header */}
          <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50">
            <div className="p-4 font-semibold text-gray-700">Feature</div>
            <div className="p-4 text-center font-semibold text-gray-700">ChatGPT Plus</div>
            <div className="bg-orange-50 p-4 text-center font-semibold text-[#FF6B35]">Lokul</div>
          </div>

          {/* Table Rows */}
          {comparisons.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-3 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50"
            >
              <div className="flex items-center p-4 font-medium text-gray-700">{row.feature}</div>
              <div className="p-4 text-center">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <ComparisonIcon type={row.chatGPT.icon} />
                  <span className="font-medium text-gray-700">{row.chatGPT.label}</span>
                </div>
                <p className="text-sm text-gray-500">{row.chatGPT.subtext}</p>
              </div>
              <div className="bg-orange-50/50 p-4 text-center">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <ComparisonIcon type={row.lokul.icon} highlight />
                  <span className="font-medium text-[#FF6B35]">{row.lokul.label}</span>
                </div>
                <p className="text-sm text-gray-600">{row.lokul.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Text */}
        <p className="mb-8 text-center text-gray-600">Both are good. Choose what matters to you.</p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={scrollToCTA}>
            Try Lokul Free
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.open("https://openai.com/chatgpt", "_blank")}
          >
            Learn More About ChatGPT →
          </Button>
        </div>
      </div>
    </section>
  );
}
