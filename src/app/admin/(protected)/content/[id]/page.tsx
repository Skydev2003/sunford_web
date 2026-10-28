import { notFound } from "next/navigation";
import { getEditor } from "@/features/cms/server/editors";
import { DocumentEditor } from "@/features/cms/components/document-editor";
import { Suspense } from "react";
import { AdminPageLoading } from "@/features/admin/components/admin-page-loading";
type EditorPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};
export default function ContentEditorPage(props: EditorPageProps) {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <EditorContent {...props} />
    </Suspense>
  );
}
async function EditorContent({ params, searchParams }: EditorPageProps) {
  let id: string;
  try {
    id = decodeURIComponent((await params).id);
  } catch {
    notFound();
  }
  const editor = await getEditor(id);
  if (!editor) notFound();
  return (
    <DocumentEditor
      key={`${editor.id}:${editor.version}:${editor.productVersion}`}
      {...editor}
      saved={(await searchParams).saved === "1"}
    />
  );
}
