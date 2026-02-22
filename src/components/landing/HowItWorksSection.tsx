"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";

interface CursorState {
  x: number;
  y: number;
  scale: number;
}

const TYPED_URL = "trylokul.com";
const HERO_TAGLINE = "Private AI that lives on your device.";
const CHAT_MESSAGE = "Hello Lokul!";

const MODELS = [
  { id: "quick", name: "Quick Mode", size: "80MB", desc: "Fast responses", compatible: true },
  { id: "smart", name: "Smart Mode", size: "2.8GB", desc: "Best balance", compatible: true },
  { id: "genius", name: "Genius Mode", size: "6.4GB", desc: "Most capable", compatible: true },
  { id: "llama8b", name: "Llama 3.1 8B", size: "6.9GB", desc: "High quality", compatible: false },
  {
    id: "llama8b32",
    name: "Llama 3.1 8B (High)",
    size: "8.6GB",
    desc: "Best quality",
    compatible: false,
  },
];

const blurInVariants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

function GhostCursor({ state }: { state: CursorState }) {
  return (
    <motion.div
      className="pointer-events-none absolute top-0 left-0 z-[100]"
      animate={{
        x: state.x,
        y: state.y,
        scale: state.scale,
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 18,
        mass: 0.3,
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 16 16"
        fill="none"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
      >
        <path
          d="M2 2L2 12L5.5 8.5L8 13.5L10.5 11.5L8 7L12 7L2 2Z"
          fill="white"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="0.5"
        />
      </svg>
    </motion.div>
  );
}

function BrowserChrome({
  url,
  isTyping,
  typedUrl,
}: {
  url: string;
  isTyping: boolean;
  typedUrl: string;
}) {
  return (
    <div className="flex h-10 items-center gap-3 border-b border-white/10 bg-[#1a1a1a] px-3">
      <div className="flex gap-1.5">
        <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <div className="h-3 w-3 rounded-full bg-[#27ca40]" />
      </div>
      <div className="flex-1 rounded-md bg-[#2a2a2a] px-3 py-1">
        {isTyping ? (
          <span className="text-xs text-white/70">
            {typedUrl}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              |
            </motion.span>
          </span>
        ) : (
          <span className="text-xs text-white/70">{url}</span>
        )}
      </div>
    </div>
  );
}

function LandingPageScreen({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      className="flex h-full flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div
          className="mb-4 text-3xl font-bold text-white"
          style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}
        >
          Private AI.
        </div>
        <p className="mb-6 text-sm text-white/60" style={{ fontFamily: '"DM Sans", sans-serif' }}>
          {HERO_TAGLINE}
        </p>
        <motion.div
          className="cursor-pointer rounded-full bg-[#ff6b35] px-6 py-2.5 text-sm font-medium text-white"
          whileHover={{ scale: 1.05 }}
        >
          Chat with Lokul
        </motion.div>
      </div>
    </motion.div>
  );
}

function OnboardingScreen({
  isActive,
  selectedModel,
  downloadProgress,
  isDownloading,
}: {
  isActive: boolean;
  selectedModel: string | null;
  downloadProgress: number;
  isDownloading: boolean;
}) {
  return (
    <motion.div
      className="flex h-full flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
    >
      <div className="border-b border-white/10 p-4">
        <p
          className="text-sm font-medium text-white/80"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          Choose Your AI
        </p>
        <p className="text-xs text-white/50" style={{ fontFamily: '"DM Sans", sans-serif' }}>
          Download once. Use forever.
        </p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {MODELS.map((model) => {
          const isSelected = selectedModel === model.id;
          const showProgress = isSelected && isDownloading;

          return (
            <motion.div
              key={model.id}
              className={`relative overflow-hidden rounded-lg border p-3 transition-colors ${
                isSelected ? "border-[#ff6b35] bg-[#ff6b35]/10" : "border-white/10 bg-white/5"
              }`}
              animate={{
                borderColor: isSelected ? "#ff6b35" : "rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{model.name}</p>
                  <p className="text-xs text-white/50">
                    {model.size} - {model.desc}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {model.compatible ? (
                    <span className="text-xs text-green-500">Compatible</span>
                  ) : (
                    <span className="text-xs text-amber-500">!</span>
                  )}
                </div>
              </div>

              {showProgress && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-[#ff6b35]"
                  initial={{ width: 0 }}
                  animate={{ width: `${downloadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {isSelected && !isDownloading && downloadProgress >= 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                >
                  <span className="text-lg text-green-500">✓</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ChatScreen({ isActive, chatMessage }: { isActive: boolean; chatMessage: string }) {
  return (
    <motion.div
      className="flex h-full flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
    >
      <div className="flex-1 overflow-y-auto p-4">
        {chatMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex justify-end"
          >
            <div className="max-w-[70%] rounded-xl rounded-br-sm bg-[#ff6b35] px-3 py-2 text-sm text-white">
              {chatMessage}
            </div>
          </motion.div>
        )}
        {chatMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-start"
          >
            <div className="flex items-start gap-2">
              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded bg-[#ff6b35]">
                <span className="text-[10px] font-bold text-white">L</span>
              </div>
              <div className="max-w-[70%] rounded-xl rounded-bl-sm bg-white/10 px-3 py-2 text-sm text-gray-200">
                Hello! I&apos;m Lokul, your private AI assistant. How can I help you today?
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <div className="border-t border-white/10 p-3">
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <span className="text-xs text-white/30">Type a message...</span>
        </div>
      </div>
    </motion.div>
  );
}

function StepText({
  step,
  isVisible,
}: {
  step: { number: string; title: string; description: string; detail: string };
  isVisible: boolean;
}) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <p
        className="mb-2 text-xs font-medium tracking-wider text-[#ff6b35] uppercase"
        style={{ fontFamily: '"DM Sans", sans-serif' }}
      >
        Step {step.number}
      </p>
      <h3
        className="mb-2 text-2xl text-white md:text-3xl"
        style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}
      >
        {step.title}
      </h3>
      <p
        className="text-sm text-white/70 md:text-base"
        style={{ fontFamily: '"DM Sans", sans-serif' }}
      >
        {step.description}
      </p>
      <p
        className="mt-2 text-xs text-white/50 md:text-sm"
        style={{ fontFamily: '"DM Sans", sans-serif' }}
      >
        {step.detail}
      </p>
    </motion.div>
  );
}

function LaptopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto max-w-[700px]">
      {/* Laptop screen bezel */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] p-2 shadow-2xl shadow-black/50">
        {/* Screen */}
        <div className="overflow-hidden rounded-lg border border-white/5 bg-[#0a0a0a]">
          {children}
        </div>
      </div>

      {/* Laptop base/keyboard area */}
      <div className="mx-auto mt-2 h-3 w-[40%] rounded-b-lg bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]" />

      {/* Subtle reflection */}
      <div className="pointer-events-none absolute right-0 -bottom-4 left-0 h-8 bg-gradient-to-t from-transparent to-white/[0.02] blur-sm" />
    </div>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const [cursorState, setCursorState] = useState<CursorState>({ x: 350, y: 250, scale: 1 });
  const [phase, setPhase] = useState(0);
  const [typedUrl, setTypedUrl] = useState("");
  const [isTypingUrl, setIsTypingUrl] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isUiVisible, setIsUiVisible] = useState(false);

  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = [
    {
      number: "01",
      title: "Open Your Browser",
      description: "No downloads. No accounts. Just visit Lokul.",
      detail: "Works instantly in Chrome, Edge, or any WebGPU-enabled browser.",
    },
    {
      number: "02",
      title: "Pick Your AI",
      description: "Choose from all the available models",
      detail: "Download once.",
    },
    {
      number: "03",
      title: "Start Chatting",
      description: "Private AI that works offline, forever.",
      detail: "Your conversations never leave your device. No subscriptions. No limits.",
    },
  ];

  const moveCursor = useCallback((x: number, y: number) => {
    setCursorState((prev) => ({ ...prev, x, y }));
  }, []);

  const clickCursor = useCallback(() => {
    setCursorState((prev) => ({ ...prev, scale: 0.7 }));
    setTimeout(() => {
      setCursorState((prev) => ({ ...prev, scale: 1 }));
    }, 150);
  }, []);

  const typeText = useCallback(
    (text: string, onChar: (char: string) => void, onComplete: () => void, speed = 80) => {
      let index = 0;
      const type = () => {
        if (index < text.length) {
          onChar(text[index]);
          index++;
          typingRef.current = setTimeout(type, speed);
        } else {
          onComplete();
        }
      };
      type();
    },
    []
  );

  const runAnimation = useCallback(() => {
    setPhase(0);
    setTypedUrl("");
    setIsTypingUrl(false);
    setSelectedModel(null);
    setDownloadProgress(0);
    setIsDownloading(false);
    setChatMessage("");
    setIsUiVisible(false);
    setCursorState({ x: 350, y: 250, scale: 1 });

    const executeScene = async () => {
      await new Promise((r) => (animationRef.current = setTimeout(r, 500)));
      setIsUiVisible(true);

      await new Promise((r) => (animationRef.current = setTimeout(r, 1500)));

      // Phase 0: Move cursor to URL bar and type
      moveCursor(320, 18);
      await new Promise((r) => (animationRef.current = setTimeout(r, 700)));
      clickCursor();
      setIsTypingUrl(true);

      await new Promise<void>((resolve) => {
        let text = "";
        typeText(
          TYPED_URL,
          (char) => {
            text += char;
            setTypedUrl(text);
          },
          () => {
            setIsTypingUrl(false);
            resolve();
          },
          70
        );
      });

      await new Promise((r) => (animationRef.current = setTimeout(r, 400)));

      // Navigate to landing page
      moveCursor(320, 350);
      await new Promise((r) => (animationRef.current = setTimeout(r, 300)));
      clickCursor();
      setPhase(1);

      await new Promise((r) => (animationRef.current = setTimeout(r, 1800)));

      // Click "Chat with Lokul" button
      moveCursor(350, 280);
      await new Promise((r) => (animationRef.current = setTimeout(r, 700)));
      clickCursor();
      setPhase(2);

      await new Promise((r) => (animationRef.current = setTimeout(r, 800)));

      // Select Smart model
      moveCursor(380, 140);
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));
      clickCursor();
      setSelectedModel("smart");
      setIsDownloading(true);

      // Animate download progress
      for (let i = 0; i <= 100; i += 5) {
        await new Promise((r) => (animationRef.current = setTimeout(r, 50)));
        setDownloadProgress(i);
      }

      setIsDownloading(false);
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));

      // Proceed to chat
      moveCursor(350, 400);
      await new Promise((r) => (animationRef.current = setTimeout(r, 400)));
      clickCursor();
      setPhase(3);

      await new Promise((r) => (animationRef.current = setTimeout(r, 800)));

      // Type chat message
      moveCursor(350, 470);
      await new Promise((r) => (animationRef.current = setTimeout(r, 400)));
      clickCursor();

      await new Promise<void>((resolve) => {
        let text = "";
        typeText(
          CHAT_MESSAGE,
          (char) => {
            text += char;
            setChatMessage(text);
          },
          () => resolve(),
          60
        );
      });

      await new Promise((r) => (animationRef.current = setTimeout(r, 2500)));

      // Reset and loop
      setIsUiVisible(false);
      await new Promise((r) => (animationRef.current = setTimeout(r, 1500)));

      // Restart animation
      runAnimation();
    };

    executeScene();
  }, [moveCursor, clickCursor, typeText]);

  useEffect(() => {
    if (isInView) {
      runAnimation();
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [isInView, runAnimation]);

  const getCurrentUrl = () => {
    if (phase === 0) return "about:blank";
    if (phase >= 1) return "trylokul.com";
    return "about:blank";
  };

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#080808] py-20 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/5 absolute top-1/3 left-1/4 h-96 w-96 rounded-full blur-3xl" />
      </div>

      <div className="content-container relative">
        {/* Header */}
        <motion.div
          variants={blurInVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <p
            className="text-primary mb-4 text-[11px] tracking-[0.18em] uppercase"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            How It Works
          </p>
          <h2
            className="text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-white"
            style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}
          >
            From zero to private AI
            <br />
            in under a minute
          </h2>
        </motion.div>

        {/* Animation container */}
        <div className="space-y-8">
          {/* Step text based on phase */}
          <div className="min-h-[120px]">
            <AnimatePresence mode="wait">
              {phase === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <StepText step={steps[0]} isVisible={isUiVisible} />
                </motion.div>
              )}
              {phase === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <StepText step={steps[1]} isVisible={isUiVisible} />
                </motion.div>
              )}
              {phase === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <StepText step={steps[2]} isVisible={isUiVisible} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Browser mockup in laptop frame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isUiVisible ? 1 : 0, y: isUiVisible ? 0 : 30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <LaptopFrame>
              <div className="relative">
                <BrowserChrome url={getCurrentUrl()} isTyping={isTypingUrl} typedUrl={typedUrl} />
                <div className="relative h-[380px]">
                  <AnimatePresence mode="wait">
                    {phase === 0 && (
                      <motion.div
                        key="blank"
                        className="absolute inset-0 bg-[#0a0a0a]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                    {phase === 1 && <LandingPageScreen key="landing" isActive={phase === 1} />}
                    {phase === 2 && (
                      <OnboardingScreen
                        key="onboarding"
                        isActive={phase === 2}
                        selectedModel={selectedModel}
                        downloadProgress={downloadProgress}
                        isDownloading={isDownloading}
                      />
                    )}
                    {phase === 3 && (
                      <ChatScreen key="chat" isActive={phase === 3} chatMessage={chatMessage} />
                    )}
                  </AnimatePresence>

                  <GhostCursor state={cursorState} />
                </div>
              </div>
            </LaptopFrame>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
