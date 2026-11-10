# Project Memory

## Logo alignment in the Home Navbar flyout

- At tablet widths the all-products links started 32px to the right of the logo. The panel used a header-relative offset inside a narrower, centered stage.
- Keep the stage full width while positioning this panel from the header's logo offset. Measure the first actual link against the logo at both sides of the 1024px breakpoint.

## Scope rail spacing above shared list resets

- Observed: The first implementation applied horizontal padding to the new card rail, but the shared ProductsOverview `ul` reset had greater selector specificity. The cards rendered at the viewport edge while the section heading retained its gutter.
- Root cause: A local single-class rail rule did not beat the shared `.overview ul` reset, so visual inspection exposed a mismatch that structure and overflow checks could not detect.
- Correct behavior: Scope the rail rule through its owning page wrapper and measure the rendered left edges of the H1, intro, section heading and first card at representative widths. Keep the horizontal rail scrollable and verify body overflow separately. For the approved all-products layout, the four edges are32pxat390,48pxat834/1024and130pxat1440.

## Check Navbar hit boxes against the viewport

- Observed: A read-only browser experiment adding a ninth Navbar label moved search/compare controls beyond the834pxviewport. The Home page still reported no document overflow because an ancestor clipped the excess.
- Root cause: document.scrollWidth alone did not show clipped Header controls outside the visible viewport.
- Correct behavior: Check everyvisibleNavbar/control bounding box against the viewport and against neighboringitems, alongside documentoverflow. Test the desktopbreakpoint and adjacentwidths; any sharedfont/gap adjustment needs explicitSpec/Plan scope. The approved compact834–1023style is now integrated and verified for both Header variants at834/930/1023px, with the original spacing retained at1024/1440px.

## Keep final navigation and Footers outside stagger motion

- Owner correction: The final category link index and Footer shown in the latest image must stay static. This supersedes earlier coverage that included allnon-home main/footer content.
- Current contract: Exclude `[data-overview-section="index"]`, `[data-products-footer]` and `.site-footer`, including descendants, using the existing hook selectors. Keep the800msreference profile on othercontent,whole-homepage exclusion andNavbar unchanged. Do not exclude everyHTMLfooter or alterlayout/markup to implement this exception.
- Verified:66productioncases,5developmenthydrationcases and15responsiveparitycases pass. Native records remain0in excludedregions whilefinder/mobileFooterdetails work;othercontent still reveals. Use maincontent foroffscreen/late-callback motionfixtures becausefinalFooters no longer animate.

## Extract the full contract from a supplied motion reference

- Observed: The user clarified stagger bounce with runnable code specifying a stronger translate/scale pop; the existing implementation used a smaller translation without scale. They also confirmed page-open/viewport-entry activation.
- Root cause: A shared animation name did not specify its numeric movement, scale, easing, cadence or activation rules.
- Correct behavior: Extract duration, delay, easing, opacity, translation, scale and activation from the supplied reference before changing motion. Preserve previously agreed route exclusions and hydration/focus safeguards; record which behavior is proposed versus implemented and verified.
- Verified reference profile:800ms,100+150ms stagger,opacity0→1,translate40→0px,scale0.8→1,cubic-bezier(0.34,1.56,0.64,1);3cards×10times×3computedproperties match the supplied CSS reference exactly. Play only on first viewport entry per visit, keeping Home excluded and hydration-safe state.

## Freeze only the animation phase under inspection

- Observed: Mobile intro tests held newly encountered offscreen buttons at their invisible translated first frame; a neighboring gallery intercepted the trusted click indefinitely.
- Root cause: A test instrumentation wrapper froze every future reveal even after the entrance measurement had ended. The browser correctly reported the artificial overlap.
- Correct behavior: Keep recording native animations, but end test-only freezing after sampling the intended entrance. Let later offscreen reveals run normally before testing real pointer interaction; retain the click, dialog, reload and once-per-visit assertions. Read computedOffset when keyframe offsets are implicit.

## Keep animation bookkeeping outside child hydration markup

- Observed: Cold development loads showed hydration warnings for stagger attributes on scales, software and service content. The layout motion effect had written descendant markers while the page Client Component was still unhydrated.
- Root cause: A committed ancestor effect was treated as proof that all streamed or selectively hydrated children were ready. Production-only browser checks did not expose the development attribute diagnostic.
- Correct behavior: Keep imperative animation bookkeeping in JavaScript rather than injecting attributes that child React components do not render. Verify fresh development hydration with delayed child chunks, CPU throttling and console/page-error capture until the child is actually ready, alongside production motion checks. Do not use a fixed delay or warning suppression as a hydration guarantee.
- Verified repair: Removing leaf markers and using the managed set for keyboard ancestor lookup eliminates all3reproduced warnings while retaining native animation counts19/10/25. Test completed motion through recorded native Animation objects; for cached reentry inspect active animations rather than requiring a lifetime count of1on a DOM node that the router may reuse.

## Observe native modified-link tabs through the browser context

- Observed: Ctrl-clicking a real navigation link opened its destination in a new tab, but an opener-specific `page.waitForEvent("popup")` check timed out for both Header variants.
- Root cause: Native modified-link browsing does not guarantee the opener popup event assumed by the test.
- Correct behavior: For native Ctrl-click navigation, wait for the browser context's `page` event, then verify the new page URL and that the original page URL is unchanged. Use the opener's popup event when that opener relationship is part of the behavior being tested.

## Preserve pointer hit geometry when completing an entrance animation

- Observed: Clicking a breadcrumb during a paused entrance reveal focused the link, canceled its translation and moved it before pointer release; the click then failed to navigate.
- Root cause: A focus handler treated pointer focus like keyboard focus and changed the target's hit rectangle between pointerdown and click.
- Correct behavior: Complete entrance motion immediately for keyboard focus using the focused target's `:focus-visible` state. Preserve pointer-focused target geometry through click dispatch. Verify real trusted clicks and cached Back/Forward while a reveal is actively paused, separately from programmatic keyboard-focus checks.

## Update regressions after approved shared-navigation changes

- Observed: The combined pre-commit browser run failed on retired “สินค้า”, `.desktop-nav` and `.site-header` selectors and a former heading level after the approved five-category navigation and category-page changes.
- Root cause: New feature suites matched the final design, while earlier navigation and full-page regressions still described the previous shared markup.
- Correct behavior: When a shared navigation or category-route contract changes, search affected tests for old labels, chrome selectors, URLs and heading levels. Keep checks for every child destination, product membership, reload/history, keyboard focus and one visible header/footer, then run the affected suites together before committing.

## Gate decorative CSS entrance motion and measure the heading's actual paint

- Observed: With JavaScript disabled, Chrome exposed initial opacity0 while returning no active CSS animations; a title could remain hidden. Separately, a zero-opacity title became the final mobile LCP candidate after its fade, while an otherwise identical15%-opacity start painted the title earlier in a controlled4xCPU experiment.
- Root cause: A reduced-motion check alone did not cover disabled scripting. Starting critical text fully transparent also delayed its eligibility as visible painted content.
- Correct behavior: Apply decorative entrance CSS only under both prefers-reduced-motion:no-preference and scripting:enabled. Keep base styles visible and non-filling finite animations. Start critical headings at a visible nonzero opacity, leave Hero imagery unanimated, and compare actual LCP candidates, CLS and geometry under identical CPU throttling. Verify disabled JavaScript and reduced motion separately; unsupported scripting media queries must fall back to static content.

