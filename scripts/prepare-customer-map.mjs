// Rebuild locally hosted geometry and the readable Thai area reference.
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const repo = "DevelopedbyWill/thailand-canonical-admin-names";
const revision = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(revision ?? ""))
  throw new Error("Pass the pinned 40-character upstream commit.");
const root = path.resolve("public/maps/thailand");
const levels = ["province", "district", "subdistrict"];
const originals = await Promise.all(
  levels.map(async (level, index) => {
    const url = `https://raw.githubusercontent.com/${repo}/${revision}/data/v1.0.0/thailand-adm${index + 1}-polygons-v1.0.0.geojson`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${level}: HTTP ${response.status}`);
    const text = await response.text();
    return {
      level,
      url,
      features: JSON.parse(text).features,
      sha256: createHash("sha256").update(text).digest("hex"),
    };
  }),
);
const [provinces, districts, subdistricts] = originals.map((item) => item.features);
if (provinces.length !== 77 || districts.length !== 928 || subdistricts.length !== 7425)
  throw new Error("Review upstream coverage before updating.");
const rawProject = ([lon, lat]) => [
  (lon * Math.PI) / 180,
  -Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)),
];
const polygons = (feature) =>
  feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;
const extent = (points) =>
  points.reduce(
    (b, p) => [
      Math.min(b[0], p[0]),
      Math.min(b[1], p[1]),
      Math.max(b[2], p[0]),
      Math.max(b[3], p[1]),
    ],
    [Infinity, Infinity, -Infinity, -Infinity],
  );
const countryBounds = extent(provinces.flatMap((f) => polygons(f).flat(2).map(rawProject)));
const scale = Math.min(
  720 / (countryBounds[2] - countryBounds[0]),
  720 / (countryBounds[3] - countryBounds[1]),
);
const round = (n) => Math.round(n * 100) / 100;
const project = (point) => {
  const p = rawProject(point);
  return [
    round(400 + (p[0] - (countryBounds[0] + countryBounds[2]) / 2) * scale),
    round(400 + (p[1] - (countryBounds[1] + countryBounds[3]) / 2) * scale),
  ];
};
const code = (feature, level) => feature.properties[`ADM${level}_PCODE`].replace(/^TH/, "");
function polygonCenter(ring) {
  let twiceArea = 0,
    x = 0,
    y = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i],
      b = ring[i + 1],
      cross = a[0] * b[1] - b[0] * a[1];
    twiceArea += cross;
    x += (a[0] + b[0]) * cross;
    y += (a[1] + b[1]) * cross;
  }
  return {
    size: Math.abs(twiceArea),
    point: twiceArea ? [round(x / (3 * twiceArea)), round(y / (3 * twiceArea))] : ring[0],
  };
}
function convert(feature, levelIndex) {
  const level = levelIndex + 1;
  const id = code(feature, level);
  const projectedPolygons = polygons(feature).map((p) => p.map((ring) => ring.map(project)));
  const rings = projectedPolygons.flat();
  const centers = projectedPolygons
    .map((polygon) => polygonCenter(polygon[0]))
    .sort((a, b) => b.size - a.size);
  const children = level === 1 ? districts : level === 2 ? subdistricts : null;
  return {
    id,
    level: levels[levelIndex],
    name: feature.properties[`ADM${level}_TH`],
    ...(level > 1 ? { parentId: code(feature, level - 1) } : {}),
    ...(children
      ? {
          childIds: children
            .filter((child) => code(child, level) === id)
            .map((child) => code(child, level + 1))
            .sort(),
        }
      : {}),
    path: rings.map((ring) => `M${ring.map((point) => point.join(",")).join("L")}Z`).join(""),
    center: centers[0].point,
    bounds: extent(rings.flat()),
  };
}
const byName = (a, b) => a.name.localeCompare(b.name, "th");
const converted = originals.map((original, i) =>
  original.features.map((feature) => convert(feature, i)).sort(byName),
);
for (const [i, areas] of converted.entries()) {
  if (new Set(areas.map((a) => a.id)).size !== areas.length)
    throw new Error(`Duplicate ${levels[i]} IDs`);
  for (const area of areas) {
    if (!new RegExp(`^\\d{${(i + 1) * 2}}$`).test(area.id))
      throw new Error(`Invalid ID ${area.id}`);
    if (
      i &&
      (!area.id.startsWith(area.parentId) ||
        !converted[i - 1].some((parent) => parent.id === area.parentId))
    )
      throw new Error(`Invalid parent ${area.id}`);
  }
}
await mkdir(path.join(root, "districts"), { recursive: true });
await mkdir(path.join(root, "subdistricts"), { recursive: true });
await writeFile(path.join(root, "provinces.json"), JSON.stringify({ areas: converted[0] }));
for (const province of converted[0]) {
  for (const index of [1, 2]) {
    await writeFile(
      path.join(root, `${levels[index]}s`, `${province.id}.json`),
      JSON.stringify({
        parentId: province.id,
        areas: converted[index].filter((a) => a.id.startsWith(province.id)),
      }),
    );
  }
}
await mkdir("data/customer-map", { recursive: true });
await writeFile(
  "data/customer-map/area-reference.json",
  JSON.stringify(
    subdistricts
      .map(({ properties: p }) => ({
        รหัสจังหวัด: p.ADM1_PCODE.slice(2),
        จังหวัด: p.ADM1_TH,
        รหัสอำเภอ: p.ADM2_PCODE.slice(2),
        "อำเภอ/เขต": p.ADM2_TH,
        รหัสตำบล: p.ADM3_PCODE.slice(2),
        "ตำบล/แขวง": p.ADM3_TH,
      }))
      .sort((a, b) => a["รหัสตำบล"].localeCompare(b["รหัสตำบล"])),
    null,
    2,
  ) + "\n",
);
await writeFile(
  path.join(root, "source.json"),
  JSON.stringify(
    {
      source: `https://github.com/${repo}/tree/${revision}`,
      attribution:
        "Thailand Canonical Administrative-Names Reference / William J. Reynolds; bundled COD-AB reference polygons, RTSD / OCHA / HDX",
      licenses: [
        "https://creativecommons.org/licenses/by/4.0/",
        "https://creativecommons.org/licenses/by/3.0/igo/",
      ],
      changes:
        "Converted WGS84 polygons to Mercator SVG paths; rounded to 0.01 SVG units, calculated label centroids of largest polygon, retained Thai names and administrative parent/child IDs, split by province. Thai reference index exported separately. No customer data included.",
      boundaryValidOn: "2019-02-21",
      provinces: 77,
      districts: 928,
      subdistricts: 7425,
      coverageNote:
        "Versioned reference geometry, not a live administrative register. Reconcile unmatched Excel rows; do not silently drop or guess their locations.",
      originals: originals.map(({ level, url, sha256 }) => ({ level, url, sha256 })),
    },
    null,
    2,
  ) + "\n",
);
console.log(`Prepared 77 provinces, 928 districts, 7425 subdistricts from ${revision}`);
