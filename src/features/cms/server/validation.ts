import "server-only";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { isAllowedProductImage } from "@/features/admin/server/media";

export function safeLink(value: string) {
  if (/[\u0000-\u001f\\]/.test(value)) return false;
  if (value === "" || /^#[\w-]+$/.test(value)) return true;
  if (value.startsWith("/") && !value.startsWith("//")) {
    try {
      const decoded = decodeURIComponent(value);
      const normalized = new URL(decoded, "https://site.invalid");
      return (
        normalized.origin === "https://site.invalid" &&
        !decoded.startsWith("//") &&
        !/[\\\u0000-\u001f]/.test(decoded) &&
        !/^\/(admin|api)(\/|$)/i.test(normalized.pathname)
      );
    } catch {
      return false;
    }
  }
  if (/^(mailto:[^@\s]+@[^@\s]+|tel:\+?[\d()-]+)$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function safeImage(value: string) {
  return (
    isAllowedProductImage(value) ||
    /^\/images\/[a-z0-9][a-z0-9._-]*\.(png|jpe?g|webp|avif)$/i.test(value)
  );
}
export function cleanHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "span",
      "figure",
      "figcaption",
      "details",
      "summary",
    ],
    allowedAttributes: {
      "*": ["class"],
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedSchemes: ["https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tag, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          href: safeLink(attribs.href ?? "") ? attribs.href : "",
          rel: "noopener noreferrer",
        },
      }),
    },
    exclusiveFilter: (frame) => frame.tag === "img" && !safeImage(frame.attribs.src ?? ""),
  });
}
const text = z.string().trim().max(5000);
export const linkSchema = text.refine(
  safeLink,
  "ลิงก์ไม่ถูกต้อง ใช้ /path, #section หรือ https://",
);
export const imageSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(safeImage, "กรุณาอัปโหลดรูปผ่านช่องรูปภาพ");
export const videoSchema = z.object({
  id: z
    .string()
    .trim()
    .transform((value) => {
      if (/^[\w-]{11}$/.test(value)) return value;
      try {
        const url = new URL(value);
        if (url.hostname === "youtu.be") return url.pathname.slice(1);
        if (
          ["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com"].includes(
            url.hostname,
          )
        )
          return url.searchParams.get("v") ?? url.pathname.split("/").at(-1) ?? "";
      } catch {
        /* Validate below. */
      }
      return "";
    })
    .pipe(z.string().regex(/^[\w-]{11}$/, "YouTube URL ไม่ถูกต้อง")),
  image: imageSchema,
});
export const mediaSchema = z.object({
  price: z
    .union([z.literal(""), z.null(), z.coerce.number().min(0).max(999999999)])
    .transform((value) => (value === "" ? null : value)),
  gallery: z.array(z.object({ image: imageSchema.refine(Boolean, "กรุณาเลือกรูปภาพ") })).max(50),
  descriptionHtml: z.string().max(300000).transform(cleanHtml),
  detailsHtml: z.string().max(500000).transform(cleanHtml),
  specifications: z.array(z.object({ label: text.min(1), value: text })).max(100),
  videos: z.array(videoSchema).max(30),
});
export const pageSchema = z.object({
  sourcePath: z.string().max(1000),
  path: z
    .string()
    .min(2)
    .max(1000)
    .refine((value) => {
      try {
        const decoded = decodeURIComponent(value);
        return (
          safeLink(value) &&
          value.startsWith("/") &&
          !/[?#]/.test(decoded) &&
          !decoded.split("/").some((segment) => segment === "." || segment === "..") &&
          !/^\/(products|explore|_[^/]*|icon\.svg)(\/|$)/i.test(decoded)
        );
      } catch {
        return false;
      }
    }, "URL นี้สงวนไว้หรือไม่ถูกต้อง"),
  title: text.min(1),
  kind: z.enum(["page", "article", "collection"]),
  html: z.string().max(1000000).transform(cleanHtml),
  images: z.array(z.object({ image: imageSchema.refine(Boolean) })).max(50),
  videos: z.array(videoSchema).max(30),
  productIds: z.array(z.object({ id: text.min(1) })).max(500),
  published: z.boolean(),
  order: z.coerce.number().int().min(0).max(99999),
});
export const categorySchema = z.object({
  label: text.min(1).max(150),
  english: text.min(1).max(150),
});
export const heroSchema = z.object({
  announcement: text,
  announcementLabel: text,
  announcementHref: linkSchema,
  tagline: text,
  primaryLabel: text,
  secondaryLabel: text,
  secondaryHref: linkSchema,
  slides: z
    .array(
      z.object({
        productId: text,
        title: text,
        description: text,
        image: imageSchema,
        href: linkSchema,
      }),
    )
    .min(1)
    .max(20),
});
export const siteSchema = z.object({
  logo: imageSchema.refine(Boolean),
  name: text.min(1),
  phone: text,
  phoneHref: linkSchema,
  email: z.email(),
  line: linkSchema,
  messenger: linkSchema.optional(),
});
export const navigationSchema = z.object({
  exploreLabel: text,
  exploreLinks: z.array(z.object({ label: text.min(1), href: linkSchema.refine(Boolean) })).max(30),
  helpLabel: text,
  helpLinks: z.array(z.object({ label: text.min(1), href: linkSchema.refine(Boolean) })).max(30),
  mobileLinks: z.array(z.object({ label: text.min(1), href: linkSchema.refine(Boolean) })).max(30),
  items: z
    .array(
      z.object({
        label: text.min(1),
        submenuLabel: text.optional(),
        href: linkSchema.refine(Boolean),
        links: z.array(z.object({ label: text.min(1), href: linkSchema.refine(Boolean) })).max(30),
        groups: z
          .array(
            z.object({
              label: text.min(1),
              links: z
                .array(z.object({ label: text.min(1), href: linkSchema.refine(Boolean) }))
                .max(30),
            }),
          )
          .max(2)
          .optional(),
      }),
    )
    .min(1)
    .max(20),
});
export const patchesSchema = z
  .record(z.string().regex(/^(text|image|href)_[a-f0-9]+$/), text)
  .superRefine((data, ctx) => {
    for (const [key, value] of Object.entries(data)) {
      if (
        (key.startsWith("image_") && !safeImage(value)) ||
        (key.startsWith("href_") && !safeLink(value))
      )
        ctx.addIssue({ code: "custom", message: "รูปภาพหรือลิงก์ไม่ถูกต้อง", path: [key] });
    }
  });
export const footerSettingsSchema = z
  .object({ customerMapEnabled: z.boolean().default(true) })
  .catchall(text)
  .superRefine((data, ctx) => {
    const patches = Object.fromEntries(
      Object.entries(data).filter(([key]) => key !== "customerMapEnabled"),
    );
    const result = patchesSchema.safeParse(patches);
    if (!result.success)
      for (const issue of result.error.issues)
        ctx.addIssue({ code: "custom", message: issue.message, path: issue.path });
  });
export const textSettingsSchema = z.record(z.string().max(100), text).superRefine((data, ctx) => {
  for (const [key, value] of Object.entries(data))
    if (/href$/i.test(key) && !safeLink(value))
      ctx.addIssue({ code: "custom", message: "ลิงก์ไม่ถูกต้อง", path: [key] });
});
