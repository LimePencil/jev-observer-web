# Verification

Reviewed on 2026-09-22 against a production build of the website.

## Build and behavior

- `npm run build`: passes; landing page, docs index, all 10 guides, metadata images, robots and sitemap are prerendered.
- `npm run lint`, `npm run typecheck`, and `npm run format:check`: pass.
- `npm test`: 31 passed, one intentional skip (desktop does not have mobile navigation), zero failures.
- Browser coverage: desktop and mobile, real screenshot tabs with keyboard navigation, screenshot dialog and focus restoration, all docs routes and internal anchors, full-text search, clipboard contents, persisted themes, reduced motion, and horizontal overflow.
- All eight axe scans pass: homepage and installation, light and dark themes, desktop and mobile.
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

First Contentful Paint: 0.8s. Largest Contentful Paint: 1.9s. Total Blocking Time: 80ms. Cumulative Layout Shift: 0.

Native CSS animations and an IntersectionObserver keep motion lightweight. Content is rendered without JavaScript, entry reveals skip the initial viewport, and every animation respects reduced-motion preferences. The header wordmark uses its visible text as its accessible name.

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
