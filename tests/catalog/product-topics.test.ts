import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyProductTopics, topicGroups } from "../../src/features/catalog/data/product-topics";
import { products } from "../../src/features/catalog/data/products";

test("explicit non-waterproof specification overrides positive collection membership", () => {
  const topics = classifyProductTopics(
    {
      ...products[0],
      name: "เครื่องชั่ง",
      subtitle: "ไม่กันน้ำ กันสนิม",
      description: "",
      connection: "—",
    },
    ["/collections/waterproof-weighing-scales"],
  );
  assert.ok(topics.includes("non-waterproof"));
  assert.ok(!topics.includes("waterproof"));
  assert.ok(!topics.includes("wet"));
});

test("missing waterproof information never becomes a non-waterproof claim", () => {
  const topics = classifyProductTopics({
    ...products[0],
    subtitle: "ชั่งน้ำหนัก",
    description: "",
    connection: "—",
  });
  assert.ok(!topics.includes("non-waterproof"));
  assert.ok(!topics.includes("waterproof"));
});

test("broad legacy washdown collection is not a waterproof specification", () => {
  const topics = classifyProductTopics(
    { ...products[0], name: "แท่นชั่ง", subtitle: "ชั่งน้ำหนัก", description: "", connection: "—" },
    ["/collections/Washdown weighing"],
  );
  assert.ok(!topics.includes("waterproof"));
});

test("waterproof consumables are not classified as wet-work scales or label-printing equipment", () => {
  const topics = classifyProductTopics({
    ...products[0],
    category: "accessories",
    name: "สติกเกอร์กันน้ำ สำหรับพิมพ์ฉลาก",
    subtitle: "",
    description: "",
    connection: "—",
  });
  assert.ok(topics.includes("consumables"));
  assert.ok(topics.includes("for-printing"));
  assert.ok(!topics.includes("wet"));
  assert.ok(!topics.includes("labels"));
});

test("POS operating system membership and all topic keys are supported", () => {
  const topics = classifyProductTopics(
    {
      ...products[0],
      category: "pos",
      name: "POS",
      subtitle: "",
      description: "",
      connection: "—",
    },
    ["/collections/pos-android"],
  );
  assert.ok(topics.includes("android"));
  assert.ok(!topics.includes("windows"));
  const ids = topicGroups.flatMap((group) => group.topics.map((topic) => topic.id));
  assert.equal(new Set(ids).size, ids.length);
});
