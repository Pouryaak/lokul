"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

type AnimationDirection = "loop" | "vloop";

interface LogoItem {
  icon: React.ReactNode;
  label: string;
}

interface LogoStepperProps {
  logos: LogoItem[];
  animationDuration?: number;
  animationDelay?: number;
  direction?: AnimationDirection;
  visibleCount?: number;
}

export const LogoStepper: React.FC<LogoStepperProps> = ({
  logos,
  animationDuration = 0.6,
  animationDelay = 1.2,
  direction = "loop",
  visibleCount = 5,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logos.length);
    }, animationDelay * 1000);

    return () => clearInterval(interval);
  }, [logos.length, animationDelay]);

  const getVisibleLogos = () => {
    const visible = [];
    const offset = Math.floor(visibleCount / 2);

    for (let i = -offset; i <= offset; i++) {
      const index = (currentIndex + i + logos.length) % logos.length;
      visible.push({
        logo: logos[index],
        originalIndex: index,
        position: i,
      });
    }

    return visible;
  };

  const visibleLogos = getVisibleLogos();

  return (
    <div className="relative flex w-full items-start justify-center overflow-hidden py-4">
      <div className="flex items-start justify-center gap-6" style={{ width: "fit-content" }}>
        <AnimatePresence initial={false} mode="popLayout">
          {visibleLogos.map(({ logo, originalIndex, position }) => {
            let lineOpacity = 0;
            if (position === 0) lineOpacity = 1;
            else if (position === -1) lineOpacity = 0.3;
            else if (position === 1) lineOpacity = 0.3;

            const isActive = position === 0;

            return (
              <motion.div
                key={originalIndex}
                layout="position"
                initial={{
                  x: direction === "loop" ? 120 : -120,
                  opacity: 0,
                  scale: 0.7,
                }}
                animate={{
                  x: 0,
                  opacity: position === 0 ? 1 : 0.4,
                  scale: position === 0 ? 1 : 0.75,
                }}
                exit={{
                  x: direction === "loop" ? -120 : 120,
                  opacity: 0,
                  scale: 0.7,
                }}
                transition={{
                  duration: animationDuration,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="flex min-h-50 w-24 shrink-0 flex-col items-center"
              >
                <motion.div
                  className={`rounded-xl border p-4 transition-colors ${
                    isActive
                      ? "border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(255,107,53,0.2)]"
                      : "border-white/10 bg-[#111111]"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center">{logo.icon}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: lineOpacity }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: animationDuration,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="mt-4 flex h-28 flex-col items-center"
                >
                  <div
                    className={`mb-4 h-16 w-0.5 ${isActive ? "bg-primary/60" : "bg-white/20"}`}
                  />
                  <span
                    className={`text-xs font-medium tracking-wider whitespace-nowrap ${
                      isActive ? "text-primary" : "text-[#a59f98]"
                    }`}
                    style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
                  >
                    {logo.label}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
