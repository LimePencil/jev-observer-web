# Dashboard screenshots

Captured on 2026-10-26 from the official public Jev Observer v0.4.0 Linux release.
These are unmodified browser screenshots, not mockups or fabricated application
views. They replace the earlier v0.3.1 public-release captures.

## Provenance

- Application: [`v0.4.0` public release](https://github.com/LimePencil/jev-observer/releases/tag/v0.4.0),
  package `jev-observer-v0.4.0-x86_64-unknown-linux-musl.tar.gz`, with its embedded UI.
  Tag commit: `cc9384ae0cc6f7a43b5926a9bee3dd52733cb670`.
- Downloaded the native package and `SHA256SUMS` using `gh release download`.
  SHA-256 verified: `d5a9ea6c18daa187a2e1771c54c626da219365375a04dac9239684ed858d30d7`.
  The downloaded executable reported `jev-observer 0.4.0`.
- Launch: `./jev-observer --demo --port 18768 --db <capture-dir>/observer.sqlite`,
  using an isolated temporary directory outside the website checkout.
- Demo mode seeds 720 synthetic requests, disables forwarding, and uses a
  separate demo database. No provider calls or credentials were used.
- Browser authentication: username `observer`, using the isolated demo token file
  (`observer.demo.sqlite.token`) directly in Playwright's HTTP credentials. The token was not printed or captured.
- Browser: Playwright Chromium `153.0.8010.12`, light color scheme, reduced motion,
  `en-US` locale, UTC display timezone, viewport 1440 × 950, device scale factor 1.5.
  The dashboard uses `?window=all` (All history).
- Output: 2160 × 1425 PNG screenshots at `public/images/`.
- The tour imports these images as bundled assets. Content hashes in their URLs
  prevent browsers and the image optimizer from reusing old development captures.
- Assertions confirmed 720 sample requests, group definition versions, the request
  review control, and authenticated settings reporting `demo: true`, `version: 0.4.0`.
  No page errors or external browser requests occurred.
- The isolated capture process was terminated cleanly with `SIGINT` after capture.
  Existing processes and the application source checkout were left unchanged.
- The capture script, package and raw captures remain in that isolated directory,
  outside the website checkout.

## Images and truthful labels

| Image                    | Recommended website label | Actual application state                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observer-metrics.png`   | Overview                  | Workspace overview with the Latency timeline metric selected and All history in scope. Shows request count, failures, p50/p95 latency, known tokens and coverage, known cost, collection health, and the beginning of recurring questions and the request stream. |
| `observer-questions.png` | Question groups           | The actual `support_routing` recurring-question detail drawer. Shows its answer distribution, associated request activity, and the Definition versions heading with a count of two. The background dashboard is scrolled to recurring questions.                  |
| `observer-live.png`      | Request details           | The actual `synthetic-0719` request detail drawer. Shows request-level latency, tokens and synthetic cost, followed by the `support_routing` choice and reported probabilities.                                                                                   |

The application uses one dashboard with Overview, Question groups, and Requests
navigation; these images should not be described as independent product pages.
The overview screenshot visibly carries the current “jev observer” wordmark,
“Sample data” and the banner explaining that forwarding is disabled until
restarting without `--demo`. Its action is “See live setup.” The question-group
screenshot carries “Sample environment” and “Sample
workspace.” The request-detail screenshot explicitly states “Synthetic sample.
No provider was called.” Keep a visible synthetic-demo caption with any website
presentation, especially if an image is cropped.

Sample counts, costs, probabilities, and latency values illustrate the interface;
they are not benchmarks, real usage, or provider charges.

## Visual reference observations

Reviewed actual rendered homepages of [Ghostty](https://ghostty.org) and
[Zed](https://zed.dev) before implementation.

- Ghostty puts a distinctive product artifact first, followed by a plain product
  definition and direct Download / Documentation actions. A concrete application
  image makes a developer tool easier to understand than decorative abstraction.
- Zed uses a warm paper background, one strong accent, typographic contrast,
  delicate structural rules, adjacent installation / source actions, and a real
  screenshot immediately after compact value statements.
- Useful principles here: clear product definition, real UI, generous space,
  restrained framing, and direct installation / documentation paths. Do not
  copy their branding. The current public release provides native packages;
  use the verified release and installation guide for download claims.

Historical reference screenshots were saved only in `/tmp/jev-observer-web-capture/` as
`ghostty.org.png` and `zed.dev.png`; they are not website assets.
