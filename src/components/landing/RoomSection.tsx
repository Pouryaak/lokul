"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function TextAnimate({
  children,
  highlightWords = [],
}: {
  children: string;
  highlightWords?: string[];
}) {
  const words = children.split(/(\s+)/);

  return (
    <span>
      {words.map((word, index) => {
        const cleanWord = word.replace(/[.,!?]/g, "");
        const shouldHighlight = highlightWords.includes(cleanWord);
        return (
          <span key={index} className={shouldHighlight ? "text-[#ff6b35]" : ""}>
            {word}
          </span>
        );
      })}
    </span>
  );
}

export function RoomSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Darkness only appears when text needs to be readable
  // Room is natural light when images are appearing/settling

  // First text: "Every AI lives somewhere."
  // Room darkens for text
  const firstTextOpacity = useTransform(scrollYProgress, [0.02, 0.06, 0.1, 0.14], [0, 1, 1, 0]);
  const firstDarkness = useTransform(scrollYProgress, [0.02, 0.06, 0.1, 0.14], [0, 0.6, 0.6, 0]);

  // Robots appear/disappear with fade (room natural light)
  const robotsOpacity = useTransform(scrollYProgress, [0.18, 0.26, 0.62, 0.7], [0, 1, 1, 0]);

  // Second text: ChatGPT, Claude, Gemini...
  // Room darkens for text
  const secondTextOpacity = useTransform(scrollYProgress, [0.4, 0.46, 0.54, 0.6], [0, 1, 1, 0]);
  const secondDarkness = useTransform(scrollYProgress, [0.4, 0.46, 0.54, 0.6], [0, 0.7, 0.7, 0]);

  // Lokul appears and stays (room natural light)
  const lokulOpacity = useTransform(scrollYProgress, [0.65, 0.73], [0, 1]);

  // Third text: Lokul lives here...
  // Room darkens for text
  const thirdTextOpacity = useTransform(scrollYProgress, [0.82, 0.87, 0.92, 0.96], [0, 1, 1, 0]);
  const thirdDarkness = useTransform(scrollYProgress, [0.82, 0.87, 0.92, 0.96], [0, 0.65, 0.65, 0]);

  return (
    <section ref={containerRef} className="relative h-[600vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background room image - always visible at natural light */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/Lokul-room.jpeg')",
          }}
        />

        {/* Darkness overlay for first text */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: firstDarkness }}
        />

        {/* Darkness overlay for second text */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: secondDarkness }}
        />

        {/* Darkness overlay for third text */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: thirdDarkness }}
        />

        {/* First text: "Every AI lives somewhere." */}
        <div className="relative flex h-full w-full items-center justify-center">
          <motion.p
            className="text-center text-[clamp(32px,6vw,56px)] text-white"
            style={{
              fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
              fontStyle: "italic",
              opacity: firstTextOpacity,
            }}
          >
            Every AI lives somewhere.
          </motion.p>
        </div>

        {/* Robots - 3x size, left side - fade in/out */}
        <motion.div
          className="absolute bottom-[0%] -left-45 w-full max-w-[1200px]"
          style={{
            opacity: robotsOpacity,
          }}
        >
          <img src="/robots.png" alt="AI Robots" className="h-auto w-full object-contain" />
        </motion.div>

        {/* Second text: ChatGPT, Claude, Gemini... - right side, center-aligned text */}
        <motion.div
          className="absolute inset-0 flex items-center justify-end pr-[10%]"
          style={{ opacity: secondTextOpacity }}
        >
          <div className="max-w-xl text-center">
            {/* Header in Instrument Serif */}
            <p
              className="text-[clamp(28px,5vw,44px)] leading-snug text-white"
              style={{
                fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
                fontStyle: "italic",
              }}
            >
              <TextAnimate highlightWords={["ChatGPT.", "Claude.", "Gemini."]}>
                ChatGPT. Claude. Gemini.
              </TextAnimate>
              <br />
              <span className="text-[clamp(22px,3.5vw,34px)] text-white/90">
                Brilliant. Tangled. Always watching.
              </span>
            </p>

            {/* Body in DM Sans */}
            <p
              className="mt-6 text-[clamp(16px,2.2vw,20px)] leading-relaxed text-white/80"
              style={{
                fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
              }}
            >
              Every word you type travels to{" "}
              <TextAnimate highlightWords={["servers"]}>their servers.</TextAnimate>
              <br />
              Gets processed. Gets stored.
              <br />
              <TextAnimate highlightWords={["used"]}>Sometimes gets used.</TextAnimate>
            </p>

            <p
              className="mt-6 text-[clamp(14px,1.8vw,18px)] text-white/60"
              style={{
                fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
              }}
            >
              They can&apos;t help it.
              <br />
              That&apos;s just where they live.
            </p>
          </div>
        </motion.div>

        {/* Lokul - 3x size, right side - fade in/out */}
        <motion.div
          className="absolute right-0 bottom-[0%] w-full max-w-[1200px]"
          style={{
            opacity: lokulOpacity,
          }}
        >
          <img src="/lokul-chill.png" alt="Lokul" className="h-auto w-full object-contain" />
        </motion.div>

        {/* Third text: Lokul lives here... */}
        <motion.div
          className="absolute top-[15%] right-[10%] max-w-lg text-right"
          style={{ opacity: thirdTextOpacity }}
        >
          {/* Header in Instrument Serif */}
          <p
            className="text-[clamp(26px,5vw,42px)] leading-tight text-white"
            style={{
              fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
              fontStyle: "italic",
            }}
          >
            <TextAnimate highlightWords={["Lokul"]}>Lokul lives here.</TextAnimate>
          </p>

          {/* Body in DM Sans */}
          <p
            className="mt-4 text-[clamp(18px,3vw,26px)] text-white/80"
            style={{
              fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
            }}
          >
            On <TextAnimate highlightWords={["device"]}>your device.</TextAnimate> In your browser.
            <br />
            <span className="text-[#ff6b35]">Nowhere else.</span>
          </p>

          <motion.div className="mt-10" style={{ opacity: thirdTextOpacity }}>
            <p
              className="text-[clamp(18px,2.5vw,24px)] text-white/70"
              style={{
                fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
              }}
            >
              Nothing you say
              <br />
              <TextAnimate highlightWords={["ever"]}>ever leaves this room.</TextAnimate>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
