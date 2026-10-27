import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  areaCustomerCount,
  countLabel,
  customerCounts,
  customerShare,
  customerShareLabel,
  nationwideCustomerCount,
  percentageColor,
} from "../../src/features/customer-map/data/customer-counts";
import type { MapArea, MapLayer } from "../../src/features/customer-map/types";

const read = (name: string): MapLayer =>
  JSON.parse(readFileSync(`public/maps/thailand/${name}.json`, "utf8"));

test("77 provinces, 928 districts and all 7440 workbook subdistricts have unique IDs and correct parent links", () => {
  const provinces = read("provinces").areas;
  assert.equal(provinces.length, 77);
  assert.equal(new Set(provinces.map((p) => p.id)).size, 77);
  const allIds = new Set(provinces.map((p) => p.id));
  let districtCount = 0,
    subdistrictCount = 0,
    geometryCount = 0;
  for (const province of provinces) {
    const districts = read(`districts/${province.id}`).areas;
    const subdistricts = read(`subdistricts/${province.id}`).areas;
    assert.equal(districts.length, province.childIds?.length);
    for (const district of districts) {
      assert.equal(district.parentId, province.id);
      assert.ok(district.id.startsWith(province.id));
      const children = subdistricts.filter((area) => area.parentId === district.id);
      assert.equal(children.length, district.childIds?.length);
      assert.deepEqual(new Set(children.map((a) => a.id)), new Set(district.childIds));
      assert.equal(
        children.reduce((sum, area) => sum + areaCustomerCount(area)!, 0),
        areaCustomerCount(district),
      );
      districtCount++;
    }
    const allocated = districts.reduce((sum, area) => sum + areaCustomerCount(area)!, 0);
    assert.equal(
      allocated + customerCounts.unallocatedByProvince![province.id],
      areaCustomerCount(province),
    );
    for (const area of [...districts, ...subdistricts]) {
      assert.ok(!allIds.has(area.id));
      allIds.add(area.id);
      assert.ok(area.name.length > 0);
      if (area.geometryAvailable === false) {
        assert.equal(area.path, "");
      } else {
        assert.match(area.path, /^M[\d.,LZM-]+Z$/);
        const [x0, y0, x1, y1] = area.bounds;
        assert.ok(x1 > x0 && y1 > y0 && x0 >= 0 && y0 >= 0 && x1 <= 800 && y1 <= 800);
        if (area.level === "subdistrict") geometryCount++;
      }
      assert.ok(area.center.every(Number.isFinite));
      assert.ok(Number.isSafeInteger(areaCustomerCount(area)));
    }
    subdistrictCount += subdistricts.length;
  }
  assert.equal(districtCount, 928);
  assert.equal(subdistrictCount, 7440);
  assert.equal(geometryCount, 7424);
  assert.equal(read("districts/10").areas.length, 50);
  assert.equal(read("districts/73").areas.find((d) => d.id === "7305")?.name, "บางเลน");
});

test("source totals reconcile without treating unknown locations as zero or people as unique customers", () => {
  const summary = customerCounts.summary!;
  assert.equal(summary.total, 125804);
  assert.equal(summary.located, 97758);
  assert.equal(summary.unknownProvince, 28003);
  assert.equal(summary.foreign, 43);
  assert.equal(summary.unknownSubdistrict, 12758);
  assert.equal(summary.located + summary.unknownProvince + summary.foreign, summary.total);
  const provinces = read("provinces").areas;
  assert.equal(
    provinces.reduce((sum, area) => sum + areaCustomerCount(area)!, 0),
    summary.located,
  );
  assert.equal(nationwideCustomerCount(provinces), summary.total);
  assert.equal(
    areaCustomerCount(read("subdistricts/73").areas.find((a) => a.id === "730505")!),
    40,
  );
  const zeros = Object.values(customerCounts.areas).filter((value) => value === 0);
  assert.ok(zeros.length > 0);
  assert.equal(countLabel(0), "0 รายชื่อ");
  assert.equal(countLabel(null), "ยังไม่มีข้อมูล");
});

test("a partial lower-level import cannot appear to be a complete total", () => {
  const area = { id: "73", childIds: ["7301", "7305"] } as MapArea;
  assert.equal(areaCustomerCount(area, { updatedAt: null, areas: { "7305": 7 } }), null);
  assert.equal(areaCustomerCount(area, { updatedAt: null, areas: { "7305": 7, "7301": 0 } }), 7);
  const subdistrict = { id: "730505" } as MapArea;
  assert.equal(areaCustomerCount(subdistrict, { updatedAt: null, areas: { "730505": -1 } }), null);
  assert.equal(areaCustomerCount(subdistrict, { updatedAt: null, areas: { "730505": 1.5 } }), null);
});

test("percentage display uses the complete register and preserves small, zero and unknown values", () => {
  assert.equal(customerShare(25, 200), 12.5);
  assert.equal(customerShareLabel(customerCounts.summary!.total), "100.00%");
  assert.equal(customerShareLabel(customerCounts.summary!.located), "77.71%");
  assert.equal(customerShareLabel(customerCounts.summary!.unknownProvince), "22.26%");
  assert.equal(customerShareLabel(customerCounts.summary!.foreign), "0.03%");
  assert.equal(customerShareLabel(20462), "16.26%");
  assert.equal(customerShareLabel(0), "0.00%");
  assert.equal(customerShareLabel(1), "<0.01%");
  assert.equal(customerShareLabel(null), "ยังไม่มีข้อมูล");
  assert.equal(customerShareLabel(1, 0), "ยังไม่มีข้อมูล");
  assert.equal(customerShareLabel(1, null), "ยังไม่มีข้อมูล");
  assert.equal(customerShareLabel(2, 1), "ยังไม่มีข้อมูล");
  assert.notEqual(percentageColor(null), percentageColor(0));
  assert.notEqual(percentageColor(0), percentageColor(customerShare(1)));
  assert.equal(percentageColor(customerShare(20462)), "#841427");
});
