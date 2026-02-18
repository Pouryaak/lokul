import { Activity, Menu } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ChatInterface } from "./components/Chat/ChatInterface";
import { ConversationSidebar } from "./components/Sidebar/ConversationSidebar";
import { ComparisonSection } from "./components/landing/ComparisonSection";
import { DemoSection } from "./components/landing/DemoSection";
import { FAQSection } from "./components/landing/FAQSection";
import { FinalCTASection } from "./components/landing/FinalCTASection";
import { FooterSection } from "./components/landing/FooterSection";
import { HeroSection } from "./components/landing/HeroSection";
import { HowItWorksSection } from "./components/landing/HowItWorksSection";
import { ProblemSolutionSection } from "./components/landing/ProblemSolutionSection";
import { TechnicalTrustSection } from "./components/landing/TechnicalTrustSection";
// import { TestimonialsSection } from "./components/landing/TestimonialsSection";
import { ModelsSection } from "./components/landing/ModelsSection";
import { LoadingScreen } from "./components/onboarding/LoadingScreen";
import { PerformancePanel } from "./components/performance/PerformancePanel";
import { StatusIndicator } from "./components/performance/StatusIndicator";
import { Button } from "./components/ui/Button";
import { QUICK_MODEL } from "./lib/ai/models";
import { useModelStore } from "./store/modelStore";
import { selectHasCompletedSetup, useSettingsStore } from "./store/settingsStore";
import { useClearChat } from "./store/chatStore";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Clear chat action for new conversation
  const clearChat = useClearChat();

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

  // Handle new chat
  const handleNewChat = useCallback(() => {
    clearChat();
  }, [clearChat]);

  // Handle toggle sidebar
  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
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

  // Chat screen
  if (appState === "chat") {
    return (
      <div className="flex h-screen overflow-hidden bg-[#FFF8F0]">
        {/* Sidebar */}
        <ConversationSidebar
          isOpen={sidebarOpen}
          onToggle={handleToggleSidebar}
          onNewChat={handleNewChat}
        />

        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Sidebar Toggle Button - Top Left (when sidebar is closed) */}
          {!sidebarOpen && (
            <div className="absolute top-4 left-4 z-30">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleSidebar}
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
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
    <div className="relative min-h-screen bg-white">
      {/* Landing Page Sections */}
      <HeroSection onStart={handleStart} />
      <ProblemSolutionSection />
      <ModelsSection />
      <DemoSection />
      <ComparisonSection />
      <HowItWorksSection />
      <TechnicalTrustSection />
      <FAQSection />
      {/* TestimonialsSection hidden for now - will add back later */}
      {/* <TestimonialsSection /> */}
      <FinalCTASection onStart={handleStart} />
      <FooterSection />
    </div>
  );
}

export default App;
