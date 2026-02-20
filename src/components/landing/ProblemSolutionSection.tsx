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
            style={{ fontFamily: '"Syne", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            {title[0]}
          </span>
        )}
      </div>
      <p
        className="text-center text-[11px] tracking-[0.08em] text-[#a59f98] uppercase"
        style={{ fontFamily: '"Syne", "Avenir Next", "Segoe UI", sans-serif' }}
      >
        {title}
      </p>
    </div>
  );
});

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
      <div className="relative mx-auto grid w-full max-w-[1240px] gap-14 px-4 sm:px-6 lg:grid-cols-[55%_45%] lg:gap-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <p
            className="mb-8 text-[11px] tracking-[0.18em] text-[#FF6B35] uppercase"
            style={{ fontFamily: '"Syne", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            The Problem
          </p>

          <h2
            className="max-w-[560px] text-[clamp(2rem,4vw,2.625rem)] leading-[1.3] text-[#f2ede8]"
            style={{
              fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
              fontStyle: "italic",
            }}
          >
            Every conversation you&apos;ve
            <br />
            ever had with AI -
            <br />
            someone else has read it.
          </h2>

          <p
            className="mt-8 max-w-[380px] text-[17px] leading-[1.7] text-[#b9b3ae]"
            style={{
              fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
              fontWeight: 300,
            }}
          >
            ChatGPT, Claude, Gemini - every word you type travels to a server, gets processed by a
            company, potentially stored, potentially used. Your medical questions. Your business
            ideas. Your private struggles.
            <br />
            <br />
            They say they protect your data.
            <br />
            <span className="text-[#d7d1cc]">They just can&apos;t prove it.</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
          className="self-center"
        >
          <div
            ref={beamContainerRef}
            className="relative h-[360px] overflow-hidden rounded-2xl border border-white/8 bg-[#111111] p-10"
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
              curvature={8}
              duration={8}
              delay={0.35}
              pathColor="rgba(255,255,255,0.18)"
              gradientStartColor="#ffb997"
              gradientStopColor="#ff6b35"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
