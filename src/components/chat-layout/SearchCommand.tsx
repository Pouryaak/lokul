/**
 * SearchCommand Component
 *
 * Command palette overlay for searching across all conversations.
 * Opens with Cmd/Ctrl+K, shows results with title + snippet.
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  CommandPalette,
  type CommandGroup,
  type CommandItem,
} from "@/components/ui/command-palette";
import { useSearchIndex } from "@/hooks/useSearchIndex";
import type { SearchResult } from "@/lib/search/search-index";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SNIPPET_MAX_LENGTH = 80;

/**
 * Truncate text to max length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + "...";
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const navigate = useNavigate();
  const { search, isIndexing, indexReady } = useSearchIndex();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle query changes from CommandPalette
  const handleQueryChange = async (newQuery: string) => {
    setQuery(newQuery);

    if (!newQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await search(newQuery);
      setResults(searchResults);
    } finally {
      setIsSearching(false);
    }
  };

  // Reset state when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
    onOpenChange(isOpen);
  };

  // Convert search results to command items
  const groups = useMemo((): CommandGroup[] => {
    if (results.length === 0) {
      return [];
    }

    const items: CommandItem[] = results.map((result) => ({
      id: result.conversationId,
      label: result.title,
      description: truncateText(result.content, SNIPPET_MAX_LENGTH),
      icon: Search,
      keywords: [result.content],
      onSelect: () => {
        navigate(`/chat/${result.conversationId}`);
        onOpenChange(false);
      },
    }));

    return [
      {
        id: "conversations",
        heading: "Conversations",
        items,
      },
    ];
  }, [results, navigate, onOpenChange]);

  const isLoading = isIndexing || isSearching;

  return (
    <CommandPalette
      open={open}
      onOpenChange={handleOpenChange}
      groups={groups}
      placeholder="Search conversations..."
      emptyMessage={
        !indexReady && isIndexing
          ? "Building search index..."
          : query.trim()
            ? "No conversations found. Try different keywords or check your spelling."
            : "Start typing to search your conversations"
      }
      shortcut={["⌘", "K"]}
      loading={isLoading}
      showRecent={false}
      onQueryChange={handleQueryChange}
      disableFiltering={true}
    />
  );
}
