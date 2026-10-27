# Project state

## Deployment state

- Production releases run `bun run deploy` from a clean `uat` branch: fetch/sync, rebase onto `origin/main`, validate with fixtures, then fast-forward push the checked HEAD to remote `main` for Vercel Git deployment. The cloud build pipeline is separate in `scripts/vercel-build.mjs`.
- Content paths with URL-encoded segments over 200 bytes rewrite internally to stable SHA-256 paths to bound Vercel prerender and runtime-cache filenames, preserving public URLs and content.

- Hosting configuration now targets Vercel via `vercel.json` (Node.js 24, npm, Mumbai `bom1` near the existing Supabase database). Import the repository and configure environment variables using `docs/vercel.md`; a live Vercel deployment has not yet been verified.
- Production builds from `main` migrate and seed before building. Preview builds accept other branches and only build; use an independently prepared Supabase project for Preview. Admin image uploads are limited to 4 MB to fit Vercel request limits.
- The Render observations below are historical. The repository no longer contains a Render Blueprint; the previous service must be disabled manually after the Vercel cutover.

- The existing `sunford-uat` Render service at `https://sunford-uat.onrender.com` tracks `main` and uses `APP_ENV=production`, despite its UAT service name. Deploying this service requires merging into `main` and passing its CI checks.
- On 2026-10-26, PR #2 merged the navigation and tooltip changes from `uat` into `main` as `264b7194200a2c8e671ae422415b3f296588269c`. PR and main CI passed, Render reported success, and `/api/health` returned `status: ok` with revision `264b7194200a`. No database schema or deployment configuration changed.
- Eight browser checks passed against the deployed site, covering navigation, guides and tooltips. One initial check encountered a transient Render 502 on page load and passed when rerun.

## Navigation architecture

- The public layout renders `SiteHeader`, which loads CMS navigation settings and passes them to the client `Header`.
- Default menu labels, primary links and category-specific secondary columns live in `src/features/cms/data/navigation.ts`.
- Desktop flyouts use their content height and share one fixed starting corner: the first column starts at the logo's left edge for every active menu. Switching menus does not move that starting corner. Panels are constrained to the remaining viewport width. Text within all columns is left-aligned. Primary links remain large and bold; secondary category links use smaller text. Hover zoom expands from the left edge; keyboard dismissal and backdrop behavior are preserved.
- The mobile menu retains its existing flat list of primary links and additional mobile links.

## Data contract

- `NavigationItem.groups` is an optional array of up to two `{ label, links: [{ label, href }] }` columns, validated by `navigationSchema` and editable through the CMS navigation editor.
- For existing saved items without `groups`, both the header and editor fall back to default columns by the item's primary `href`. An explicit empty array disables category-specific secondary columns.
- The support item at `/#support` continues to use `exploreLabel`, `exploreLinks`, `helpLabel` and `helpLinks`. Those generic columns appear only in the support flyout.
- Buying guides are statically defined in `src/features/content/data/buying-guides.ts` and rendered at `/guides/[slug]`. Guide prose is maintained in the repository; secondary menu labels and destinations are CMS-editable.
- Guide slugs are `scales`, `indicators`, `platforms`, `pos` and `accessories`. Menu fragments must match the section IDs in the corresponding guide.

## Shared UI components

- `Tooltip` in `src/components/ui/tooltip.tsx` accepts one trigger element and optional `content`. The description defaults to the trigger's `aria-label`; existing props, refs and event handlers are preserved without adding a layout wrapper.
- Tooltips appear after a short pointer hover or immediately on keyboard focus, remain hoverable, and dismiss on pointer exit, blur, click or Escape. Touch taps perform the original action without opening a tooltip. Disabled controls retain their native behavior.
- A visible tooltip uses `role="tooltip"` and adds its ID to the trigger's `aria-describedby`. Escape dismisses the tooltip before dismissing an underlying dialog.
- Tooltips are positioned within the viewport and follow resizing and scrolling. They render inside the nearest open native dialog, or in the document body, to avoid clipping and modal stacking issues.
- The shared tooltip is used for public icon controls in the header, modal close buttons, comparison controls, carousel arrows, product video playback, 3D controls and the contact launcher. Existing contact link labels and admin controls retain their current presentation.

## Product detail presentation

- All `/products/[slug]` pages use the shared reference layout: a rounded pale image panel on the left, and the product name, short subtitle, specification overview and red inquiry button on the right. Tablet layouts retain the two columns; screens up to 720px stack the gallery above the product information.
- Every overview has exactly eight rows in this order: น้ำหนัก, ค่าละเอียด, เหมาะสำหรับ, หน้าจอแสดงผล, หน่วยความจำ, การพิมพ์ฉลาก, การเชื่อมต่อระบบ, วัสดุและความทนทาน. `productOverview` maps existing specification labels and core capacity/readability/connection fields to these rows; missing or blank values appear as `-`. Unmatched specifications remain in the additional details table below the overview. No facts are inferred from descriptions or reference images.
- Product images, gallery controls, the JC21 3D model, CMS specifications, prices when supplied and inquiry destinations retain their existing data and behavior.
- The ค่าละเอียด label includes a circled question-mark button using the shared `Tooltip` to explain display increments with a 1-gram example. It supports hover, keyboard focus and Escape without changing the product's displayed specification value.
- Long descriptions and contact information appear below the main product overview, followed by existing technical details, videos and related products. Descriptions no longer use an inner scrolling box.
- Verified production build and TypeScript, scoped ESLint, and five browser checks covering every available product category, long names at 320/390/768/932/1440px, original specifications, gallery switching and 3D controls/fallback.

## Done

- Added category-specific selection links and buying advice to all five product menus, retaining the original primary categories and support columns.
- Added five complete buying guides for menu topics that lacked matching pages. Wet-work guidance requires checking the whole weighing assembly and does not infer waterproofing from stainless construction alone.
- Reduced flyout vertical padding while retaining content-driven sizing.
- Verified production build, TypeScript, scoped ESLint and formatting.
- Browser checks cover the three-column content, destinations and fragments, mobile navigation, the shared logo-aligned origin and zoom at 1126/1440/1920px, reduced motion, guide navigation and mobile guide layouts.
- Verified the CMS navigation editor preserves its data in the browser fixture and schema validation accepts legacy items while rejecting unsafe links and more than two secondary columns.
- Added reusable icon tooltips and verified production build, TypeScript, scoped ESLint and ten browser checks covering tooltip interactions plus existing navigation, comparison and 3D controls.

## Out of scope

- No mobile navigation redesign, new product filtering features or database content writes in this change.
- Guide pages are not added to the CMS page editor or search index in this change.
