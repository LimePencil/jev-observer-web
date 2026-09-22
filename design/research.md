# Design research

Reviewed before implementation on 2026-09-22:

- https://zed.dev: product-first storytelling, a short value proposition, a concrete download action, and a real interface. Borrow the clarity and product evidence, not the dense testimonials or claims.
- https://zod.dev: precise category statement, usable code examples, direct installation and well-organized docs. Borrow the short path from understanding to first use.
- https://litestream.io: direct technical purpose and focused setup documentation. Borrow the restraint.
- https://posthog.com: honest product capabilities and substantial accessible technical documentation. Borrow the specificity, not the desktop metaphor or visual density.
- https://ghostty.org: restrained developer-tool presentation with a visible product. Use as a visual reference only.

## Direction

Greenfield site for developers evaluating a local observability tool. Custom aesthetic using Tailwind v4 and native CSS, not an imitation of a formal design system.

DESIGN_VARIANCE: 6. Asymmetric hero, generous space, alternating composition types.
MOTION_INTENSITY: 5. Intro sequence, scroll reveals, feedback and product-tour transitions; reduced-motion fallback. Native CSS and an IntersectionObserver implement these modest transitions to keep the client bundle small.
VISUAL_DENSITY: 3. Short marketing copy; detailed content lives in docs.

Palette: neutral off-white / charcoal, one muted emerald accent. System light/dark with manual toggle. Geist + Geist Mono, locally bundled. Radii: 8px for controls, 16px for panels. Z-index: 10 sticky header, 20 mobile navigation, 30 docs search overlay.

Hero art: generated optical illustration, a visual metaphor for inspecting decisions. Product-tour media: screenshots captured from actual Observer sample mode; no invented UI or performance statistics.

## Content authority

Current Jev Observer README and source, not research proposals. Source installation only. Live inference goes to the configured provider. No universal-provider, production-readiness, lossless-capture, or unverified packaging claims. The website does not connect to or collect data from an Observer instance.

## Source availability review

GitHub metadata confirmed the application repository is private at implementation time. Landing/footer copy and installation/contributing docs disclose source access requirements. No application repository visibility changes were made.
