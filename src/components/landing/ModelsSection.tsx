/**
 * ModelsSection Component - Premium model showcase with LogoStepper
 *
 * Animated showcase of AI models with smooth transitions.
 */

import { Button } from "@/components/ui/Button";
import { LogoStepper } from "@/components/ui/logo-stepper";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Cpu, Sparkles } from "lucide-react";
import { useRef } from "react";

const models = [
  {
    id: "phi",
    name: "Phi-4",
    company: "Microsoft",
    status: "available",
    logo: "/microsoft-logo.png",
  },
  {
    id: "llama",
    name: "Llama 3.3",
    company: "Meta",
    status: "available",
    logo: "/meta-logo.webp",
  },
  {
    id: "llama3.2",
    name: "Llama 3.2 8B",
    company: "Meta",
    status: "available",
    logo: "/meta-logo.webp",
  },
  {
    id: "mistral",
    name: "Mistral",
    company: "Mistral AI",
    status: "available",
    logo: "/mistral-logo.png",
  },
  {
    id: "gemma",
    name: "Gemma 2",
    company: "Google",
    status: "available",
    logo: "/gemma-logo.png",
  },
  {
    id: "qwen",
    name: "Qwen 2.5",
    company: "Alibaba",
    status: "available",
    logo: "/qwen-logo.webp",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    company: "DeepSeek AI",
    status: "coming-soon",
    logo: "/deepseek-logo.png",
  },
  {
    id: "nemotron",
    name: "Nemotron",
    company: "NVIDIA",
    status: "coming-soon",
    logo: "/nvidia-logo.png",
  },
];

const logoItems = models.map((model) => ({
  icon: <img src={model.logo} alt={model.name} className="h-10 w-10 object-contain" />,
  label: model.name,
}));

const blurInVariants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

export function ModelsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.35 });

  const scrollToCTA = () => {
    const ctaSection = document.getElementById("final-cta");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const availableCount = models.filter((m) => m.status === "available").length;
  const comingSoonCount = models.filter((m) => m.status === "coming-soon").length;

  return (
    <section
      id="models"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#050505] py-16 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/5 absolute top-1/4 -left-20 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute -right-20 bottom-1/4 h-80 w-80 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1000px] px-4">
        <div className="mb-12 text-center md:mb-16">
          <motion.div
            variants={blurInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="border-primary/30 mb-6 inline-flex items-center gap-2 rounded-full border bg-[#111111] px-4 py-2 shadow-sm"
          >
            <Cpu className="text-primary h-4 w-4" />
            <span
              className="text-primary text-sm font-medium"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              Models
            </span>
          </motion.div>

          <motion.h2
            variants={blurInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mb-4 text-4xl font-bold text-white md:text-5xl"
            style={{
              fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
              fontStyle: "italic",
            }}
          >
            All the{" "}
            <span className="text-primary relative">
              <span className="relative z-10">Best Models</span>
              <span className="bg-primary/20 absolute right-0 bottom-1 left-0 h-3" />
            </span>
          </motion.h2>

          <motion.p
            variants={blurInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="mx-auto max-w-xl text-lg text-gray-300"
            style={{
              fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
              fontWeight: 300,
            }}
          >
            From research labs to your device. All running 100% locally.
          </motion.p>

          <motion.div
            variants={blurInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="mt-8 flex items-center justify-center gap-6"
          >
            <div className="rounded-full border border-white/10 bg-[#111111] px-4 py-2 shadow-sm">
              <span
                className="text-sm font-medium text-white"
                style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
              >
                <span className="text-primary font-bold">{availableCount}</span> Available
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary h-4 w-4" />
              <span
                className="text-sm font-medium text-gray-300"
                style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
              >
                {comingSoonCount} Coming Soon
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={blurInVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          <LogoStepper
            logos={logoItems}
            direction="loop"
            animationDelay={1.5}
            animationDuration={0.5}
            visibleCount={7}
          />
        </motion.div>

        <div className="text-center">
          <motion.p
            variants={blurInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            className="mb-6 text-gray-400"
            style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
          >
            Start with any available model. Switch anytime. All locally.
          </motion.p>
          <motion.div
            variants={blurInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          >
            <Button variant="cta" size="lg" onClick={scrollToCTA}>
              Start Chatting — Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
