# Verification

## Current review: October 2, 2026

Compared the website with fetched application `main` at
[`d3e4886`](https://github.com/LimePencil/jev-observer/commit/d3e4886955990087bda970f645756ae5b5d9ee3b)
and the public [`v0.1.0` release](https://github.com/LimePencil/jev-observer/releases/tag/v0.1.0)
published on October 2. The release tag resolves to
`340fa9417718b6728c1d4124cb84676e440796a0`; subsequent main changes do not alter
the UI or backend. The sibling application checkout remains unchanged.

### What differed and what changed

- Documentation search silently hid matches beyond eight and reported that
  truncated number as the total. All matching guides now appear, with accurate
  singular/plural feedback and normalized title ranking.
- Search now supports arrow navigation through actual links, Enter to open the
  first result, and Escape to close without erasing the query. Native search-input
  Escape behavior was reproduced in both desktop and mobile Chromium tests.
  Reopening selects the previous query for replacement; ordinary Tab navigation
  and dialog focus restoration remain intact.
- Long guides had no section navigation below 1100px. Native “On this page”
  disclosures now expose every section on phones and tablets. Desktop keeps its
  existing sidebar. Code text is larger and mobile search uses a 16px input.
- Clipboard failures previously said “Select to copy” without selecting anything.
  They now select and focus the requested code, announce persistent manual-copy
  instructions, and offer a retry. Successful copies retain compact feedback.
- The import limit is 8 MiB of decoded UTF-8 text, not an 8 MiB HTTP envelope.
  Privacy, troubleshooting and API guides now match the server's separate
  transport allowance.
- Setup distinguishes the database key, dashboard password, provider key and
  local client token. Generate-once key commands are separate from repeatable
  startup commands. Demo-to-live instructions say to stop the sample first and
  use the live dashboard token. Packaged installs are the default command path.
- Dashboard guidance explains the initial 12-request feed, the 100-record/group
  bounds, and which actions refresh a paused view while collection continues.
- Homepage wording reflects native installers and encrypted live history.
  All three tour screenshots now come from the verified public executable,
  including the current wordmark and demo-to-live guidance. Bundled image hashes
  prevent stale captures from surviving browser/image-optimizer caches.
- A second browser pass found mobile menus staying open after history navigation,
  viewport changes and leaving the header. They now dismiss consistently, return
  focus on Escape and identify the current documentation section.
- Search closes on route changes and ignores repeated shortcut keydown events.
  Its input, close button and keyboard help stay visible at short landscape
  heights while results scroll independently.
- Search and screenshot dialogs preserve the underlying page's reading position.
  The screenshot viewport is explicitly keyboard-focusable, allowing arrow-key
  panning in WebKit as well as Chromium and Firefox.
- Missing pages now have a useful browser title, with regression checks for the
  404 response, noindex metadata and working recovery links.
- Privacy guidance now states that imported demo records remain plaintext and
  imports apply current capture/redaction settings, including discarding raw
  input state by default. This was checked against application normalization and
  database-opening code.
- The repeatable browser suite and CI now include Firefox and mobile WebKit in
  addition to desktop and mobile Chromium.
- A held pointer press reproduced missed screenshot expansion in WebKit: the
  entrance animation moved the button before release. The interactive tour now
  stays stationary while surrounding headings retain their reveal animation.
  Keyboard focus also cancels remaining section reveals so focused controls are
  immediately visible.

### Evidence and scope

Final checks against the updated production build:

- `npm run build`, `npm run lint`, `npm run typecheck`,
  `npm run format:check` and `git diff --check`: pass.
- `npm audit --omit=dev`: no known production dependency vulnerabilities.
- `npm test -- --workers=2`: **196 passed, 4 expected skips, 0 failures** across
  Chromium desktop/mobile, Firefox desktop and mobile WebKit. This uses the same
  worker count as CI. Two skips exclude a mobile-only navigation case from
  desktop projects; two exclude native clipboard permission grants unsupported
  by Firefox/WebKit. Clipboard recovery and retry run in every project.
- All 24 axe checks pass: homepage, installation and the open search dialog in
  both themes across all four projects. Search overflow is checked at 320px; guide
  navigation is checked at 320px, 768px, 1024px and desktop width.
- Manual browser review confirmed the mobile contents menu, full search results,
  Escape dismissal, short landscape search controls and the current-release
  screenshot rendered from its new content-hashed URL.

The baseline production suite passed 43 tests with one expected desktop-only
skip; the first Chromium usability pass finished with 67 passes and one skip.
New regressions reproduced truncated search, padded-query ranking, missing
keyboard behavior and missing small-screen section navigation before the fixes.
The second pass added menu, history, short-screen modal, focus and 404 coverage
and expanded the browser matrix. Tests synchronize with completed native scrolls
and breakpoint state changes, and use the suite timeout for finite animations.
Clipboard recovery tests cover rejected and unavailable clipboard APIs using
browser-local mocks, including successful retry and exact code selection.

The public-release demo was tested independently on an isolated port/database.
Assertions verified 720 synthetic requests, question-definition versions, request
review controls and authenticated demo settings. It produced no page errors or
external browser requests. Package checksum, release identity, capture settings
and process cleanup are recorded in [screenshots.md](screenshots.md).

Visual review preserves the existing green palette, Geist typography, rounded
controls, route structure, hero and product tour. This is a targeted usability
update, with the existing variance 6 / motion 5 / density 3 direction retained.

Browser coverage includes Chromium desktop/mobile, Firefox desktop and mobile
WebKit emulation. Native wheel-scroll checks use desktop pointer input at narrow
widths because mobile WebKit emulation does not support wheel events. Physical
iOS/Safari devices were not tested. Paid inference and real provider credentials
were not used. These checks were completed locally before deployment; the
application-source checkout remains unchanged.

Useful follow-ups are physical-device checks and a release checklist that rechecks
API limits, SDK pins, authentication, installer behavior and screenshot provenance
whenever the application ships. Documentation and screenshot updates remain
reviewed changes, not an automatic claim that every future release matches.

## Historical review: September 22, 2026

The following records the earlier implementation review and measurements; it is
retained for provenance and does not replace the current review above.

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
