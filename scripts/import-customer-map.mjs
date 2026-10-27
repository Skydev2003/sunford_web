// Import the extracted aggregate workbook, retaining every source row and count.
// Re-run prepare-customer-map.mjs before importing a new snapshot.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const read = async (path) => JSON.parse(await readFile(path, "utf8"));
const source = await read("data/customer-map/source-aggregates.json");
const names = await read("data/customer-map/name-reference.json");
const root = "public/maps/thailand";
const provinces = (await read(`${root}/provinces.json`)).areas;
const displayName = (value) =>
  String(value ?? "")
    .normalize("NFC")
    .trim()
    .replace(/^(จังหวัด|อำเภอ|เขต|ตำบล|แขวง)\s*/u, "");
const normalize = (value) => displayName(value).replace(/[.\s]+/g, "");
const districtNames = new Map(names.districts.map((area) => [area.id, area.name]));
const referenceSubdistricts = new Map(
  names.subdistricts.map((area) => [`${area.parentId}|${normalize(area.name)}`, area]),
);
const counts = {
  updatedAt: source.updatedAt,
  summary: {
    total: source.total,
    located: source.located,
    unknownProvince: source.unknownProvince,
    foreign: source.foreign,
    unknownSubdistrict: source.unallocated.reduce((sum, row) => sum + row.count, 0),
  },
  unallocatedByProvince: {},
  areas: {},
};
const readable = [];
const missingGeometry = [];
const renamed = [];
const consumed = new Set();
const pendingFiles = [];
let districtCount = 0,
  subdistrictCount = 0,
  subdistrictTotal = 0;

// These spellings refer to the same coded area in the supplied and reference lists.
const aliases = { ไผ่จำศีล: "ไผ่จำศิล" };
const verifiedGeometryAliases = new Set(["910303", "150601"]);

for (const province of provinces) {
  const provinceSource = source.provinces.find(
    (row) => normalize(row.province) === normalize(province.name),
  );
  if (!provinceSource) throw new Error(`Missing province ${province.name}`);
  counts.areas[province.id] = provinceSource.count;
  counts.unallocatedByProvince[province.id] = provinceSource.unallocated;
  const districtLayer = await read(`${root}/districts/${province.id}.json`);
  const geographic = (await read(`${root}/subdistricts/${province.id}.json`)).areas;
  const importedSubdistricts = [];
  let provinceSubdistrictTotal = 0;

  for (const district of districtLayer.areas) {
    if (districtNames.has(district.id)) district.name = districtNames.get(district.id);
    const rows = source.subdistricts.filter(
      (row) =>
        normalize(row.province) === normalize(province.name) &&
        normalize(row.district) === normalize(district.name),
    );
    if (!rows.length) throw new Error(`Missing district ${province.name}/${district.name}`);
    const children = [];
    let districtTotal = 0;
    for (const row of rows) {
      if (consumed.has(row.row)) throw new Error(`Source row reused ${row.row}`);
      consumed.add(row.row);
      const originalName = displayName(row.subdistrict);
      const name = normalize(aliases[originalName] ?? originalName);
      const exact = geographic.filter(
        (area) =>
          area.geometryAvailable !== false &&
          area.path.length > 0 &&
          area.parentId === district.id &&
          normalize(area.name) === name,
      );
      if (exact.length > 1) throw new Error(`Ambiguous name ${row.subdistrict}`);
      const canonical = referenceSubdistricts.get(`${district.id}|${name}`);
      let geometry = exact[0];
      if (!geometry && canonical) {
        const candidate = geographic.find(
          (area) =>
            area.geometryAvailable !== false &&
            area.path.length > 0 &&
            area.id === canonical.id &&
            area.parentId === district.id,
        );
        if (
          candidate &&
          (name.startsWith(normalize(candidate.name)) || verifiedGeometryAliases.has(candidate.id))
        )
          geometry = candidate;
      }
      // New or unmatched boundaries retain their source count in the list. Never
      // draw a guessed point, borrow a neighbouring polygon, or drop the record.
      const id =
        geometry?.id ??
        canonical?.id ??
        `source-${district.id}-${createHash("sha256").update(originalName).digest("hex").slice(0, 10)}`;
      if (Object.hasOwn(counts.areas, id)) throw new Error(`Duplicate aggregate key ${id}`);
      const area = geometry
        ? { ...geometry, name: originalName, geometryAvailable: true }
        : {
            id,
            level: "subdistrict",
            name: originalName,
            parentId: district.id,
            path: "",
            center: district.center,
            bounds: district.bounds,
            geometryAvailable: false,
          };
      if (!geometry)
        missingGeometry.push({
          province: province.name,
          district: district.name,
          subdistrict: originalName,
          count: row.count,
          sourceRow: row.row,
          id,
        });
      else if (geometry.name !== originalName)
        renamed.push({ id, original: geometry.name, sourceName: originalName });
      importedSubdistricts.push(area);
      children.push(id);
      counts.areas[id] = row.count;
      districtTotal += row.count;
      readable.push({
        จังหวัด: province.name,
        "อำเภอ/เขต": district.name,
        "ตำบล/แขวง": originalName,
        จำนวนลูกค้า_รายชื่อ: row.count,
        รหัสพื้นที่: id,
        มีขอบเขตแผนที่: Boolean(geometry),
        แถวต้นทาง: row.row,
      });
    }
    district.childIds = children;
    counts.areas[district.id] = districtTotal;
    provinceSubdistrictTotal += districtTotal;
    districtCount++;
  }
  if (provinceSubdistrictTotal + provinceSource.unallocated !== provinceSource.count)
    throw new Error(`Province reconciliation failed ${province.name}`);
  pendingFiles.push([`${root}/districts/${province.id}.json`, JSON.stringify(districtLayer)]);
  pendingFiles.push([
    `${root}/subdistricts/${province.id}.json`,
    JSON.stringify({
      parentId: province.id,
      areas: importedSubdistricts.sort((a, b) => a.name.localeCompare(b.name, "th")),
    }),
  ]);
  subdistrictCount += importedSubdistricts.length;
  subdistrictTotal += provinceSubdistrictTotal;
}
if (
  consumed.size !== source.subdistricts.length ||
  subdistrictCount !== 7440 ||
  districtCount !== 928
)
  throw new Error("Incomplete import");
