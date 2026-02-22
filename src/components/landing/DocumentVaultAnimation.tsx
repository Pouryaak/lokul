"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";

interface CursorState {
  x: number;
  y: number;
  scale: number;
  isDragging: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citation?: string;
  warning?: string;
  isStreaming: boolean;
}

const DOCUMENT_CONTENT_1 = `CONSULTING AGREEMENT

This Consulting Agreement ("Agreement") is entered into as of January 15, 2024.

SECTION 1 — SCOPE OF SERVICES
The Consultant agrees to provide strategic advisory services related to product development and market expansion.

SECTION 2 — COMPENSATION
Client shall pay Consultant a monthly retainer of $15,000, due on the first of each month.

SECTION 8 — TERMINATION

8.1  Standard Termination
This Agreement may be terminated by either party with sixty (60) days written notice.

8.2  Early Termination
Either party may terminate this Agreement with thirty (30) days written notice in the event of a material breach. Termination without cause shall require payment of sixty percent (60%) of remaining contract value as a termination fee.

8.3  Effect of Termination
Upon termination, all work product shall become the property of the Client.

SECTION 11 — LIMITATION OF LIABILITY

11.1  Liability Cap
The total liability of either party shall not exceed the total fees paid in the six (6) months prior to the claim.

SECTION 15 — GENERAL PROVISIONS
This Agreement shall be governed by the laws of the State of California.`;

const TYPED_MESSAGE_1 = "Can they terminate early without paying the remaining fees?";
const LOKUL_RESPONSE_1 =
  "Yes — Section 8.2 allows early termination with 30 days written notice, but only without penalty if the termination follows a material breach by either party.\n\nOtherwise, the terminating party owes 60% of remaining contract value as a termination fee.";
const CITATION_1 = "Consulting_Agreement_Final.pdf · Section 8.2 · p.4";

const TYPED_MESSAGE_2 = "What's their liability cap?";
const LOKUL_RESPONSE_2 =
  "Based on your active documents, the liability cap is limited to the total fees paid in the 6 months prior to the claim.";
const CITATION_2 = "Consulting_Agreement_Final.pdf · Section 11.1 · p.7";
const WARNING_2 =
  "Your documents don't specify the liability cap for IP infringement claims specifically. You may want to clarify this before signing.";

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
        viewBox="0 0 20 20"
        fill="none"
        style={{
          filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))",
        }}
      >
        <motion.path
          d="M3 3L3 15L7 11L10 17L13 15L10 9L15 9L3 3Z"
          fill={state.isDragging ? "#ffb84d" : "white"}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="0.5"
        />
      </svg>
    </motion.div>
  );
}

