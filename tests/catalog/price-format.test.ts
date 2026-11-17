import assert from "node:assert/strict";
import test from "node:test";
import { formatBaht, formatPrice } from "../../src/features/catalog/data/price-format";

const prices = [
  [0, "0.00", "฿0.00"],
  [0.01, "0.01", "฿0.01"],
  [1.005, "1.01", "฿1.01"],
  [1.07, "1.07", "฿1.07"],
  [1.999, "2.00", "฿2.00"],
  [100, "100.00", "฿100.00"],
  [1234.5, "1,234.50", "฿1,234.50"],
  [9999999.99, "9,999,999.99", "฿9,999,999.99"],
] as const;

test("price numbers retain grouping, satang precision and display rounding without adding VAT", () => {
  for (const [value, expected] of prices) assert.equal(formatPrice(value), expected);
});

test("baht prices retain the Thai currency symbol and two decimal places exactly", () => {
  for (const [value, , expected] of prices) assert.equal(formatBaht(value), expected);
});
