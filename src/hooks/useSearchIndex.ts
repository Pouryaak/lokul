/**
 * useSearchIndex Hook
 *
 * React hook for managing the search index lifecycle.
 * Lazy-initializes the index on first search, provides debounced search.
 */

import { useCallback, useRef, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import {
  indexConversations,
  searchConversations as searchIndex,
  clearSearchIndex,
  isIndexInitialized,
} from "@/lib/search/search-index";
import type { SearchResult } from "@/lib/search/search-index";

const DEBOUNCE_MS = 300;

interface UseSearchIndexReturn {
  /** Search for conversations matching query */
  search: (query: string, signal?: AbortSignal) => Promise<SearchResult[]>;
  /** Whether the index is currently being built */
  isIndexing: boolean;
  /** Whether the index is ready for searching */
  indexReady: boolean;
  /** Rebuild the index from all conversations */
  reindex: () => Promise<void>;
}

export function useSearchIndex(): UseSearchIndexReturn {
  const { conversations } = useConversations();
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexReady, setIndexReady] = useState(false);

  // Track debounce timeout
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track current search abort controller
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  /**
   * Initialize the index if not already done
   */
  const ensureIndexReady = useCallback(async (): Promise<void> => {
    if (isIndexInitialized() && indexReady) {
      return;
    }

    setIsIndexing(true);

    try {
      // Index all conversations
      indexConversations(conversations);
      setIndexReady(true);
    } finally {
      setIsIndexing(false);
    }
  }, [conversations, indexReady]);

  /**
   * Search with debouncing and abort support
   */
  const search = useCallback(
    async (query: string, signal?: AbortSignal): Promise<SearchResult[]> => {
      // Clear previous debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Abort previous search
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }

      // Handle empty query
      if (!query || query.trim().length === 0) {
        return [];
      }

      // Wait for debounce
      return new Promise((resolve) => {
        const abortHandler = () => {
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }
          resolve([]);
        };

        signal?.addEventListener("abort", abortHandler);

        debounceTimeoutRef.current = setTimeout(async () => {
          signal?.removeEventListener("abort", abortHandler);

          // Check if aborted after debounce
          if (signal?.aborted) {
            resolve([]);
            return;
          }

          // Ensure index is ready before searching
          await ensureIndexReady();

          // Check if aborted after indexing
          if (signal?.aborted) {
            resolve([]);
            return;
          }

          // Perform search
          const results = searchIndex(query);
          resolve(results);
        }, DEBOUNCE_MS);
      });
    },
    [ensureIndexReady]
  );

  /**
   * Rebuild the entire index from scratch
   */
  const reindex = useCallback(async (): Promise<void> => {
    setIsIndexing(true);

    try {
      clearSearchIndex();
      indexConversations(conversations);
      setIndexReady(true);
    } finally {
      setIsIndexing(false);
    }
  }, [conversations]);

  return {
    search,
    isIndexing,
    indexReady,
    reindex,
  };
}
