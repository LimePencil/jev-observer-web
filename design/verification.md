# Verification

Reviewed on 2026-09-22 against a production build of the website.

## Build and behavior

- `npm run build`: passes; landing page, docs index, all 10 guides, metadata images, robots and sitemap are prerendered.
- `npm run lint`, `npm run typecheck`, and `npm run format:check`: pass.
- `npm test`: 41 passed, one intentional skip (desktop does not have mobile navigation), zero failures.
- Browser coverage: desktop and mobile, real screenshot tabs with keyboard navigation, screenshot dialog and focus restoration, all docs routes and internal anchors, full-text search, clipboard contents, persisted themes, reduced motion, and horizontal overflow.
- All eight axe scans pass: homepage and installation, light and dark themes, desktop and mobile.
- All six additional hero scans pass: routing, urgency, and frustration answers in both light and dark themes.
- Manual checks: system themes, search empty state, 404 page, hero entry animation, scroll reveals, and visual review of desktop/mobile landing and documentation.
- Mobile document and body width both equal the 390px viewport after correcting code-block grid constraints.
- Production dependency audit: no known vulnerabilities at review time.

## Follow-up review

Three parallel reviews covered interactions/accessibility, documentation routing/metadata, and content accuracy against the application source. An independent second pass reviewed the resulting changes.

- Fixed mobile navigation ignoring Escape when its trigger retained focus.
- Kept all product-tour tab targets present, with inactive panels hidden.
- Added the homepage canonical URL and corrected documentation social titles, descriptions, and missing preview images.
- Isolated local browser checks on port 3100 with server reuse disabled so an existing development server cannot mask regressions.
- Added `PLAYWRIGHT_BASE_URL` for checking the deployed site with the same browser suite.
- Added regression coverage for the verified interaction and sharing-metadata issues. The interaction regressions failed against the previous build and passed after the fixes.
- Verified layouts at 320px, 360px, 768px, and 1024px; checked search and screenshot dialogs and both generic/documentation 404 pages for accessibility issues. No additional defects remained after accounting for entry animations during contrast scans.
- Installation commands, SDK examples, defaults, API routes, and privacy descriptions agree with the application source.

## Lighthouse

Local production server, Chromium, Lighthouse mobile defaults. These are lab results, not measurements of a deployed Vercel site or real-user traffic.

| Category       | Score |
| -------------- | ----- |
| Performance    | 99    |
| Accessibility  | 100   |
| Best practices | 100   |
| SEO            | 100   |

First Contentful Paint: 1.1s. Largest Contentful Paint: 2.1s. Total Blocking Time: 60ms. Cumulative Layout Shift: 0. These measurements include the larger graphics and finite reveal animations.

Native CSS, the Web Animations API, and IntersectionObserver keep motion lightweight. Content is rendered without JavaScript, entry reveals skip the initial viewport, and every animation respects reduced-motion preferences. The header wordmark uses its visible text as its accessible name.

## Interactive hero

The original optical bitmap has been replaced by a request-flow explainer after research into Linear, Resend, and Trigger.dev. See `design/research.md` for specific observations and sample-data provenance.

- Request, response, and local-capture paths reveal once; sample-answer selection works by mouse, touch, and native keyboard radio navigation.
- All hero animations finish; changing questions triggers another brief reveal. No looping particles or pause/play controls remain.
- Bar, ring, and dot graphics express the synthetic answer data, with larger results and less visible explanatory copy.
- Reduced motion suppresses animations while sample selection remains usable. Below-fold sections reveal once; initial-viewport content is visible immediately.
- Visual review covered desktop, 768px tablet, and mobile in both themes. All answer states fit 320px and 390px viewports.
- Manually verified below-fold content after scroll, after changing motion preferences, and with JavaScript disabled.
- Build, lint, formatting, TypeScript, and all 41 browser tests pass against the production build.

## Design preflight

Custom greenfield direction; variance 6, motion 5, density 3. One green accent, semantic light/dark tokens, consistent control/panel radii, locally bundled sans-serif fonts, a two-line desktop hero with visible actions, and no repeated three-card feature rows. Copy audited against current application documentation. No fabricated testimonials, usage claims, package installers, or roadmap features. Real sample-mode product captures and a generated optical illustration are documented separately.

## Delivery

Sibling project: `/home/limepencil/dev/jev-observer-web`.
Repository: `LimePencil/jev-observer-web`, verified private.
Production: https://jev-observer-web.vercel.app. The Vercel project is connected to `main` and deploys pushed commits. The README contains both deployment and deployed-site verification instructions.

## Hosted CI limitation

The first GitHub Actions run did not start any steps. GitHub's check annotation reported: "The job was not started because recent account payments have failed or your spending limit needs to be increased."

Run: https://github.com/LimePencil/jev-observer-web/actions/runs/35699562361

This is an account-level runner restriction, not a website build or test failure. The workflow remains configured, and the same build, lint, TypeScript and browser checks were run locally. The owner can resolve GitHub billing and rerun the workflow when desired. Vercel deploys independently through its GitHub integration.
