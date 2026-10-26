---
title: "What's new in 0.4.0"
description: "Native Decisions, Box inspection, broader model coverage and safer history handling."
section: "Getting started"
order: 3.5
---

Released October 22, 2026. [Install or update Observer](/docs/installation#update-an-existing-build).

## More decision formats

Choose the wire format with `--protocol`, model validation with `--model-profile`, and credentials and billing attribution with `--provider`. System One remains the default. Native OpenAI Decisions uses `/v1/decisions`; Cloudflare System One keeps its response wrapper intact.

Decisions preserves ordered questions, optional names, refusals and typed Choice values: boolean `true` and string `"true"` remain distinct. Supported TypeSafe and H2O profiles add Box geometry and confidence. Box observations can be reviewed individually; they do not produce scalar means or histograms. H2O's no-localization result does not establish absence.

The source-reviewed catalog now has 54 entries, including OneJev, Clef runtimes, Liquid D1 and H2O Lightning. Separate offline adapters handle saved OmniJev and Jev-Omni results. Catalog research and synthetic fixtures describe supported inspection; they do not establish live provider availability or model quality. See [connection setup](/docs/connecting) and [importing records](/docs/data-and-privacy#import-records).

## Captures and history

Observer can inspect one bounded gzip member or zstd frame and supported PNG/JPEG multipart requests after forwarding. Wire bytes stay unchanged. Unsupported or oversized inspection data leaves a minimal incomplete record. Input capture remains opt-in; limits apply to inspected bodies, not total process memory.

Privacy checks reject ambiguous redaction and import identities changed by redaction atomically. Exports fetch bounded pages, while retention and Delete all history preserve atomic deletion. Closing an import or deletion drawer keeps its pending status. Request navigation, saved review feedback, timeline sizing and full-date timestamps are improved. See [data and privacy](/docs/data-and-privacy) and the [dashboard guide](/docs/dashboard).

## Before updating

Stop Observer and preserve a complete workspace backup, database key, token files, provider credentials and the previous executable.

Workspace tokens now append `.token` to the complete database filename, such as `observer.sqlite.token`. A workspace with only an older `*.access-token` file gets a fresh token; sign in again and update clients that use workspace authentication. The old file is left untouched.

**Older releases cannot reliably read new Box records**, even though the database schema is unchanged. For rollback, keep the upgraded workspace separately and restore the stopped pre-upgrade snapshot with the earlier executable. Swapping binaries or exporting new records does not make them backward compatible. Follow the [upgrade and rollback instructions](/docs/installation#update-an-existing-build).

## Verification scope

The release includes six native packages and `SHA256SUMS`. The legacy Python 0.7.1 / JavaScript 0.6.0 SDK checks remain separate from the current Python 0.7.5 / JavaScript 0.7.0 compression and multipart fixture, which runs on Linux. These fixtures use a loopback provider without paid inference. macOS and Windows binaries remain unsigned.

[Full release notes and downloads](https://github.com/LimePencil/jev-observer/releases/tag/v0.4.0).
