-- SUNFORD website product read contract v2.
-- Apply to the configured Warehouse database as the function owner.
-- This file changes only this function, its comment and its own execution ACL.
BEGIN;

DO $guard$
DECLARE
  existing_function oid := to_regprocedure('ecommerce.get_website_products(bigint,text[])');
  existing_owner name;
  existing_volatility "char";
  existing_security_definer boolean;
  existing_config text[];
  has_external_execute boolean;
BEGIN
  IF existing_function IS NULL THEN
    RETURN;
  END IF;

  SELECT
    pg_get_userbyid(function_row.proowner),
    function_row.provolatile,
    function_row.prosecdef,
    function_row.proconfig,
    EXISTS (
      SELECT 1
      FROM aclexplode(COALESCE(function_row.proacl, acldefault('f', function_row.proowner))) AS acl
      WHERE acl.grantee <> function_row.proowner
        AND acl.privilege_type = 'EXECUTE'
    )
  INTO
    existing_owner,
    existing_volatility,
    existing_security_definer,
    existing_config,
    has_external_execute
  FROM pg_proc AS function_row
  WHERE function_row.oid = existing_function;

  IF existing_owner <> current_user THEN
    RAISE EXCEPTION 'Refusing to replace ecommerce.get_website_products owned by %, current role is %',
      existing_owner,
      current_user;
  END IF;
  IF existing_volatility <> 's'
     OR existing_security_definer
     OR existing_config IS DISTINCT FROM ARRAY['search_path=pg_catalog']::text[]
     OR has_external_execute THEN
    RAISE EXCEPTION 'Existing ecommerce.get_website_products security contract differs from the reviewed v1 baseline';
  END IF;
END
$guard$;

-- PostgreSQL cannot change a RETURNS TABLE shape with CREATE OR REPLACE. The
-- drop/create stays atomic inside this transaction and never uses CASCADE.
DROP FUNCTION IF EXISTS ecommerce.get_website_products(bigint, text[]);

CREATE FUNCTION ecommerce.get_website_products(
  p_master_company_id bigint,
  p_item_codes text[] DEFAULT NULL
)
RETURNS TABLE (
  master_item_id text,
  sku text,
  product_name text,
  product_short_name text,
  description text,
  unit text,
  group_name text,
  usage_family text,
  sale_price text,
  image_object_key text,
  image_mime_type text,
  image_size_bytes integer,
  updated_at text,
  read_at timestamp with time zone,
  specifications jsonb,
  components jsonb
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
  SELECT
    item.master_item_id::text,
    item.item_code::text,
    item.item_name,
    NULLIF(BTRIM(item.item_short_name), ''),
    item.item_description,
    base_unit.unit_name,
    item_group.item_group_name,
    item_type.item_usage_family::text,
    item.standard_sale_price::text,
    item.image_object_key,
    item.image_mime_type::text,
    item.image_size_bytes,
    item.updated_at::text,
    statement_timestamp(),
    COALESCE(facts.rows, '[]'::jsonb),
    COALESCE(parts.rows, '[]'::jsonb)
  FROM master_data.master_item AS item
  JOIN master_data.master_unit AS base_unit
    ON base_unit.master_unit_id = item.base_master_unit_id
   AND base_unit.master_company_id = item.master_company_id
   AND NOT base_unit.is_deleted
  LEFT JOIN master_data.master_item_group AS item_group
    ON item_group.master_item_group_id = item.master_item_group_id
   AND item_group.master_company_id = item.master_company_id
   AND NOT item_group.is_deleted
  LEFT JOIN master_data.master_item_type AS item_type
    ON item_type.master_item_type_id = item.master_item_type_id
   AND item_type.master_company_id = item.master_company_id
   AND NOT item_type.is_deleted
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'title', attribute.title,
        'value_text', fact.value_text,
        'value_number', fact.value_number::text,
        'value_options', fact.value_options,
        'unit', attribute.unit
      ) ORDER BY attribute.title, attribute.id
    ) AS rows
    FROM master_data.ai_products AS product
    JOIN master_data.ai_product_facts AS fact
      ON fact.product_id = product.id
     AND fact.master_company_id = product.master_company_id
    JOIN master_data.ai_attributes AS attribute
      ON attribute.id = fact.attribute_id
     AND attribute.master_company_id = product.master_company_id
     AND attribute.is_active
    WHERE product.master_company_id = item.master_company_id
      AND product.master_item_id = item.master_item_id
      AND product.is_active
      AND fact.verification = 'verified'
  ) AS facts ON true
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'sku', component.item_code,
        'quantity', line.quantity::text
      ) ORDER BY line.master_item_component_line_id
    ) AS rows
    FROM master_data.master_item_component_line AS line
    JOIN master_data.master_item AS component
      ON component.master_item_id = line.component_master_item_id
     AND component.master_company_id = line.master_company_id
     AND NOT component.is_deleted
    WHERE line.master_company_id = item.master_company_id
      AND line.root_master_item_id = item.master_item_id
      AND NOT line.is_deleted
  ) AS parts ON true
  WHERE item.master_company_id = p_master_company_id
    AND item.is_active
    AND item.is_saleable
    AND NOT item.is_deleted
    AND item.standard_sale_price >= 0
    AND (p_item_codes IS NULL OR item.item_code = ANY(p_item_codes))
  ORDER BY item.item_code, item.master_item_id;
$function$;

COMMENT ON FUNCTION ecommerce.get_website_products(bigint, text[]) IS
  'SUNFORD website product read contract v2: company-scoped full/short names, net prices, primary-image metadata, verified specifications and components.';

REVOKE ALL ON FUNCTION ecommerce.get_website_products(bigint, text[]) FROM PUBLIC;

-- The configured function-owner role retains EXECUTE. A future dedicated caller
-- needs an explicit reviewed EXECUTE grant and SELECT privileges on source tables.
-- No anonymous/API role is granted access by this installation.
COMMIT;

-- Reads (company 1 is the currently verified company, not a hardcoded function filter):
-- SELECT * FROM ecommerce.get_website_products(1);
-- SELECT * FROM ecommerce.get_website_products(1, ARRAY['G106698']);
-- SELECT * FROM ecommerce.get_website_products(1, ARRAY[]::text[]);
-- Roll back only after restoring application callers: transactionally replace
-- this function with the reviewed v1 definition; never drop it without restore.
