import "server-only";
import encodedPreviews from "./warehouse-image-previews.json";

const previews: Record<string, string> = encodedPreviews;

export function warehouseBlurDataURL(src: string | undefined) {
  const preview = src ? previews[src] : undefined;
  return preview ? "data:image/webp;base64," + preview : undefined;
}
