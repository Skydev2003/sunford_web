import assert from "node:assert/strict";
import test from "node:test";
import {
  createSpecificationIndex,
  findTechnicalSpecifications,
} from "../../src/features/catalog/data/technical-specifications";

test("technical search matches public Warehouse SKU or model and requires verified facts", () => {
  const withSpecs = {
    name: "SUNFORD Label Scale",
    warehouseSku: "G106321",
    warehouseModelCodes: ["RLS-1100"],
    warehouseSpecifications: [{ label: "รุ่นสินค้า", value: "RLS-1100" }],
  };
  const products = [
    withSpecs,
    { ...withSpecs, warehouseSku: "G100000", warehouseSpecifications: [] },
    { ...withSpecs, warehouseSku: undefined },
  ];
  const index = createSpecificationIndex(products, (product) => product);
  for (const query of ["g106321", "106321", "RLS1100", " rls 1100 "])
    assert.deepEqual(findTechnicalSpecifications(index, query), {
      total: 1,
      matches: [withSpecs],
    });
  for (const query of ["", "---", "G100000", "unknown"])
    assert.deepEqual(findTechnicalSpecifications(index, query), { total: 1, matches: [] });
});

test("technical search still finds models when the Warehouse model code array is empty", () => {
  const product = {
    warehouseSku: "G12345",
    name: "RLS Retail Scale",
    storefrontName: "Label Storefront 1100",
    warehouseName: "Digital Warehouse TCS-02",
    warehouseModelCodes: [],
    warehouseSpecifications: [{ label: "รุ่นสินค้า", value: "RLS-VERIFIED" }],
  };
  const index = createSpecificationIndex([product], (entry) => entry);
  for (const query of ["g12345", "RLS Retail", "label storefront", "tcs 02", "rls verified"])
    assert.deepEqual(findTechnicalSpecifications(index, query).matches, [product]);
});
