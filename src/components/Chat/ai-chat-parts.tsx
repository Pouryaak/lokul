import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { InputModelSelector } from "@/components/model/InputModelSelector";
import { cn } from "@/lib/utils";
import type { UIMessage } from "@ai-sdk/react";
import { AlertCircle, MessageSquare, RefreshCw, X } from "lucide-react";
import { Shimmer } from "../ai-elements/shimmer";

interface ErrorBannerProps {
  message: string;
  fallbackMessage?: string;
  onRetry?: () => void;
  onDismiss: () => void;
}

export function ErrorBanner({ message, fallbackMessage, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-red-800">Error</p>
          <p className="mt-1 text-sm text-red-600">{message}</p>
          {fallbackMessage && <p className="mt-1 text-xs text-red-500">{fallbackMessage}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Save
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-red-700 hover:text-red-800"
            >
              Reload
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function MessageBody({ message }: { message: UIMessage }) {
  return (
    <div className="flex max-w-[80%] flex-col gap-1">
      <Message from={message.role}>
        <MessageContent>
          {message.parts
            .filter((part): part is { type: "text"; text: string } => part.type === "text")
            .map((part, i) => (
              <MessageResponse key={i}>{part.text}</MessageResponse>
            ))}
        </MessageContent>
      </Message>
    </div>
  );
}

interface ConversationMessagesProps {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
}

function PendingAssistantMessage() {
  return (
    <div className="group flex py-6">
      <div className="flex items-center">
        <Shimmer>Thinking...</Shimmer>
      </div>
    </div>
  );
}

export function ConversationMessages({ messages, status }: ConversationMessagesProps) {
  const showPendingAssistant = status === "submitted";

  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "group flex py-6",
            message.role === "user" ? "flex-row-reverse" : "flex-row"
          )}
        >
          <MessageBody message={message} />
        </div>
      ))}
      {showPendingAssistant ? <PendingAssistantMessage /> : null}
    </>
  );
}

interface InputSectionProps {
  conversationId: string;
  status: "submitted" | "streaming" | "ready" | "error";
  onSubmit: (message: { text: string }) => Promise<void>;
  onStop: () => void;
  className?: string;
}

const CHAT_NOISE_BACKGROUND_IMAGE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")";

export function InputSection({
  conversationId,
  status,
  onSubmit,
  onStop,
  className,
}: InputSectionProps) {
  return (
    <div className={cn("pointer-events-none px-4 pb-4", className)}>
      <div className="pointer-events-auto mx-auto max-w-3xl">
        <PromptInput
          onSubmit={onSubmit}
          className="relative overflow-hidden rounded-2xl bg-[#0f0f0f] text-[var(--chat-text-primary)] shadow-[0_14px_38px_rgba(0,0,0,0.38)]"
          inputGroupClassName="border-0 bg-transparent shadow-none"
        >
          {/* Grainy noise overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-screen"
            style={{
              backgroundImage: CHAT_NOISE_BACKGROUND_IMAGE,
              backgroundRepeat: "repeat",
              backgroundSize: "220px 220px",
            }}
          />
          <PromptInputTextarea
            placeholder="Message Lokul..."
            className="min-h-[60px] text-[15px] text-[var(--chat-text-primary)] placeholder:text-[var(--chat-text-muted)]"
          />
          <PromptInputFooter>
            <PromptInputTools>
              <InputModelSelector conversationId={conversationId} />
            </PromptInputTools>
            <PromptInputSubmit status={status} onStop={onStop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

export function EmptyChatState() {
  return <MessageSquare className="text-primary size-12" />;
}
