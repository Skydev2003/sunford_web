-- SUNFORD website quotation-item search RPC
--
-- Purpose:
--   Return physical, saleable items with their raw standard sale price and
--   stock available for quotation. The caller may scope stock to one branch
--   and/or one saleable warehouse.
--
-- Safety:
--   * Read-only SQL function (STABLE, SECURITY INVOKER).
--   * Does not reserve or mutate stock.
--   * Does not interpret VAT; standard_sale_price is returned unchanged.
--   * PUBLIC execution is revoked. Grant only to the dedicated PostgREST role
--     after that role and its source-relation SELECT privileges are reviewed.

create or replace function ecommerce.search_quotation_item(
  p_master_company_id bigint,
  p_search text default null,
  p_master_item_id bigint default null,
  p_master_branch_id bigint default null,
  p_master_warehouse_id bigint default null,
  p_only_available boolean default true,
  p_limit integer default 50
)
returns table(
  master_item_id bigint,
  item_code character varying,
  item_name text,
  item_name_eng text,
  master_item_type_id bigint,
  item_type_code character varying,
  item_type_name text,
  base_master_unit_id bigint,
  base_unit_code character varying,
  base_unit_name text,
  standard_sale_price numeric,
  on_hand_quantity numeric,
  reserved_quantity numeric,
  available_quantity numeric,
  last_stock_updated_at timestamp with time zone,
  is_serial_controlled boolean,
  dropdown_label text
)
language sql
stable
security invoker
set search_path = pg_catalog
as $function$
with params as (
  select nullif(btrim(p_search), '') as search_text
),
saleable_locations as (
  select
    location.master_company_id,
    location.master_branch_id,
    location.master_warehouse_id,
    location.master_warehouse_location_id
  from master_data.master_warehouse_location location
  join master_data.master_warehouse warehouse
    on warehouse.master_warehouse_id = location.master_warehouse_id
   and warehouse.master_company_id = location.master_company_id
   and warehouse.master_branch_id = location.master_branch_id
   and warehouse.is_active = true
   and warehouse.is_deleted = false
   and warehouse.is_saleable_warehouse = true
  where location.master_company_id = p_master_company_id
    and location.is_active = true
    and location.is_deleted = false
    and location.is_return_scrap_location = false
    and (
      p_master_branch_id is null
      or location.master_branch_id = p_master_branch_id
    )
    and (
      p_master_warehouse_id is null
      or location.master_warehouse_id = p_master_warehouse_id
    )
),
stock as (
  select
    balance.master_item_id,
    balance.master_unit_id,
    coalesce(sum(balance.on_hand_quantity), 0)::numeric(18, 6) as on_hand_quantity,
    max(balance.last_movement_recorded_at) as last_stock_updated_at
  from inventory.v_stock_balance balance
  join saleable_locations location
    on location.master_company_id = balance.master_company_id
   and location.master_branch_id = balance.master_branch_id
   and location.master_warehouse_id = balance.master_warehouse_id
   and location.master_warehouse_location_id = balance.master_warehouse_location_id
  where balance.master_company_id = p_master_company_id
  group by
    balance.master_item_id,
    balance.master_unit_id
),
reservations as (
  select
    reservation.master_item_id,
    reservation.master_unit_id,
    coalesce(sum(reservation.reserved_quantity), 0)::numeric(18, 6) as reserved_quantity
  from shipping.shipping_stock_reservation reservation
  join saleable_locations location
    on location.master_company_id = reservation.master_company_id
   and location.master_branch_id = reservation.master_branch_id
   and location.master_warehouse_location_id = reservation.source_master_warehouse_location_id
  where reservation.master_company_id = p_master_company_id
    and reservation.reservation_status_code = 'ACTIVE'
  group by
    reservation.master_item_id,
    reservation.master_unit_id
),
candidates as (
  select
    item.master_item_id,
    item.item_code,
    item.item_name,
    item.item_name_eng,
    item_type.master_item_type_id,
    item_type.item_type_code,
    item_type.item_type_name,
    item.base_master_unit_id,
    unit.unit_code as base_unit_code,
    unit.unit_name as base_unit_name,
    item.standard_sale_price,
    coalesce(stock.on_hand_quantity, 0)::numeric(18, 6) as on_hand_quantity,
    coalesce(reservations.reserved_quantity, 0)::numeric(18, 6) as reserved_quantity,
    (
      coalesce(stock.on_hand_quantity, 0)
      - coalesce(reservations.reserved_quantity, 0)
    )::numeric(18, 6) as available_quantity,
    stock.last_stock_updated_at,
    item.is_serial_controlled,
    item.item_code || ' - ' || item.item_name as dropdown_label,
    params.search_text
  from master_data.master_item item
  join master_data.master_item_type item_type
    on item_type.master_item_type_id = item.master_item_type_id
   and item_type.is_deleted = false
  join master_data.master_unit unit
    on unit.master_unit_id = item.base_master_unit_id
   and unit.is_deleted = false
  left join stock
    on stock.master_item_id = item.master_item_id
   and stock.master_unit_id = item.base_master_unit_id
  left join reservations
    on reservations.master_item_id = item.master_item_id
   and reservations.master_unit_id = item.base_master_unit_id
  cross join params
  where item.master_company_id = p_master_company_id
    and item.is_active = true
    and item.is_deleted = false
    and item.is_saleable = true
    and item.is_stock_controlled = true
    and item.is_service_item = false
    and item.standard_sale_price > 0
    and (
      p_master_item_id is null
      or item.master_item_id = p_master_item_id
    )
    and (
      params.search_text is null
      or lower(item.item_name) like '%' || lower(params.search_text) || '%'
      or lower(coalesce(item.item_name_eng, '')) like '%' || lower(params.search_text) || '%'
      or lower(item.item_code) like '%' || lower(params.search_text) || '%'
      or lower(coalesce(item.item_barcode, '')) like '%' || lower(params.search_text) || '%'
    )
)
select
  candidates.master_item_id,
  candidates.item_code,
  candidates.item_name,
  candidates.item_name_eng,
  candidates.master_item_type_id,
  candidates.item_type_code,
  candidates.item_type_name,
  candidates.base_master_unit_id,
  candidates.base_unit_code,
  candidates.base_unit_name,
  candidates.standard_sale_price,
  candidates.on_hand_quantity,
  candidates.reserved_quantity,
  candidates.available_quantity,
  candidates.last_stock_updated_at,
  candidates.is_serial_controlled,
  candidates.dropdown_label
