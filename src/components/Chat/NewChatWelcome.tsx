import { motion } from "framer-motion";
import { Sparkles, Lightbulb, Code, FileText, MessageSquare } from "lucide-react";

interface NewChatWelcomeProps {
  onSuggestionClick?: (text: string) => void;
}

function getGreeting(): { greeting: string; subtext: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: "Good morning",
      subtext: "Ready to start your day with some private AI?",
    };
  }

  if (hour >= 12 && hour < 17) {
    return {
      greeting: "Good afternoon",
      subtext: "What can Lokul help you with today?",
    };
  }

  if (hour >= 17 && hour < 21) {
    return {
      greeting: "Good evening",
      subtext: "Your conversations stay here, on your device.",
    };
  }

  return {
    greeting: "Working late?",
    subtext: "Lokul is here whenever you need it.",
  };
}

const suggestions = [
  {
    icon: Lightbulb,
    title: "Brainstorm ideas",
    prompt:
      "Help me brainstorm 10 creative ideas for a mobile app that helps people build better habits",
  },
  {
    icon: Code,
    title: "Write code",
    prompt: "Write a React hook that handles keyboard shortcuts with proper cleanup",
  },
  {
    icon: FileText,
    title: "Summarize text",
    prompt: "Can you help me summarize a long article? I'll paste it in my next message",
  },
  {
    icon: MessageSquare,
    title: "Have a conversation",
    prompt: "Let's have a thoughtful discussion about the future of AI and privacy",
  },
];

export function NewChatWelcome({ onSuggestionClick }: NewChatWelcomeProps) {
  const { greeting, subtext } = getGreeting();

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-[500px] text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-[#ff6b35]/20 blur-2xl" />
            <img src="/lokul-logo.png" alt="Lokul" className="relative h-12 w-12" />
          </div>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1
            className="mb-2 text-3xl leading-tight text-[#1a1a1a] md:text-4xl"
            style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}
          >
            {greeting}
          </h1>
          <p className="text-[15px] text-gray-500" style={{ fontFamily: '"DM Sans", sans-serif' }}>
            {subtext}
          </p>
        </motion.div>

        {/* Suggested prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 grid gap-3"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.title}
              onClick={() => onSuggestionClick?.(suggestion.prompt)}
              className="group flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3 text-left transition-all hover:border-[#ff6b35]/30 hover:bg-[#fff8f0] hover:shadow-sm"
              style={{
                transitionDelay: `${index * 50}ms`,
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#fff4ed] text-[#ff6b35] transition-colors group-hover:bg-[#ff6b35] group-hover:text-white">
                <suggestion.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#1a1a1a]">{suggestion.title}</p>
                <p className="truncate text-xs text-gray-400">{suggestion.prompt}</p>
              </div>
              <Sparkles className="h-4 w-4 flex-shrink-0 text-gray-200 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </motion.div>

        {/* Privacy note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-xs text-gray-400"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          Your conversations are stored locally and never leave your device.
        </motion.p>
      </div>
    </div>
  );
}
