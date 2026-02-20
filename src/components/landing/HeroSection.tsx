import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useState } from "react";

export interface HeroSectionProps {
  onStart: () => void;
}

const proofItems = ["Open source", "Verified private", "No account required", "Works offline"];
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function HeroSection({ onStart }: HeroSectionProps) {
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#050505] px-4 py-16 md:py-20">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.62) 45%, rgba(5,5,5,0.52) 100%), url('/hero_bg.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1220px] items-center gap-10 lg:grid-cols-[55%_45%] lg:gap-2">
        <div>
          <motion.div
            className="mb-7 inline-flex rounded-full bg-[#FF6B35] px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-white uppercase"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.45, ease: "easeOut" }}
            style={{ fontFamily: '"Syne", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            ⚡ WORKS IN YOUR BROWSER · ZERO SERVERS · FREE FOREVER
          </motion.div>

          <h1
            className="mb-6 text-center text-[clamp(3rem,8vw,5.5rem)] leading-[0.95] tracking-[-0.03em] text-white lg:text-left"
            style={{ fontFamily: '"Instrument Serif", "Iowan Old Style", serif' }}
          >
            <motion.span
              className="block"
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(0 0 0 0)" }}
              transition={{ duration: 0.5, delay: 1.65, ease: EASE }}
            >
              Your thoughts.
            </motion.span>
            <motion.span
              className="block font-light italic"
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(0 0 0 0)" }}
              transition={{ duration: 0.5, delay: 1.85, ease: EASE }}
            >
              Your AI. <span className="text-[#FF6B35]/70">No one else.</span>
            </motion.span>
          </h1>

          <motion.p
            className="mx-auto mb-10 max-w-[460px] text-center text-[19px] leading-[1.55] text-[#9a9590] lg:mx-0 lg:text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 2.05, ease: "easeOut" }}
            style={{
              fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
              fontWeight: 300,
            }}
          >
            Lokul runs entirely in your browser. No cloud. No servers. No company reading your
            words. Just you and an AI that stays exactly where you put it.
          </motion.p>

          <motion.div
            className="mb-10 flex flex-wrap items-center justify-center gap-5 lg:justify-start"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 2.25, ease: "easeOut" }}
          >
            <div>
              <Button
                variant="cta"
                size="lg"
                onClick={onStart}
                className="group relative h-[52px] rounded-full px-8 text-[16px] font-semibold"
                style={{ fontFamily: '"Syne", "Avenir Next", "Segoe UI", sans-serif' }}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-[140%] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-[140%]" />
                <span className="relative z-10">Start for free &nbsp;→</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                const nextSection = document.getElementById("demo");
                if (nextSection) {
                  nextSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group h-[52px] rounded-full bg-transparent px-1 text-[16px] font-medium text-white/78 hover:bg-transparent hover:text-white"
              style={{ fontFamily: '"Syne", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              <span className="relative">
                See how it works &nbsp;↓
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-white/70 transition-transform duration-300 group-hover:scale-x-100" />
              </span>
            </Button>
          </motion.div>

          <motion.div
            className="mx-auto w-full max-w-[760px] lg:mx-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 2.45, ease: "easeOut" }}
          >
            <div className="mb-4 h-px w-full bg-white/8" />
            <div
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-[12px] tracking-[0.08em] text-[#9d9892] lg:justify-start lg:text-left"
              style={{ fontFamily: '"Syne", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              {proofItems.map((item, index) => (
                <span key={item} className="inline-flex items-center">
                  <motion.span
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    animate={{ clipPath: "inset(0 0 0 0)" }}
                    transition={{ duration: 0.3, delay: 2.45 + index * 0.15, ease: "easeOut" }}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {item}
                  </motion.span>
                  {index < proofItems.length - 1 && <span className="px-2 text-white/20">·</span>}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <div
          className="absolute"
          style={{
            left: "68%",
            top: "62%",
            width: "clamp(860px, 72vw, 1360px)",
            transform: "translate(-50%, -50%)",
            transformOrigin: "center center",
          }}
        >
          <div>
            <motion.div
              className="pointer-events-none absolute"
              style={{ left: "-10%", top: "-10%", width: "100%" }}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.52, delay: 0.45, ease: EASE }}
            >
              <motion.div
                className="absolute top-[8%] left-1/2 h-[30%] w-[62%] -translate-x-1/2 rounded-full bg-[#FFD88A]/55 blur-3xl"
                animate={{ opacity: isSwitchOn ? 1 : 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              />

              <div className="relative h-auto w-full">
                <motion.img
                  src="/stand-lamp-off.png"
                  alt="Stand lamp off"
                  className="relative h-auto w-full drop-shadow-[0_14px_32px_rgba(0,0,0,0.42)]"
                  animate={{ opacity: isSwitchOn ? 0 : 1 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                />
                <motion.img
                  src="/stand-lamp.png"
                  alt="Stand lamp on"
                  className="absolute inset-0 h-auto w-full drop-shadow-[0_14px_32px_rgba(0,0,0,0.42)]"
                  animate={{ opacity: isSwitchOn ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                />
              </div>
            </motion.div>

            <div className="pointer-events-none absolute bottom-[2%] left-1/2 h-[11%] w-[78%] -translate-x-1/2 rounded-full bg-black/85 blur-2xl" />
            <div className="pointer-events-none absolute bottom-[4%] left-1/2 h-[13%] w-[84%] -translate-x-1/2 rounded-full bg-[#FF8A4D]/16 blur-3xl" />

            <motion.img
              src="/lokul-couch.png"
              alt="Spark on couch"
              className="relative z-10 h-auto w-full"
              style={{
                transform: "rotateY(-8deg)",
                filter: "drop-shadow(0 32px 48px rgba(0,0,0,0.72))",
              }}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.56, delay: 0.95, ease: EASE }}
            />

            <motion.img
              src="/coffee-table.png"
              alt="Coffee table"
              className="pointer-events-none absolute right-[-20%] bottom-[-15%] z-20 h-auto w-[90%]"
              style={{ filter: "drop-shadow(0 38px 56px rgba(0,0,0,0.78))" }}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.48, delay: 1.08, ease: EASE }}
            />
            <div className="pointer-events-none absolute right-[-14%] bottom-[-14%] z-[19] h-[13%] w-[62%] rounded-full bg-black/85 blur-2xl" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-40 hidden lg:block">
        <div
          className="pointer-events-none absolute"
          style={{
            left: "68%",
            top: "62%",
            width: "clamp(860px, 72vw, 1360px)",
            transform: "translate(-50%, -50%)",
          }}
        >
          <motion.button
            type="button"
            onClick={() => setIsSwitchOn((prev) => !prev)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 3.05, ease: EASE }}
            className="pointer-events-auto absolute top-0 left-[50%] z-40 w-[20%] -translate-x-1/2 -translate-y-[320px] cursor-pointer"
            aria-label="Toggle room light switch"
          >
            <motion.div
              className="pointer-events-none absolute -top-20 left-[20%] z-50 -translate-x-1/2 select-none"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 3.55, ease: "easeOut" }}
            >
              <p
                className="text-2xl whitespace-nowrap text-white/85"
                style={{
                  fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
                  fontStyle: "italic",
                }}
              >
                Turn On Privacy
              </p>
              <svg
                width="170"
                height="88"
                viewBox="0 0 170 88"
                className="-mt-1 ml-7"
                aria-hidden="true"
              >
                <path
                  d="M8 12 C48 8, 70 26, 66 44 C62 57, 84 66, 102 58 C121 50, 118 30, 110 26 C98 19, 86 25, 91 35 C96 46, 116 50, 136 62"
                  fill="none"
                  stroke="#FFB07A"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* <path
                  d="M112 26 L146 72 L126 70"
                  fill="none"
                  stroke="#FFB07A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                /> */}
              </svg>
            </motion.div>

            <img
              src={isSwitchOn ? "/light-switch-on.webp" : "/light-switch-off.png"}
              alt={isSwitchOn ? "Light switch on" : "Light switch off"}
              className="h-auto w-full drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
            />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
