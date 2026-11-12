// Run from the repository root. The output is self-contained and stays on the seller's device.
import fs from "node:fs/promises";
import { build } from "esbuild";
const app = await build({
  entryPoints: ["tools/quotation-seller/seller.ts"],
  bundle: true,
  write: false,
  minify: true,
  format: "iife",
  legalComments: "inline",
});
const html = await fs.readFile("tools/quotation-seller/index.html", "utf8");
const font = await fs.readFile("src/app/fonts/noto-thai-regular.ttf");
const fontCss =
  "@font-face{font-family:Quotation;src:url(data:font/ttf;base64," + font.toString("base64") + ")}";
await fs.mkdir("output/quotation", { recursive: true });
await fs.writeFile(
  "output/quotation/SUNFORD-seller.html",
  html
    .replace("/* embedded-font */", () => fontCss)
    .replace("/* embedded-app */", () =>
      app.outputFiles[0].text.replace(/<\/script/gi, "<\\/script"),
    ),
);
