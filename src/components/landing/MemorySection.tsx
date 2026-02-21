/**
 * MemorySection Component - Cinematic memory feature showcase
 *
 * Shows the difference between AI with and without memory,
 * plus transparency controls.
 */

import { motion, useInView } from "framer-motion";
import { Eye, Minus, Pencil, Square, Trash2, X } from "lucide-react";
import { useRef } from "react";

const blurInVariants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

function BrowserWindow({
  children,
  variant = "default",
  title,
}: {
  children: React.ReactNode;
  variant?: "default" | "highlight";
  title: string;
}) {
  return (
    <div
      className={`h-full overflow-hidden rounded-2xl border ${
        variant === "highlight" ? "border-primary/30 bg-[#111111]" : "border-white/10 bg-[#111111]"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#181818] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57]/80">
            <X className="h-2 w-2 text-[#ff5f57]" />
          </div>
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e]/80">
            <Minus className="h-2 w-2 text-[#febc2e]" />
          </div>
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840]/80">
            <Square className="h-1.5 w-1.5 text-[#28c840]" />
          </div>
        </div>
        <div className="mx-auto flex-1 text-center">
          <span
            className="rounded-md bg-[#0f0f0f] px-4 py-1 text-xs text-gray-400"
            style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            {title}
          </span>
        </div>
        <div className="w-[52px]" />
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ChatBubble({ children, isUser = false }: { children: React.ReactNode; isUser?: boolean }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser ? "bg-primary rounded-br-md text-white" : "rounded-bl-md bg-white/10 text-gray-200"
        }`}
        style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
      >
        {children}
      </div>
    </div>
  );
}

function ConversationDivider() {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      <span
        className="text-[10px] tracking-wider text-white/30 uppercase"
        style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
      >
        New conversation
      </span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function WithoutMemoryCard() {
  return (
    <BrowserWindow title="chat.example.com" variant="default">
      <div className="relative">
        <div className="absolute -inset-4 rounded-xl bg-red-500/5" />
        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-400/60" />
            <span
              className="text-xs font-medium tracking-wider text-red-400/80 uppercase"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              Without Memory
            </span>
          </div>

          <ChatBubble isUser>Can you help me with my React project?</ChatBubble>
          <ChatBubble>Of course! What are you building?</ChatBubble>

          <ConversationDivider />

          <ChatBubble isUser>Help me debug this</ChatBubble>
          <ChatBubble>Sure! What language are you working in?</ChatBubble>

          <ConversationDivider />

          <ChatBubble isUser>I need help writing for my startup</ChatBubble>
          <ChatBubble>Happy to help! What does your startup do?</ChatBubble>

          <p
            className="mt-6 text-center text-sm text-white/40 italic"
            style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            Every conversation.
            <br />
            Starting from zero.
            <br />
            Every time.
          </p>
        </div>
      </div>
    </BrowserWindow>
  );
}

function WithMemoryCard() {
  return (
    <BrowserWindow title="lokul.app" variant="highlight">
      <div className="relative">
        <div className="bg-primary/5 absolute -inset-4 rounded-xl" />
        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <div className="bg-primary h-2 w-2 rounded-full" />
            <span
              className="text-primary text-xs font-medium tracking-wider uppercase"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              With Lokul
            </span>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <ChatBubble isUser>Help me debug this</ChatBubble>
              <div className="mb-3 flex justify-start">
                <div className="flex items-start gap-2">
                  <img src="/lokul-logo.png" alt="" className="mt-1 h-4 w-4" />
                  <div
                    className="bg-primary/10 max-w-[85%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-gray-200"
                    style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
                  >
                    On your React app? What&apos;s happening — is it the TypeScript issue you
                    mentioned last time or something new?
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden w-40 shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 lg:block">
              <p
                className="mb-3 text-[10px] font-medium tracking-wider text-white/50 uppercase"
                style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
              >
                What Lokul knows
              </p>
              <div className="space-y-2.5 text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span>💼</span>
                  <span style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}>
                    Building a React app
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span>⚡</span>
                  <span style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}>
                    Prefers TypeScript
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span>🚀</span>
                  <span style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}>
                    Runs a startup
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✨</span>
                  <span style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}>
                    Likes concise answers
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p
            className="text-primary/70 mt-6 text-center text-sm italic"
            style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            It already knows.
            <br />
            You never repeat yourself.
          </p>
        </div>
      </div>
    </BrowserWindow>
  );
}

function TransparencyFeature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="bg-primary/10 mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full">
        <Icon className="text-primary h-5 w-5" />
      </div>
      <h4
        className="mb-2 text-base font-semibold text-white"
        style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
      >
        {title}
      </h4>
      <p
        className="text-sm leading-relaxed text-gray-400"
        style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
      >
        {description}
      </p>
    </div>
  );
}

export function MemorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      id="memory"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#050505] py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/5 absolute top-1/3 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-primary/3 absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.p
            variants={blurInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-primary mb-6 text-[11px] tracking-[0.18em] uppercase"
            style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            Lokul Remembers You
          </motion.p>

          <motion.h2
            variants={blurInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mb-6 text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.15] text-white"
            style={{
              fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
              fontStyle: "italic",
            }}
          >
            The AI that actually
            <br />
            knows who you are.
          </motion.h2>

          <motion.p
            variants={blurInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="mx-auto max-w-[560px] text-lg text-gray-400"
            style={{
              fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
              fontWeight: 300,
            }}
          >
            Most AI forgets you the moment you close the tab. Lokul doesn&apos;t. It quietly learns
            about you as you chat — and carries that knowledge into every conversation after.
          </motion.p>
        </div>

        {/* Two Column Comparison */}
        <motion.div
          variants={blurInVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mb-16 grid gap-8 lg:grid-cols-2"
        >
          <WithoutMemoryCard />
          <WithMemoryCard />
        </motion.div>

        {/* Transparency Block */}
        <motion.div
          variants={blurInVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="border-l-primary rounded-2xl border-t border-r border-b border-l-4 border-white/10 bg-[#111111] p-8"
        >
          <h3
            className="mb-8 text-center text-xl font-semibold text-white"
            style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            You see everything. You control everything.
          </h3>

          <div className="mb-8 grid gap-8 md:grid-cols-3">
            <TransparencyFeature
              icon={Eye}
              title="Read it"
              description="Open the memory panel anytime. See every single thing Lokul has learned about you. No hidden profile. No invisible inferences."
            />
            <TransparencyFeature
              icon={Pencil}
              title="Edit it"
              description="Something wrong or outdated? Change it in one tap. Lokul updates immediately. You're always the source of truth."
            />
            <TransparencyFeature
              icon={Trash2}
              title="Delete it"
              description="Don't want Lokul to know something anymore? Remove it. It's gone. Not archived, not soft-deleted. Gone."
            />
          </div>

          <motion.p
            variants={blurInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            className="mx-auto max-w-[700px] text-center text-base text-gray-400 italic"
            style={{
              fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
            }}
          >
            Cloud AI companies store what they know about you because it makes their product better
            for them. Lokul stores what you tell it because it makes the product better for you.{" "}
            <span className="text-primary">You own the difference.</span>
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
