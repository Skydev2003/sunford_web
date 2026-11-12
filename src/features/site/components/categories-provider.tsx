"use client";
import { createContext, useContext } from "react";
import { categories } from "@/features/catalog/types";
import type { Category } from "../types";
const Context = createContext<readonly Category[]>(categories);
export function CategoriesProvider({
  categories,
  children,
}: {
  categories: Category[];
  children: React.ReactNode;
}) {
  return <Context.Provider value={categories}>{children}</Context.Provider>;
}
export function useCategories() {
  return useContext(Context);
}
