import type { Product } from "../types";
import type { SourceProduct } from "@/features/content/types";

export function productPresentation(product: Product, snapshot?: Product, source?: SourceProduct) {
  if (product.media)
    return {
      images: product.media.gallery.map((entry) => entry.image),
      descriptionHtml: product.media.descriptionHtml,
      specifications: product.media.specifications,
    };
  const images = source?.images ?? [];
  const imageChanged = snapshot && product.image !== snapshot.image;
  const specifications = [...(source?.specifications ?? [])];
  const fields = [
    { key: "capacity", label: "พิกัดน้ำหนัก", pattern: /พิกัดน้ำหนัก|น้ำหนักสูงสุด/ },
    { key: "readability", label: "ความละเอียด", pattern: /อ่านละเอียด|ความละเอียด|ค่าละเอียด/ },
    { key: "connection", label: "การเชื่อมต่อ", pattern: /การเชื่อมต่อ|พอร์ท|พอร์ต/ },
  ] as const;
  for (const field of fields) {
    if (snapshot && product[field.key] === snapshot[field.key]) continue;
    const index = specifications.findIndex((spec) => field.pattern.test(spec.label));
    const entry = { label: field.label, value: product[field.key] };
    if (index === -1) specifications.push(entry);
    else specifications[index] = { ...specifications[index], value: product[field.key] };
  }
  return {
    images: imageChanged
      ? [
          ...(product.image ? [product.image] : []),
          ...images.filter((image) => image !== product.image),
        ]
      : images.length
        ? images
        : product.image
          ? [product.image]
          : [],
    descriptionHtml:
      snapshot && product.description === snapshot.description
        ? source?.descriptionHtml
        : undefined,
    specifications,
  };
}
