import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

export const CHUNK_SIZE = 30;
const LONG_THREAD_THRESHOLD = 50;
const TOP_LOAD_OFFSET = 120;

export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

interface UseConversationHistoryWindowOptions<TMessage> {
  messages: TMessage[];
  scrollElement: HTMLElement | null;
  resetKey?: string;
  chunkSize?: number;
  threshold?: number;
  topLoadOffset?: number;
  startAtBottom?: boolean;
}

interface UseConversationHistoryWindowResult<TMessage> {
  visibleMessages: TMessage[];
  shouldChunk: boolean;
  hasOlderMessages: boolean;
  startIndex: number;
  maybeLoadOlder: (metrics: ScrollMetrics) => boolean;
}

function getTailStartIndex(totalMessages: number, chunkSize: number): number {
  return Math.max(0, totalMessages - chunkSize);
}

export function useConversationHistoryWindow<TMessage>({
  messages,
  scrollElement,
  resetKey,
  chunkSize = CHUNK_SIZE,
  threshold = LONG_THREAD_THRESHOLD,
  topLoadOffset = TOP_LOAD_OFFSET,
  startAtBottom = true,
}: UseConversationHistoryWindowOptions<TMessage>): UseConversationHistoryWindowResult<TMessage> {
  const shouldChunk = messages.length > threshold;
  const initialStartIndex = shouldChunk
    ? startAtBottom
      ? getTailStartIndex(messages.length, chunkSize)
      : 0
    : 0;
  const [startIndex, setStartIndex] = useState(initialStartIndex);
  const pendingCompensationRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);

  useLayoutEffect(() => {
    setStartIndex(initialStartIndex);
  }, [initialStartIndex, resetKey]);

  useLayoutEffect(() => {
    if (!shouldChunk && startIndex !== 0) {
      setStartIndex(0);
    }
  }, [shouldChunk, startIndex]);

  useLayoutEffect(() => {
    if (!scrollElement || !pendingCompensationRef.current) {
      return;
    }

    const before = pendingCompensationRef.current;
    const heightDelta = scrollElement.scrollHeight - before.scrollHeight;
    scrollElement.scrollTop = before.scrollTop + heightDelta;
    pendingCompensationRef.current = null;
  }, [scrollElement, startIndex]);

  const maybeLoadOlder = useCallback(
    (metrics: ScrollMetrics) => {
      if (!shouldChunk || startIndex === 0 || metrics.scrollTop > topLoadOffset) {
        return false;
      }

      pendingCompensationRef.current = {
        scrollHeight: metrics.scrollHeight,
        scrollTop: metrics.scrollTop,
      };
      setStartIndex((currentStart) => Math.max(0, currentStart - chunkSize));
      return true;
    },
    [chunkSize, shouldChunk, startIndex, topLoadOffset]
  );

  const visibleMessages = useMemo(() => {
    if (!shouldChunk) {
      return messages;
    }
    return messages.slice(startIndex);
  }, [messages, shouldChunk, startIndex]);

  return {
    visibleMessages,
    shouldChunk,
    hasOlderMessages: shouldChunk && startIndex > 0,
    startIndex,
    maybeLoadOlder,
  };
}
