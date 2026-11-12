-- SUNFORD website product read contract v1.
-- Apply to the configured Warehouse database as the function owner.
-- This file changes only this function, its comment and its own execution ACL.
CREATE OR REPLACE FUNCTION ecommerce.get_website_products(
  p_master_company_id bigint,
  p_item_codes text[] DEFAULT NULL
)
RETURNS TABLE (
  master_item_id text,
  sku text,
  product_name text,
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
  'SUNFORD website product read contract v1: company-scoped products, net prices, primary-image metadata, verified specifications and components.';

REVOKE ALL ON FUNCTION ecommerce.get_website_products(bigint, text[]) FROM PUBLIC;

-- The configured function-owner role retains EXECUTE. A future dedicated caller
-- needs an explicit reviewed EXECUTE grant and SELECT privileges on source tables.
-- No anonymous/API role is granted access by this installation.
-- Reads (company 1 is the currently verified company, not a hardcoded function filter):
-- SELECT * FROM ecommerce.get_website_products(1);
-- SELECT * FROM ecommerce.get_website_products(1, ARRAY['G106698']);
-- SELECT * FROM ecommerce.get_website_products(1, ARRAY[]::text[]);
-- Rollback only after restoring all callers to the previous reader:
-- DROP FUNCTION ecommerce.get_website_products(bigint, text[]);
