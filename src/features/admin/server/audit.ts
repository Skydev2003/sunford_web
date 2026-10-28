import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { AdminSession } from "./auth";

export type AuditType =
  "product" | "page" | "category" | "settings" | "product-media" | "home-image";
export function auditEntry(
  session: AdminSession,
  entityType: AuditType,
  entityId: string,
  title: string,
  action: string,
  fields: string[] = [],
): Prisma.AuditLogCreateManyInput {
  return {
    id: crypto.randomUUID(),
    entityType,
    entityId,
    title,
    action,
    fields,
    actorId: session.user.id,
    actorEmail: session.user.email ?? session.user.id,
  };
}

export function changedFields(previous: object | undefined, next: object) {
  const before = previous as Record<string, unknown> | undefined;
  return Object.entries(next)
    .filter(([key, value]) => JSON.stringify(before?.[key]) !== JSON.stringify(value))
    .map(([key]) => key);
}
