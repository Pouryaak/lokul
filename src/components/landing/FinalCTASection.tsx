/**
 * FinalCTASection Component - Cinematic story-telling finale
 *
 * A powerful narrative journey from surveillance to freedom.
 * Scroll-triggered reveals create an immersive transformation story.
 */

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Shield, Lock, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

const storyBeats = [
  {
    icon: EyeOff,
    title: "You were never the customer.",
    subtitle: "You were the product.",
    description: "Every word you typed. Every thought you shared. Trained into someone else's AI.",
    theme: "dark",
  },
  {
    icon: Shield,
    title: "But what if...",
    subtitle: "Your privacy was real?",
    description:
      "No data centers. No tracking. No subscription. Just you and your AI, alone together.",
    theme: "light",
  },
  {
    icon: Lock,
    title: "This is Lokul.",
    subtitle: "AI that respects you.",
    description: "The future of AI isn't cloud computing. It's right here, on your device.",
    theme: "cta",
  },
];

function StoryBeat({
  beat,
  index,
  isVisible,
}: {
  beat: (typeof storyBeats)[0];
  index: number;
  isVisible: boolean;
}) {
  const Icon = beat.icon;
  const isDark = beat.theme === "dark";
  const isCTA = beat.theme === "cta";

  return (
    <div
      className={`relative transition-all duration-1000 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 400}ms` }}
    >
      <div
        className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-500 md:p-12 ${
          isDark
            ? "bg-[#1A1A1A] text-white"
            : isCTA
              ? "bg-gradient-to-br from-[#FF6B35] to-[#FFB84D] text-white shadow-[0_20px_60px_rgba(255,107,53,0.4)]"
              : "bg-[#111111] text-white shadow-[0_8px_40px_rgba(0,0,0,0.25)]"
        }`}
      >
        <div
          className={`pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl ${
            isDark ? "bg-[#FF6B35]/10" : isCTA ? "bg-white/20" : "bg-[#FF6B35]/5"
          }`}
        />

        <div
          className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
            isDark
              ? "bg-[#FF6B35]/20 text-[#FF6B35]"
              : isCTA
                ? "bg-white/20 text-white"
                : "bg-[#FF6B35]/10 text-[#FF6B35]"
          }`}
        >
          <Icon className="h-7 w-7" />
        </div>

        <div className="relative">
          <p
            className={`mb-2 text-sm font-semibold tracking-wider uppercase ${
              isDark ? "text-[#FF6B35]" : isCTA ? "text-white/80" : "text-[#FF6B35]"
            }`}
            style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            {beat.subtitle}
          </p>
          <h3
            className="mb-4 text-2xl text-white md:text-3xl"
            style={{
              fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
              fontStyle: "italic",
            }}
          >
            {beat.title}
          </h3>
          <p
            className={`text-lg leading-relaxed ${
              isDark ? "text-gray-400" : isCTA ? "text-white/90" : "text-gray-300"
            }`}
            style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            {beat.description}
          </p>
        </div>

        {isCTA && (
          <div className="absolute right-0 bottom-0 left-0 h-1 bg-white/20">
            <div className="h-full animate-pulse bg-white" style={{ width: "60%" }} />
          </div>
        )}
      </div>
    </div>
  );
}

export interface FinalCTASectionProps {
  onStart: () => void;
}

export function FinalCTASection({ onStart }: FinalCTASectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => setShowCTA(true), 1500);
        }
      },
      { threshold: 0.15, rootMargin: "-100px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="final-cta"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#050505] py-16 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#FF6B35]/5 blur-[120px]" />
      </div>

      <div className="content-container relative">
        <div
          className={`mb-16 text-center transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 bg-[#111111] px-4 py-2 shadow-sm">
            <Sparkles className="h-4 w-4 text-[#FF6B35]" />
            <span
              className="text-sm font-medium text-[#FF6B35]"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              The Choice Is Yours
            </span>
          </div>

          <h2
            className="mb-4 text-4xl md:text-5xl lg:text-6xl"
            style={{
              fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
              fontStyle: "italic",
            }}
          >
            <span className="text-white">A Story in </span>
            <span className="relative">
              <span className="relative z-10 text-white">Three Acts</span>
              <span className="absolute right-0 bottom-1 left-0 h-3 bg-[#FF6B35]/20" />
            </span>
          </h2>
        </div>

        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {storyBeats.map((beat, index) => (
            <StoryBeat key={index} beat={beat} index={index} isVisible={isVisible} />
          ))}
        </div>

        <div
          className={`transition-all duration-1000 ${
            showCTA ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0"
          }`}
        >
          <div className="relative overflow-hidden rounded-3xl bg-[#1A1A1A] p-8 text-center md:p-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-1/2 left-1/4 h-96 w-96 -translate-y-1/2 rounded-full bg-[#FF6B35]/20 blur-[100px]" />
              <div className="absolute top-1/2 right-1/4 h-96 w-96 -translate-y-1/2 rounded-full bg-[#FFB84D]/10 blur-[100px]" />
            </div>

            <div className="relative">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-[#FF6B35]/30 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB84D] shadow-[0_8px_30px_rgba(255,107,53,0.5)]">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <h3
                className="mb-4 text-3xl md:text-4xl lg:text-5xl"
                style={{
                  fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
                  fontStyle: "italic",
                }}
              >
                <span className="text-white">Ready to Take Control?</span>
              </h3>

              <p
                className="mx-auto mb-8 max-w-xl text-lg text-gray-400"
                style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
              >
                Join thousands who've already made the switch. Your data. Your device. Your AI.
              </p>

              <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button
                  variant="cta"
                  size="2xl"
                  onClick={onStart}
                  className="group min-w-[280px] shadow-[0_8px_40px_rgba(255,107,53,0.4)]"
                >
                  Start Chatting - Free
                  <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>

              <div
                className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
                style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
              >
                <span className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  No email required
                </span>
                <span className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  No credit card
                </span>
                <span className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  30 second setup
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`mt-12 text-center transition-all duration-1000 ${
            showCTA ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <p
            className="text-gray-400 italic"
            style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            "The best time to take back your privacy was yesterday."
            <br />
            <span className="text-[#FF6B35]">The second best time is now.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
