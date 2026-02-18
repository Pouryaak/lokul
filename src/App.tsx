import { useCallback, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "sonner";
import { ChatLayout } from "./components/chat-layout/ChatLayout";
import { ComparisonSection } from "./components/landing/ComparisonSection";
import { DemoSection } from "./components/landing/DemoSection";
import { FAQSection } from "./components/landing/FAQSection";
import { FinalCTASection } from "./components/landing/FinalCTASection";
import { FooterSection } from "./components/landing/FooterSection";
import { HeroSection } from "./components/landing/HeroSection";
import { HowItWorksSection } from "./components/landing/HowItWorksSection";
import { ModelsSection } from "./components/landing/ModelsSection";
import { ProblemSolutionSection } from "./components/landing/ProblemSolutionSection";
import { TechnicalTrustSection } from "./components/landing/TechnicalTrustSection";
import { LoadingScreen } from "./components/onboarding/LoadingScreen";
import { StatusIndicator } from "./components/performance/StatusIndicator";
import { ChatDetailRoute } from "./routes/ChatDetailRoute";
import { ChatRoute } from "./routes/ChatRoute";
import { RootLayout } from "./routes/RootLayout";
import { QUICK_MODEL } from "./lib/ai/models";
import { useModelStore } from "./store/modelStore";
import {
  selectHasCompletedSetup,
  useSettingsStore,
} from "./store/settingsStore";

/**
 * LandingPage component - All landing sections combined
 */
function LandingPage() {
  const navigate = useNavigate();

  // Model store
  const loadModel = useModelStore((state) => state.loadModel);
  const completeSetup = useSettingsStore((state) => state.completeSetup);

  // Handle start chatting
  const handleStart = useCallback(async () => {
    // Load Quick Model
    try {
      await loadModel(QUICK_MODEL.id);
      await completeSetup();
      navigate("/chat");
    } catch (error) {
      // Error is handled by model store
      console.error("Failed to load model:", error);
    }
  }, [loadModel, completeSetup, navigate]);

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
      <FinalCTASection onStart={handleStart} />
      <FooterSection />
    </div>
  );
}

/**
 * LoadingPage component - Model download screen
 */
function LoadingPage() {
  const navigate = useNavigate();

  // Model store
  const cancelDownload = useModelStore((state) => state.cancelDownload);
  const resetModel = useModelStore((state) => state.resetModel);
  const downloadProgress = useModelStore((state) => state.downloadProgress);
  const loadingStep = useModelStore((state) => state.loadingStep);
  const modelError = useModelStore((state) => state.error);

  // Handle cancel
  const handleCancel = useCallback(() => {
    cancelDownload();
    resetModel();
    navigate("/");
  }, [cancelDownload, resetModel, navigate]);

  // Handle ready
  const handleReady = useCallback(() => {
    navigate("/chat");
  }, [navigate]);

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

/**
 * ChatLayoutWrapper component - Wraps chat routes with layout
 */
function ChatLayoutWrapper() {
  const navigate = useNavigate();

  // Handle new chat
  const handleNewChat = useCallback(() => {
    navigate("/chat");
  }, [navigate]);

  // Handle conversation click - navigate to specific conversation
  const handleConversationClick = useCallback((id: string) => {
    navigate(`/chat/${id}`);
  }, [navigate]);

  return (
    <ChatLayout onNewChat={handleNewChat} onConversationClick={handleConversationClick}>
      <Outlet />
    </ChatLayout>
  );
}

/**
 * AppContent component - Router content with routes
 */
function AppContent() {
  const navigate = useNavigate();

  // Settings store
  const hasCompletedSetup = useSettingsStore(selectHasCompletedSetup);
  const isSettingsLoading = useSettingsStore((state) => state.isLoading);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  // Model store
  const currentModel = useModelStore((state) => state.currentModel);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Check if user has completed setup and redirect to chat if so
  useEffect(() => {
    if (!isSettingsLoading && hasCompletedSetup && currentModel) {
      // User has already completed setup, redirect to /chat
      // But only if we're at the root path
      if (window.location.pathname === "/") {
        navigate("/chat");
      }
    }
  }, [hasCompletedSetup, currentModel, isSettingsLoading, navigate]);

  return (
    <Routes>
      {/* Landing page routes */}
      <Route path="/" element={<RootLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="loading" element={<LoadingPage />} />
      </Route>

      {/* Chat routes */}
      <Route path="chat" element={<ChatLayoutWrapper />}>
        <Route index element={<ChatRoute />} />
        <Route path=":id" element={<ChatDetailRoute />} />
      </Route>

      {/* Catch-all redirect to landing */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

/**
 * App component - Main application entry point
 *
 * Provides BrowserRouter and renders the app content.
 */
export function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
