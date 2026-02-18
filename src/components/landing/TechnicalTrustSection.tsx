/**
 * TechnicalTrustSection Component - Premium privacy verification experience
 *
 * Features interactive verification steps with animated reveals
 * and immersive scroll effects.
 */

import { useEffect, useRef, useState } from "react";
import { Shield, Lock, Eye, FileCode, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

/**
 * Verification step data
 */
interface VerificationStep {
  id: string;
  icon: typeof Shield;
  title: string;
  status: string;
  details: string[];
}

const verificationSteps: VerificationStep[] = [
  {
    id: "opensource",
    icon: FileCode,
    title: "Open Source Verified",
    status: "Auditable",
    details: [
      "100% of code available on GitHub",
      "MIT License - fork and modify freely",
      "No hidden tracking mechanisms",
      "Community reviewed and vetted",
    ],
  },
  {
    id: "network",
    icon: Eye,
    title: "Zero Network Activity",
    status: "Air-gapped",
    details: [
      "No data transmission during chat",
      "DevTools Network tab shows zero requests",
      "Works offline completely",
      "Your ISP sees nothing",
    ],
  },
  {
    id: "architecture",
    icon: Lock,
    title: "Privacy by Architecture",
    status: "Bulletproof",
    details: [
      "WebGPU processes locally in browser",
      "IndexedDB stores data on device only",
      "No server infrastructure exists",
      "Mathematically impossible to leak",
    ],
  },
];

/**
 * Animated verification row
 */
function VerificationRow({
  step,
  index,
  isVisible,
  isActive,
  onHover,
}: {
  step: VerificationStep;
  index: number;
  isVisible: boolean;
  isActive: boolean;
  onHover: () => void;
}) {
  const Icon = step.icon;

  return (
    <div
      className={`group relative transition-all duration-700 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 200}ms` }}
      onMouseEnter={onHover}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
          isActive
            ? "border-[#FF6B35]/50 bg-[#FF6B35]/5"
            : "border-gray-800 bg-[#1A1A1A] hover:border-gray-700"
        }`}
      >
        {/* Scanning line animation */}
        <div
          className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent transition-opacity duration-500 ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="flex items-center gap-6 p-6 md:p-8">
          {/* Icon */}
          <div
            className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${
              isActive
                ? "bg-[#FF6B35]/20 text-[#FF6B35]"
                : "bg-gray-800 text-gray-500 group-hover:text-[#FF6B35]"
            }`}
          >
            <Icon className="h-8 w-8" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-500 ${
                  isActive
                    ? "bg-[#FF6B35]/20 text-[#FF6B35]"
                    : "bg-gray-800 text-gray-500"
                }`}
              >
                {step.status}
              </span>
            </div>

            {/* Expandable details */}
            <div
              className={`grid transition-all duration-500 ${
                isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {step.details.map((detail, dIndex) => (
                    <div
                      key={dIndex}
                      className="flex items-center gap-2 text-sm text-gray-400"
                    >
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#FF6B35]" />
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Arrow indicator */}
          <ChevronRight
            className={`h-6 w-6 flex-shrink-0 transition-all duration-500 ${
              isActive
                ? "translate-x-1 rotate-90 text-[#FF6B35]"
                : "text-gray-600 group-hover:text-gray-400"
            }`}
          />
        </div>

        {/* Progress bar at bottom */}
        <div className="h-1 bg-gray-800">
          <div
            className={`h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB84D] transition-all duration-700 ${
              isActive ? "w-full" : "w-0"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Technical Trust section with security audit aesthetic
 */
export function TechnicalTrustSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Auto-scan through steps
          setIsScanning(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-scan effect
  useEffect(() => {
    if (!isScanning || !isVisible) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % verificationSteps.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isScanning, isVisible]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#1A1A1A] py-16 md:py-24"
    >
      {/* Warm gradient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-[#FF6B35]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#FFB84D]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1000px] px-4">
        {/* Header */}
        <div
          className={`mb-12 transition-all duration-700 md:mb-16 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-4 py-2">
              <Shield className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-sm font-medium text-[#FF6B35]">
                Verified & Auditable
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              How Do I Know It&apos;s{" "}
              <span className="relative">
                <span className="relative z-10">Really</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#FF6B35]/30" />
              </span>{" "}
              Private?
            </h2>
            <p className="text-lg text-gray-400">
              Three verifiable proofs that your data stays yours.
            </p>
          </div>
        </div>

        {/* Verification Steps */}
        <div className="mb-12 space-y-4">
          {verificationSteps.map((step, index) => (
            <VerificationRow
              key={step.id}
              step={step}
              index={index}
              isVisible={isVisible}
              isActive={activeStep === index}
              onHover={() => {
                setIsScanning(false);
                setActiveStep(index);
              }}
            />
          ))}
        </div>

        {/* Trust badge */}
        <div
          className={`text-center transition-all duration-700 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          <div className="inline-flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6B35]/10">
                <Sparkles className="h-6 w-6 text-[#FF6B35]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">
                  Still skeptical? Good.
                </p>
                <p className="text-xs text-gray-500">
                  That&apos;s the right attitude for privacy.
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                window.open("https://github.com/pouryaak/lokul", "_blank")
              }
              className="group flex cursor-pointer items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-[#1A1A1A] transition-all hover:bg-[#FF6B35] hover:text-white"
            >
              Audit the Code Yourself
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
