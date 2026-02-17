import { useState, useEffect, useCallback } from "react";
import { Activity } from "lucide-react";
import { StatusIndicator } from "./components/performance/StatusIndicator";
import { PerformancePanel } from "./components/performance/PerformancePanel";
import { Button } from "./components/ui/Button";
import { HeroSection } from "./components/landing/HeroSection";
import { ProblemSolutionSection } from "./components/landing/ProblemSolutionSection";
import { DemoSection } from "./components/landing/DemoSection";
import { HowItWorksSection } from "./components/landing/HowItWorksSection";
import { ComparisonSection } from "./components/landing/ComparisonSection";
import { UseCasesSection } from "./components/landing/UseCasesSection";
import { TechnicalTrustSection } from "./components/landing/TechnicalTrustSection";
import { FAQSection } from "./components/landing/FAQSection";
import { TestimonialsSection } from "./components/landing/TestimonialsSection";
import { FinalCTASection } from "./components/landing/FinalCTASection";
import { FooterSection } from "./components/landing/FooterSection";
import { LoadingScreen } from "./components/onboarding/LoadingScreen";
import { useSettingsStore, selectHasCompletedSetup } from "./store/settingsStore";
import { useModelStore } from "./store/modelStore";
import { QUICK_MODEL } from "./lib/ai/models";

/**
 * App states
 */
type AppState = "landing" | "loading" | "chat" | "error";

/**
 * App component - Main application entry point
 *
 * Orchestrates the landing page and onboarding flow:
 * - Landing state: Shows 11-section marketing page
 * - Loading state: Shows model download progress
 * - Chat state: Shows chat interface (placeholder)
 *
 * Also includes:
 * - StatusIndicator: Fixed bottom-left (always visible)
 * - PerformancePanel: Toggleable panel
 * - Performance toggle button: Top-right corner
 */
export function App() {
  // App state
  const [appState, setAppState] = useState<AppState>("landing");
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);

  // Settings store
  const hasCompletedSetup = useSettingsStore(selectHasCompletedSetup);
  const isSettingsLoading = useSettingsStore((state) => state.isLoading);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const completeSetup = useSettingsStore((state) => state.completeSetup);

  // Model store
  const loadModel = useModelStore((state) => state.loadModel);
  const cancelDownload = useModelStore((state) => state.cancelDownload);
  const resetModel = useModelStore((state) => state.resetModel);
  const downloadProgress = useModelStore((state) => state.downloadProgress);
  const loadingStep = useModelStore((state) => state.loadingStep);
  const modelError = useModelStore((state) => state.error);
  const currentModel = useModelStore((state) => state.currentModel);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Check if user has completed setup
  useEffect(() => {
    if (!isSettingsLoading) {
      if (hasCompletedSetup && currentModel) {
        setAppState("chat");
      }
    }
  }, [hasCompletedSetup, currentModel, isSettingsLoading]);

  // Handle start chatting
  const handleStart = useCallback(async () => {
    setAppState("loading");

    // Load Quick Model
    try {
      await loadModel(QUICK_MODEL.id);
      await completeSetup();
    } catch (error) {
      // Error is handled by model store
      console.error("Failed to load model:", error);
    }
  }, [loadModel, completeSetup]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    cancelDownload();
    resetModel();
    setAppState("landing");
  }, [cancelDownload, resetModel]);

  // Handle ready
  const handleReady = useCallback(() => {
    setAppState("chat");
  }, []);

  // Loading screen
  if (appState === "loading") {
    return (
      <>
        <LoadingScreen
          onCancel={handleCancel}
          onReady={handleReady}
          modelName={QUICK_MODEL.name}
          modelSizeMB={QUICK_MODEL.sizeMB}
          progress={downloadProgress}
          loadingStep={loadingStep}
          error={modelError}
        />
        {/* Status Indicator - always visible */}
        <StatusIndicator />
      </>
    );
  }

  // Chat screen (placeholder)
  if (appState === "chat") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        {/* Main Content */}
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FF6B35]/20 blur-3xl rounded-full" />
              <img
                src="/spark-logo.svg"
                alt=""
                className="relative w-16 h-16"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Ready to chat!
          </h1>
          <p className="text-muted-foreground mb-6">
            {currentModel?.name} is loaded and ready.
          </p>
          <p className="text-sm text-muted-foreground">
            Chat interface coming in the next phase.
          </p>
          <button
            onClick={() => setAppState("landing")}
            className="mt-6 text-[#FF6B35] hover:underline"
          >
            Back to landing page
          </button>
        </div>

        {/* Performance Toggle Button - Top Right */}
        <div className="fixed top-4 right-4 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPerformancePanel(!showPerformancePanel)}
            aria-label={showPerformancePanel ? "Hide performance panel" : "Show performance panel"}
            aria-pressed={showPerformancePanel}
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>

        {/* Performance Panel - Right Side */}
        {showPerformancePanel && (
          <div className="fixed top-16 right-4 z-40">
            <PerformancePanel onClose={() => setShowPerformancePanel(false)} />
          </div>
        )}

        {/* Status Indicator - Bottom Left */}
        <StatusIndicator />
      </div>
    );
  }

  // Landing page with all sections
  return (
    <div className="min-h-screen bg-white relative">
      {/* Landing Page Sections */}
      <HeroSection onStart={handleStart} />
      <ProblemSolutionSection />
      <DemoSection />
      <HowItWorksSection />
      <ComparisonSection />
      <UseCasesSection />
      <TechnicalTrustSection />
      <FAQSection />
      <TestimonialsSection />
      <FinalCTASection onStart={handleStart} />
      <FooterSection />

      {/* Performance Toggle Button - Top Right */}
      <div className="fixed top-4 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPerformancePanel(!showPerformancePanel)}
          aria-label={showPerformancePanel ? "Hide performance panel" : "Show performance panel"}
          aria-pressed={showPerformancePanel}
        >
          <Activity className="h-4 w-4" />
        </Button>
      </div>

      {/* Performance Panel - Right Side */}
      {showPerformancePanel && (
        <div className="fixed top-16 right-4 z-40">
          <PerformancePanel onClose={() => setShowPerformancePanel(false)} />
        </div>
      )}

      {/* Status Indicator - Bottom Left */}
      <StatusIndicator />
    </div>
  );
}

export default App;
