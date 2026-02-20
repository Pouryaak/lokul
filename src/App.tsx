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
import { Nav } from "./components/landing/Nav";
import { ModelsSection } from "./components/landing/ModelsSection";
import { ProblemSolutionSection } from "./components/landing/ProblemSolutionSection";
import { TechnicalTrustSection } from "./components/landing/TechnicalTrustSection";
import { LoadingScreen } from "./components/onboarding/LoadingScreen";
import { SMART_MODEL, getModelById } from "./lib/ai/models";
import { ChatDetailRoute } from "./routes/ChatDetailRoute";
import { ChatRoute } from "./routes/ChatRoute";
import { RootLayout } from "./routes/RootLayout";
import { useModelStore } from "./store/modelStore";
import {
  selectDefaultModel,
  selectHasCompletedSetup,
  useSettingsStore,
} from "./store/settingsStore";

function LandingPage() {
  const navigate = useNavigate();
  const handleStart = useCallback(() => navigate("/loading"), [navigate]);

  return (
    <div className="relative min-h-screen bg-[#050505]">
      <div
        className="pointer-events-none fixed inset-0 z-[1000] opacity-[0.16] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "220px 220px",
        }}
      />
      <Nav onStart={handleStart} />
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
  const defaultModelId = useSettingsStore(selectDefaultModel);
  const bootstrapModel = getModelById(defaultModelId) ?? SMART_MODEL;

  useEffect(() => {
    if (!currentModel && loadingStep === "idle") {
      loadModel(bootstrapModel.id);
    }
  }, [bootstrapModel.id, currentModel, loadingStep, loadModel]);

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
    <LoadingScreen
      onCancel={handleCancel}
      onReady={() => navigate("/chat")}
      modelName={bootstrapModel.name}
      modelSizeMB={bootstrapModel.sizeMB}
      progress={downloadProgress}
      loadingStep={loadingStep}
      error={modelError}
    />
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
  const defaultModelId = useSettingsStore(selectDefaultModel);
  const currentModel = useModelStore((state) => state.currentModel);
  const loadModel = useModelStore((state) => state.loadModel);
  const loadingStep = useModelStore((state) => state.loadingStep);
  const bootstrapModelId = getModelById(defaultModelId)?.id ?? SMART_MODEL.id;

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

    if (isChatRoute && !currentModel && loadingStep === "idle") {
      loadModel(bootstrapModelId);
    }
  }, [bootstrapModelId, currentModel, loadingStep, loadModel]);

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
