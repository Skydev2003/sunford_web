# Project Memory

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
