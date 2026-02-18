import { useCallback, useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
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
import { QUICK_MODEL } from "./lib/ai/models";
import { ChatDetailRoute } from "./routes/ChatDetailRoute";
import { ChatRoute } from "./routes/ChatRoute";
import { RootLayout } from "./routes/RootLayout";
import { useModelStore } from "./store/modelStore";
import { selectHasCompletedSetup, useSettingsStore } from "./store/settingsStore";

function logModelBootstrap(scope: string, payload: Record<string, unknown>): void {
  if (!import.meta.env.DEV) {
    return;
  }

  console.info(`[ModelBootstrap:${scope}]`, payload);
}

function LandingPage() {
  const navigate = useNavigate();
  const handleStart = useCallback(() => navigate("/loading"), [navigate]);

  return (
    <div className="relative min-h-screen bg-white">
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

function LoadingPage() {
  const navigate = useNavigate();
  const cancelDownload = useModelStore((state) => state.cancelDownload);
  const resetModel = useModelStore((state) => state.resetModel);
  const loadModel = useModelStore((state) => state.loadModel);
  const downloadProgress = useModelStore((state) => state.downloadProgress);
  const loadingStep = useModelStore((state) => state.loadingStep);
  const modelError = useModelStore((state) => state.error);
  const currentModel = useModelStore((state) => state.currentModel);
  const completeSetup = useSettingsStore((state) => state.completeSetup);

  useEffect(() => {
    logModelBootstrap("LoadingPage.effect", {
      hasCurrentModel: Boolean(currentModel),
      loadingStep,
    });

    if (!currentModel && loadingStep === "idle") {
      logModelBootstrap("LoadingPage.autoload", { modelId: QUICK_MODEL.id });
      loadModel(QUICK_MODEL.id);
    }
  }, [currentModel, loadingStep, loadModel]);

  useEffect(() => {
    if (loadingStep === "ready" && currentModel) {
      completeSetup().then(() => navigate("/chat"));
    }
  }, [loadingStep, currentModel, completeSetup, navigate]);

  const handleCancel = useCallback(() => {
    cancelDownload();
    resetModel();
    navigate("/");
  }, [cancelDownload, resetModel, navigate]);

  return (
    <>
      <LoadingScreen
        onCancel={handleCancel}
        onReady={() => navigate("/chat")}
        modelName={QUICK_MODEL.name}
        modelSizeMB={QUICK_MODEL.sizeMB}
        progress={downloadProgress}
        loadingStep={loadingStep}
        error={modelError}
      />
      <StatusIndicator />
    </>
  );
}

function ChatLayoutWrapper() {
  const navigate = useNavigate();
  const handleNewChat = useCallback(() => navigate("/chat"), [navigate]);
  const handleConversationClick = useCallback((id: string) => navigate(`/chat/${id}`), [navigate]);

  return (
    <ChatLayout onNewChat={handleNewChat} onConversationClick={handleConversationClick}>
      <Outlet />
    </ChatLayout>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const hasCompletedSetup = useSettingsStore(selectHasCompletedSetup);
  const isSettingsLoading = useSettingsStore((state) => state.isLoading);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const currentModel = useModelStore((state) => state.currentModel);
  const loadModel = useModelStore((state) => state.loadModel);
  const loadingStep = useModelStore((state) => state.loadingStep);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (
      !isSettingsLoading &&
      hasCompletedSetup &&
      currentModel &&
      window.location.pathname === "/"
    ) {
      navigate("/chat");
    }
  }, [hasCompletedSetup, currentModel, isSettingsLoading, navigate]);

  useEffect(() => {
    const isChatRoute = window.location.pathname.startsWith("/chat");

    logModelBootstrap("AppContent.effect", {
      pathname: window.location.pathname,
      isChatRoute,
      hasCurrentModel: Boolean(currentModel),
      loadingStep,
    });

    if (isChatRoute && !currentModel && loadingStep === "idle") {
      logModelBootstrap("AppContent.autoload", { modelId: QUICK_MODEL.id });
      loadModel(QUICK_MODEL.id);
    }
  }, [currentModel, loadingStep, loadModel]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="loading" element={<LoadingPage />} />
        </Route>
        <Route path="chat" element={<ChatLayoutWrapper />}>
          <Route index element={<ChatRoute />} />
          <Route path=":id" element={<ChatDetailRoute />} />
        </Route>
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
