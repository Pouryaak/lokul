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
  const isMountedRef = useRef(true);
  const latestConversationIdRef = useRef(conversationId);
  const latestMessagesRef = useRef(messages);
  const lastExtractedMessageCountRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const runExtraction = useCallback(async () => {
    const latestMessages = latestMessagesRef.current;
    if (latestMessages.length < 2 || isExtractingRef.current) {
      return;
    }

    const engine = inferenceManager.getEngine();
    if (!engine) {
      if (import.meta.env.DEV) {
        console.info("[MemoryExtraction] Skipping extraction: engine unavailable");
      }
      return;
    }

    if (import.meta.env.DEV) {
      console.info(
        `[MemoryExtraction] Starting extraction for ${latestMessages.length} messages in ${latestConversationIdRef.current}`
      );
    }

    isExtractingRef.current = true;
    if (isMountedRef.current) {
      setIsExtracting(true);
    }

    try {
      const extraction = await extractFacts(engine, latestMessages);
      if (extraction.kind === "err") {
        if (import.meta.env.DEV) {
          console.warn("[MemoryExtraction] Extraction failed", extraction.error);
        }
        return;
      }

      if (import.meta.env.DEV) {
        console.info(
          `[MemoryExtraction] Extracted ${extraction.value.length} candidate facts from ${latestMessages.length} messages`
        );
      }

      if (extraction.value.length > 0) {
        const persistence = await processExtractedFacts(
          extraction.value,
          latestConversationIdRef.current
        );

        if (persistence.kind === "err") {
          if (import.meta.env.DEV) {
            console.warn("[MemoryExtraction] Persisting extracted facts failed", persistence.error);
          }
          return;
        }

        if (import.meta.env.DEV) {
          console.info(`[MemoryExtraction] Persisted ${persistence.value.length} memory facts`);
        }
      }

      lastExtractedMessageCountRef.current = latestMessages.length;
      if (isMountedRef.current) {
        setLastExtraction(Date.now());
      }
    } finally {
      isExtractingRef.current = false;
      if (isMountedRef.current) {
        setIsExtracting(false);
      }
    }
  }, []);

  const triggerExtraction = useCallback(
    (immediate: boolean = false) => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (immediate) {
        void runExtraction();
        return;
      }

      timeoutRef.current = window.setTimeout(() => {
        void runExtraction();
        timeoutRef.current = null;
      }, 0);
    },
    [runExtraction]
  );

  useEffect(() => {
    latestConversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const messagesSinceLast = messages.length - lastExtractedMessageCountRef.current;
    if (messagesSinceLast >= EXTRACTION_INTERVAL_MESSAGES) {
      if (import.meta.env.DEV) {
        console.info(
          `[MemoryExtraction] Interval trigger: ${messagesSinceLast} new messages since last extraction`
        );
      }
      triggerExtraction();
    }
  }, [messages.length, triggerExtraction]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        triggerExtraction(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      triggerExtraction(true);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [triggerExtraction]);

  return {
    triggerExtraction,
    isExtracting,
    lastExtraction,
  };
}
