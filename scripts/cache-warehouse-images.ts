import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { isPublicWarehouseSku } from "../src/features/catalog/data/warehouse-products";
import {
  closeWarehousePool,
  readWarehouseImage,
  readWarehouseProducts,
  type WarehouseCachedImage,
} from "../src/features/services/warehouse-postgres";
import { readWarehouseStorageImage } from "../src/features/services/warehouse-storage";

const root = process.cwd();
const target = path.join(root, "data/warehouse/images.json");
const imageDir = path.join(root, "public/images/warehouse-cache");
const formats: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

async function capture() {
  loadEnvConfig(root, true);
  const feed = await readWarehouseProducts();
  if (!feed.items.length) throw Error("Empty feed: image cache left intact");
  await mkdir(imageDir, { recursive: true });
  await mkdir(path.dirname(target), { recursive: true });
  const images: WarehouseCachedImage[] = [];
  const files = new Set(await readdir(imageDir));
  const queue = feed.items.filter((item) => item.image_url && isPublicWarehouseSku(item.sku));
  async function worker() {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const metadata = await readWarehouseImage(item.sku);
      if (!metadata) throw Error("Missing Warehouse image for SKU " + item.sku);
      const { bytes, mime } = await readWarehouseStorageImage(metadata.image_object_key!);
      const ext = formats[mime];
      if (!ext) throw Error("Cannot save Warehouse image for " + item.sku);
      if (!bytes.length || bytes.length > 10 * 1024 * 1024)
        throw Error("Invalid image size for " + item.sku);
      const filename = hash(bytes) + "." + ext;
      if (!files.has(filename)) {
        files.add(filename);
        await writeFile(path.join(imageDir, filename), bytes);
      }
      images.push({
        sku: item.sku,
        master_item_id: metadata.master_item_id,
        updated_at: metadata.updated_at,
        local_image: "/images/warehouse-cache/" + filename,
      });
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  const data = { items: images.sort((a, b) => a.sku.localeCompare(b.sku)) };
  const temp = target + "." + randomUUID() + ".tmp";
  await writeFile(temp, JSON.stringify(data, null, 2) + "\n");
  JSON.parse(await readFile(temp, "utf8"));
  await rename(temp, target);
  console.log("Saved", images.length, "image references");
}
capture()
  .catch((error) => {
    console.error("Warehouse image cache refresh failed", error.code ?? error.name);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await closeWarehousePool();
    } catch {}
  });
