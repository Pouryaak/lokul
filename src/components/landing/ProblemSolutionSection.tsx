import { motion, useInView } from "framer-motion";
import { Server, User } from "lucide-react";
import { forwardRef, useRef } from "react";

import { AnimatedBeam } from "@/components/ui/animated-beam";

interface NodeProps {
  title: string;
  tone?: "neutral" | "alert" | "safe";
  icon?: React.ReactNode;
}

const Node = forwardRef<HTMLDivElement, NodeProps>(function Node(
  { title, tone = "neutral", icon },
  ref
) {
  const toneClass =
    tone === "safe"
      ? "border-[#FF6B35]/60 bg-[#FF6B35]/15 text-[#ffd9c7] shadow-[0_0_28px_rgba(0,0,0,0.35),0_0_20px_rgba(255,107,53,0.4)]"
      : tone === "alert"
        ? "border-white/20 bg-white/5 text-[#d7d1cc] shadow-[0_0_28px_rgba(0,0,0,0.35)]"
        : "border-white/16 bg-[#151515] text-[#e9e4df] shadow-[0_0_28px_rgba(0,0,0,0.35)]";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={ref}
        className={`z-20 flex h-16 w-16 items-center justify-center rounded-full border-2 ${toneClass}`}
      >
        {icon || (
          <span
            className="text-[11px] uppercase"
            style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            {title[0]}
          </span>
        )}
      </div>
      <p
        className="text-center text-[11px] tracking-[0.08em] text-[#a59f98] uppercase"
        style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
      >
        {title}
      </p>
    </div>
  );
});

const blurInVariants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

export function ProblemSolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const beamContainerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const middleTopRef = useRef<HTMLDivElement>(null);
  const middleBottomRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const isInView = useInView(sectionRef, { once: true, amount: 0.35 });

  return (
    <section
      id="problem-solution"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0f0f0f] py-24 md:py-32"
    >
      <div className="relative mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[32%_36%_32%] lg:gap-4">
          {/* LEFT COLUMN - The Problem */}
          <div className="flex flex-col items-center justify-center text-center">
            <motion.p
              variants={blurInVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-6 text-[11px] tracking-[0.18em] text-[#FF6B35] uppercase"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              The Problem
            </motion.p>

            <motion.h2
              variants={blurInVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-[38px] leading-[1.2] text-[#f2ede8]"
              style={{
                fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
                fontStyle: "italic",
              }}
            >
              Every conversation
              <br />
              you&apos;ve ever had
              <br />
              with AI — someone
              <br />
              else has read it.
            </motion.h2>

            <motion.p
              variants={blurInVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="mt-8 text-[15px] leading-[1.8] text-[#b9b3ae]"
              style={{
                fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
                fontWeight: 300,
              }}
            >
              ChatGPT, Claude, Gemini —
              <br />
              every word you type travels
              <br />
              to a server, gets processed
              <br />
              by a company, potentially
              <br />
              stored, potentially used.
              <br />
              <br />
              Your medical questions.
              <br />
              Your business ideas.
              <br />
              Your private struggles.
              <br />
              <br />
              <span className="text-[#d7d1cc]">They say they protect</span>
              <br />
              <span className="text-[#d7d1cc]">your data.</span>
              <br />
              <br />
              <span className="font-normal text-[#e9e4df]">They just can&apos;t prove it.</span>
            </motion.p>
          </div>

          {/* CENTER COLUMN - The Animated Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <div
              ref={beamContainerRef}
              className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-white/8 bg-[#111111] p-10"
            >
              <div className="flex h-full items-center justify-between gap-10">
                <div className="flex h-full flex-col justify-center">
                  <Node
                    ref={leftRef}
                    title="You"
                    tone="neutral"
                    icon={<User className="h-7 w-7" />}
                  />
                </div>

                <div className="flex h-full flex-col items-center justify-center gap-24">
                  <Node
                    ref={middleTopRef}
                    title="ChatGPT"
                    tone="alert"
                    icon={<img src="/ChatGPT-Logo.webp" alt="ChatGPT" className="h-9 w-9" />}
                  />
                  <Node
                    ref={middleBottomRef}
                    title="Lokul"
                    tone="safe"
                    icon={<img src="/lokul-logo.png" alt="Lokul" className="h-10 w-10" />}
                  />
                </div>

                <div className="flex h-full flex-col justify-center">
                  <Node
                    ref={rightRef}
                    title="Server"
                    tone="alert"
                    icon={<Server className="h-7 w-7" />}
                  />
                </div>
              </div>

              <AnimatedBeam
                containerRef={beamContainerRef}
                fromRef={leftRef}
                toRef={middleTopRef}
                curvature={10}
                duration={8}
                pathColor="rgba(255,255,255,0.18)"
                gradientStartColor="#ffd9c7"
                gradientStopColor="#ff6b35"
              />
              <AnimatedBeam
                containerRef={beamContainerRef}
                fromRef={leftRef}
                toRef={middleBottomRef}
                curvature={-10}
                duration={8}
                delay={0.2}
                pathColor="rgba(255,255,255,0.18)"
                gradientStartColor="#ffd9c7"
                gradientStopColor="#ff6b35"
              />
              <AnimatedBeam
                containerRef={beamContainerRef}
                fromRef={middleTopRef}
                toRef={rightRef}
                curvature={10}
                duration={8}
                delay={0.35}
                pathColor="rgba(255,255,255,0.18)"
                gradientStartColor="#ffb997"
                gradientStopColor="#ff6b35"
              />
            </div>
          </motion.div>

          {/* RIGHT COLUMN - The Resolution */}
          <div className="flex flex-col items-center justify-center text-center">
            <motion.p
              variants={blurInVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="mb-6 text-[11px] tracking-[0.18em] text-[#7dd3a0] uppercase"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              The Difference
            </motion.p>

            <motion.h2
              variants={blurInVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
              className="text-[38px] leading-[1.2] text-[#f2ede8]"
              style={{
                fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
                fontStyle: "italic",
              }}
            >
              Lokul never
              <br />
              meets a server.
              <br />
              Not once.
            </motion.h2>

            <motion.p
              variants={blurInVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
              className="mt-8 text-[15px] leading-[1.8] text-[#b9b3ae]"
              style={{
                fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
                fontWeight: 300,
              }}
            >
              The AI model downloads
              <br />
              directly to your device.
              <br />
              It runs on your GPU.
              <br />
              <br />
              When you type, nothing
              <br />
              travels anywhere. There&apos;s
              <br />
              no request to intercept,
              <br />
              no data to steal, no company
              <br />
              with access to subpoena.
              <br />
              <br />
              <span className="text-[17px] font-normal text-[#e9e4df]">
                We don&apos;t protect your data.
              </span>
              <br />
              <br />
              <span className="text-[17px] font-normal text-[#f2ede8]">
                We never have it
                <br />
                in the first place.
              </span>
            </motion.p>
          </div>
        </div>

        {/* SECTION FOOTER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.45, ease: "easeOut" }}
          className="mt-16 flex flex-col items-center"
        >
          <div className="mb-6 h-px w-full max-w-[800px] bg-white/10" />
          <motion.p
            variants={blurInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
            className="text-center text-[13px] leading-[1.8] text-[#a59f98]"
            style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            The only way someone could read your Lokul conversations
            <br className="hidden sm:block" />
            is if they physically had your device in their hands.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
