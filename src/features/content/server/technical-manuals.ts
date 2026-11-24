import "server-only";
import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
import installationManuals from "../data/installation-manuals.json";
import usageManuals from "../data/usage-manuals.json";

export const technicalManuals = [...usageManuals, ...installationManuals];

export function sanitizeTechnicalManual(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "details", "summary"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["id", "class"],
      img: ["src", "alt", "width", "height", "loading", "decoding"],
      details: ["open"],
      th: ["scope", "colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      ol: ["start"],
      li: ["value"],
    },
    transformTags: { h1: "h2" },
  });
}

export function prepareTechnicalManualChapter(html: string) {
  const $ = load(sanitizeTechnicalManual(html), null, false);
  const primaryHeadings = $("h2");
  const headings = primaryHeadings.length > 2 || !$("h3").length ? primaryHeadings : $("h3");
  const outline = headings
    .map((index, heading) => {
      const item = $(heading);
      const id = item.attr("id") ?? `guide-section-${index + 1}`;
      item.attr({ id, tabindex: "-1" });
      return { id, label: item.text().replace(/\s+/g, " ").trim() };
    })
    .get();
  $('a[href^="/downloads/manuals/"]').attr("download", "");
  return { html: $.html(), outline };
}