if (
  subdistrictTotal + counts.summary.unknownSubdistrict !== source.located ||
  source.located + source.unknownProvince + source.foreign !== source.total
)
  throw new Error("Total reconciliation failed");
// All reconciliation checks finish before any geographic asset is changed.
for (const [file, text] of pendingFiles) await writeFile(file, text);
await writeFile(
  `${root}/NAME-REFERENCE-LICENSE.txt`,
  await readFile("data/customer-map/NAME-REFERENCE-LICENSE.txt", "utf8"),
);
const geographicSource = await read(`${root}/source.json`);
geographicSource.customerDataOverlay = {
  updatedAt: source.updatedAt,
  subdistricts: subdistrictCount,
  geometryMatched: subdistrictCount - missingGeometry.length,
  withoutGeometry: missingGeometry.length,
  namesReference: names.source,
  namesLicense: "/maps/thailand/NAME-REFERENCE-LICENSE.txt",
};
await writeFile(`${root}/source.json`, JSON.stringify(geographicSource, null, 2) + "\n");
await writeFile(
  "src/features/customer-map/data/customer-counts.json",
  JSON.stringify(counts, null, 2) + "\n",
);
await writeFile(
  "data/customer-map/customer-counts-readable.json",
  JSON.stringify(readable, null, 2) + "\n",
);
const report = {
  sourceFile: source.sourceFile,
  sourceSha256: source.sourceSha256,
  updatedAt: source.updatedAt,
  unit: source.unit,
  total: source.total,
  located: source.located,
  unknownProvince: source.unknownProvince,
  foreign: source.foreign,
  unknownSubdistrict: counts.summary.unknownSubdistrict,
  allocatedToDistrictAndSubdistrict: subdistrictTotal,
  provinces: 77,
  districts: districtCount,
  subdistricts: subdistrictCount,
  sourceRowsConsumed: consumed.size,
  geometryMatched: subdistrictCount - missingGeometry.length,
  withoutGeometry: missingGeometry.length,
  withoutGeometryCount: missingGeometry.reduce((sum, row) => sum + row.count, 0),
  missingGeometry,
  renamed,
  namesReference: names.source,
  reconciliation: "PASS",
};
await writeFile("data/customer-map/import-report.json", JSON.stringify(report, null, 2) + "\n");
console.log(
  JSON.stringify({
    total: report.total,
    subdistricts: report.subdistricts,
    geometryMatched: report.geometryMatched,
    withoutGeometry: report.withoutGeometry,
    withoutGeometryCount: report.withoutGeometryCount,
    reconciliation: report.reconciliation,
  }),
);