## Validate HTTP status before serving a cached route fallback

- Observed: An unknown category rendered the not-found page with HTTP200 even though the page checked its params before catalog reads and used instant=false.
- Root cause: Cache Components served the dynamic route's fallback shell before notFound() ran. instant=false controls validation, and dynamicParams is unavailable with Cache Components.
- Correct behavior: For finite catalog category pages whose full server output is cached, pair complete generateStaticParams with ensureStatic="navigation" so unknown parameters resolve before serving output. Verify the production request actually returns404 as well as showing not-found UI. Keep this setting local to suitable routes; do not disable streaming or add proxy guards across the app to fix one category route.

## Count active headers separately from cached route markup

- Observed: A navigation regression counted two shared headers after leaving Products for software and warranty pages, while only one header was visible.
- Root cause: The router retained the inactive Products subtree under a display:none ancestor. Counting all matching DOM nodes confused cached route markup with duplicate active navigation; runtime inspection confirmed the inactive header had zero width and height.
- Correct behavior: After client navigation, scope header interactions and uniqueness checks to visible headers, assert exactly one visible header and no visible menu left open, and inspect inactive header geometry before changing application code to remove cached content. Keep fresh-page structure assertions separate.

## Exclude archived source snapshots from TypeScript checks

- Observed: Removing an unused component caused typecheck to fail on an old `.tsx` backup inside `output`, although application imports had been removed.
- Root cause: TypeScript's recursive include patterns also compiled local evidence files.
- Correct behavior: Keep `output` excluded in `tsconfig.json`. Preserve backup files as evidence; do not restore retired application components solely to satisfy imports in archived snapshots.

## Verify cold-load geometry and normal-motion navigation together

- Observed: Opening correctness tests passed, but slow fonts still moved the Header logo5.25px after its destination was measured; reduced-motion nav tests also missed tone detection sampling the blocking opening as white.
- Root cause: Stable/warm assets and reduced motion did not exercise the normal opening's overlay, inert content and late font replacement.
- Correct behavior: Wait for Header fonts before capturing the docking target, sample the actual Hero beneath the opening, and verify normal-motion cold fonts plus final real-header alignment. Use lightweight frame sampling for performance claims; per-frame geometry probes can force layout and are diagnostic only.

## Keep carousel rebases free of inherited transform transitions

- Observed: Replacing a visible loop copy with its identical original caused a small video-card size/position jump, although logical indices and blur matched.
- Root cause: The global button transform transition animated the original card from its previous offscreen scale after the instantaneous scroll rebase. Story cards already overrode that transition.
- Correct behavior: When JavaScript drives per-frame carousel scale, override inherited transform transitions on the focused video cards. Verify normal-motion rebases by comparing visible logical cards, geometry and blur immediately before/after the copy swap; reduced-motion tests alone can hide the jump.

## SUNFORD service scope

- The owner confirmed on 2026-11-03 that SUNFORD does not offer a calibration service. Do not advertise calibration as a company service or add it to navigation. Product calibration instructions are separate from offering a service.

## Cancel section reveals when their route is hidden

- Observed: Navigating away during a HomeMotion reveal could show the error boundary on Back. A paused-reveal browser regression reproduced the crash.
- Root cause: Motion's stop() commits current styles; the route cache keeps nodes connected but hides them, so native commitStyles() throws InvalidStateError. Checking isConnected alone does not prove the target is rendered.
- Correct behavior: Cancel and clear HomeMotion controls during effect cleanup and before applying the reduced-motion baseline. Verify navigation and Back while a real reveal is still active, plus a live reduced-motion change.

## Distinguish hash filters from document anchors

- Observed: Navbar software links changed the URL hash on the downloads page while the selected filter remained unchanged.
- Root cause: The software catalogue subscribes to native hashchange; a same-page client-router navigation did not emit it. The fragment is filter state, not a DOM element ID.
- Correct behavior: For same-page Navbar hash links, use Link onNavigate to delegate fragment changes to the browser. Verify both the URL and selected filter, including first entry, changing categories and Back; do not require a DOM ID for filter fragments.

## Smoke-test hardware video encoders before a long render

- Observed: The installed FFmpeg NVENC encoder required a newer API than the current GPU driver provided, so encoder startup failed before writing frames.
- Root cause: Available encoder names do not prove driver compatibility.
- Correct behavior: Run a two-frame encode at the target resolution before selecting a hardware encoder. If initialization fails, use the installed software encoder and preserve the user's drivers; do not change drivers for a rendering task without a separate request. Poll renderer sessions to successful completion before previewing or verifying dependent files.

## Trace active section styles before layout changes

- Observed: Global legacy story/support selectors resembled current sections, but the mounted components use CSS Modules.
- Root cause: Similar selector names were treated as evidence of ownership before checking the current JSX imports.
- Correct behavior: Follow the mounted component's stylesheet imports and inspect computed geometry before editing section sizes. Remove edits to inactive selectors; verify the actual production-rendered section afterward.

## Verify a complete QA build before running browser suites

- Observed: An old QA server announced readiness, but requests returned 500 because its prerender manifest was missing.
- Root cause: A leftover BUILD_ID was treated as proof of a complete production build.
- Correct behavior: Use a fresh task-specific QA directory, confirm the build completed and its prerender manifest exists, then smoke-test HTTP 200 before running UI suites. Do not reuse another task's mutable build directory based only on BUILD_ID.

## Keep dark section backgrounds fixed during scroll reveals

- Observed: Revealing an entire black section over the white page surface exposed a 24px white strip and faded the section background.
- Root cause: The section itself received translateY and opacity animation rather than its inner content.
- Correct behavior: Animate the inner content while keeping the section background at opacity 1 with no transform. Sample actual intermediate animation frames and adjacent section bounds on desktop/mobile; settled screenshots alone miss the seam.

## Keep concurrent browser verification outputs separate

- Observed: Starting another Playwright run with the default output directory while a previous run was still finishing removed an in-progress trace artifact and produced an ENOENT test failure.
- Root cause: Each Playwright run cleans its output directory; the two runs shared `test-results`.
- Correct behavior: Wait for the active Playwright run to finish before launching another, or give each concurrent run a distinct `--output` directory. Use a clean sequential rerun to verify any case affected by artifact collisions.

## Verify physical labels after generative retouching

- Observed: Product background edits changed a readable LCD number and a small printed model code despite preservation instructions.
- Root cause: Generative retouching reconstructs text and display segments rather than preserving every source pixel.
- Correct behavior: Compare readable model codes, display values and button order against the original before delivery; correct observed changes with a narrowly targeted edit and recheck the alpha on light/dark backgrounds. Preserve source files and native retouched masters, and identify AI reconstruction and upscaling in the handoff.

## Verify requested raster resolution against actual image output

- Observed: Six transparent product edits requested as 4K returned native widths of 1536–1774 pixels from the built-in image tool.
- Root cause: A resolution requested in a natural-language prompt does not guarantee the returned file dimensions.
- Correct behavior: Inspect actual image metadata before claiming a resolution. Keep native retouched masters, export an explicitly labeled upscaled 3840 × 2160 PNG when needed, preserve alpha, and verify the final dimensions, transparent margins and composites on light/dark backgrounds.

## Keep initial 3D startup out of the brand opening

