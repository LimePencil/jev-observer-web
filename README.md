# Jev Observer website

A separate, private Next.js website for [Jev Observer](https://github.com/LimePencil/jev-observer): a responsive introduction, real dashboard tour, installation instructions, user guides, and developer documentation.

## Develop

Use Node.js 22.12 or later and npm.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. This website has no dependency on a running Observer instance, database, or provider API key.

## Deploy on Vercel

1. Import the private `LimePencil/jev-observer-web` GitHub repository into your Vercel account. Grant Vercel access to this repository when asked.
2. Keep the framework preset **Next.js**, root directory **.**, install command **npm ci**, and build command **npm run build**. Use Node.js **22.x** or later supported by Vercel. Leave the output directory at the framework default.
3. Deploy. No environment variables are required. The website does not deploy the Observer proxy or its SQLite database.
4. After assigning a production domain, optionally set `NEXT_PUBLIC_SITE_URL` to the full HTTPS origin (for example your own domain) and redeploy. Without it, metadata and sitemap use Vercel's production URL; local builds use `http://localhost:3000`.

Production is hosted at [jev-observer-web.vercel.app](https://jev-observer-web.vercel.app). The Vercel project is connected to this repository and deploys changes pushed to `main`.

## Verify

```bash
npm run lint
npm run build
npm run typecheck
npx playwright install chromium
npm test
```

Playwright starts the production server. It checks desktop/mobile navigation, the product-tour tabs and screenshot dialog, documentation search, all doc routes and internal anchors, clipboard behavior, persistent light/dark themes, reduced motion, and WCAG accessibility using axe. CI repeats these checks on pushes and pull requests.

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

The website repository is private. The application source repository was also private when reviewed, so the site explicitly notes that source builds and GitHub links require repository access. Before a public application release, update that copy to match the actual source availability. Do not imply a packaged installer, verified cross-platform distribution, universal provider support, production readiness, or lossless capture.

The application README and current source are authoritative. Research proposals in the application repository are historical, not shipped-feature documentation. Update these guides when the application changes, particularly SDK pins, CLI defaults, API routes, import limits, and privacy behavior.

## Scope

This is a presentation and documentation site. It never connects to a visitor's local Observer, collects their request history, or handles provider credentials. Copying a command does not execute it. The product tour displays real screenshots, not a hosted live dashboard.
