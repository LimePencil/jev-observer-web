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
MOTION_INTENSITY: 5. Finite request and answer reveals, staggered scroll reveals, feedback and product-tour transitions; reduced-motion fallback. Native CSS, the Web Animations API and IntersectionObserver keep motion isolated and lightweight. No looping hero motion.
VISUAL_DENSITY: 3. Short marketing copy; detailed content lives in docs.

Palette: neutral off-white / charcoal, one muted emerald accent. System light/dark with manual toggle. Geist + Geist Mono, locally bundled. Radii: 8px for controls, 16px for panels. Z-index: 10 sticky header, 20 mobile navigation, 30 docs search overlay.

Hero: interactive request-flow diagram and selectable synthetic answers. Product-tour media: screenshots captured from actual Observer sample mode; no invented dashboard UI or performance statistics. The original generated optical illustration is retained as an unused asset with its provenance.

## Interactive hero refinement

The hero was revised on 2026-09-22 after feedback that the static optical image did not work. Preserve the existing green palette, Geist typography, site structure, headline, and conversion links. Replace the visual with a functional explainer, not a simulated dashboard screenshot.

Live reference pages were researched and visually inspected:

- [Linear](https://linear.app): product activity gives the visual a specific purpose; keep the typography and surrounding space restrained.
- [Resend](https://resend.com): a concise split hero and an interactive email example further down connect input with a visible result. Borrow the direct cause-and-effect interaction.
- [Trigger.dev](https://trigger.dev): animated terminal footage and selectable capability examples make technical behavior explorable. Borrow the ability to choose what to inspect.

Observer's diagram shows request and response paths between an application, Observer, and a provider, plus local capture. Visitors select routing, urgency, or frustration to inspect a typed answer. Values come from `sample_records()` at index 5 in the application source: the Support inbox sample returns technical routing, 0.88 urgency, and a 1.7 frustration score. These are explicitly synthetic values, not performance or accuracy claims.

Motion uses finite transform/opacity keyframes sampled along SVG paths, with no new animation dependency. A request reveals once when the graphic enters view and again when a visitor selects another question. Reduced motion removes animations while retaining every answer. Native radio inputs provide keyboard and touch selection, and a persistent live region announces answer changes.

## Graphics and reveal refinement

Further feedback requested more graphics, less text, simple reveals, and stronger emphasis. The revised hero removes toolbar instructions, full visible question sentences, type badges, and textual distributions. A larger Observer mark anchors the flow; a bar chart, probability ring, and score dots make the selected answer visual. Synthetic-data labeling and the probability caveat remain visible, and full question/distribution descriptions remain available to assistive technology.

The headline's supporting copy is reduced to requests, answers, usage, and the local dashboard. Tour and workflow introductions are shortened; green emphasis highlights the key phrases. Product screenshots reveal separately after their headings. Below-fold sections reveal once, while initial-viewport content remains immediately visible. Content stays readable with JavaScript disabled or reduced motion enabled.

## Content authority

Current Jev Observer README and source, not research proposals. Source installation only. Live inference goes to the configured provider. No universal-provider, production-readiness, lossless-capture, or unverified packaging claims. The website does not connect to or collect data from an Observer instance.

## Source availability review

GitHub metadata confirmed the application repository is private at implementation time. Landing/footer copy and installation/contributing docs disclose source access requirements. No application repository visibility changes were made.
