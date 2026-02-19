export type MemoryCategory = "identity" | "preference" | "project";

export interface MemoryFact {
  id: string;
  fact: string;
  category: MemoryCategory;
  confidence: number;
  mentionCount: number;
  firstSeen: number;
  lastSeen: number;
  lastSeenConversationId: string;
  pinned: boolean;
  updatesFactId?: string;
}

export interface ExtractedFact {
  fact: string;
  category: MemoryCategory;
  confidence: number;
  updatesPrevious: boolean;
}
