import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "@/types/index";
import { inferenceManager } from "@/lib/ai/inference";
import { extractFacts } from "@/lib/memory/extraction";
import { processExtractedFacts } from "@/lib/memory/storage-operations";

const EXTRACTION_INTERVAL_MESSAGES = 5;

export function useMemoryExtraction(
  conversationId: string,
  messages: Message[]
): {
  triggerExtraction: () => void;
  isExtracting: boolean;
  lastExtraction: number | null;
} {
  const [isExtracting, setIsExtracting] = useState(false);
  const [lastExtraction, setLastExtraction] = useState<number | null>(null);
  const isExtractingRef = useRef(false);
  const lastExtractedMessageCountRef = useRef(messages.length);
  const timeoutRef = useRef<number | null>(null);

  const runExtraction = useCallback(async () => {
    if (messages.length < 2 || isExtractingRef.current) {
      return;
    }

    const engine = inferenceManager.getEngine();
    if (!engine) {
      return;
    }

    isExtractingRef.current = true;
    setIsExtracting(true);

    try {
      const extraction = await extractFacts(engine, messages);
      if (extraction.kind === "ok" && extraction.value.length > 0) {
        await processExtractedFacts(extraction.value, conversationId);
      }
      lastExtractedMessageCountRef.current = messages.length;
      setLastExtraction(Date.now());
    } finally {
      isExtractingRef.current = false;
      setIsExtracting(false);
    }
  }, [conversationId, messages]);

  const triggerExtraction = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      void runExtraction();
    }, 0);
  }, [runExtraction]);

  useEffect(() => {
    const messagesSinceLast = messages.length - lastExtractedMessageCountRef.current;
    if (messagesSinceLast >= EXTRACTION_INTERVAL_MESSAGES) {
      triggerExtraction();
    }
  }, [messages.length, triggerExtraction]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      triggerExtraction();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        triggerExtraction();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      triggerExtraction();
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [triggerExtraction]);

  return {
    triggerExtraction,
    isExtracting,
    lastExtraction,
  };
}