from candidates
where
  coalesce(p_only_available, true) = false
  or candidates.available_quantity > 0
order by
  case
    when p_master_item_id is not null
      and candidates.master_item_id = p_master_item_id then 0
    when candidates.search_text is not null
      and lower(candidates.item_code) = lower(candidates.search_text) then 1
    when candidates.search_text is not null
      and lower(candidates.item_name) = lower(candidates.search_text) then 2
    else 3
  end,
  candidates.item_code,
  candidates.master_item_id
limit greatest(1, least(coalesce(p_limit, 50), 100));
$function$;

comment on function ecommerce.search_quotation_item(
  bigint,
  text,
  bigint,
  bigint,
  bigint,
  boolean,
  integer
) is 'Read-only website quotation search using standard sale price and stock available in active saleable warehouse locations.';

revoke all on function ecommerce.search_quotation_item(
  bigint,
  text,
  bigint,
  bigint,
  bigint,
  boolean,
  integer
) from public;

-- Direct SQL examples
--
-- Default: only items with a positive standard price and available quantity.
-- select *
-- from ecommerce.search_quotation_item(1);
--
-- Search all eligible items, including zero/negative availability.
-- select *
-- from ecommerce.search_quotation_item(
--   p_master_company_id => 1,
--   p_search => 'ACS',
--   p_only_available => false,
--   p_limit => 20
-- );
--
-- Exact item lookup within one branch and one saleable warehouse.
-- select *
-- from ecommerce.search_quotation_item(
--   p_master_company_id => 1,
--   p_master_item_id => 796,
--   p_master_branch_id => 1,
--   p_master_warehouse_id => 1,
--   p_only_available => false,
--   p_limit => 1
-- );

-- PostgREST example
--
-- POST /rpc/search_quotation_item
-- Content-Type: application/json
-- Content-Profile: ecommerce
-- Accept-Profile: ecommerce
--
-- {
--   "p_master_company_id": 1,
--   "p_search": "ACS",
--   "p_master_item_id": null,
--   "p_master_branch_id": null,
--   "p_master_warehouse_id": null,
--   "p_only_available": true,
--   "p_limit": 20
-- }

-- Installation notes
--
-- 1. Keep PUBLIC revoked.
-- 2. Confirm the dedicated PostgREST database role.
-- 3. Review that role's USAGE and SELECT privileges for ecommerce,
--    master_data, inventory and shipping before granting EXECUTE.
-- 4. Grant EXECUTE only to that dedicated role using this exact signature.

-- Rollback (run only when intentionally removing an installed function)
-- drop function if exists ecommerce.search_quotation_item(
--   bigint,
--   text,
--   bigint,
--   bigint,
--   bigint,
--   boolean,
--   integer
-- );
