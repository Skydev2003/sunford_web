"use client";
import { create } from "zustand";
import type { CategoryId } from "@/features/catalog/types";

type CatalogState = {
  category: CategoryId;
  query: string;
  searchOpen: boolean;
  compareOpen: boolean;
  compareIds: string[];
  setCategory: (category: CategoryId) => void;
  setQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  setCompareOpen: (open: boolean) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
};
export const useCatalogStore = create<CatalogState>((set) => ({
  category: "all",
  query: "",
  searchOpen: false,
  compareOpen: false,
  compareIds: [],
  setCategory: (category) => set({ category, query: "" }),
  setQuery: (query) => set({ query }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setCompareOpen: (compareOpen) => set({ compareOpen }),
  toggleCompare: (id) =>
    set((state) => ({
      compareIds: state.compareIds.includes(id)
        ? state.compareIds.filter((item) => item !== id)
        : state.compareIds.length < 3
          ? [...state.compareIds, id]
          : state.compareIds,
    })),
  clearCompare: () => set({ compareIds: [], compareOpen: false }),
}));
