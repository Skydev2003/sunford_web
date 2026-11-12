// Build once from the supplied raster-only reference. Coordinates use a 4 px/mm proof.
import fs from "node:fs/promises";
import sharp from "sharp";

const pdf = await fs.readFile(process.argv[2]);
const start = pdf.indexOf(Buffer.from("ffd8ff", "hex"));
const end = pdf.indexOf(Buffer.from("ffd9", "hex"), start);
if (start < 0 || end < 0) throw new Error("Cannot locate the reference JPEG");
const { data, info } = await sharp(pdf.subarray(start, end + 2))
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
if (info.width !== 2382 || info.height !== 3483 || info.channels !== 3)
  throw new Error("Unexpected reference image");
const X = (x) => Math.round((x * info.width) / 840);
const Y = (y) => Math.round((y * info.height) / 1188);
function clear(x, y, right, bottom, sampleX = 10, sampleY = 10) {
  const sample = (Y(sampleY) * info.width + X(sampleX)) * 3;
  const color = data.subarray(sample, sample + 3);
  for (let row = Y(y); row < Y(bottom); row++) {
    data.fill(color, (row * info.width + X(x)) * 3, (row * info.width + X(right)) * 3);
  }
}
clear(645, 125, 790, 213, 740, 128); // Document identifiers
clear(101, 244, 321, 355);
clear(343, 244, 525, 355);
clear(554, 252, 796, 290);
clear(37, 408, 805, 714); // All sample items and row dividers
clear(318, 726, 501, 778);
clear(214, 774, 501, 795);
clear(632, 733, 760, 777, 650, 737);
clear(685, 819, 797, 845);
clear(118, 954, 800, 991); // Warranty belongs to the selected products
clear(122, 1033, 239, 1131);
clear(339, 1032, 482, 1091);
clear(347, 1098, 474, 1126);
await sharp(data, { raw: info }).png().toFile("public/images/quotation-template.png");
