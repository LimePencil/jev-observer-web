---
title: "Contribute"
description: "Report reproducible problems and make focused, verified changes."
section: "Developer guide"
order: 10
---

Jev Observer is an independent MIT-licensed project. Contributions can improve the application, tests, documentation or compatibility evidence. Start with the [source repository](https://github.com/LimePencil/jev-observer), [development setup](/docs/development) and [architecture](/docs/architecture).

## Report a problem

Open an [issue](https://github.com/LimePencil/jev-observer/issues) with the version or commit, operating system, relevant flags, SDK version and a minimal reproduction. Describe expected and observed behavior.

For collection problems, include whether forwarding succeeded and what health counters showed. For dashboard problems, include filters, pause state and whether details were open. Use synthetic payloads and remove secrets or sensitive content before sharing logs, captures or exports.

## Preserve the data contract

Keep changes focused and preserve these boundaries:

- Forwarding does not wait for capture reservations or queue space; recording gaps remain visible.
- Multi-answer requests count usage and cost once. Missing values stay unknown, and failures do not become valid answers.
- Changed definitions, question order and typed Choice values remain distinguishable; imported records keep provenance and reported values. Box geometry must not become a scalar statistic.
- Credentials and input excluded by capture settings stay out of retained records, including imported metadata. Discover secrets before omitting known input paths; reject ambiguous redaction or external import identities changed by redaction atomically.

Normalization or import changes need representative fixtures for each protocol and model profile. Keep protocol, validation and credential-provider identities separate. Forwarding changes should verify response bytes, status, headers and interrupted transfers. Use release source and tests to establish behavior; research plans include proposals that may not have shipped.

## Verify and submit

Run the relevant [development checks](/docs/development#run-the-checks). For dashboard changes, check keyboard use, narrow screens, loading and error states, unknown values, and pending reviews when closing and reopening details. Preserve filter scope, pause behavior and independent collection health. Pending imports and deletion must also survive closing and reopening their drawers.

Synthetic browser tests, packaged-backend integration tests and live-provider checks establish different things. Keep their scope clear in your pull request. For SDK changes, follow [compatibility checks](/docs/development#reproduce-sdk-compatibility). For performance changes, record the exact binary, host, workload, history size and collection losses using the [benchmark procedure](/docs/development#measure-representative-load).

Open a pull request against the application repository. Explain the problem, resulting behavior, verification and any remaining limitation. Update public docs when CLI flags, import formats or API behavior change; include a screenshot when it helps explain a visible change.

References: [0.4.0 release notes](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/releases/0.4.0.md), [CI checks](https://github.com/LimePencil/jev-observer/blob/v0.4.0/.github/workflows/ci.yml) and [license](https://github.com/LimePencil/jev-observer/blob/v0.4.0/LICENSE).
