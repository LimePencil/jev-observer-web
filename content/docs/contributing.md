---
title: "Contribute"
description: "Make a focused change, preserve observable facts, and bring evidence a reviewer can use."
section: "Developer guide"
order: 10
---

Jev Observer is an independent MIT-licensed project. Contributions can improve the local application, its tests, documentation or evidence about supported workloads.

Start with the [source repository](https://github.com/LimePencil/jev-observer), [development setup](/docs/development) and [architecture](/docs/architecture). The historical research and planning reports contain proposals as well as implemented ideas. Use current source and the README to establish existing behavior.

> The source repository is currently private. Opening issues, reading source links, and submitting changes require repository access.

## Report a reproducible problem

A useful issue includes the application version or commit, operating system, relevant startup flags, SDK package/version, expected behavior and observed behavior. Add a minimal sequence that reproduces the problem.

For collection problems, report whether forwarding succeeded and what health counters showed. For UI problems, include the filter window, whether the view was paused and whether a details panel was open. For performance reports, include retained-history size and workload shape.

Use synthetic payloads when possible. Review logs, database excerpts and exports for credentials, sensitive definitions, answers and captured state before sharing them. Open an issue through the [repository issue tracker](https://github.com/LimePencil/jev-observer/issues).

## Keep a change focused

Explain the concrete behavior your change introduces or fixes. Include the relevant test result and a reproduction example when it helps review. Documentation should describe functionality verified in source rather than promising work from a planning document.

For dashboard changes, test keyboard use, narrow screens, loading and error states, empty history and unknown values. Preserve the meaning of pause, collection health, cost coverage and bounded feeds.

## Preserve the data contract

Several boundaries are central to the application:

- Forwarding must not deliberately wait for a capture reservation or a full observation queue.
- Recording gaps must remain visible through independent health accounting.
- A multi-answer request contributes token usage and cost once.
- Missing values remain unknown; failures do not become valid negative answers.
- Changed definitions and presentations remain distinguishable.
- Imported actions keep their provenance and do not become fabricated inference calls.
- Credentials and opted-out raw state must not appear in retained records.

Changes to normalization, grouping or import conversion need fixtures that demonstrate these properties. Changes to forwarding should verify response bytes, status, relevant headers and failure behavior.

## Verify the implementation

Run the standard project checks from the repository root:

```bash
npm ci --prefix ui
npm run build --prefix ui
cargo fmt --all --check
cargo clippy --locked --all-targets -- -D warnings
cargo test --locked
npx --prefix ui playwright install chromium
npm test --prefix ui
cargo build --release --locked
```

For SDK-sensitive changes, run the [local compatibility check](/docs/development#reproduce-sdk-compatibility). For proxy or storage performance changes, describe a workload and use the [benchmark procedure](/docs/development#measure-representative-load).

Browser interaction tests use synthetic API fixtures. Passing them does not establish live-provider compatibility or backend throughput. Keep those evidence boundaries explicit in a pull request.

## Write useful performance evidence

Record the exact binary or commit, host, payload sizes, upstream latency, request rate, duration, capture configuration and database size. Include failures, dropped/incomplete observations and accounting checks alongside latency.

Repeatable local-mock results are useful, but do not establish cold TLS behavior, provider capacity, all operating systems or every query cardinality. The existing [performance report](https://github.com/LimePencil/jev-observer/blob/main/docs/performance.md) provides the expected context and limitations.

## Submit for review

Create a branch with your change and open a pull request against the application repository. State the problem, the resulting behavior, how you verified it and any remaining limitation. Link an issue when relevant.

Keep source comments and public docs synchronized when a CLI flag, import format, API shape or behavior changes. Include screenshots for a visible dashboard change when they help reviewers understand it.

Source: [MIT license](https://github.com/LimePencil/jev-observer/blob/main/LICENSE), [CI checks](https://github.com/LimePencil/jev-observer/blob/main/.github/workflows/ci.yml) and [implementation contract](https://github.com/LimePencil/jev-observer/blob/main/docs/implementation-contract.md).
