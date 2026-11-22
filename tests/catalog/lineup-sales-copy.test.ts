import assert from "node:assert/strict";
import test from "node:test";
import { lineupSalesCopy } from "../../src/features/catalog/data/lineup-sales-copy";

const sparse = {
  name: "RC-10",
  subtitle: "",
  description: "",
  readability: "",
  capacity: "",
  connection: "",
  warehouseSku: "RC-10",
};

test("published showcase copy is keyed to an exact Warehouse SKU", () => {
  const indicator = { ...sparse, name: "AW31", warehouseCategoryId: "indicators" };
  assert.equal(
    lineupSalesCopy({ ...indicator, warehouseSku: "G107770" }),
    "จอ LCD อ่านได้ไกล 4 เมตร",
  );
  assert.equal(lineupSalesCopy(indicator), "อ่านค่าน้ำหนักจากแท่นชั่ง");
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

test("sparse records describe their verified use and avoid repeating the model name", () => {
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
    "แท่นสำหรับวางของขณะชั่ง",
  );
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseCategoryId: "indicators",
      name: "อ่านค่าน้ำหนักจากแท่นชั่ง",
    }),
    "",
  );
  assert.equal(lineupSalesCopy({ ...sparse, warehouseSku: undefined, subtitle: "ล้างน้ำได้" }), "");
});

test("explicit current Warehouse specs take precedence over product type", () => {
  const scale = { ...sparse, warehouseCategoryId: "scales" };
  assert.equal(lineupSalesCopy({ ...scale, capacity: "5000 g" }), "ชั่งได้ถึง 5 กก.");
  assert.equal(
    lineupSalesCopy({ ...scale, connection: "ส่งข้อมูลผ่านพอร์ท RS232" }),
    "ส่งข้อมูลผ่านพอร์ต RS232",
  );
  assert.equal(
    lineupSalesCopy({ ...scale, connection: "เพิ่ม Bluetooth ได้เมื่อซื้ออุปกรณ์เสริม" }),
    "ชั่งน้ำหนักสินค้า",
  );
});

test("suite, part and display copy come from the full Warehouse record", () => {
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseSku: "G106155",
      name: "TGS1000M",
      warehouseCategoryId: "scales",
    }),
    "มีแบตเตอรี่เป็นส่วนประกอบ",
  );
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseCategoryId: "pos",
      description: "Set SUNFORD POS1100A P1",
    }),
    "ชุด POS พร้อมเครื่องชั่ง",
  );
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseCategoryId: "accessories",
      subtitle: "สติ๊กเกอร์เลเบล (1 ลัง = 50 ม้วน)",
    }),
    "ลังละ 50 ม้วน",
  );
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseCategoryId: "accessories",
      warehouseName: "SUNFORD จอแสดงผล C1/C5",
    }),
    "จอเสริมสำหรับรุ่น C1/C5",
  );
});

test("platform model digits never become dimensions or a material claim", () => {
  assert.equal(
    lineupSalesCopy({
      ...sparse,
      warehouseSku: "G107572",
      name: "TMS 3040",
      warehouseCategoryId: "platforms",
      warehouseName: "SUNFORD ชิ้นส่วน - Platform TMS 3040",
    }),
    "แท่นสำหรับวางของขณะชั่ง",
  );
});

test("specific Warehouse benefits distinguish neighboring scale cards", () => {
  assert.equal(
    lineupSalesCopy({ ...sparse, warehouseSku: "G106582", name: "POS1100-A" }),
    "ชั่งสินค้าได้ถึง 30 กก.",
  );
  assert.equal(
    lineupSalesCopy({ ...sparse, warehouseSku: "G106483", name: "TSS-150-SW31S" }),
    "เตือนเมื่อชั่งขาดหรือเกิน",
  );
});
