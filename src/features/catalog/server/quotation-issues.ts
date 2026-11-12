import type { PrismaClient } from "@/generated/prisma/client";
import type { QuotationIssue } from "../data/quotation-issue";

export async function issuePostgres(db: PrismaClient, key: string): Promise<QuotationIssue> {
  return db.$transaction(
    async (tx) => {
      // Serialize allocations across application instances, including retries after a lost response.
      await tx.$executeRaw`LOCK TABLE ecommerce.quotation_issues IN EXCLUSIVE MODE`;
      const existing = await tx.$queryRaw<
        { number: number; created_at: Date }[]
      >`SELECT number, created_at FROM ecommerce.quotation_issues WHERE request_key = ${key}::uuid`;
      const [row] = existing.length
        ? existing
        : await tx.$queryRaw<{ number: number; created_at: Date }[]>`
      INSERT INTO ecommerce.quotation_issues (number, request_key)
      SELECT COALESCE(MAX(number), 0) + 1, ${key}::uuid FROM ecommerce.quotation_issues
      RETURNING number, created_at`;
      return {
        number: String(row.number).padStart(8, "0"),
        createdAt: row.created_at.toISOString(),
      };
    },
    { isolationLevel: "ReadCommitted" },
  );
}
