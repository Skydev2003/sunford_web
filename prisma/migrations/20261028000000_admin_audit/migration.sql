CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "actorEmail" TEXT NOT NULL,
  "fields" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_createdAt_id_idx" ON "audit_logs"("createdAt", "id");
CREATE INDEX "audit_logs_entityType_entityId_createdAt_idx" ON "audit_logs"("entityType", "entityId", "createdAt");
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "audit_logs" FROM anon, authenticated;
