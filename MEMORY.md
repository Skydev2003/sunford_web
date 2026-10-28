# Project Memory

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
