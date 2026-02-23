import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { WelcomeStep } from "./WelcomeStep";
import { ModelSelectionStep } from "./ModelSelectionStep";
import { DownloadStep } from "./DownloadStep";
import type { ModelConfig } from "@/lib/ai/models";

export type OnboardingStep = "welcome" | "select" | "download" | "complete";

interface OnboardingFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

const stepOrder: OnboardingStep[] = ["welcome", "select", "download", "complete"];

export function OnboardingFlow({ onComplete, onBack }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);

  const goToNextStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [currentStep]);

  const goToPrevStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    } else {
      onBack();
    }
  }, [currentStep, onBack]);

  const handleModelSelect = useCallback((model: ModelConfig) => {
    setSelectedModel(model);
    setCurrentStep("download");
  }, []);

  const handleDownloadComplete = useCallback(() => {
    setCurrentStep("complete");
    setTimeout(onComplete, 2000);
  }, [onComplete]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 60 : -60,
      opacity: 0,
    }),
  };

  const getStepIndex = () => stepOrder.indexOf(currentStep);

  return (
    <div className="relative min-h-screen bg-[#050505]">
      {/* Grainy texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[1000] opacity-[0.16] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "220px 220px",
        }}
      />

      {/* Progress indicator */}
      {currentStep !== "complete" && (
        <div className="fixed top-0 right-0 left-0 z-50 p-4">
          <div className="mx-auto flex max-w-[600px] items-center gap-2">
            {stepOrder.slice(0, 3).map((step, index) => (
              <div key={step} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`h-1 w-full rounded-full transition-all duration-500 ${
                    index <= getStepIndex() ? "bg-[#ff6b35]" : "bg-white/10"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      {currentStep !== "download" && currentStep !== "complete" && (
        <button
          onClick={goToPrevStep}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white/80"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait" custom={getStepIndex()}>
        <motion.div
          key={currentStep}
          custom={getStepIndex()}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="min-h-screen"
        >
          {currentStep === "welcome" && <WelcomeStep onContinue={goToNextStep} />}
          {currentStep === "select" && <ModelSelectionStep onSelect={handleModelSelect} />}
          {currentStep === "download" && selectedModel && (
            <DownloadStep
              model={selectedModel}
              onComplete={handleDownloadComplete}
              onCancel={goToPrevStep}
            />
          )}
          {currentStep === "complete" && selectedModel && (
            <div className="flex min-h-screen flex-col items-center justify-center px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-green-500/20 blur-3xl" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                      <svg
                        className="h-10 w-10 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <h2
                  className="mb-3 text-3xl text-white"
                  style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}
                >
                  {selectedModel.name} Ready
                </h2>
                <p className="text-white/60" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                  Downloaded and cached. Works completely offline.
                </p>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
