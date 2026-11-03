# Desktop Hero reference implementation

The user authorized implementation on 2 November 2026: change only Desktop Hero, use a product image instead of 3D, add Smooth Scrolling + Scroll Reveal into the next section, and preserve the logo Opening and the remaining website. Desktop follows the existing breakpoint above 800px. Mobile keeps its current composition and interactions.

The reference is the supplied 5.77-second clip, inspected in `output/hero-reference-2026-11-02/review.md`. Use one central front-view ACS-30-JC21 image, oversized SUNFORD type behind it, a dark silver-lit landscape, verified product highlights at the lower left and a product-detail card at the lower right. Use the existing first configured slide, including its custom image and destination; prefer the existing compact front-view image for known default products. No invented price, rating or review count. Preserve the existing header structure and Opening choreography.

Approaches considered: retain WebGL with a readiness gate (does not meet the removal request); embed the supplied video (adds a 4.78MB asset and bakes content into video); compose HTML and a front-view image over the reference landscape (selected for low payload and usable text/links).

The desktop scene uses CSS and finite entrance animation after the existing Opening release. Desktop must not mount or fetch the mobile model-viewer, GLBs, bubble portal or rotating ribbon. Existing mobile-only components can load when the viewport enters the mobile breakpoint. Server HTML remains readable with JavaScript disabled, images have reserved geometry, and reduced motion reveals final states immediately.

The existing scroll affordance becomes a native link to the immediately following BrandFilm section. JavaScript enhances it with browser-native smooth scrolling; wheel/keyboard scrolling remains natural. An IntersectionObserver runs a single finite transform/opacity reveal on that section on desktop. No page-wide scrolling library, sticky scene, scroll interception, extra viewport-height spacer, content rewrite or dependency.

Target desktop viewports: 1440x900, 1280x720, 1024x768, 1920x1080 and 844x390. Verify mobile isolation at 390x844 and the 800/801px breakpoint, plus live resizing in both directions. Required states: normal Opening/reload, reduced motion, no JavaScript, failed image, no configured product, keyboard link access, native scroll/reveal and navigation cleanup. Image errors retain text and the destination. Empty slides retain company copy and a catalogue destination.

Visual success means a single clear product, legible display and copy, stable lower cards, no control overlap and no overflow. The background may fill the viewport while foreground landmarks fit both available width and height. Performance success is directly observed absence of Hero 3D requests on desktop; any byte/timing measurements must be reported as local observations, not promised Lighthouse scores.
