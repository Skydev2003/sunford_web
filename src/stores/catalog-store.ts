"use client";
import { create } from "zustand";
import type { CategoryId } from "@/features/catalog/types";

type CatalogState = {
  category: CategoryId;
  query: string;
  searchOpen: boolean;
  compareOpen: boolean;
  compareMode: boolean;
  compareIds: string[];
  setCategory: (category: CategoryId) => void;
  setQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  setCompareOpen: (open: boolean) => void;
  startCompare: () => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
};
export const useCatalogStore = create<CatalogState>((set) => ({
  category: "all",
  query: "",
  searchOpen: false,
  compareOpen: false,
  compareMode: false,
  compareIds: [],
  setCategory: (category) => set({ category, query: "" }),
  setQuery: (query) => set({ query }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  startCompare: () => set({ compareMode: true, compareOpen: false }),
  setCompareOpen: (compareOpen) =>
    set((state) =>
      compareOpen
        ? { compareMode: true, compareOpen: state.compareIds.length > 0 }
        : { compareMode: false, compareOpen: false, compareIds: [] },
    ),
  toggleCompare: (id) =>
    set((state) => {
      if (!state.compareMode) return state;
      const compareIds = state.compareIds.includes(id)
        ? state.compareIds.filter((item) => item !== id)
        : state.compareIds.length < 3
          ? [...state.compareIds, id]
          : state.compareIds;
      return state.compareOpen && !compareIds.length
        ? { compareIds, compareMode: false, compareOpen: false }
        : { compareIds };
    }),
  clearCompare: () => set({ compareIds: [], compareOpen: false, compareMode: false }),
}));
