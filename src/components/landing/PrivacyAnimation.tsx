"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";

interface CursorState {
  x: number;
  y: number;
  scale: number;
  isHovering: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
}

const CHAT_MESSAGES_INITIAL: Message[] = [
  {
    id: "initial-1",
    role: "user",
    content: "Help me draft an email to my team about the product delay",
    isStreaming: false,
    isComplete: true,
  },
  {
    id: "initial-2",
    role: "assistant",
    content: "Here's a draft that's honest without being alarming — want me to adjust the tone?",
    isStreaming: false,
    isComplete: true,
  },
];

const TYPED_MESSAGE_1 = "Can you make it more direct?";
const LOKUL_RESPONSE_1 =
  'Sure. Here\'s the direct version:\n\n"Team — the launch is delayed by two weeks. Reason: [X]. Impact: [Y]. Next steps: [Z]. Questions welcome."';
const TYPED_MESSAGE_2 = "Now make it warmer. More human.";
const LOKUL_RESPONSE_2 =
  "\"Team — we hit an unexpected obstacle and the launch is moving two weeks. I know that's not what anyone wanted to hear. Here's what we know, and here's the plan...\"";

const MEMORY_ITEMS = [
  { icon: "👤", label: "Your name is Sam" },
  { icon: "💼", label: "Works in product management" },
  { icon: "📧", label: "Drafting a team update today" },
  { icon: "❤️", label: "Prefers direct communication but not cold", highlight: true },
];

