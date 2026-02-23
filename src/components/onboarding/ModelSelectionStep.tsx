import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Brain, Cpu } from "lucide-react";
import { MODELS, SMART_MODEL } from "@/lib/ai/models";
import type { ModelConfig } from "@/lib/ai/models";

interface ModelSelectionStepProps {
  onSelect: (model: ModelConfig) => void;
}

function formatSize(mb: number): string {
  if (mb < 1000) {
    return `${mb} MB`;
  }
  return `${(mb / 1000).toFixed(1)} GB`;
}

const tierIcons: Record<string, React.ReactNode> = {
  "Quick Mode": <Zap className="h-5 w-5" />,
  "Smart Mode": <Brain className="h-5 w-5" />,
  "Genius Mode": <Sparkles className="h-5 w-5" />,
};

function ModelCard({
  model,
  isRecommended,
  onSelect,
  index,
}: {
  model: ModelConfig;
  isRecommended: boolean;
  onSelect: () => void;
  index: number;
}) {
  const icon = tierIcons[model.name] || <Cpu className="h-5 w-5" />;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={onSelect}
      className="group relative w-full cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition-all duration-300 hover:border-[#ff6b35]/50 hover:bg-white/10"
    >
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ff6b35] px-3 py-1 text-xs font-medium text-white shadow-lg">
            <Sparkles className="h-3 w-3" />
            Recommended
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
            isRecommended
              ? "bg-[#ff6b35]/20 text-[#ff6b35]"
              : "bg-white/10 text-white/60 group-hover:bg-[#ff6b35]/10 group-hover:text-[#ff6b35]"
          }`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3
              className="font-semibold text-white"
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              {model.name}
            </h3>
            <span
              className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/60"
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              {formatSize(model.sizeMB)}
            </span>
          </div>
          <p className="mb-2 text-sm text-white/50" style={{ fontFamily: '"DM Sans", sans-serif' }}>
            {model.bestFor}
          </p>
          <p className="text-xs text-white/30" style={{ fontFamily: '"DM Sans", sans-serif' }}>
            {model.description}
          </p>
        </div>

        {/* Select indicator */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-all group-hover:border-[#ff6b35] group-hover:bg-[#ff6b35]/10">
          <Check className="h-4 w-4 text-white/30 transition-colors group-hover:text-[#ff6b35]" />
        </div>
      </div>
    </motion.button>
  );
}

export function ModelSelectionStep({ onSelect }: ModelSelectionStepProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-24">
      <div className="mx-auto w-full max-w-[500px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2
            className="mb-3 text-3xl text-white md:text-4xl"
            style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}
          >
            Choose your AI model
          </h2>
          <p className="text-white/60" style={{ fontFamily: '"DM Sans", sans-serif' }}>
            Each model has different capabilities. Start with one, switch anytime.
          </p>
        </motion.div>

        {/* Model list */}
        <div className="space-y-4">
          {MODELS.map((model, index) => (
            <ModelCard
              key={model.id}
              model={model}
              isRecommended={model.id === SMART_MODEL.id}
              onSelect={() => onSelect(model)}
              index={index}
            />
          ))}
        </div>

        {/* Info note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 text-center text-xs text-white/30"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          Models are cached after download. Larger models require more RAM.
        </motion.p>
      </div>
    </div>
  );
}