- Observed: The first model-viewer activation blocked the main thread for roughly 900ms during the brand opening, skipping the S hold and text-reveal samples even while the logo transform continued on the compositor.
- Root cause: Starting the 3D runtime at homepage mount competed with a short, reference-timed opening sequence.
- Correct behavior: Keep the existing product image fallback mounted, but defer model-viewer activation and Hero playback until the opening completes. Verify actual animation times and rendered poses in the browser; do not infer geometric phases from delayed JavaScript timers or change timing just to satisfy a sampling probe.

## Preserve already integrated merge history during releases

- Observed: Unconditional release rebases rewrote an approved merge even though both remote tips were already ancestors, splitting equivalent work into duplicate commit histories and producing repeated historical conflicts.
- Root cause: The release script always rebased instead of checking whether the required upstream history was already contained in the release.
- Correct behavior: Check `git merge-base --is-ancestor` before each synchronization rebase. Preserve merge parents when the remote tip is already included, retain rebasing for genuinely divergent histories, and verify both first-parent lineage and unchanged content before publication. Keep all validation and concurrency guards enabled.

## Check sticky navigation during partial Hero scrolling

- Observed: Hero headings showed through the sticky navigation and foreground bubble controls covered it while the Hero was still partially visible.
- Root cause: Header transparency followed whole-section intersection, while a body portal bypassed the header's ordinary stacking context. Endpoint screenshots missed the intermediate overlap.
- Correct behavior: Restore the header surface when content starts passing underneath it, and clip foreground portal paint/hit targets out of the measured navigation area. Check partial scroll on short desktop and mobile viewports, drag a bubble across a real navigation control, and verify returning to the top restores the intended transparent design.

## Restore foreground effects after visual overlay closure

- Observed: Hero bubbles popped into the foreground while the submenu and blur backdrop were still animating closed. A product change during that exit could also mount visible replacement bubbles.
- Root cause: Layer restoration followed the logical open class instead of the end of delayed CSS transitions; newly mounted effects did not inherit the overlay's closing state.
- Correct behavior: Keep foreground effects hidden and inert until every covering surface finishes its animations and has hidden computed visibility. Invalidate pending reveals on reopen or unmount, inspect ongoing closure when mounting replacements, then restart the entrance while respecting pause/reduced motion. Verify intermediate frames and product changes during closure, not only the final open/closed screenshots.

## Separate styling verification from live database availability

- Observed: Styling-only production builds repeatedly passed compilation and TypeScript but failed during page generation because the external database connection timed out.
- Root cause: Build-time public-content reads depend on database availability even when the change only affects CSS.
- Correct behavior: Retry once, then use the existing `hasDatabase()` snapshot fallback for isolated UI verification if the database remains unavailable. Set a placeholder containing `YOUR-PASSWORD` only in the QA process environment for both build and server; leave environment files and database records unchanged. Report snapshot verification separately from unavailable live-database verification.

## Reset CSS animations after imperative geometry probes

- Observed: A badge pause check reported movement even though computed `animation-play-state` was paused, after the probe had manually sought, paused and played its CSS animations.
- Root cause: Imperative animation playback changed the animation's control state and contaminated the following CSS-driven pause check. A fresh page using only the real UI paused correctly.
- Correct behavior: Separate manual keyframe/geometry sampling from real playback-control verification. Reload or use a fresh page after manipulating CSSAnimation timelines, then test pause/resume through the actual UI without imperative `play()` calls.

## Preserve RSC object sharing when trimming client props

- Observed: Individually projecting the same catalogue for a page and its layout increased serialized data despite removing fields. Projecting filtered category products separately also duplicated their descriptions.
- Root cause: New object identities discarded RSC reference deduplication across Client Component boundaries. Cold/resumed and cache-hit responses also had different sizes.
- Correct behavior: Create one request-cached public product projection, reuse its objects in the layout and page, and filter that shared array for category membership. Clone only when a displayed value actually changes. Measure every affected route under matched cache conditions before accepting a payload optimization.

## Keep isolated baseline source out of TypeScript's source globs

- Observed: A source snapshot under ignored `output/` was still typechecked against current aliases and failed the application build.
- Root cause: Git ignore rules do not exclude files from `tsconfig.json`'s recursive includes.
- Correct behavior: Put source-bearing benchmark snapshots outside the project or in an explicitly excluded directory before running checks. Keep temporary environment files out of deliverables and remove copied credentials after the isolated run.

## Read project text as UTF-8 on Windows

- Observed: Python source reads failed repeatedly on files containing Thai text while CSS-only scripts succeeded.
- Root cause: `Path.read_text()` used the Windows legacy code page instead of the repository's UTF-8 encoding.
- Correct behavior: Pass `encoding="utf-8"` explicitly to Python `read_text()` and `write_text()` when processing repository source or reports. Do not rely on the host locale.

## Separate browser automation jumps from application motion

- Observed: Performance sampling showed GPU raster stalls when automation scrolled a tall section into view, then instantly jumped again to an offscreen button before clicking.
- Root cause: The automation's implicit `scrollIntoViewIfNeeded` did not represent the page's normal smooth scrolling. A readiness check also needed to wait for hydration before interpreting the absence of an intro marker.
- Correct behavior: Wait for application hydration/readiness first; scroll controls into view normally before recording trusted clicks. Keep forced jumps as a separate stress scenario and retain their outliers rather than reporting them as normal scrolling. Use trace attribution to distinguish GPU raster work from JavaScript long tasks.

## Isolate browser test artifacts between runs

- Observed: A second Playwright run removed traces still being written by the first, causing an ENOENT failure during teardown after the UI assertions passed.
- Root cause: Concurrent runs shared the default output directory, which Playwright cleans at startup.
- Correct behavior: Run suites sequentially, or assign a distinct output directory to every concurrent run. Keep verification artifacts in ignored directories or outside the source tree.

## Verify sticky scenes and floating control hit targets in the browser

- Observed: A padded scene scrolled away leaving an empty area, and a video control overlapped the floating chat button on mobile.
- Root cause: Bottom padding did not provide the intended sticky travel area, and visibility/size assertions alone did not detect the overlay.
- Correct behavior: Give the sticky container a measured minimum height including its scroll travel. Assert the stage's actual position during forward/reverse scrolling and check controls with elementFromPoint at their centers across portrait and landscape sizes.

## Check interpolated frames at ribbon face reversals

- Observed: Moving product cards could stretch into a diagonal band across the Hero even though checks at eight fixed phases passed.
- Root cause: Per-card projective matrices became unstable during interpolation near the edge-on face reversal; keyframe-only or coarse phase checks missed the intermediate distortion.
- Correct behavior: Use the already projected position and an affine tangent for these cards. Verify rendered bounds through a full cycle at sub-keyframe intervals on mobile and desktop, including both face reversals and the loop seam.

## Resolve tooltip children before reading props

- Observed: The product readability tooltip crashed while reading `aria-label` from an undefined `children.props`.
- Root cause: The shared client tooltip assumed its child was already a resolved React element; delayed children from server rendering can lack directly accessible element props. Promise-backed children reproduce the same error in the original implementation.
- Correct behavior: Normalize children through React's `Children.toArray`, validate the single trigger with `isValidElement`, and only then access its props. Keep trigger props, refs and handlers intact. Test delayed children as well as direct page loads, client navigation and reloads.

## Read full specification fields before splitting labels and values

