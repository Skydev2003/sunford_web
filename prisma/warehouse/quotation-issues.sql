-- Only the website registry; never run the historical CMS migrations on Warehouse.
CREATE TABLE IF NOT EXISTS ecommerce.quotation_issues (
  number integer NOT NULL,
  request_key uuid NOT NULL,
  created_at timestamp(3) with time zone NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT website_quotation_issues_pkey PRIMARY KEY (number),
  CONSTRAINT website_quotation_issues_request_key UNIQUE (request_key),
  CONSTRAINT website_quotation_issues_number_range CHECK (number BETWEEN 1 AND 99999999)
);

COMMENT ON TABLE ecommerce.quotation_issues IS 'SUNFORD website quotation registry v1';
ALTER TABLE ecommerce.quotation_issues ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE ecommerce.quotation_issues FROM PUBLIC;
