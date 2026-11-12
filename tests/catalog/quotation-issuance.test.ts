import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { issueLocal } from "../../src/features/catalog/server/quotation-issues-local.mjs";
import { quotationDates } from "../../src/features/catalog/data/quotation-issue";

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
