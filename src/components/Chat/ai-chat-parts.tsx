import { AlertCircle, Bot, MessageSquare, RefreshCw, User, X } from "lucide-react";
import type { UIMessage } from "@ai-sdk/react";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { InputModelSelector } from "@/components/model/InputModelSelector";
import { cn } from "@/lib/utils";

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

function MessageAvatar({ role }: { role: "user" | "assistant" | "system" }) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        role === "user" ? "bg-[#FF6B35]" : "bg-gray-200"
      )}
    >
      {role === "user" ? (
        <User className="h-4 w-4 text-white" />
      ) : (
        <Bot className="h-4 w-4 text-gray-600" />
      )}
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

export function ConversationMessages({ messages }: { messages: UIMessage[] }) {
  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "group flex gap-4 py-6",
            message.role === "user" ? "flex-row-reverse" : "flex-row"
          )}
        >
          <MessageAvatar role={message.role} />
          <MessageBody message={message} />
        </div>
      ))}
    </>
  );
}

interface InputSectionProps {
  conversationId: string;
  status: "submitted" | "streaming" | "ready" | "error";
  onSubmit: (message: { text: string }) => Promise<void>;
  onStop: () => void;
}

export function InputSection({ conversationId, status, onSubmit, onStop }: InputSectionProps) {
  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4">
      <div className="mx-auto max-w-3xl">
        <PromptInput onSubmit={onSubmit}>
          <PromptInputTextarea placeholder="Message Lokul..." className="min-h-[60px]" />
          <PromptInputFooter>
            <PromptInputTools>
              <InputModelSelector conversationId={conversationId} />
            </PromptInputTools>
            <PromptInputSubmit status={status} onStop={onStop} />
          </PromptInputFooter>
        </PromptInput>

        <p className="mt-2 text-center text-xs text-gray-400">
          AI responses are generated locally on your device.
          <span className="ml-1 text-[#FF6B35]">Private by design.</span>
        </p>
      </div>
    </div>
  );
}

export function EmptyChatState() {
  return <MessageSquare className="size-12 text-[#FF6B35]" />;
}