function GhostCursor({ state }: { state: CursorState }) {
  return (
    <motion.div
      className="pointer-events-none absolute z-50"
      animate={{
        x: state.x,
        y: state.y,
        scale: state.scale,
      }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 20,
        mass: 0.5,
      }}
      style={{
        marginLeft: -4,
        marginTop: -4,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
        }}
      >
        <motion.path
          d="M4 4L4 18L8 14L11 20L14 18L11 12L16 12L4 4Z"
          fill="white"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1"
          animate={{
            scale: state.isHovering ? 1.15 : 1,
          }}
          style={{ transformOrigin: "4px 4px" }}
        />
      </svg>
    </motion.div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div className={`flex max-w-[85%] items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
        {!isUser && (
          <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-[#ff6b35]">
            <span className="text-[10px] font-bold text-white">L</span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "rounded-br-md bg-[#ff6b35] text-white"
              : "rounded-bl-md bg-white/10 text-gray-200"
          }`}
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          {message.content}
          {message.isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="ml-0.5 inline-block text-[#ff6b35]"
            >
              ▋
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function WifiIcon({ isOnline, isHovered }: { isOnline: boolean; isHovered: boolean }) {
  return (
    <motion.div
      className="relative flex items-center gap-1"
      animate={{ scale: isHovered ? 1.1 : 1 }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" className="overflow-visible">
        <motion.path
          d="M2 8.5C2 8.5 6 4 12 4C18 4 22 8.5 22 8.5"
          stroke={isOnline ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)"}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: isOnline ? 1 : 0.2 }}
        />
        <motion.path
          d="M6 12C6 12 8.5 9 12 9C15.5 9 18 12 18 12"
          stroke={isOnline ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)"}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: isOnline ? 1 : 0.2 }}
          transition={{ delay: 0.1 }}
        />
        <motion.path
          d="M10 15.5C10 15.5 11 14.5 12 14.5C13 14.5 14 15.5 14 15.5"
          stroke={isOnline ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)"}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: isOnline ? 1 : 0.2 }}
          transition={{ delay: 0.2 }}
        />
        <circle
          cx="12"
          cy="19"
          r="1.5"
          fill={isOnline ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)"}
        />
      </svg>
      <AnimatePresence>
        {!isOnline && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-[10px] text-red-400/80"
            style={{ fontFamily: '"Syne", sans-serif' }}
          >
            Offline
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OfflineToast({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute top-4 left-1/2 z-40 -translate-x-1/2 rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2 shadow-xl"
        >
          <div className="flex items-center gap-2 text-[12px] text-gray-300">
            <span className="text-amber-500">⚠</span>
            <span style={{ fontFamily: '"DM Sans", sans-serif' }}>No internet connection</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MemoryPanel({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="absolute top-0 right-0 z-30 h-full w-[220px] border-l border-white/10 bg-[#0c0c0c] p-4"
        >
          <p
            className="mb-4 text-[10px] font-medium tracking-wider text-white/40 uppercase"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            What Lokul knows
          </p>
          <div className="space-y-3">
            {MEMORY_ITEMS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="group relative"
              >
                <div className="flex items-start gap-2 text-[11px] text-gray-400">
                  <span>{item.icon}</span>
                  <span style={{ fontFamily: '"DM Sans", sans-serif' }}>{item.label}</span>
                </div>
                {item.highlight && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
                    className="absolute -bottom-1 left-5 h-[2px] w-[calc(100%-20px)] origin-left bg-gradient-to-r from-[#ff6b35] to-[#ffb84d]"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OfflineLabel({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="mt-4 text-center text-[11px] text-[#ff6b35]/80"
          style={{ fontFamily: '"Syne", sans-serif' }}
        >
          Running entirely on your device · No internet required
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PrivacyAnimation() {
  const [cursorState, setCursorState] = useState<CursorState>({
    x: 200,
    y: 180,
    scale: 1,
    isHovering: false,
  });

  const [messages, setMessages] = useState<Message[]>(CHAT_MESSAGES_INITIAL);
  const [isOnline, setIsOnline] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [showOfflineLabel, setShowOfflineLabel] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(false);
  const [isWifiHovered, setIsWifiHovered] = useState(false);
  const [isInputHovered, setIsInputHovered] = useState(false);
  const [isMemoryBtnHovered, setIsMemoryBtnHovered] = useState(false);

  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageIdRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const moveCursor = useCallback((x: number, y: number, options?: { hover?: boolean }) => {
    setCursorState((prev) => ({
      ...prev,
      x,
      y,
      scale: options?.hover ? 1.15 : 1,
      isHovering: options?.hover || false,
    }));
  }, []);

  const clickCursor = useCallback(() => {
    setCursorState((prev) => ({ ...prev, scale: 0.7 }));
    setTimeout(() => {
      setCursorState((prev) => ({ ...prev, scale: 1 }));
    }, 150);
  }, []);

  const typeText = useCallback(
    (
      text: string,
      onChar: (char: string, index: number) => void,
      onComplete: () => void,
      speed = 60
    ) => {
      let index = 0;
      const type = () => {
        if (index < text.length) {
          onChar(text[index], index);
          index++;
          const delay = speed + Math.random() * 40 - 20;
          typingRef.current = setTimeout(type, delay);
        } else {
          onComplete();
        }
      };
      type();
    },
    []
  );

  const addStreamingMessage = useCallback((role: "user" | "assistant"): string => {
    const id = `msg-${++messageIdRef.current}`;
    setMessages((prev) => [
      ...prev,
      { id, role, content: "", isStreaming: true, isComplete: false },
    ]);
    return id;
  }, []);

  const updateMessageContent = useCallback(
    (id: string, content: string, isStreaming?: boolean, isComplete?: boolean) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id
            ? {
                ...msg,
                content,
                isStreaming: isStreaming ?? msg.isStreaming,
                isComplete: isComplete ?? msg.isComplete,
              }
            : msg
        )
      );
    },
    []
  );

  const runAnimation = useCallback(() => {
    setMessages(CHAT_MESSAGES_INITIAL);
    setIsUiVisible(false);
    setIsOnline(true);
    setShowToast(false);
    setShowMemoryPanel(false);
    setShowOfflineLabel(false);
    setIsWifiHovered(false);
    setIsInputHovered(false);
    setIsMemoryBtnHovered(false);
    setCursorState({ x: 200, y: 180, scale: 1, isHovering: false });

    const executeScene = async () => {
      await new Promise((r) => (animationRef.current = setTimeout(r, 100)));

      setIsUiVisible(true);
      await new Promise((r) => (animationRef.current = setTimeout(r, 1500)));

      // Scene: Move to chat input and type
      moveCursor(280, 340);
      await new Promise((r) => (animationRef.current = setTimeout(r, 1000)));
      setIsInputHovered(true);
      moveCursor(280, 340, { hover: true });
      await new Promise((r) => (animationRef.current = setTimeout(r, 400)));
      clickCursor();
      setIsInputHovered(false);
      await new Promise((r) => (animationRef.current = setTimeout(r, 200)));

      const userMsg1Id = addStreamingMessage("user");
      await new Promise<void>((resolve) => {
        let currentText = "";
        typeText(
          TYPED_MESSAGE_1,
          (_char) => {
            currentText += _char;
            updateMessageContent(userMsg1Id, currentText);
            scrollToBottom();
          },
          () => {
            updateMessageContent(userMsg1Id, TYPED_MESSAGE_1, false, true);
            resolve();
          },
          50
        );
      });
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));

      // Click send
      moveCursor(380, 345);
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));
      clickCursor();
      await new Promise((r) => (animationRef.current = setTimeout(r, 500)));

      // AI responds
      const assistantMsg1Id = addStreamingMessage("assistant");
      await new Promise<void>((resolve) => {
        let currentText = "";
        typeText(
          LOKUL_RESPONSE_1,
          (_char) => {
            currentText += _char;
            updateMessageContent(assistantMsg1Id, currentText);
            scrollToBottom();
          },
          () => {
            updateMessageContent(assistantMsg1Id, LOKUL_RESPONSE_1, false, true);
            resolve();
          },
          20
        );
      });
      await new Promise((r) => (animationRef.current = setTimeout(r, 800)));

      // Scene: Move to wifi icon and disconnect
      moveCursor(470, 22);
      await new Promise((r) => (animationRef.current = setTimeout(r, 1200)));
      setIsWifiHovered(true);
      moveCursor(470, 22, { hover: true });
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));
      clickCursor();
      setIsWifiHovered(false);
      setIsOnline(false);
      setShowToast(true);
      await new Promise((r) => (animationRef.current = setTimeout(r, 2000)));
      setShowToast(false);
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));

      // Scene: Chat while offline
      moveCursor(280, 340);
      await new Promise((r) => (animationRef.current = setTimeout(r, 1000)));
      setIsInputHovered(true);
      moveCursor(280, 340, { hover: true });
      await new Promise((r) => (animationRef.current = setTimeout(r, 400)));
      clickCursor();
      setIsInputHovered(false);
      await new Promise((r) => (animationRef.current = setTimeout(r, 200)));

      const userMsg2Id = addStreamingMessage("user");
      await new Promise<void>((resolve) => {
        let currentText = "";
        typeText(
          TYPED_MESSAGE_2,
          (_char) => {
            currentText += _char;
            updateMessageContent(userMsg2Id, currentText);
            scrollToBottom();
          },
          () => {
            updateMessageContent(userMsg2Id, TYPED_MESSAGE_2, false, true);
            resolve();
          },
          50
        );
      });
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));

      // Click send
      moveCursor(380, 345);
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));
      clickCursor();
      await new Promise((r) => (animationRef.current = setTimeout(r, 500)));

      // AI responds while offline
      const assistantMsg2Id = addStreamingMessage("assistant");
      await new Promise<void>((resolve) => {
        let currentText = "";
        typeText(
          LOKUL_RESPONSE_2,
          (_char) => {
            currentText += _char;
            updateMessageContent(assistantMsg2Id, currentText);
            scrollToBottom();
          },
          () => {
            updateMessageContent(assistantMsg2Id, LOKUL_RESPONSE_2, false, true);
            resolve();
          },
          20
        );
      });
      setShowOfflineLabel(true);
      await new Promise((r) => (animationRef.current = setTimeout(r, 2500)));
      setShowOfflineLabel(false);
      await new Promise((r) => (animationRef.current = setTimeout(r, 400)));

      // Scene: Open memory panel
      moveCursor(420, 22);
      await new Promise((r) => (animationRef.current = setTimeout(r, 800)));
      setIsMemoryBtnHovered(true);
      moveCursor(420, 22, { hover: true });
      await new Promise((r) => (animationRef.current = setTimeout(r, 400)));
      clickCursor();
      setIsMemoryBtnHovered(false);
      setShowMemoryPanel(true);
      await new Promise((r) => (animationRef.current = setTimeout(r, 2500)));

      // Close memory panel
      moveCursor(300, 180);
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));
      setShowMemoryPanel(false);
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));

      moveCursor(200, 200);
      await new Promise((r) => (animationRef.current = setTimeout(r, 1000)));

      // Reset
      setIsUiVisible(false);
      await new Promise((r) => (animationRef.current = setTimeout(r, 800)));
    };

    executeScene();
  }, [
    moveCursor,
    clickCursor,
    typeText,
    addStreamingMessage,
    updateMessageContent,
    scrollToBottom,
  ]);

  useEffect(() => {
    runAnimation();
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [runAnimation]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ maxWidth: "500px" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isUiVisible ? 1 : 0.3 }}
        transition={{ duration: 0.8 }}
        className="relative h-[380px] overflow-hidden bg-[#0a0a0a]"
      >
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-12 border-r border-white/5 bg-[#080808] p-2">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-6 rounded ${i === 1 ? "bg-white/10" : "bg-white/5"}`} />
              ))}
            </div>
          </div>

          {/* Main chat area */}
          <div className="relative flex flex-1 flex-col">
            {/* Top bar */}
            <div className="flex h-11 items-center justify-between border-b border-white/5 px-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-[#ff6b35]"
                />
                <span
                  className="text-[11px] text-white/60"
                  style={{ fontFamily: '"DM Sans", sans-serif' }}
                >
                  Lokul
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Memory button */}
                <motion.button
                  className="flex items-center gap-1 text-[10px] text-white/40"
                  animate={{ scale: isMemoryBtnHovered ? 1.1 : 1 }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </motion.button>
                <WifiIcon isOnline={isOnline} isHovered={isWifiHovered} />
              </div>
            </div>

            {/* Messages area */}
            <div className="relative flex-1 overflow-hidden">
              <div
                ref={messagesContainerRef}
                className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 h-full overflow-y-auto p-3"
              >
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
                <OfflineLabel isVisible={showOfflineLabel} />
              </div>

              <MemoryPanel isVisible={showMemoryPanel} />
            </div>

            {/* Input area */}
            <motion.div
              className="border-t border-white/5 p-2"
              animate={{
                borderColor: isInputHovered ? "rgba(255,107,53,0.3)" : "rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-[11px] text-white/30">Type a message...</span>
                <div className="flex-1" />
                <div className="text-[10px] text-white/20">↵</div>
              </div>
            </motion.div>

            <OfflineToast isVisible={showToast} />
          </div>
        </div>

        <GhostCursor state={cursorState} />
      </motion.div>
    </div>
  );
}
