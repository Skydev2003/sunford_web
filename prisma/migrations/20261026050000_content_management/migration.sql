ALTER TABLE "products" ADD COLUMN "categoryId" TEXT;
CREATE TABLE "cms_documents" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cms_documents_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cms_documents_kind_deletedAt_idx" ON "cms_documents"("kind", "deletedAt");
ALTER TABLE "cms_documents" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "cms_documents" FROM anon, authenticated;