- Observed: Technical rows split parentheses, numeric ranges, dimensions and Thai words between the label and value cells.
- Root cause: Imported HTML span boundaries and the first space were treated as complete field boundaries, although the source often splits a word or number across spans.
- Correct behavior: Read the full paragraph and separate a recognized complete field prefix, removing only that prefix across DOM text nodes. Keep unfamiliar statements intact rather than guessing a boundary. Preserve inline links and media, and audit all current source records and published product URLs after changes.

## Regenerate Prisma Client after schema changes

- Observed: Admin product queries failed with `Unknown argument deletedAt`.
- Root cause: The schema and database had `deletedAt` and `catalogManaged`, but the local generated Prisma Client still used the older model.
- Correct behavior: Run `prisma generate` after changing or pulling the schema, then restart the dev server to replace the Prisma Client cached in `globalThis`. The `dev` script generates the client before starting Next.js. Verify the same query against the database; do not remove soft-delete filters to bypass an outdated client.

## Preserve navigation UX when updating menu data

- Observed: Updating categories from reference images also changed submenu typography, arrows, headings and the mobile menu hierarchy.
- Root cause: Images supplied for menu content were treated as instructions to redesign the interaction and presentation.
- Correct behavior: For menu data updates, change labels and destinations only. Preserve the existing submenu typography, spacing, hover behavior, animation and mobile menu structure unless the user explicitly requests UX changes.

## Install dependencies after manifest changes

- Observed: Product pages failed to compile because `@google/model-viewer` was declared in the npm manifest and lockfile but missing from local `node_modules` and `bun.lock`.
- Root cause: Dependency changes were committed without refreshing the local installation and the Bun lockfile used by the deployment workflow.
- Correct behavior: After pulling dependency changes, run `npm install` before starting development. When changing dependencies, synchronize both `package-lock.json` and `bun.lock`, verify Bun accepts the frozen lockfile, and run the production build.

## Isolate concurrent Playwright output

- Observed: A CMS browser check failed during trace cleanup with a missing trace file while another Playwright process used the same output directory. The same check passed when rerun with its own output directory.
- Root cause: Separate Playwright processes cleaned and wrote the shared `test-results` directory concurrently.
- Correct behavior: Run Playwright processes sequentially, or pass a distinct `--output` directory to each process before running them concurrently.

## Clean up products created during QA

- Observed: Two `inline-qa-` products with placeholder introduction text and no images remained published in the live catalogue after testing.
- Root cause: The QA records retained `published: true` and no deletion marker. The originating script was not found in the repository's tests or scripts, so its cleanup mechanism could not be established.
- Correct behavior: Track the exact IDs of products created for QA, clean them up in a `finally` block using the supported deletion flow, and verify that the admin list and public catalogue no longer contain them and their public URLs return 404. Never identify disposable records by a naming prefix alone; inspect their contents and references first.

## Preserve input values when a form action returns an error

- Observed: A failed product save inside the detail panel displayed the error but reset uncontrolled inputs to their original values.
- Root cause: React's form action reset ran after the action resolved with an error result, although the business operation had not succeeded.
- Correct behavior: Prevent the automatic reset for both detail and full-page product forms so failed saves keep the entered values, counters and draft preview consistent. Close the detail panel only after an explicit success result, and verify that a failed save leaves the master list's query and page unchanged.

## Use an application dialog for unsaved admin navigation

- Observed: An unsaved category edit showed its save bar in the embedded browser, but sidebar navigation continued without an observable JavaScript confirmation. Chrome exposed the standard confirmation, but it blocked browser-control commands.
- Root cause: The navigation guard relied on the browser host's handling of `window.confirm`.
- Correct behavior: Use the shared HTML confirmation dialog for admin links, panel cancellation and history traversal. Keep native `beforeunload` for reload/tab closure, where the browser controls warning availability and wording. Verify cancellation retains form values and accepted navigation does not produce a duplicate prompt.

## Preserve ordinary submit events when no confirmation is needed

- Observed: Product save/error regressions stopped reaching their fixture action after the unsaved guard cancelled and asynchronously replayed every submission.
- Root cause: The guard replaced the original submission even when no other dirty form needed confirmation, and replayed it without its submitter.
- Correct behavior: Allow the original submit event when no other form is dirty. Only cancel submissions that require confirmation, and replay accepted submissions with their original submitter. Verify both ordinary product saves and confirmed saves with multiple dirty forms.

## Rebind browser control after a stale bridge error

- Observed: Reusing a previous admin browser binding across turns repeatedly failed with `browser.user is unavailable`, while a runtime reset followed by binding the same known tab succeeded.
- Root cause: The retained browser-control binding no longer matched the available bridge session.
- Correct behavior: When this bridge error occurs, reset `cua_repl`, bind the known tab again with `cua.getTab`, read its fresh documentation/state and continue. Discard every pre-reset JavaScript binding; do not recreate tabs or switch browsers merely to recover this error.

## Avoid multiplying card padding in recursive CMS fields

- Observed: The navigation editor showed several nested borders and wide indentation around submenu/column/link fields, squeezing the input area.
- Root cause: Recursive array sections and their field containers each reused the outer card border and padding at every depth.
- Correct behavior: Keep the outer row card, render nested groups with headings and separators, and remove horizontal padding from nested row-field containers. Verify deeply nested input widths and retained form data before changing the editor's data structure.

## Select an available browser for local Playwright checks

- Observed: Browser checks failed before running their assertions because the bundled Chromium headless executable was not installed.
- Root cause: The local runner used its default browser despite an installed Chrome channel being available.
- Correct behavior: Check browser availability before running a large suite. If bundled Chromium is absent and Chrome is installed, set `PLAYWRIGHT_CHANNEL=chrome` for the local run using the existing configuration. Stop repeated launch failures and rerun the affected suite; do not change application code to resolve a missing test executable.

## Audit shared components for admin-wide visual changes

- Observed: A decorative-arrow/dot cleanup covered list headings and links but left login branding, back links, the product-view icon and generated editor guidance unchanged.
- Root cause: The initial review followed the screenshot examples without inventorying every admin route and shared presentation component.
- Correct behavior: For admin-wide presentation requests, inventory route files, shared editors, generated helper text and CSS pseudo-elements before editing. Inspect every primary module and editor type, including login and auxiliary views, and preserve controls whose icons perform reordering or expansion. Update text selectors and verify the affected workflows before claiming complete coverage.

## Preserve rich product content across browser newline normalization

- Observed: Saving an unchanged product description replaced its formatted introduction with one long paragraph. ACS-30-JC21EL retained its text but lost paragraph and soft-break markup.
- Root cause: Browser form submission converted LF to CRLF. A raw string comparison treated that as an edit and overwrote rich HTML with a single paragraph containing literal newlines.
- Correct behavior: Normalize CRLF and CR to LF at the product input boundary and before comparing existing descriptions or source snapshots. Preserve existing rich HTML when normalized descriptions match. For real plain-text edits, escape HTML, convert blank lines into paragraphs and single newlines into line breaks. Verify both newline directions and actual text edits through the save action. Restore damaged formatting only after comparing the current text with its source and backing up the current record.

## Name product fields by their public-page location

- Observed: A saved subtitle change appeared ineffective because the user checked the separate introduction beneath the product details heading.
- Root cause: The form grouped subtitle/plain description together while the rich-content editor lived behind a distant secondary link; generic labels did not distinguish their visible destinations.
- Correct behavior: Group and label product fields by their public-page location. Identify the subtitle beneath the model name and the separate lower introduction, keep the rich-content shortcut adjacent to the introduction, explain plain-text replacement before editing, and label preview limitations. Verify that editing the subtitle preserves the description and that switching editors protects unsaved values.

