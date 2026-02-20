/**
 * Nav Component - Fixed navigation with scroll-aware glass effect
 *
 * Features animated spark logo, smooth scroll links, and pill CTA.
 */

import { Button } from "@/components/ui/Button";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface NavProps {
  onStart: () => void;
}

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Your Privacy", href: "#technical-trust" },
  { label: "GitHub", href: "https://github.com/pouryaak/lokul", external: true },
];

export function Nav({ onStart }: NavProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();

  // Transform scroll position to background opacity
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const backdropBlur = useTransform(scrollY, [0, 80], [0, 12]);

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLinkClick = (link: (typeof navLinks)[0]) => {
    if (link.external) {
      window.open(link.href, "_blank");
    } else if (link.href.startsWith("#")) {
      const element = document.getElementById(link.href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: isLoaded ? 0 : -40, opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 right-0 left-0 z-50"
    >
      {/* Background layer with scroll-aware glass effect */}
      <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 bg-[#050505]/85" />
      <motion.div
        style={{ backdropFilter: useTransform(backdropBlur, (v) => `blur(${v}px)`) }}
        className="absolute inset-0"
      />

      {/* Nav content */}
      <nav className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo with animated spark */}
          <motion.a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group flex cursor-pointer items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Logo with subtle pulse */}
            <motion.div
              className="relative flex h-7 w-7 items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Glow effect behind logo */}
              <motion.div
                className="absolute inset-0 rounded-full bg-[#FF6B35]/20"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <img
                src="/lokul-logo.png"
                alt="Lokul"
                className="relative h-15 w-15 object-contain"
              />
            </motion.div>

            {/* Wordmark */}
            <span
              className={`text-lg font-semibold transition-colors duration-300 ${"text-white"}`}
            >
              Lokul
            </span>
          </motion.a>

          {/* Right: Links + CTA */}
          <div className="flex items-center gap-6">
            {/* Navigation links */}
            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <motion.button
                  key={link.label}
                  onClick={() => handleLinkClick(link)}
                  className="relative cursor-pointer text-sm text-gray-400 transition-colors duration-300 hover:text-[#FF6B35]"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {link.label}
                  {/* Underline animation */}
                  <motion.span
                    className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#FF6B35]"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              ))}
            </div>

            {/* CTA Button - Same as HeroSection */}
            <Button variant="cta" size="sm" onClick={onStart}>
              <Sparkles className="mr-1.5 h-4 w-4 transition-transform group-hover:rotate-12" />
              Try Lokul Free
            </Button>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
