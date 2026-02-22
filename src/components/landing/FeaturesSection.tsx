/**
 * FeaturesSection Component - Premium feature showcase with tabs
 *
 * Three features: Memory, Document Vault, Private & Offline
 */

import { motion, AnimatePresence, useInView } from "framer-motion";
import { FileText, Lock, Brain } from "lucide-react";
import { useRef, useState } from "react";
import { PrivacyAnimation } from "./PrivacyAnimation";
import { DocumentVaultAnimation } from "./DocumentVaultAnimation";

const blurInVariants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

const tabs = [
  {
    id: "memory",
    number: "01",
    title: "Memory",
    description: "Lokul learns and remembers you across every conversation.",
    icon: Brain,
  },
  {
    id: "documents",
    number: "02",
    title: "Document Vault",
    description: "Upload anything. Ask anything. Your documents, always available.",
    icon: FileText,
  },
  {
    id: "privacy",
    number: "03",
    title: "Private & Offline",
    description: "Nothing leaves your device. Safe for any institution, any person.",
    icon: Lock,
  },
];

function TabButton({
  tab,
  isActive,
  onClick,
}: {
  tab: (typeof tabs)[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full cursor-pointer py-6 pr-6 pl-10 text-left transition-all duration-300 ${
        isActive ? "bg-primary/5" : "hover:bg-white/[0.02]"
      }`}
    >
      <div
        className={`absolute top-0 left-0 h-full w-[3px] transition-all duration-300 ${
          isActive
            ? "bg-primary shadow-[0_0_20px_rgba(255,107,53,0.5),0_0_40px_rgba(255,107,53,0.3)]"
            : "bg-white/10 group-hover:bg-white/20"
        }`}
      />
      <span
        className={`mb-2 block text-[11px] font-medium tracking-wider transition-colors ${
          isActive ? "text-primary" : "text-white/30"
        }`}
        style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
      >
        {tab.number}
      </span>
      <h3
        className={`mb-2 text-lg font-semibold transition-colors ${
          isActive ? "text-white" : "text-[#5a5550]"
        }`}
        style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
      >
        {tab.title}
      </h3>
      <p
        className={`text-[13px] leading-relaxed transition-colors ${
          isActive ? "text-gray-400" : "text-[#5a5550]/80"
        }`}
        style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif', fontWeight: 300 }}
      >
        {tab.description}
      </p>
    </button>
  );
}

function MemoryPanel() {
  return (
    <div className="flex h-full flex-col">
      {/* Mockup */}
      <div className="mb-8 flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#111111]">
        <div className="flex h-full">
          {/* Chat */}
          <div className="flex-1 border-r border-white/10 p-4">
            <div className="mb-3 flex justify-end">
              <div className="bg-primary max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white">
                Can you help me prep for my presentation tomorrow?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <img src="/lokul-logo.png" alt="" className="mt-1 h-4 w-4" />
                <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-white/10 px-4 py-2.5 text-sm text-gray-200">
                  Of course — want me to lean into the data-heavy approach you prefer, or keep it
                  story-first this time?
                  <span className="bg-primary ml-1 inline-block h-4 w-2 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Memory Sidebar */}
          <div className="w-44 p-4">
            <p
              className="mb-3 text-[10px] font-medium tracking-wider text-white/40 uppercase"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              What Lokul knows
            </p>
            <div className="space-y-3 text-xs text-gray-400">
              <div>
                <span className="text-white/60">👤 You</span>
                <div className="mt-1 space-y-0.5 pl-1 text-[11px]">
                  <div>Name: Alex</div>
                  <div>Based in: Berlin</div>
                </div>
              </div>
              <div>
                <span className="text-white/60">💼 Work</span>
                <div className="mt-1 space-y-0.5 pl-1 text-[11px]">
                  <div>Product manager, Series B</div>
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-primary/20 text-primary rounded px-1"
                  >
                    Presenting to board tomorrow
                  </motion.div>
                </div>
              </div>
              <div>
                <span className="text-white/60">❤️ Preferences</span>
                <div className="mt-1 space-y-0.5 pl-1 text-[11px]">
                  <div>Data-first, then narrative</div>
                  <div>Bullet points over paragraphs</div>
                  <div>Concise — no filler</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <h4
          className="mb-4 text-2xl text-white"
          style={{
            fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
            fontStyle: "italic",
          }}
        >
          It remembers you.
          <br />
          Not just this session.
          <br />
          Every session.
        </h4>

        <p
          className="mb-6 leading-relaxed text-gray-400"
          style={{
            fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
            fontWeight: 300,
          }}
        >
          Most AI starts from zero every time you open it. Lokul carries your context forward — your
          name, your work, your preferences, your goals — automatically, privately, and always under
          your control.
        </p>

        <div className="mb-6 space-y-2 text-sm text-gray-300">
          {[
            "Learns from every conversation automatically",
            "You see exactly what it knows — no hidden profile",
            "Edit or delete any memory in one tap",
            "Shared across all your conversations, not just one",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="text-primary">✦</span>
              <span style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        <p
          className="text-sm text-white/30 italic"
          style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
        >
          Cloud AI stores what you tell it too. The difference is: you can&apos;t see theirs, you
          can&apos;t edit yours, and neither can you delete it.
        </p>
      </div>
    </div>
  );
}

function DocumentsPanel() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex-1 items-center justify-center overflow-hidden">
        <DocumentVaultAnimation />
      </div>

      <div>
        <h4
          className="mb-4 text-[26px] leading-tight text-white"
          style={{
            fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
            fontStyle: "italic",
          }}
        >
          Your documents.
          <br />
          Always there.
          <br />
          Always private.
          <br />
          Always sourced.
        </h4>

        <p
          className="mb-6 leading-relaxed text-gray-400"
          style={{
            fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
            fontWeight: 300,
          }}
        >
          Upload once. Ask forever. Every answer traceable to the exact page it came from — all on
          your device.
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            "Persistent vault",
            "Any file type",
            "Proof Mode",
            "Source citations",
            "Local only",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-[rgba(255,107,53,0.3)] bg-[rgba(255,107,53,0.1)] px-3 py-1.5 text-[11px] text-white/80"
              style={{ fontFamily: '"Syne", sans-serif' }}
            >
              ✓ {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrivacyPanel() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex-1 items-center justify-center overflow-hidden rounded-xl bg-[#060606]">
        <div className="flex h-full flex-col items-center justify-center p-6">
          <PrivacyAnimation />
        </div>
      </div>

      <div>
        <h4
          className="mb-4 text-[28px] leading-tight text-white"
          style={{
            fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
            fontStyle: "italic",
          }}
        >
          Works everywhere.
          <br />
          Tells no one.
        </h4>

        <p
          className="mb-6 leading-relaxed text-gray-400"
          style={{
            fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
            fontWeight: 300,
          }}
        >
          After the first download, Lokul needs nothing.
          <br />
          No signal. No server. No permission from anyone.
          <br />
          Your device is the only infrastructure it needs.
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            "Zero network requests",
            "Full offline after download",
            "Open source verified",
            "No account ever",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-[rgba(255,107,53,0.3)] bg-[rgba(255,107,53,0.1)] px-3 py-1.5 text-[11px] text-white/80"
              style={{ fontFamily: '"Syne", sans-serif' }}
            >
              ✓ {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const panelComponents = {
  memory: MemoryPanel,
  documents: DocumentsPanel,
  privacy: PrivacyPanel,
};

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState("memory");
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const ActivePanel = panelComponents[activeTab as keyof typeof panelComponents];

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#080808] py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/5 absolute top-1/3 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-primary/3 absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
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
            What Lokul Can Do
          </motion.p>

          <motion.h2
            variants={blurInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-[clamp(2rem,5vw,3rem)] leading-[1.15] text-white"
            style={{
              fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
              fontStyle: "italic",
            }}
          >
            More than a chat.
            <br />A private workspace.
          </motion.h2>
        </div>

        {/* Two Column Layout */}
        <motion.div
          variants={blurInVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col gap-8 lg:flex-row lg:gap-0"
        >
          {/* Left - Tabs */}
          <div className="w-full lg:w-[40%] lg:pr-8">
            <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-[#0c0c0c]">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>
            <p
              className="mt-6 text-center text-sm text-white/25 italic lg:text-left"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              All three work together.
              <br />
              All three stay on your machine.
            </p>
          </div>

          {/* Divider */}
          <div className="hidden w-px bg-white/[0.06] lg:block" />

          {/* Right - Content */}
          <div className="min-h-[600px] w-full lg:w-[60%] lg:pl-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ActivePanel />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