## Edit the resolved overview values shown on the public product page

- Observed: The public overview showed eight specification rows, but the product form exposed only three raw fields. Saved specification aliases can also make a displayed value differ from its raw product fallback.
- Root cause: The admin form did not use the public overview resolver and treated the product row as the sole source for these values.
- Correct behavior: Load and edit all eight rows through the shared overview definition/resolver. Match existing specification aliases when saving, preserve raw fallback fields when the resolved value is unchanged, and store explicit dashes when clearing values. Keep unrelated specifications and rich media unchanged, and verify create/update/clear/stale/error cases through the transactional save action.

## Refresh generated development route types after removing routes

- Observed: A production build compiled successfully but failed TypeScript validation because `.next/dev/types/validator.ts` still imported deleted admin routes.
- Root cause: The project includes both production and development generated types, and the production build did not refresh the earlier development validator after route removal.
- Correct behavior: Stop development servers before removing routes. Move or clear only the stale generated `.next/dev/types` directory, then run the production build and TypeScript again. Let the next development startup regenerate its route types; do not change application routes or suppress type errors to satisfy stale generated imports.

## Skip hidden images in public screenshot preloading

- Observed: Desktop and mobile homepage browser checks timed out trying to scroll hidden images into view.
- Root cause: The preload helper iterated every image, including mounted images hidden by the current UI state.
- Correct behavior: Select visible images when preloading a page for screenshots. Keep scrolling and natural-width checks for those displayed images; verify hidden images only through the interaction that reveals them.

## Pause moving photo ribbons before screenshot preloading

- Observed: The homepage screenshot check timed out waiting for an image to stop moving even after hidden images were skipped.
- Root cause: The Hero photo ribbon keeps animating independently of product autoplay, so `scrollIntoViewIfNeeded()` could not obtain a stable image target.
- Correct behavior: Pause both Hero autoplay and its photo ribbon through their controls before preloading screenshot images. Keep the visible-image and natural-width checks, and store screenshots in each test's output directory.

## Check committed merge results for conflict markers

- Observed: A clean working tree still contained conflict markers in a browser test after a merge, preventing Playwright from parsing the file.
- Root cause: The marker text was committed in the merge result; Git no longer reported an unmerged path.
- Correct behavior: Scan the final changed files for conflict markers and run test discovery before committing a merge resolution. Do not treat a clean Git status alone as evidence that conflicts were resolved correctly.

## Stop QA development servers before handing control back

- Observed: The user could not run `bun dev` because the agent’s local verification server still held the development-server lock.
- Root cause: A QA development server was left running after verification without coordinating who would own the local server.
- Correct behavior: Stop agent-started QA development servers before handing the terminal back unless the user asks to keep them running. When resolving a conflict, verify the process command line and project directory before stopping it, then confirm the port is free. Do not start a replacement server when the user intends to run their own.

## Check translated paths against existing ASCII routes

- Observed: Initial English translations for two Thai routes collided with existing ASCII destinations when compared without case.
- Root cause: Translating each source segment independently did not account for English routes already present in the imported catalogue.
- Correct behavior: Compare every proposed destination against the complete existing route set using case-insensitive keys before applying a path migration. Give distinct source pages distinct destinations, retain existing ASCII paths and verify redirects and product memberships across all affected pages.

## Separate responsive image cancellation from real image failure

- Observed: A valid Hero image disappeared permanently when the viewport crossed the picture source breakpoint while the image was loading.
- Root cause: `HTMLImageElement.decode()` rejects when its selected source changes as well as when an image fails. A callback tied only to the product image URL treated that cancellation as a permanent error.
- Correct behavior: Use load/error events for active requests. When recovering an error that happened before hydration, verify that the image is already complete with zero natural width and still has the same selected source and matching media before declaring failure. Test delayed artwork through desktop-to-mobile-to-desktop resizing.

## Scope homepage styling to the active scene lifecycle

- Observed: Client navigation to the contact page retained the homepage Hero DOM in a hidden router cache. A selector based on any Hero being present would still match on the internal page.
- Root cause: DOM presence is not proof that a cached route is active.
- Correct behavior: Let the active Hero own Header attributes and remove them in effect cleanup. Scope shared Header decoration to those active attributes; use DOM-presence fallback only without scripting, when navigation replaces the document. Verify computed Header colors after client-side CTA navigation, partial scrolling and return visits.

## Verify locale and settled selection before reference measurements

- Observed: A temporary reference tab redirected from the requested localized route to English, producing inconsistent text wrapping and section-height comparisons with a Thai mock. Immediate snapshots after role clicks also briefly retained previous media/list content.
- Root cause: Requested URL and dispatched click were treated as proof of the rendered locale and completed component update.
- Correct behavior: Assert the actual URL and document language, select the intended locale through the visible UI when needed, and wait for the selected state plus expected media/list content before capturing geometry. Store locale with every baseline and replace invalid measurements rather than mixing languages.

## Set the isolated build directory on the build command itself

- Observed: A QA build briefly started in the live workspace after preparing a separate source copy. It was stopped before compilation finished; the existing dev process remained running and returned HTTP 200.
- Root cause: The replacement command copied files into QA but retained the live workspace as its command working directory.
- Correct behavior: Run the build as a separate command with an explicit absolute QA `workdir`. Verify that path before launching and confirm the build output does not load the live environment file. Do not rely on a preceding copy operation to change the working directory.

## Check the composited color of translucent navigation

- Observed: Matching a reference navbar's computed rgba color first produced pale gray; adding an opaque dark Header base then hid the actual backdrop blur.
- Root cause: HoN overlays content with a fixed translucent navbar. SUNFORD's former sticky layout reserved an empty surface beneath the glass, and the later opaque base blocked sampling of page content.
- Correct behavior: For reference blur fidelity, place real page content behind the translucent fixed Header and remove opaque layers beneath its glass. Reserve header space separately on internal pages. Verify screenshots plus a controlled patterned backdrop with blur enabled/disabled; computed CSS alone cannot prove visible blur. Check closed/scrolled/expanded desktop and mobile states. Do not restore an opaque base as a substitute for matching compositing.

## Do not reset a moving link track on pointer focus

- Observed: The first click on a moving category image stopped/repositioned its track without opening the link. A real-pointer regression reproduced the URL remaining on the homepage.
- Root cause: A `:focus-within` accessibility rule also ran on mousedown, removing the animation and moving the pressed link away before mouseup.
- Correct behavior: Limit track-reset/manual-scroll styling to keyboard-visible focus using `:has(a:focus-visible)`. Keep pointer focus from changing link geometry between press and release; test first-click navigation at a nonzero animation phase, keyboard activation and touch tap.

## Pass file globs to ripgrep rather than literal PowerShell paths

- Observed: Several searches reported that a path ending in `category-feature*` was invalid on Windows.
- Root cause: PowerShell did not expand the wildcard for the native `rg` command, so ripgrep received a literal wildcard path.
- Correct behavior: Search the actual directory and pass the filename pattern through `rg -g 'category-feature*.tsx'`; do not append wildcards to path arguments passed to ripgrep from PowerShell.

## Exclude generated browser snapshots from formatting checks

- Observed: The release stopped at `format:check` because three generated Playwright CLI YAML snapshots did not match Prettier formatting.
- Root cause: `.playwright-cli` was absent from `.prettierignore`, so `prettier --check .` included browser-generated artifacts.
- Correct behavior: Keep `.playwright-cli` in `.prettierignore`. Preserve generated snapshots as local evidence and verify `bun run format:check` after changing formatter exclusions; do not disable source formatting or reformat generated evidence to unblock releases.

