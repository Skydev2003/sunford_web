CREATE TABLE "quotation_issues" (
  "number" INTEGER PRIMARY KEY CHECK ("number" BETWEEN 1 AND 99999999),
  "request_key" UUID NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE "quotation_issues" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "quotation_issues" FROM PUBLIC;
