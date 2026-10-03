# Jev Observer website

A separate Next.js website for [Jev Observer](https://github.com/LimePencil/jev-observer): a responsive introduction, real dashboard tour, installation instructions, user guides, and developer documentation.

## Develop

Use Node.js 22.12 or later and npm.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. This website has no dependency on a running Observer instance, database, or provider API key.

## Deploy on Vercel

1. Import the `LimePencil/jev-observer-web` GitHub repository into your Vercel account. Grant Vercel access to this repository when asked.
2. Keep the framework preset **Next.js**, root directory **.**, install command **npm ci**, and build command **npm run build**. Use Node.js **22.x** or later supported by Vercel. Leave the output directory at the framework default.
3. Deploy. No environment variables are required. The website does not deploy the Observer proxy or its SQLite database.
4. After assigning a production domain, optionally set `NEXT_PUBLIC_SITE_URL` to the full HTTPS origin (for example your own domain) and redeploy. Without it, metadata and sitemap use Vercel's production URL; local builds use `http://localhost:3000`.

Production is hosted at [jev-observer-web.vercel.app](https://jev-observer-web.vercel.app). The Vercel project is connected to this repository and deploys changes pushed to `main`.

## Verify

```bash
npm run lint
npm run build
npm run typecheck
npx playwright install --with-deps chromium firefox webkit
npm test
```

Playwright starts the production server. It runs Chromium desktop/mobile, Firefox desktop and mobile WebKit checks for navigation and browser history, guide section links, product-tour tabs and keyboard-pannable screenshots, search and short-screen dialogs, doc routes and internal anchors, 404 recovery, clipboard success and recovery, persisted themes, reduced motion, and WCAG accessibility using axe. Native clipboard permission checks run only in Chromium; all engines verify rejected/unavailable clipboard recovery and retry. CI repeats these checks on pushes and pull requests.

Wheel-scroll regressions use desktop pointer input at narrow widths because mobile WebKit emulation does not support wheel events. Other mobile checks retain device emulation; these runs do not replace testing on physical iOS devices.

To run the browser checks against a deployment without starting a local server:

```bash
PLAYWRIGHT_BASE_URL=https://jev-observer-web.vercel.app npm test
```

## Content and assets

- `app/page.tsx`: landing page. Interactive leaves live in `components/`.
- `components/hero-flow.tsx`: visual request-flow explainer with graphical synthetic answers, brief reveal animations, and reduced-motion support. Its visual styling is isolated in `hero-flow.module.css`.
- `content/docs/*.md`: documentation with `title`, `description`, `section`, and numeric `order` frontmatter. Sections are `Getting started`, `User guide`, and `Developer guide`. Local full-text search, sidebar, page metadata, and sitemap are generated from this content.
- `app/globals.css`: semantic light/dark tokens, layouts, responsive rules, and reduced-motion support. Typography uses locally bundled Geist fonts through `next/font/local`.
- `design/research.md`: reference-site research, design decisions, and content boundaries.
- `design/screenshots.md`: provenance of the actual Observer sample-mode captures.
- `design/image-prompt.md`: provenance for the original, now unused `public/images/observer-lens.webp` hero image.
- `public/fonts/*-LICENSE.txt`: font licenses. Dashboard screenshots use synthetic data.

The website and application repositories are public and MIT-licensed. Version 0.2.0 provides six native packages for Linux, macOS and Windows with checksum-verifying installers. Documentation must explain dashboard authentication, the live SQLCipher database key and registered client tokens. Demo history and explicit exports remain plaintext. Do not imply universal provider support, production readiness, or lossless capture.

The application README and current source are authoritative. Research proposals in the application repository are historical, not shipped-feature documentation. Update these guides when the application changes, particularly SDK pins, CLI defaults, API routes, import limits, and privacy behavior.

The latest alignment review on October 3, 2026 checked the published [v0.2.0 release](https://github.com/LimePencil/jev-observer/releases/tag/v0.2.0), whose tag resolves to [`55a6e47`](https://github.com/LimePencil/jev-observer/commit/55a6e47a6c2c134d2f45e712c9124ae333fc2856). It includes all six native packages. Guides cover local Laya authentication and SDK timeouts, OpenRouter-reported cost, Score consistency warnings, history pagination, group search, date ranges, comparison limits and credential downgrade behavior. Tour screenshots come from the checksum-verified 0.2.0 Linux ARM64 package using synthetic demo data.

Import limits apply to decoded UTF-8 text (8 MiB and 10,000 records), with JSON transport overhead allowed separately. Dashboard documentation preserves the difference between pausing visible updates and continuing collection. See [verification](design/verification.md) for current checks and the public-repository assessment.

## Scope

This is a presentation and documentation site. It never connects to a visitor's local Observer, collects their request history, or handles provider credentials. Copying a command does not execute it. The product tour displays real screenshots, not a hosted live dashboard.

## License

This website is [MIT-licensed](LICENSE), copyright 2026 Jaeyoung Shin. Bundled Geist and Geist Mono fonts retain their SIL Open Font License notices in `public/fonts/`. The npm `private: true` flag prevents accidental package publication; the source repository is public.

Changes to `main` require a pull request, the GitHub Actions `verify` check and resolved review conversations. The branch must be current with `main`; force-pushes and deletion are blocked, including for administrators. No additional approving reviewer is required while this repository has one maintainer.