## Attribute performance counters before setting regression budgets

- Observed: A scroll regression initially expected zero Header measurements after removing Hero's duplicate reads, but two calls remained in the separate Header surface sampler.
- Root cause: The counter included every caller of the same DOM method, mixing the work being removed with existing necessary behavior.
- Correct behavior: Capture call stacks before interpreting a shared performance counter. Derive the budget from the controlled interaction and required callers, then rerun the refined test against both the original and changed code. Do not remove unrelated functionality or relax a threshold without proving the original code still fails.

## Keep page controls and body portals in the same stacking context

- Observed: A body-level layout portal at z-index30 intercepted the Header at40 even after both used named tokens; a browser hit-target regression reproduced it.
- Root cause: The outer site wrapper's isolation created a separate parent context for the Header. Its child40 could not outrank a sibling portal30 in the document context.
- Correct behavior: Keep the outer site wrapper free of unnecessary isolation when page-level controls and body portals must share the scale. Isolate decorative sections locally, retain native showModal top-layer behavior, and verify Header hit targets against a real body portal plus modal hit targets against critical9999 content. Do not fix parent-context conflicts by increasing child numbers.

## Match Thai usage phrases instead of word fragments

- Observed: A health scale entered the kitchen subgroup because the bare Thai fragment ครัว also matched ครอบครัว (family) in its product copy.
- Root cause: Substring presence was treated as evidence of a complete usage term.
- Correct behavior: Match explicit usage phrases or authoritative collection membership. Do not use ครัว alone as a kitchen predicate. Keep a regression with family-health copy and a real health-scale record, alongside positive kitchen/coffee examples; verify that products without evidence remain available under All.

## Honor owner-supplied model manifests

- Observed: The owner supplied an explicit scale-model document after the earlier evidence/keyword classification, including Fitdays in kitchen/coffee.
- Root cause: Keeping the old family-health exclusion as the current membership rule would contradict the newer explicit owner manifest.
- Correct behavior: Use docs/sunford-scale-categories.md as the authoritative membership for these eight scale children. Explicit entries supersede prior heuristic exclusions, including Fitdays. Preserve the general Thai substring-matching lesson for unrelated classifiers. Resolve exact model codes and documented aliases; show missing codes as clearly labeled Mock cards rather than normalizing differing suffixes, capacity numbers or zeros. Do not copy unverified document footnotes into product specifications.

## Respect the existing reload policy when testing catalog query links

- Observed: A new child-navigation regression expected #products to remain after reloading, even though the filter queries were restored correctly.
- Root cause: The test assumed a URL-fragment invariant without checking src/components/layout/navigation-start.ts, which intentionally removes hashes on reload and resets scroll to the top.
- Correct behavior: Verify local category/subcategory clicks preserve unrelated query/hash values before reload. After reload, assert that the category/subcategory queries still select the correct filter and that the hash follows the existing navigation-start policy. Do not change the global reload script to satisfy a catalog test.

## Encode unsafe local image pathname characters before image optimization

- Observed: Two approved homepage PNGs existed on disk and returned200 as encoded static URLs, but raw filenames containing spaces/commas returned404 through the production Next image optimizer and displayed placeholders.
- Root cause: The raw pathname references did not match the optimizer's internally served static URL. The same files returned optimized200 when the pathname characters were percent-encoded.
- Correct behavior: Diagnose direct static delivery and raw-versus-encoded optimizer requests separately. For these existing local artwork references, percent-encode unsafe filename characters while preserving path separators and existing encodings. Keep the original image bytes and optimization; do not replace the artwork or change shared ProductImage fallback merely to hide this failure.

## Verify Git blob bytes when exporting hash-sensitive fixtures on Windows

- Observed: The default archive export produced CRLF reference Markdown while its committed Git blob used LF, causing the reference SHA256 unit assertion to fail although all remaining cases passed.
- Root cause: Windows core.autocrlf conversion affected exported fixture bytes; filesystem equality was assumed before checking the underlying Git blob.
- Correct behavior: Export hash-sensitive candidate fixtures with `git -c core.autocrlf=false archive`, compare the exported reference bytes to `git show <tree>:<path>`, and run the existing test suite on that verified export. Do not change the reference hash, source document or test to disguise checkout/export conversion.

## Check the full formatter scope before release handoff

- Observed: Release formatting failed on6 Markdown/JSON files after delivery formatting had checked only changed code.
- Root cause: The delivery check scope differed from the production release command, which runs prettier --check . across all non-ignored repository files.
- Correct behavior: Before handing off a deploy-ready revision, run the exact full format:check script after updating project docs and generated reports. Scoped code formatting is useful while editing, but does not establish that the full release formatting gate passes. Verify the release --check implementation before treating it as a test/build preflight.

## Keep Markdown reference tests compatible with canonical formatting

- Observed: Prettier normalized a reference list from asterisks to dashes; an existing test parser returned empty model lists because it matched only asterisks.
- Root cause: The parser treated one valid Markdown list marker as a data contract, while the release formatter uses another valid marker.
- Correct behavior: Accept both standard dash and asterisk markers when parsing these reference lists, then retain strict comparison of every model and its order. For byte-hashed LF reference documents, set a path-specific Git eol=lf rule and keep the original Git blob/hash unchanged.

## Isolate generated source writes and check free disk before QA builds

- Observed: A QA production build stopped with ENOSPC. A subsequent Prisma generation through a generated-source junction truncated the workspace client file, so previously passing TypeScript checks then failed.
- Root cause: The isolated build shared writable generated source with the workspace, and code generation was retried while the disk remained nearly full.
- Correct behavior: Check available disk space before isolated builds and stop generation after ENOSPC. Give QA its own generated-source copy whenever a command can regenerate it; do not junction that writable directory to the workspace. After space is restored, run the existing Prisma generation on Node24, verify that the client is nonempty, and rerun TypeScript/build before relying on earlier results. Clean only verified task-owned generated caches or ask the owner to free space; preserve source, credentials and prior build evidence.

## Keep client-only controls disabled until hydration

- Observed: A cold production click on a visible server-rendered popup launcher did nothing, while the same check passed after the client files were cached. The trace placed a required client chunk after the first click.
- Root cause: Visible, enabled server HTML was treated as proof that its client event handlers were ready.
- Correct behavior: Render client-only controls natively disabled until their component is hydrated, then enable them without a timer. Verify the first interaction on a fresh browser context as well as warm navigation. Before programmatically focusing a gated control, assert that it is enabled; focus does not wait for readiness like a click does.

## Apply the QA directory guard to dev servers too

- Observed: A setup command copied QA files but launched the dev server from the workspace. Its telemetry-disabled startup removed a generated agent-feedback block from the workspace instructions. The process was stopped and the exact baseline bytes restored and hash-verified.
- Root cause: Copying files was mistaken for changing the working directory of the following process.
- Correct behavior: Launch every dev server, build and generator in a separate command with an explicit absolute QA workdir. Verify that directory before starting and verify that live environment files are not loaded. If a framework updates a protected instruction file, compare the exact diff and restore verified baseline bytes without overwriting unrelated changes.

## Verify layered comparison dismissal and surviving keyboard focus

