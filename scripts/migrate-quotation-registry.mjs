import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import nextEnv from "@next/env";
import { Pool } from "pg";

const identity = "ecommerce.quotation_issues";
const { loadEnvConfig } = nextEnv;
const marker = "SUNFORD website quotation registry v1";
const mismatch = () =>
  Object.assign(new Error("Incompatible website quotation registry"), {
    code: "REGISTRY_SCHEMA_MISMATCH",
  });

async function validateRegistry(client) {
  const columns = await client.query(`
    select a.attname as name,format_type(a.atttypid,a.atttypmod) as type,a.attnotnull as required,
      pg_get_expr(d.adbin,d.adrelid) as default_value
    from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
    where a.attrelid='ecommerce.quotation_issues'::regclass and a.attnum>0 and not a.attisdropped
    order by a.attnum`);
  const expected = [
    ["number", "integer", true, null],
    ["request_key", "uuid", true, null],
    ["created_at", "timestamp(3) with time zone", true, "clock_timestamp()"],
  ];
  if (
    JSON.stringify(
      columns.rows.map((row) => [row.name, row.type, row.required, row.default_value]),
    ) !== JSON.stringify(expected)
  )
    throw mismatch();
  const constraints =
    await client.query(`select conname as name,pg_get_constraintdef(oid) as definition
    from pg_constraint where conrelid='ecommerce.quotation_issues'::regclass order by conname`);
  const expectedConstraints = {
    website_quotation_issues_number_range: "CHECKnumber>=1ANDnumber<=99999999",
    website_quotation_issues_pkey: "PRIMARYKEYnumber",
    website_quotation_issues_request_key: "UNIQUErequest_key",
  };
  if (
    constraints.rows.length !== 3 ||
    constraints.rows.some(
      (row) => expectedConstraints[row.name] !== row.definition.replace(/[()\s"]/g, ""),
    )
  )
    throw mismatch();
  const privacy = await client.query(`select c.relrowsecurity as rls,
    exists(select 1 from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a where a.grantee=0) as public_privileges
    from pg_class c where c.oid='ecommerce.quotation_issues'::regclass`);
  if (!privacy.rows[0]?.rls || privacy.rows[0].public_privileges) throw mismatch();
}

// Caller owns the transaction, so validation can also run in rollback-only checks.
export async function setupQuotationRegistry(client) {
  await client.query(
    "select pg_advisory_xact_lock(hashtextextended('sunford.website.quotation.registry',0))",
  );
  const schema = await client.query("select to_regnamespace('ecommerce')::text as name");
  if (!schema.rows[0]?.name) throw mismatch();
  const table = await client.query(
    "select to_regclass($1)::text as name,obj_description(to_regclass($1),'pg_class') as description",
    [identity],
  );
  const exists = Boolean(table.rows[0]?.name);
  if (exists) {
    if (table.rows[0].description !== marker) throw mismatch();
    await validateRegistry(client);
  }
  await client.query(
    await readFile(new URL("../prisma/warehouse/quotation-issues.sql", import.meta.url), "utf8"),
  );
  await validateRegistry(client);
  return { created: !exists };
}

async function main() {
  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
  const connectionString = process.env.QUOTATION_DATABASE_URL?.trim();
  if (!connectionString || connectionString.includes("YOUR-PASSWORD"))
    throw Object.assign(new Error("Configure QUOTATION_DATABASE_URL"), {
      code: "REGISTRY_CONFIG_REQUIRED",
    });
  let target;
  try {
    target = new URL(connectionString);
  } catch {
    throw Object.assign(new Error("Invalid registry URL"), { code: "REGISTRY_CONFIG_INVALID" });
  }
  if (
    !["postgres:", "postgresql:"].includes(target.protocol) ||
    !target.username ||
    !target.password ||
    target.port === "6543"
  )
    throw Object.assign(new Error("Invalid registry URL"), { code: "REGISTRY_CONFIG_INVALID" });
  const pool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
  });
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    await client.query("SET LOCAL lock_timeout='5s'");
    const result = await setupQuotationRegistry(client);
    await client.query("COMMIT");
    console.log(
      result.created
        ? "Website quotation registry created."
        : "Website quotation registry validated; existing numbers preserved.",
    );
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client?.release();
    await pool.end();
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((error) => {
    console.error(
      "Website quotation registry setup failed:",
      error.code ?? "REGISTRY_SETUP_FAILED",
    );
    process.exitCode = 1;
  });
}
