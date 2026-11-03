# Desktop Hero Implementation Plan

> Execute natively with superpowers:executing-plans. The user has explicitly authorized starting; do not add another approval step. Track changing task status in claude-mem work_state.

**Goal:** Replace the desktop 3D Hero with the reference image composition and a scoped smooth-scroll/reveal handoff.

**Architecture:** Keep the existing Hero entry and shared Opening. Gate legacy scene components and model loading to the existing mobile breakpoint, dynamically loading them only there. Add one small desktop composition with its own CSS module and an effect for the next-section handoff.

**Tech Stack:** Existing Next.js 16.4.3, React 19.3, next/image, CSS, native browser animation/scroll/IntersectionObserver, Playwright. No new dependency.

**Spec:** `docs/superpowers/specs/2026-11-02-desktop-hero-design.md`

## Global Constraints

- Desktop is above 800px; preserve the current mobile scene.
- Keep Opening timing, logo and header structure; preserve all later content.
- Prefer configured slide data and existing real product imagery; no invented business facts.
- No global scroll interception, new library, business data writes, commit, push or deployment.

## Review Focus

- A desktop first visit must not initialize any hidden 3D workload.
- Live breakpoint changes must stop obsolete animation/observers and preserve mobile interaction.
- Short wide screens must keep the product, both information areas and scroll link reachable.
- Reduced motion, no JavaScript and failed images must keep content and destinations usable.
- The first next-section reveal must not leave transforms or inert state affecting later navigation.

## Task 1: Desktop composition and mobile isolation

Files: modify `src/features/home/components/hero.tsx`; create `hero-desktop.tsx` and `hero-desktop.module.css` alongside it; add a landscape WebP under `public/images/hero/`; create `tests/e2e/hero-desktop.spec.ts`.

Consumes: existing `HeroSlide`, `companyIntro` and Opening boolean. The desktop component uses its own DOM ref to find its containing Hero and following section. Produces: visible `[data-hero-desktop]` above 800px with the first slide's product image/name/highlights/destination; the existing mobile main below it. Only mobile mounts the legacy studio/ribbon/bubbles/model.

1. Write and run a browser regression for visible desktop product content and zero model-viewer/GLB requests. Observe it fail against the current homepage.
2. Capture current mobile geometry and screenshot before editing.
3. Implement the desktop markup/CSS and mobile media gate. Reuse compact known front views without overriding custom images. Extract only the unbranded landscape from the supplied reference before the product rises.
4. Check all target desktop bounds, image-error/no-product behavior and mobile/breakpoint isolation.

## Task 2: Handoff and final validation

Files: modify the same desktop component/module; add a stable section ID in `src/features/home/components/brand-film.tsx`; update the focused browser tests, `spec.md` and local evidence.

Consumes: the Hero section ref and the following section; produces: accessible `#brand-film` link, native smooth scroll and a once-only finite next-section reveal.

1. Extend browser coverage for actual scrolling through intermediate positions, once-only reveal, reduced motion, no JavaScript and resize cleanup.
2. Implement the scoped observer/native animation and final-state cleanup. Do not change BrandFilm content or styles.
3. Run TypeScript, scoped ESLint/Prettier, production snapshot build, focused browser tests and relevant existing Opening/mobile regressions. Use isolated QA output directories and stop any QA server started for the task.
4. Inspect desktop/mobile screenshots, record requests and payload sizes, update spec and request a fresh final code review. Verify any important fixes with a reproducing regression.