- Observed: Keyboard-opened comparison shows a focused close-button tooltip; the first Escape dismisses that tooltip. Closing the comparison also clears its original trigger, and baseline focus could then fall to the document body.
- Root cause: Tooltip and dialog are separate dismissal layers, and native dialog focus restoration cannot return to a button removed by the existing clear-on-close behavior.
- Correct behavior: In keyboard checks, dismiss a visible tooltip before asserting dialog dismissal. Preserve clear-on-close, restore nested comparison focus to the owning finder search, and verify both keyboard input and native touch on the final runtime. Do not weaken assertions or change the shared Modal to work around a test assumption.

## Preserve homepage Header and Hero geometry when sharing navigation

- Observed: Replacing the homepage Header with the catalog Navbar changed its dark glass to a pale surface and removed Hero/header integrations. Restoring the fixed Header alone also left Hero58px too high because its original surface offset had been removed.
- Root cause: Shared navigation was treated as interchangeable despite the homepage depending on `.site-header`, `.header-inner`, surface tracking and fixed-header padding.
- Correct behavior: Keep the original Header on the homepage unless a homepage redesign is explicitly approved. Restore its fixed-header offset only on its owning surface, retain the current navigation elsewhere, and verify dark glass, Hero top position, normal-motion opening, scroll controls and cached back/forward navigation together.

## Preserve approved navigation content when restoring a Header theme

- Observed: Restoring the dark homepage Header also restored the old six-entry CMS menu instead of the approved five product categories and three company menus.
- Root cause: Only PrimaryNavigation applied the category projection; the restored Header consumed raw CMS navigation. Theme and geometry checks missed the actual menu labels.
- Correct behavior: Apply the same existing navigation projection to both consumers. When restoring appearance, verify the visible parent labels, every category child destination, native parent navigation and separate mobile disclosure alongside theme, height and Hero opening behavior.

## Compare actual Navbar geometry across routes

- Observed: Both Navbars showed the approved labels, but the homepage retained a different row width, logo size, menu distribution and mobile breakpoint.
- Root cause: Verifying menu content and page overflow did not establish matching spacing between separate Header implementations.
- Correct behavior: When the owner requests consistent spacing, compare header, row, logo, each menu item and tool rectangles across routes at the same viewport. Align the CSS and resize-listener breakpoint together, and update both the owning surface offset and Hero's static height fallback when row height changes. Verify prehydration and normal opening after the geometry change.

## Restart production QA servers after a shared build changes

- Observed: A previously healthy QA server kept client-only controls disabled after another build replaced the shared output; a fresh context received an error for an old client chunk.
- Root cause: The running server retained its previous build manifest while the shared build directory contained a newer revision. The disabled control was an unhydrated server render, rather than a new navigation defect.
- Correct behavior: Give concurrent builds separate output directories. If an existing shared output is replaced, finish or stop affected browser runs, restart their production servers against the verified current build, and check cold hydration before retrying UI assertions. Record independent source changes separately and preserve them; do not fix application handlers or weaken disabled-state checks to mask stale runtime assets.

## Compare equivalent data environments in isolated QA

- Observed: A QA build without live environment files used fallback product ordering, so a strict comparison against the configured preview reported unrelated catalogue and featured-product differences.
- Root cause: The baseline and candidate used different data providers even though the protected data and unrelated application sources were unchanged.
- Correct behavior: Record the data provider for each baseline and candidate. Compare matching fixture states in isolated QA, then retain the full strict catalogue and unaffected-route comparison on the configured final preview. Do not copy production credentials into QA or alter application sorting to force unrelated data environments to match.

## Inspect streamed ancestors in no-JavaScript visibility failures

- Observed: A video section's no-JavaScript visibility test failed before and after changing only its clip ID/title. The heading and poster existed in the DOM under an ancestor marked hidden with display:none.
- Root cause: The role-based visibility failure came from the streamed ancestor's hidden state, independently of the media source; JavaScript-enabled preview and keyboard checks passed.
- Correct behavior: Reproduce no-JavaScript failures against the unchanged baseline, then inspect raw DOM presence and hidden ancestors before attributing them to a scoped component edit. Preserve the visibility assertion and report the existing limitation; do not weaken the test or expand a media-only change into a whole-page rendering fix.

## Inspect installed package contents before changing build configuration

- Observed: A configured build could not resolve declared database and CSS dependencies even though their installation directories existed. Four lockfile package directories were empty.
- Root cause: Missing installed package contents, rather than the page change or bundler root configuration.
- Correct behavior: Inspect each failing package directory and runtime resolution first. Restore only verified missing contents from the exact lockfile version, validate archive integrity before extraction, and preserve manifests and lockfiles. Re-run the configured build and equivalent-data parity checks; do not change bundler configuration or dependency versions to hide an incomplete installation.

## Preserve navigation roles when normalizing equivalent destinations

- Observed: Promoting an industrial subgroup to a canonical page made its product-child URL equal a related business link. The lookup selected the earlier product-child label, duplicating the industrial label in the mobile menu.
- Root cause: Matching the first normalized URL across unrelated navigation groups lost the semantic role and original label of the link.
- Correct behavior: Resolve related/support links from their owning non-product navigation sources, while projecting product children separately. Verify labels, order and unique primary destinations for both legacy and already-normalized CMS inputs; URL equality and total link counts alone are insufficient.

## Check native multipart path interpretation on Windows

- Observed: A Figma import upload failed locally before transferring data. OpenSSL read the archive through Git Bash's /tmp mapping, while native Windows curl could not open the same path embedded in its multipart file argument.
- Root cause: MSYS converted the ordinary OpenSSL path argument but did not convert the quoted path embedded in curl's -F argument. The native executable interpreted /tmp on the current drive instead.
- Correct behavior: Verify that both checksum and multipart executables resolve the exact same archive bytes before uploading. On this host, preserve the tool's exact command and continuation, provide matching bytes at the verified native temporary path, obtain fresh instructions after a definite local failure, and resume only after upload exits0. Never retry an ambiguous transfer or expose signed upload fields in deliverables.

## Respect workspace line-ending conversion during whitespace checks

- Observed: Running diff --check with core.autocrlf=false reported CRLF endings across existing files as trailing whitespace, while the repository-configured check passed.
- Root cause: An override suitable for byte-sensitive Git exports disabled the workspace's normal index-to-working-tree conversion during diff validation.
- Correct behavior: Run ordinary git diff --check with the repository's line-ending settings for workspace validation. Reserve core.autocrlf=false for intentional byte-preserving exports, and bound diagnostic output before inspecting broad failures. Do not rewrite unrelated files to satisfy a check using different line-ending semantics.

## Own the child process behind a temporary QA server

- Observed: Terminating a wrapped PowerShell/Python exec session left its HTTP-server child listening. Subsequent helper starts and browser runs saw port conflicts or empty image responses.
- Root cause: The session wrapper exited while the actual server child retained its listening socket; a session exit was treated as proof of server cleanup.
- Correct behavior: Prefer an in-process ephemeral HTTP server for isolated static browser verification and close its connections in finally. For separately launched helpers, record the server child PID and verify its exact command, start time and owned port before stopping it. Confirm the listener is gone; do not stop a process based only on a port number.

## Match isolated QA source to its actual reference runtime

