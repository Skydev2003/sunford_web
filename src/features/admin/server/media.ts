import "server-only";
import { getPrisma } from "@/lib/prisma";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { SupabaseClient } from "@supabase/supabase-js";
export const PRODUCT_IMAGE_BUCKET = "product-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function storageImagePath(image: string): string | null {
  const prefix = `${getSupabaseConfig().url.replace(/\/$/, "")}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  if (!image.startsWith(prefix)) return null;
  const path = image.slice(prefix.length);
  return /^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(png|jpe?g|webp)$/.test(path) ? path : null;
}
export function isAllowedProductImage(image: string) {
  return (
    image === "" ||
    /^\/images\/(?:products|imported)\/[a-z0-9][a-z0-9._-]*\.(png|jpe?g|webp|avif)$/i.test(image) ||
    storageImagePath(image) !== null
  );
}
export async function removeUnusedImage(supabase: SupabaseClient, image: string) {
  const path = storageImagePath(image);
  if (!path || (await getPrisma().product.count({ where: { image } }))) return;
  // Never change database state when Storage cleanup fails; retained files can be cleaned later.
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
  if (error) throw new Error("Storage cleanup failed.");
}
