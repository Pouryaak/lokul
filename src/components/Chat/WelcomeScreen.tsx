/**
 * WelcomeScreen Component - Empty state with welcome message and suggestions
 *
 * Displays a centered welcome message with suggestion cards that users can
 * click to start a conversation.
 */

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the WelcomeScreen component
 */
interface WelcomeScreenProps {
  /** Callback when a suggestion is clicked */
  onSuggestionClick: (suggestion: string) => void;
}

/**
 * Default suggestion prompts
 */
const SUGGESTIONS = [
  {
    id: 1,
    text: "Explain quantum computing in simple terms",
    icon: "",
  },
  {
    id: 2,
    text: "Write a Python function to sort a list",
    icon: "",
  },
  {
    id: 3,
    text: "Help me brainstorm ideas for a blog post",
    icon: "",
  },
  {
    id: 4,
    text: "What's the difference between React and Vue?",
    icon: "",
  },
];

/**
 * WelcomeScreen component
 *
 * @example
 * ```tsx
 * <WelcomeScreen onSuggestionClick={(text) => sendMessage(text)} />
 * ```
 */
export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-12">
      {/* Logo/Icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FFB84D] shadow-lg shadow-orange-200">
        <Sparkles className="h-8 w-8 text-white" />
      </div>

      {/* Welcome Text */}
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">
        How can I help you today?
      </h1>
      <p className="mb-8 max-w-md text-center text-gray-500">
        Start a conversation or try one of the suggestions below.
      </p>

      {/* Suggestions Grid */}
      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.text)}
            className={cn(
              "group relative rounded-xl border border-gray-200 bg-white p-4 text-left",
              "transition-all duration-200",
              "hover:border-[#FF6B35]/30 hover:bg-[#FFF8F0] hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
            )}
          >
            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {suggestion.text}
            </p>
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-100 group-hover:ring-[#FF6B35]/10" />
          </button>
        ))}
      </div>
    </div>
  );
}
