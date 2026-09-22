# Dashboard screenshots

Captured on 2026-09-22 from the actual Jev Observer application in the sibling
`../jev-observer` checkout. These are unmodified browser screenshots, not mockups
or fabricated application views.

## Provenance

- Application: existing `target/release/jev-observer` binary, version `0.1.0`,
  embedding the existing UI build. No application source files were edited.
- Launch: `./target/release/jev-observer --demo --port 18765 --db /tmp/jev-observer-web-capture/observer.sqlite`.
- Demo mode seeds 720 synthetic requests, disables forwarding, and uses a
  separate demo database. No provider calls or credentials were used.
- Browser: Playwright Chromium, light color scheme, reduced motion, `en-US`
  locale, UTC display timezone, viewport 1440 × 950, device scale factor 1.5.
- Output: 2160 × 1425 PNG screenshots at `public/images/`.
- The isolated capture process was terminated cleanly after capture. The
  pre-existing demo process on port 8765 was not changed or stopped.
- Capture scripts and raw reference captures remain outside the website at
  `/tmp/jev-observer-web-capture/`.

## Images and truthful labels

| Image                    | Recommended website label | Actual application state                                                                                                                                                                                                       |
| ------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `observer-metrics.png`   | Overview                  | Workspace overview with the Latency timeline metric selected. Shows request count, failures, p50/p95 latency, reported tokens, known cost, collection health, and the beginning of recurring questions and the request stream. |
| `observer-questions.png` | Question groups           | The actual `support_routing` recurring-question detail drawer. Shows its answer distribution, associated request activity, and separate definition versions. The background dashboard is scrolled to recurring questions.      |
| `observer-live.png`      | Request details           | The actual `synthetic-0719` request detail drawer. Shows request-level latency, tokens and synthetic cost, followed by the `support_routing` choice and reported probabilities.                                                |

The application uses one dashboard with Overview, Question groups, and Requests
navigation; these images should not be described as independent product pages.
The overview screenshot visibly carries “Sample data” and the synthetic-records
banner. The question-group screenshot carries “Sample environment” and “Sample
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
  copy their branding or imply that Jev Observer offers packaged downloads.

Reference screenshots are saved only in the temporary capture directory as
`ghostty.org.png` and `zed.dev.png`; they are not website assets.
