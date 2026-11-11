import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/** @param {string} filename @param {string} key */
export function issueLocal(filename, key) {
  mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  try {
    db.exec(`PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS quotation_issues (
        number INTEGER PRIMARY KEY CHECK(number BETWEEN 1 AND 99999999),
        request_key TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );
      BEGIN IMMEDIATE;`);
    let row = db
      .prepare("SELECT number, created_at FROM quotation_issues WHERE request_key=?")
      .get(key);
    if (!row)
      row = db
        .prepare(
          "INSERT INTO quotation_issues(request_key) VALUES (?) RETURNING number, created_at",
        )
        .get(key);
    db.exec("COMMIT");
    return { number: String(row.number).padStart(8, "0"), createdAt: String(row.created_at) };
  } finally {
    db.close();
  }
}
