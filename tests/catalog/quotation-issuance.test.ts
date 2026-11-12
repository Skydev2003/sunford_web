import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { issueLocal } from "../../src/features/catalog/server/quotation-issues-local.mjs";
import { quotationDates } from "../../src/features/catalog/data/quotation-issue";
import { issuePostgres } from "../../src/features/catalog/server/quotation-issues";
import type { PrismaClient } from "../../src/generated/prisma/client";

test("quotation validity starts on the Bangkok calendar day and crosses months and years", () => {
  assert.deepEqual(quotationDates("2026-12-31T16:59:59Z"), {
    issued: "31/12/2026",
    expires: "14/01/2027",
  });
  assert.deepEqual(quotationDates("2026-12-31T17:00:00Z"), {
    issued: "01/01/2027",
    expires: "15/01/2027",
  });
  assert.deepEqual(quotationDates("2028-02-15T05:00:00Z"), {
    issued: "15/02/2028",
    expires: "29/02/2028",
  });
});

test("PostgreSQL allocation uses the isolated Warehouse registry and reuses the same request", async () => {
  const records = new Map<string, { number: number; created_at: Date }>();
  const createdAt = new Date("2026-11-12T03:00:00Z");
  const tx = {
    async $executeRaw(strings: TemplateStringsArray) {
      assert.match(strings.join("?"), /LOCK TABLE ecommerce\.quotation_issues IN EXCLUSIVE MODE/);
      return 0;
    },
    async $queryRaw(strings: TemplateStringsArray, key: string) {
      const sql = strings.join("?");
      if (sql.includes("INSERT INTO")) {
        assert.match(sql, /INSERT INTO ecommerce\.quotation_issues/);
        assert.match(sql, /FROM ecommerce\.quotation_issues/);
        const row = { number: records.size + 1, created_at: createdAt };
        records.set(key, row);
        return [row];
      }
      assert.match(sql, /FROM ecommerce\.quotation_issues WHERE request_key/);
      const row = records.get(key);
      return row ? [row] : [];
    },
  };
  const db = {
    $transaction: async (operation: (client: typeof tx) => Promise<unknown>) => operation(tx),
  } as unknown as PrismaClient;
  const first = await issuePostgres(db, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  assert.deepEqual(first, { number: "00000001", createdAt: "2026-11-12T03:00:00.000Z" });
  assert.deepEqual(await issuePostgres(db, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"), first);
  assert.equal(
    (await issuePostgres(db, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")).number,
    "00000002",
  );
  assert.equal(records.size, 2);
});
test("local quotation numbers survive reopening and retries", () => {
  const directory = mkdtempSync(join(tmpdir(), "sunford-issue-"));
  const filename = join(directory, "issues.sqlite");
  try {
    const first = issueLocal(filename, "a");
    assert.equal(first.number, "00000001");
    assert.equal(issueLocal(filename, "b").number, "00000002");
    assert.deepEqual(issueLocal(filename, "a"), first);
    assert.equal(issueLocal(filename, "c").number, "00000003");
  } finally {
    rmSync(directory, { recursive: true });
  }
});
