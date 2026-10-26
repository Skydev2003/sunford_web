# Sunford public content import

Source: [sunford.co](https://www.sunford.co/). Imported on 26 October 2026.

## Coverage

- Read 398 public source URLs after following the sitemap and discoverable page links.
- Saved 392 readable pages, including 150 product records and 112 collections.
- Stored 909 image files locally and 20 video references. Playback uses the original YouTube video IDs.
- Preserved full product introductions, detailed specifications, available specification tables, image galleries, articles, software pages, company information, service information and policy text.
- Preserved public paths through the catch-all page route. Existing short product slugs continue to work.
- Added `/explore`, local content search, collection browsing and product pagination to make imported content discoverable.

The importer does not execute source scripts. Imported HTML is sanitized before it enters the application: scripts, styles, inline event handlers and unsafe URL schemes are removed. The application reads the saved snapshot; visitors do not trigger a source crawl.

## Missing source material

The source returned 404 for six URLs. Two old printer URLs are mapped to their current product records, and three old category URLs resolve to the current category pages. The old `/products/FCS` page has no verified replacement and retains a normal not-found response.

Twenty source image URLs were unavailable. They are represented by image slots instead of substitute images. Empty source collections also show an image slot. The ERP source contains placeholder copy; the local presentation leaves that detail area unfilled and offers contact information.

Precise source URLs and the missing-image inventory are retained in `src/features/content/data/import-report.json`. This is the audit record; do not describe unavailable source content as having been copied.

## Forms and accounts

The import covers public information. Sign-in, account registration, passwords, carts, checkout, payment and test pages are excluded. Warranty and customer-service pages preserve public information and open the original form for real submissions. The clone does not invent a local submission success state.

## Data and assets

- `src/features/content/data/pages.json`: source pages, sanitized bodies, collection membership and videos.
- `src/features/content/data/products.json`: full public product details and galleries.
- `public/images/imported/`: source images, named by a stable URL hash.
- `scripts/import-sunford.mjs`: resumable importer; cached HTML is ignored under `node_modules/.cache`.
- `scripts/validate-import.mjs`: validates record uniqueness, sanitized markup, video IDs and local images.

Run `npm run content:import` to repeat the import and `npm run content:validate` to validate its outputs. Remove or bypass the ignored crawl cache deliberately when a fresh source refresh is required; a normal rerun reuses cached HTML.

## Presentation

The layout follows the supplied Apple reference: compact global navigation, product-first hero sections, pill-shaped actions, alternating light and dark bands, two-column feature panels, horizontal media rows and a quiet footer. Sunford branding, content and photography remain the subject.

Desktop menus use masked backdrop layers that reduce blur from 24 to 12 to 4 pixels. Keep vendor-prefixed `backdrop-filter` before the standard declaration: with the opposite order, the installed CSS compiler drops the standard form and Chromium computes no backdrop blur. Reduced-motion preferences disable transitions.
