# Project state

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

## Done

- Added category-specific selection links and buying advice to all five product menus, retaining the original primary categories and support columns.
- Added five complete buying guides for menu topics that lacked matching pages. Wet-work guidance requires checking the whole weighing assembly and does not infer waterproofing from stainless construction alone.
- Reduced flyout vertical padding while retaining content-driven sizing.
- Verified production build, TypeScript, scoped ESLint and formatting.
- Browser checks cover the three-column content, destinations and fragments, mobile navigation, the shared logo-aligned origin and zoom at 1126/1440/1920px, reduced motion, guide navigation and mobile guide layouts.
- Verified the CMS navigation editor preserves its data in the browser fixture and schema validation accepts legacy items while rejecting unsafe links and more than two secondary columns.
- Added reusable icon tooltips and verified production build, TypeScript, scoped ESLint and ten browser checks covering tooltip interactions plus existing navigation, comparison and 3D controls.

## Out of scope

- No mobile navigation redesign, new product filtering features, database content writes or deployment in this change.
- Guide pages are not added to the CMS page editor or search index in this change.
