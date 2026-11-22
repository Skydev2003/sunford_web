import assert from "node:assert/strict";
import test from "node:test";
import { lineupSalesCopy } from "../../src/features/catalog/data/lineup-sales-copy";

const sparse = {
  name: "RC-10",
  subtitle: "",
  description: "",
  readability: "",
  warehouseSku: "RC-10",
};

test("published showcase copy is keyed to an exact Warehouse SKU", () => {
  const indicator = { ...sparse, name: "AW31", warehouseCategoryId: "indicators" };
  assert.equal(
    lineupSalesCopy({ ...indicator, warehouseSku: "G107770" }),
    "จอ LCD อ่านได้ไกล 4 เมตร",
  );
  assert.equal(lineupSalesCopy(indicator), "หัวอ่านสำหรับแสดงน้ำหนัก");
  assert.equal(
    lineupSalesCopy({ ...sparse, name: "WPS10KS", warehouseSku: "G106698" }),
    "ชาร์จได้ ไม่ต้องซื้อถ่าน",
  );
});

test("long Warehouse card text becomes one supported point without truncating it", () => {
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseCategoryId: "indicators",
      subtitle: "หัวอ่านนำหนัก จอ LED ระยะมองเห็น 8 เมตร ประหยัดพลังงาน ชาร์จเต็มใช้งานหลายชั่วโมง",
    }),
    "จอ LED อ่านได้ไกล 8 เมตร",
  );
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseCategoryId: "scales",
      subtitle: "ไม่รองรับการนับจำนวน\nหักน้ำหนักภาชนะ",
    }),
    "หักน้ำหนักภาชนะได้",
  );
});

test("numeric claims come from explicitly labeled specifications or pack facts", () => {
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseCategoryId: "scales",
      warehouseName: "SUNFORD เครื่องชั่ง ACS-30-FC31S 30Kg/1g, 2g",
    }),
    "ชั่งได้ถึง 30 กก.",
  );
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseCategoryId: "pos",
      warehouseSubcategoryIds: ["pos-android"],
      description: "แพ็คเกจ 12 เดือน SUNFORD Cloud POS - Android version",
    }),
    "สิทธิ์ใช้งาน 12 เดือน",
  );
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseCategoryId: "accessories",
      warehouseName: "กระดาษความร้อน 80x80 บรรจุ 10 ม้วน",
    }),
    "แพ็ก 10 ม้วน",
  );
});

test("sparse records use recorded types or a neutral link prompt", () => {
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseCategoryId: "platforms",
      warehouseSubcategoryIds: ["platform-sus201"],
      warehouseName: "SUNFORD Platform TIS 3949",
    }),
    "โครงแท่นสเตนเลส SUS201",
  );
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseCategoryId: "platforms",
      warehouseName: "SUNFORD Platform TIS 3949",
    }),
    "โครงสร้างสำหรับแท่นชั่ง",
  );
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseCategoryId: "indicators",
      name: "หัวอ่านสำหรับแสดงน้ำหนัก",
    }),
    "ดูข้อมูลของรุ่นนี้",
  );
  assert.equal(
    lineupSalesCopy({ ...sparse, warehouseSku: undefined, subtitle: "ล้างน้ำได้" }),
    "ดูข้อมูลของรุ่นนี้",
  );
});
