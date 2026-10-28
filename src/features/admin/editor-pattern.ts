export function adminEditorPattern(kind: "product" | "content", id: string) {
  if (kind === "product") return id === "new" ? "page" : "drawer";
  if (id.startsWith("category:")) return "modal";
  if (["spotlight", "stories"].includes(id)) return "drawer";
  return "page";
}
