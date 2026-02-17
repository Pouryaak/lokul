/**
 * ProblemSolutionSection Component - Split screen pain points vs solutions
 *
 * Left side shows pain points with red X icons on dark background.
 * Right side shows solutions with orange checkmarks on warm cream background.
 */

import { XCircle, CheckCircle, ArrowDown } from "lucide-react";

/**
 * Pain point data structure
 */
interface PainPoint {
  headline: string;
  subtext: string;
}

/**
 * Solution data structure
 */
interface Solution {
  headline: string;
  subtext: string;
}

/**
 * Pain points data
 */
const painPoints: PainPoint[] = [
  {
    headline: "$20/month for ChatGPT",
    subtext: "That's $240/year for conversations",
  },
  {
    headline: "Your data trains their AI",
    subtext: "Every prompt you write belongs to them",
  },
  {
    headline: "Stops working offline",
    subtext: "No WiFi? No AI. Simple as that.",
  },
  {
    headline: 'Privacy is a "promise"',
    subtext: "Trust them with your most private thoughts?",
  },
];

/**
 * Solutions data
 */
const solutions: Solution[] = [
  {
    headline: "$0/month. Forever.",
    subtext: "The models are free. The code is free.",
  },
  {
    headline: "Your data stays on YOUR device",
    subtext: "Not encrypted. Just... never sent anywhere.",
  },
  {
    headline: "Works on airplanes",
    subtext: "Download once. Use forever. Even offline.",
  },
  {
    headline: "Privacy by architecture",
    subtext: "Open source. Audit the code yourself.",
  },
];

/**
 * Problem/Solution split screen section
 */
export function ProblemSolutionSection() {
  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="problem-solution" className="w-full border-t border-orange-200">
      <div className="grid min-h-[600px] grid-cols-1 md:grid-cols-2">
        {/* Left Side - Pain Points (Dark) */}
        <div className="flex flex-col items-center justify-center bg-[#1A1A1A] p-8 md:p-12 lg:p-16">
          <div className="w-full max-w-[430px]">
            <h2 className="mb-10 text-4xl font-bold text-white">Tired of This?</h2>

            <div className="space-y-6">
              {painPoints.map((point, index) => (
                <div key={index} className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{point.headline}</h3>
                    <p className="mt-1 text-sm text-gray-400">{point.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Solutions (Light) */}
        <div className="flex flex-col items-center justify-center bg-[#FFF8F0] p-8 md:p-12 lg:p-16">
          <div className="w-full max-w-[430px]">
            <h2 className="mb-10 text-4xl font-bold text-[#1A1A1A]">
              <span className="underline decoration-[#FF6B35] decoration-4 underline-offset-4">
                Try This Instead
              </span>
            </h2>

            <div className="space-y-6">
              {solutions.map((solution, index) => (
                <div key={index} className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-[#FF6B35]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">{solution.headline}</h3>
                    <p className="mt-1 text-sm text-gray-600">{solution.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-orange-100 bg-white py-8">
        <div className="mx-auto max-w-[860px] px-4 text-center">
          <button
            onClick={scrollToDemo}
            className="inline-flex cursor-pointer items-center gap-2 font-medium text-[#FF6B35] transition-colors hover:text-[#FF6B35]/80"
          >
            See It In Action
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
