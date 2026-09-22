# Verification

Reviewed on 2026-09-22 against a production build of the website.

## Build and behavior

- `npm run build`: passes; landing page, docs index, all 10 guides, metadata images, robots and sitemap are prerendered.
- `npm run lint`, `npm run typecheck`, and `npm run format:check`: pass.
- `npm test`: 25 passed, one intentional skip (desktop does not have mobile navigation), zero failures.
- Browser coverage: desktop and mobile, real screenshot tabs with keyboard navigation, screenshot dialog and focus restoration, all docs routes and internal anchors, full-text search, clipboard contents, persisted themes, reduced motion, and horizontal overflow.
- All eight axe scans pass: homepage and installation, light and dark themes, desktop and mobile.
- Manual checks: system themes, search empty state, 404 page, hero entry animation, scroll reveals, and visual review of desktop/mobile landing and documentation.
- Mobile document and body width both equal the 390px viewport after correcting code-block grid constraints.
- Production dependency audit: no known vulnerabilities at review time.

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
The README contains Vercel import instructions. Deployment and the eventual application README link remain with the owner, as requested.
