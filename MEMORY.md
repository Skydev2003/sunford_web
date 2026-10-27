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
