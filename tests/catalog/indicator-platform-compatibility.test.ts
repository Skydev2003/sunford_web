import assert from "node:assert/strict";
import test from "node:test";
import {
  headPlatformPairs,
  weighingAccessories,
  weighingGroups,
} from "../../src/features/content/data/indicator-platform-compatibility";

test("platform examples stay in their source groups, including document-only models", () => {
  const models = weighingGroups.map((group) =>
    group.platforms.flatMap(([, codes]) => codes.split(", ")),
  );
  assert.deepEqual(
    models.map((group) => group.length),
    [8, 9, 5, 10],
  );
  assert.ok(models[0].includes("TIS-150-AW31"));
  assert.ok(models[1].includes("VCS-300-SW31S"));
  assert.ok(models[2].includes("CSS-150"));
  assert.ok(models[3].includes("DCS-150-JC62Z"));
  assert.equal(weighingAccessories.length, 5);
});

test("each configured head only lists documented kits naming that exact model", () => {
  const heads = weighingGroups.flatMap((g) => g.heads.split(" / "));
  assert.deepEqual(Object.keys(headPlatformPairs).sort(), heads.sort());
  for (const group of weighingGroups) {
    const kits = group.platforms.flatMap(([, codes]) => codes.split(", "));
    for (const head of group.heads.split(" / ")) {
      const suffix = head.replace(/^Indicator-/, "");
      assert.deepEqual(
        [...headPlatformPairs[head]].sort(),
        kits.filter((code) => code.split("-").at(-1) === suffix).sort(),
      );
    }
  }
});