- Observed: A parallel motion task changed shared source while the configured preview still ran the preceding verified build. A snapshot of the current directory could therefore combine different source/runtime generations.
- Root cause: Current filesystem contents were mistaken for the exact source of an already-running production preview.
- Correct behavior: Freeze QA from a known runtime-matched source version, overlay only the current task's changes, and keep its source/generated/build output and port private. Preserve and classify concurrent deltas instead of restoring them in the workspace. Verify owned source hashes and matching configured page signatures, and explicitly identify combined changes that remain outside that isolated verification.

## Verify the destination of Figma Code Layer file uploads

- Observed: The Files multiple-upload action created new image files at the project root even while an existing assets image was selected.
- Root cause: The upload action does not use the selected image's parent directory as its destination.
- Correct behavior: Inspect the resulting file path before adding image URLs to catalog data. Use the actual uploaded root filenames or a verified supported move operation, and mirror those paths in local QA. Do not upload duplicate copies or re-import an already successful Code Layer merely to fix an assumed asset directory. Verify all image loads after reloading the saved preview.

## Reset a shifted Figma Present viewport before changing design geometry

- Observed: Repeated automated clicks in a scaled Code Layer preview shifted the outer Present viewport and clipped content, while the same source passed responsive browser checks.
- Root cause: Browser automation's scroll-into-view behavior around the scaled preview changed the outer viewport independently of the source layout.
- Correct behavior: Reload the Present tab, select the category through its native dropdown and inspect the full product before diagnosing a design regression. Preserve the source geometry when reload restores the expected view; do not add layout offsets to compensate for automation viewport state.

## Verify trusted clicks when wrapping a Code Layer in a native Figma Flow

- Observed: A native Frame starting point appeared in the left Flows list and rendered the Code Layer, but its canvas snapshot intercepted pointer input over the live iframe. Programmatic selectOption changed the iframe's accessible state while the visible snapshot stayed unchanged.
- Root cause: Readback, selected Flow state and visual rendering were treated as enough evidence for a runnable Flow. The wrapper's iframe was behind the native canvas in this Present mode.
- Correct behavior: Test a trusted click from the actual Flow entry and confirm a visible product/detail state change before calling that Flow interactive. Do not bypass interception with forced clicks or DOM style changes. When the wrapper is static, explicitly distinguish its discovery/render result from interactive Code Layer Play, verify the direct Code Layer URL, and provide that working link. Preserve source and geometry rather than adding compensating layout offsets.

## Refresh both Figma live preview and cached playback after Files edits

- Observed: The three saved Files readbacks matched the new source, but the first Code Layer Play reload had the new markup/styles and the preceding script. The new runtime-generated tick elements were absent until the live Files Browser preview was reloaded, followed by Code Layer Play.
- Root cause: Saved editor content and cached playback were at different runtime generations; source readback alone did not establish that playback loaded the final script.
- Correct behavior: After the last Files save, reload its live Browser preview and then the direct Code Layer Play tab. Verify a concrete runtime-generated element count and a trusted interaction before claiming the update is running. Preserve the saved source when this refresh resolves the mismatch; do not rewrite working code to compensate for stale playback.

## Keep product photo identity stable through carousel movement

- Observed: Recycled image slots changed their product metadata while their newly assigned image was still loading/decoding. Delayed-load frame sampling caught invalid visible images, including the centered title's image; the reported Figma preview showed repeated/stale photos.
- Root cause: Preloading through separate Image objects was treated as proof that a visible image element was ready after changing its src. Slot reuse let the displayed photo and current model become temporarily inconsistent.
- Correct behavior: Keep each model bound to its own image element, await that actual element's decode before display, and move/hide the model rather than reassigning photo sources during motion. Test every visible neighbor as well as the selected image under rapid input and delayed/no-cache loading, then visually verify Figma after detail returns and both wraps. Source attributes or a correct title alone are insufficient evidence of correct pictures.

## Inspect cloned regression specs and run complete type checking

- Observed: A cloned subgroup browser spec retained the preceding family's parent-return path, and a generated unit import appeared twice. Transpile-only catalog tests passed, while the production typecheck rejected the duplicate import.
- Root cause: Text-based test migration inserted family names and imports without checking the complete generated file or repeat execution.
- Correct behavior: After cloning a family spec, inspect imports, every route/title and native parent-return assertion before execution. Make migration helpers idempotent or reject already-applied input. Run the full configured build/typecheck in addition to transpile-only unit tests; preserve initial failure evidence when fixing test-only mistakes.

## Preserve exact text when patching generated exports

- Observed: A generated CSV replacement failed because the PowerShell read omitted its UTF-8 BOM; a subsequent full JSON read exceeded the tool output limit before the update could be prepared.
- Root cause: Decoded shell text and truncated tool output were treated as exact file contents for an apply_patch replacement.
- Correct behavior: Preserve BOMs with an explicit UTF-8 file read and JSON-encoded output. Read large exports in bounded chunks and verify the concatenated character count before constructing a replacement patch, or use small unique-context hunks. Reconcile row counts, SKU sets and CSV/JSON values after generating the final artifacts; never use truncated output as edit input.

## Warehouse catalog publication and quotation source

- Owner decision: Public product consumers use actual Warehouse G-prefix SKUs. Keep unclear subgroup, model/content collisions, non-G alternatives and service/shipping records parked. Prisma remains the source of existing website/CMS metadata; never migrate the Warehouse schema to satisfy website queries.
- Correct behavior: Use the shared product repository and explicit SKU/model memberships for every product consumer. Preserve verified legacy IDs/URLs, honor CMS hidden/deleted records, and do not revive snapshot products when the API removes an item or fails. Read prices net of VAT from Warehouse, derive gross public prices, and quote an exact complete kit once rather than adding the included head again.

## Load isolated Next build environments without forwarding startup flags

- Observed: A Node environment-file startup flag was propagated into a Next build worker option that Node rejects, aborting page-data collection after compilation/typecheck succeeded.
- Root cause: Loading environment variables through the build process startup arguments also exposed that startup flag to worker creation.
- Correct behavior: Load the local environment in a wrapper process, then spawn a fresh Node process for the Next build with an explicit inherited environment and no environment-file startup flag in the child arguments. Keep secrets out of the QA copy and logs. Verify the production build fully completes before starting its server.

## Warehouse runtime development verification (2026-11-10)

Production catalog and builder/quotation checks passed, but the pre-existing development server had failed HMR WebSocket handshakes and did not hydrate the builder. An isolated Node 24 Webpack dev server passed the complete builder-to-quotation/PDF path twice. Use Node 24 as specified by package.json; when checking development, confirm hydration before assuming an SSR-visible button has handled a click. Keep production HTTP 404 checks separate from streamed development not-found status. Do not stop a user's existing server to repair a task-owned QA environment.

## Localhost HMR root cause and repair (2026-11-10)

- Observed: earlier checks used `127.0.0.1` and had HMR handshake failures, while direct `localhost` HMR and builder selection worked. The dev log explicitly recorded cross-origin rejection of the IP alias.
- Root cause: Next implicitly permits localhost but the existing exact LAN/UAT `allowedDevOrigins` list omitted `127.0.0.1`. The previous bundler workaround did not isolate this hostname difference.
- Correct behavior: compare the actual hostname/origin handshakes before changing bundlers or clearing caches. Keep `127.0.0.1` explicitly allowed, preserve exact LAN/UAT entries, and use the project's Node 24 runtime. After authorized restart, default Turbopack HMR passed on both names and a real source-update/restoration probe retained builder state. The earlier unresolved-dev/Webpack workaround is superseded. Verify current listener/CLI identity again after config saves because Next may restart the child with a new PID.
