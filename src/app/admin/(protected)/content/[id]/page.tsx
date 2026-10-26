import { notFound } from "next/navigation";
import { getEditor } from "@/features/cms/server/editors";
import { DocumentEditor } from "@/features/cms/components/document-editor";
export default async function ContentEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const editor = await getEditor((await params).id);
  if (!editor) notFound();
  return (
    <DocumentEditor
      key={`${editor.id}:${editor.version}:${editor.productVersion}`}
      {...editor}
      saved={(await searchParams).saved === "1"}
    />
  );
}
