import { useCallback, useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ChatLayout } from "./components/chat-layout/ChatLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import GradualBlur from "./components/GradualBlur";
import { FAQSection } from "./components/landing/FAQSection";
import { FeaturesSection } from "./components/landing/FeaturesSection";
import { FinalCTASection } from "./components/landing/FinalCTASection";
import { FooterSection } from "./components/landing/FooterSection";
import { HeroSection } from "./components/landing/HeroSection";
import { HowItWorksSection } from "./components/landing/HowItWorksSection";
import { ModelsSection } from "./components/landing/ModelsSection";
import { Nav } from "./components/landing/Nav";
import { ProblemSolutionSection } from "./components/landing/ProblemSolutionSection";
import { RoomSection } from "./components/landing/RoomSection";
import { TechnicalTrustSection } from "./components/landing/TechnicalTrustSection";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
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
  const hasCompletedSetup = useSettingsStore(selectHasCompletedSetup);

  const handleStart = useCallback(() => {
    if (hasCompletedSetup) {
      navigate("/chat");
    } else {
      navigate("/setup");
    }
  }, [hasCompletedSetup, navigate]);

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
      <RoomSection />
      <ModelsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TechnicalTrustSection />
      <FAQSection />
      <FinalCTASection onStart={handleStart} />
      <FooterSection />
      <GradualBlur preset="footer" target="page" strength={1.5} height="5rem" />
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const hasCompletedSetup = useSettingsStore(selectHasCompletedSetup);
  const isSettingsLoading = useSettingsStore((state) => state.isLoading);
  const completeSetup = useSettingsStore((state) => state.completeSetup);

  useEffect(() => {
    if (!isSettingsLoading && hasCompletedSetup) {
      navigate("/chat", { replace: true });
    }
  }, [hasCompletedSetup, isSettingsLoading, navigate]);

  const handleComplete = useCallback(async () => {
    await completeSetup();
    navigate("/chat", { replace: true });
  }, [completeSetup, navigate]);

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (isSettingsLoading || hasCompletedSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#ff6b35]" />
      </div>
    );
  }

  return <OnboardingFlow onComplete={handleComplete} onBack={handleBack} />;
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
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const defaultModelId = useSettingsStore(selectDefaultModel);
  const currentModel = useModelStore((state) => state.currentModel);
  const loadModel = useModelStore((state) => state.loadModel);
  const loadingStep = useModelStore((state) => state.loadingStep);
  const bootstrapModelId = getModelById(defaultModelId ?? "")?.id ?? SMART_MODEL.id;

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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
          <Route path="setup" element={<OnboardingPage />} />
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
      <Toaster
        position="top-center"
        richColors
        theme="dark"
        toastOptions={{
          style: {
            background: 'var(--chat-surface-bg)',
            border: '1px solid var(--chat-border-soft)',
            color: 'var(--chat-text-primary)',
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