function DropZone({
  isActive,
  isUploading,
  uploadProgress,
}: {
  isActive: boolean;
  isUploading: boolean;
  uploadProgress: number;
}) {
  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex h-[260px] w-[380px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8"
        animate={{
          borderColor: isActive
            ? "rgba(255,107,53,0.7)"
            : isUploading
              ? "rgba(255,107,53,0.5)"
              : "rgba(255,255,255,0.2)",
          backgroundColor: isActive ? "rgba(255,107,53,0.05)" : "rgba(255,255,255,0.02)",
          scale: isActive ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="mb-4 text-4xl"
          animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -5 : 0 }}
        >
          📄
        </motion.div>
        <p
          className="mb-2 text-[18px] text-white/80"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          Drop your document here
        </p>
        <p className="text-[12px] text-white/40" style={{ fontFamily: '"Syne", sans-serif' }}>
          PDF, Word, Excel, or text files
        </p>

        {isUploading && (
          <motion.div
            className="mt-6 w-full max-w-[260px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-[#ff6b35]"
                initial={{ width: "0%" }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <motion.div
                className="h-2 w-2 rounded-full bg-[#ff6b35]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <p className="text-[11px] text-white/50" style={{ fontFamily: '"Syne", sans-serif' }}>
                Reading locally...
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.p
        className="mt-6 text-[10px] text-white/30"
        style={{ fontFamily: '"Syne", sans-serif' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ↑ 0kb/s ↓ 0kb/s — Nothing leaves your device
      </motion.p>
    </motion.div>
  );
}

function DocumentViewer({
  documentContent,
  highlightedSection,
  scrollToSection,
  isVisible,
}: {
  documentContent: string;
  highlightedSection: string | null;
  scrollToSection: string | null;
  isVisible: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToSection && contentRef.current) {
      const sectionElement = contentRef.current.querySelector(
        `[data-section="${scrollToSection}"]`
      );
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [scrollToSection]);

  const lines = documentContent.split("\n");

  return (
    <motion.div
      className="flex h-full flex-[1.6] flex-col border-r border-white/5 bg-[#080808]"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs">📄</span>
          <span
            className="truncate text-[11px] text-white/70"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            Consulting_Agreement_Final.pdf
          </span>
        </div>
        <span className="rounded-full bg-[#ff6b35]/20 px-2 py-0.5 text-[9px] text-[#ff6b35]">
          Active ✓
        </span>
      </div>

      <div ref={contentRef} className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {lines.map((line, index) => {
            const isSection8_2 = line.includes("8.2") || line.includes("Early Termination");
            const isSection11_1 = line.includes("11.1") || line.includes("Liability Cap");
            const isSection8Content =
              highlightedSection === "8.2" &&
              (line.includes("thirty (30) days") ||
                line.includes("material breach") ||
                line.includes("sixty percent"));
            const isSection11Content =
              highlightedSection === "11.1" &&
              (line.includes("total fees paid") || line.includes("six (6) months"));

            const shouldHighlight = isSection8Content || isSection11Content;

            return (
              <motion.div
                key={index}
                data-section={isSection8_2 ? "8.2" : isSection11_1 ? "11.1" : undefined}
                className={`relative ${
                  line.startsWith("SECTION") || line.startsWith("CONSULTING")
                    ? "font-semibold text-white"
                    : ""
                } ${
                  line.match(/^\d+\.\d+\s/) || line.match(/^SECTION/)
                    ? "text-[#ff6b35]/80"
                    : "text-white/70"
                }`}
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: line.startsWith("CONSULTING") ? "14px" : "11px",
                  lineHeight: 1.6,
                }}
              >
                {shouldHighlight && (
                  <motion.div
                    className="absolute inset-0 -mx-2 rounded"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                      background: "rgba(255,184,77,0.25)",
                      transformOrigin: "left",
                    }}
                  />
                )}
                <span className="relative">{line || "\u00A0"}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/5 px-3 py-1.5 text-center">
        <span className="text-[9px] text-white/30">Page 1 of 8</span>
      </div>
    </motion.div>
  );
}

function ConversationPanel({
  messages,
  isProofMode,
  isTyping,
  typedText,
  inputFocused,
  messagesContainerRef,
  isVisible,
}: {
  messages: Message[];
  isProofMode: boolean;
  isTyping: boolean;
  typedText: string;
  inputFocused: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  isVisible: boolean;
}) {
  return (
    <motion.div
      className="flex h-full flex-1 flex-col transition-colors"
      style={{
        backgroundColor: isProofMode ? "rgba(255,107,53,0.03)" : "#0a0a0a",
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="border-b border-white/5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50">Proof Mode</span>
            <motion.div
              className={`h-4 w-8 rounded-full ${isProofMode ? "bg-[#ff6b35]" : "bg-white/20"}`}
            >
              <motion.div
                className="mt-0.5 h-3 w-3 rounded-full bg-white shadow"
                animate={{ x: isProofMode ? 18 : 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </motion.div>
          </div>
          <span className="text-[9px] text-white/40">1 active doc</span>
        </div>
        {isProofMode && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-[9px] text-[#ff6b35]/70"
            style={{ fontFamily: '"Syne", sans-serif' }}
          >
            Only referencing: 1 active document
          </motion.p>
        )}
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-3 ${message.role === "user" ? "text-right" : ""}`}
          >
            <div
              className={`inline-block max-w-[95%] rounded-xl px-3 py-2 ${
                message.role === "user"
                  ? "rounded-br-sm bg-[#ff6b35] text-white"
                  : "rounded-bl-sm bg-white/10 text-gray-200"
              }`}
              style={{ fontFamily: '"DM Sans", sans-serif', fontSize: "11px" }}
            >
              <span className="whitespace-pre-wrap">
                {message.content}
                {message.isStreaming && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="ml-0.5 text-[#ff6b35]"
                  >
                    ▋
                  </motion.span>
                )}
              </span>
            </div>
            {message.citation && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mt-1.5 inline-block rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/10 px-2 py-0.5 text-[9px] text-[#ff6b35]/80"
                style={{ fontFamily: '"Syne", sans-serif' }}
              >
                📄 {message.citation}
              </motion.div>
            )}
            {message.warning && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-left"
              >
                <p
                  className="text-[9px] font-medium text-amber-500/80"
                  style={{ fontFamily: '"DM Sans", sans-serif' }}
                >
                  ⚠ Partially covered
                </p>
                <p
                  className="mt-1 text-[10px] text-white/60"
                  style={{ fontFamily: '"DM Sans", sans-serif' }}
                >
                  {message.warning}
                </p>
              </motion.div>
            )}
          </motion.div>
        ))}

        {isTyping && typedText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 text-right"
          >
            <div className="inline-block max-w-[95%] rounded-xl rounded-br-sm bg-[#ff6b35] px-3 py-2 text-white">
              <span className="text-[11px]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                {typedText}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="ml-0.5"
                >
                  |
                </motion.span>
              </span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="border-t border-white/5 p-2">
        <motion.div
          className="rounded-lg border bg-white/5 px-3 py-2"
          animate={{
            borderColor: inputFocused ? "rgba(255,107,53,0.5)" : "rgba(255,255,255,0.1)",
          }}
        >
          <span className="text-[10px] text-white/30">Ask about your documents...</span>
        </motion.div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 px-3 py-1.5">
        <span className="text-[9px] text-white/30">↑ 0kb/s ↓ 0kb/s</span>
        <span className="text-[9px] text-green-500/60">● Local only</span>
      </div>
    </motion.div>
  );
}

export function DocumentVaultAnimation() {
  const [cursorState, setCursorState] = useState<CursorState>({
    x: 300,
    y: 200,
    scale: 1,
    isDragging: false,
  });

  const [phase, setPhase] = useState<"dropzone" | "workspace">("dropzone");
  const [isDropActive, setIsDropActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [dragFilePos, setDragFilePos] = useState({ x: -80, y: 180 });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isProofMode, setIsProofMode] = useState(false);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const [scrollToSection, setScrollToSection] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(false);

  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typedText, scrollToBottom]);

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
    (text: string, onChar: (char: string) => void, onComplete: () => void, speed = 50) => {
      let index = 0;
      const type = () => {
        if (index < text.length) {
          onChar(text[index]);
          index++;
          const delay = speed + Math.random() * 30 - 15;
          typingRef.current = setTimeout(type, delay);
        } else {
          onComplete();
        }
      };
      type();
    },
    []
  );

  const addMessage = useCallback(
    (role: "user" | "assistant", content: string, citation?: string, warning?: string) => {
      const id = `msg-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id, role, content, citation, warning, isStreaming: false },
      ]);
    },
    []
  );

  const runAnimation = useCallback(() => {
    setPhase("dropzone");
    setIsDropActive(false);
    setIsUploading(false);
    setUploadProgress(0);
    setIsDraggingFile(false);
    setDragFilePos({ x: -80, y: 180 });
    setMessages([]);
    setIsProofMode(false);
    setHighlightedSection(null);
    setScrollToSection(null);
    setIsTyping(false);
    setTypedText("");
    setInputFocused(false);
    setIsUiVisible(false);
    setCursorState({ x: 300, y: 200, scale: 1, isDragging: false });

    const executeScene = async () => {
      await new Promise((r) => (animationRef.current = setTimeout(r, 500)));
      setIsUiVisible(true);

      await new Promise((r) => (animationRef.current = setTimeout(r, 800)));
      moveCursor(20, 180);
      await new Promise((r) => (animationRef.current = setTimeout(r, 400)));

      setCursorState((prev) => ({ ...prev, isDragging: true }));
      setIsDraggingFile(true);

      for (let i = 0; i <= 100; i++) {
        await new Promise((r) => (animationRef.current = setTimeout(r, 10)));
        const progress = i / 100;
        setDragFilePos({
          x: -80 + progress * 380,
          y: 180 + Math.sin(progress * Math.PI) * -30,
        });
        setCursorState((prev) => ({
          ...prev,
          x: -60 + progress * 380,
          y: 180 + Math.sin(progress * Math.PI) * -30,
        }));

        if (i === 70) {
          setIsDropActive(true);
        }
      }

      setCursorState((prev) => ({ ...prev, isDragging: false }));
      setIsDraggingFile(false);
      setIsUploading(true);

      for (let i = 0; i <= 100; i++) {
        await new Promise((r) => (animationRef.current = setTimeout(r, 12)));
        setUploadProgress(i);
      }

      setIsUploading(false);
      setIsDropActive(false);
      await new Promise((r) => (animationRef.current = setTimeout(r, 300)));

      setPhase("workspace");
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));

      moveCursor(440, 350);
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));
      setInputFocused(true);
      await new Promise((r) => (animationRef.current = setTimeout(r, 200)));
      clickCursor();
      setIsTyping(true);

      await new Promise<void>((resolve) => {
        let text = "";
        typeText(
          TYPED_MESSAGE_1,
          (char) => {
            text += char;
            setTypedText(text);
            scrollToBottom();
          },
          () => {
            setIsTyping(false);
            setInputFocused(false);
            addMessage("user", TYPED_MESSAGE_1);
            setTypedText("");
            scrollToBottom();
            resolve();
          },
          40
        );
      });

      await new Promise((r) => (animationRef.current = setTimeout(r, 400)));

      setMessages((prev) => [
        ...prev,
        { id: "resp-1", role: "assistant", content: "", citation: CITATION_1, isStreaming: true },
      ]);
      scrollToBottom();
      setScrollToSection("8.2");

      await new Promise<void>((resolve) => {
        let text = "";
        typeText(
          LOKUL_RESPONSE_1,
          (char) => {
            text += char;
            setMessages((prev) =>
              prev.map((m) => (m.id === "resp-1" ? { ...m, content: text } : m))
            );
            scrollToBottom();
          },
          () => {
            setMessages((prev) =>
              prev.map((m) => (m.id === "resp-1" ? { ...m, isStreaming: false } : m))
            );
            setHighlightedSection("8.2");
            scrollToBottom();
            resolve();
          },
          18
        );
      });

      await new Promise((r) => (animationRef.current = setTimeout(r, 2000)));

      moveCursor(480, 18);
      await new Promise((r) => (animationRef.current = setTimeout(r, 700)));
      clickCursor();
      setIsProofMode(true);
      await new Promise((r) => (animationRef.current = setTimeout(r, 600)));

      moveCursor(440, 350);
      await new Promise((r) => (animationRef.current = setTimeout(r, 500)));
      setInputFocused(true);
      clickCursor();
      setIsTyping(true);

      await new Promise<void>((resolve) => {
        let text = "";
        typeText(
          TYPED_MESSAGE_2,
          (char) => {
            text += char;
            setTypedText(text);
            scrollToBottom();
          },
          () => {
            setIsTyping(false);
            setInputFocused(false);
            addMessage("user", TYPED_MESSAGE_2);
            setTypedText("");
            scrollToBottom();
            resolve();
          },
          50
        );
      });

      await new Promise((r) => (animationRef.current = setTimeout(r, 300)));

      setMessages((prev) => [
        ...prev,
        {
          id: "resp-2",
          role: "assistant",
          content: "",
          citation: CITATION_2,
          warning: WARNING_2,
          isStreaming: true,
        },
      ]);
      scrollToBottom();
      setScrollToSection("11.1");

      await new Promise<void>((resolve) => {
        let text = "";
        typeText(
          LOKUL_RESPONSE_2,
          (char) => {
            text += char;
            setMessages((prev) =>
              prev.map((m) => (m.id === "resp-2" ? { ...m, content: text } : m))
            );
            scrollToBottom();
          },
          () => {
            setMessages((prev) =>
              prev.map((m) => (m.id === "resp-2" ? { ...m, isStreaming: false } : m))
            );
            setHighlightedSection("11.1");
            scrollToBottom();
            resolve();
          },
          20
        );
      });

      await new Promise((r) => (animationRef.current = setTimeout(r, 2500)));

      setIsUiVisible(false);
      await new Promise((r) => (animationRef.current = setTimeout(r, 800)));
    };

    executeScene();
  }, [moveCursor, clickCursor, typeText, addMessage, scrollToBottom]);

  useEffect(() => {
    runAnimation();
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [runAnimation]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ maxWidth: "600px" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isUiVisible ? 1 : 0.3 }}
        transition={{ duration: 0.8 }}
        className="relative h-[400px] overflow-hidden bg-[#0a0a0a]"
      >
        <AnimatePresence mode="wait">
          {phase === "dropzone" ? (
            <DropZone
              key="dropzone"
              isActive={isDropActive}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          ) : (
            <motion.div
              key="workspace"
              className="flex h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DocumentViewer
                documentContent={DOCUMENT_CONTENT_1}
                highlightedSection={highlightedSection}
                scrollToSection={scrollToSection}
                isVisible={phase === "workspace"}
              />
              <ConversationPanel
                messages={messages}
                isProofMode={isProofMode}
                isTyping={isTyping}
                typedText={typedText}
                inputFocused={inputFocused}
                messagesContainerRef={messagesContainerRef}
                isVisible={phase === "workspace"}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isDraggingFile && (
            <motion.div
              className="pointer-events-none absolute z-40 flex items-center gap-2 rounded-lg border border-[#ff6b35]/40 bg-[#1a1a1a] px-3 py-2 shadow-lg"
              style={{ left: dragFilePos.x, top: dragFilePos.y }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <span className="text-sm">📄</span>
              <span
                className="text-[11px] text-white/90"
                style={{ fontFamily: '"DM Sans", sans-serif' }}
              >
                Consulting_Agreement_Final.pdf
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <GhostCursor state={cursorState} />
      </motion.div>
    </div>
  );
}
