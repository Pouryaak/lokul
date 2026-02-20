/**
 * ModelsSection Component - Premium model showcase grid
 *
 * Elegant grid showcasing all AI models Lokul supports.
 * Clean, premium design with logos in a grid layout.
 */

import { Button } from "@/components/ui/Button";
import { ArrowRight, Cpu, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Model data - all open source models
 */
const models = [
  // Available now
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
    id: "mistral",
    name: "Mistral",
    company: "Mistral AI",
    status: "available",
    logo: "/mistral-logo.png",
  },
  // Coming soon
  {
    id: "gemma",
    name: "Gemma 2",
    company: "Google",
    status: "coming-soon",
    logo: "/gemma-logo.png",
  },
  {
    id: "qwen",
    name: "Qwen 2.5",
    company: "Alibaba",
    status: "coming-soon",
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
    id: "qwq",
    name: "QwQ",
    company: "Alibaba",
    status: "coming-soon",
    logo: "/qwen-logo.webp",
  },
  {
    id: "nemotron",
    name: "Nemotron",
    company: "NVIDIA",
    status: "coming-soon",
    logo: "/nvidia-logo.png",
  },
  {
    id: "yi",
    name: "Yi",
    company: "01.AI",
    status: "coming-soon",
    logo: "/yi-logo.png",
  },
  {
    id: "wizardlm",
    name: "WizardLM",
    company: "Microsoft",
    status: "coming-soon",
    logo: "/microsoft-logo.png",
  },
  {
    id: "codellama",
    name: "CodeLlama",
    company: "Meta",
    status: "coming-soon",
    logo: "/meta-logo.webp",
  },
];

/**
 * Model logo component
 */
function ModelLogo({ logo, name, isHovered }: { logo: string; name: string; isHovered: boolean }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1a1a] p-2 transition-all duration-300 ${
        isHovered ? "scale-110 bg-[#232323] shadow-lg" : ""
      }`}
    >
      <img
        src={logo}
        alt={`${name} logo`}
        className={`h-full w-full object-contain transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
}

/**
 * Model card component
 */
function ModelCard({
  model,
  index,
  isVisible,
}: {
  model: (typeof models)[0];
  index: number;
  isVisible: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isAvailable = model.status === "available";

  return (
    <div
      className={`transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`group relative flex flex-col items-center rounded-2xl border-2 bg-[#111111] p-6 text-center transition-all duration-300 ${
          isHovered
            ? "border-[#FF6B35]/20 shadow-[0_12px_40px_rgba(255,107,53,0.12)]"
            : "border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        }`}
      >
        {/* Logo */}
        <div className="mb-4">
          <ModelLogo logo={model.logo} name={model.name} isHovered={isHovered} />
        </div>

        {/* Model Name */}
        <h3 className="mb-1 text-lg font-bold text-white">{model.name}</h3>

        {/* Company */}
        <p className="text-sm text-gray-400">{model.company}</p>

        {/* Status indicator */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${isAvailable ? "bg-[#FF6B35]" : "bg-gray-400"}`} />
          <span
            className={`text-xs font-medium ${isAvailable ? "text-[#FF6B35]" : "text-gray-400"}`}
          >
            {isAvailable ? "Available" : "Coming Soon"}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Models showcase section
 */
export function ModelsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "-50px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
      className="relative overflow-hidden bg-[#050505] py-16 md:py-24 md:pt-10"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-[#FF6B35]/5 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-[#FFB84D]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1000px] px-4">
        {/* Header */}
        <div
          className={`mb-12 text-center transition-all duration-700 md:mb-16 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 bg-[#111111] px-4 py-2 shadow-sm">
            <Cpu className="h-4 w-4 text-[#FF6B35]" />
            <span className="text-sm font-medium text-[#FF6B35]">Models</span>
          </div>

          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            All the{" "}
            <span className="relative">
              <span className="relative z-10">Best Models</span>
              <span className="absolute right-0 bottom-1 left-0 h-3 bg-[#FF6B35]/20" />
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-300">
            From research labs to your device. All running 100% locally.
          </p>

          {/* Stats */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="rounded-full border border-white/10 bg-[#111111] px-4 py-2 shadow-sm">
              <span className="text-sm font-medium text-white">
                <span className="font-bold text-[#FF6B35]">{availableCount}</span> Available
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-sm font-medium text-gray-300">
                {comingSoonCount} Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Models Grid */}
        <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {models.map((model, index) => (
            <ModelCard key={model.id} model={model} index={index} isVisible={isVisible} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <p className="mb-6 text-gray-400">
            Start with any available model. Switch anytime. All locally.
          </p>
          <Button variant="cta" size="lg" onClick={scrollToCTA}>
            Start Chatting — Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
