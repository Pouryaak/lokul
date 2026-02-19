import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MemoryCategory } from "@/lib/memory/types";

type MemoryFilterCategory = MemoryCategory | "all";

interface MemoryUIState {
  isPanelOpen: boolean;
  selectedCategory: MemoryFilterCategory;
  isManageMode: boolean;
  selectedFactIds: Set<string>;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  setSelectedCategory: (category: MemoryFilterCategory) => void;
  toggleManageMode: () => void;
  selectFact: (id: string) => void;
  deselectFact: (id: string) => void;
  clearSelection: () => void;
}

export const useMemoryStore = create<MemoryUIState>()(
  persist(
    (set) => ({
      isPanelOpen: false,
      selectedCategory: "all",
      isManageMode: false,
      selectedFactIds: new Set<string>(),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      openPanel: () => set({ isPanelOpen: true }),
      closePanel: () =>
        set({
          isPanelOpen: false,
          isManageMode: false,
          selectedFactIds: new Set<string>(),
        }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      toggleManageMode: () =>
        set((state) => ({
          isManageMode: !state.isManageMode,
          selectedFactIds: state.isManageMode ? new Set<string>() : state.selectedFactIds,
        })),
      selectFact: (id) =>
        set((state) => {
          const next = new Set(state.selectedFactIds);
          next.add(id);
          return { selectedFactIds: next };
        }),
      deselectFact: (id) =>
        set((state) => {
          const next = new Set(state.selectedFactIds);
          next.delete(id);
          return { selectedFactIds: next };
        }),
      clearSelection: () => set({ selectedFactIds: new Set<string>() }),
    }),
    {
      name: "lokul-memory-ui",
      partialize: (state) => ({
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);
