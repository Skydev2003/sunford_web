import { TrashList } from "@/features/admin/components/trash-list";
import { listTrash } from "@/features/admin/server/safety";
import { getCategories } from "@/features/cms/server/categories";
export const instant = false;
export default async function TrashPage() {
  const [items, categories] = await Promise.all([listTrash(), getCategories()]);
  return <TrashList items={items} categories={categories.filter((item) => item.id !== "all")} />;
}
