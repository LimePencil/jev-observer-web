---
title: "Meet Jev Observer"
description: "A local workspace for recurring questions, live requests, and the cost of running them."
section: "Getting started"
order: 1
---

Jev Observer puts recurring Jev questions, individual requests, failures, latency, token usage and reported or estimated cost in one local history. It is a Rust proxy with a SQLite database and a bundled React dashboard.

Use it when you want to understand how a question behaves across many calls, inspect a surprising answer, or compare the definitions your application has used. The current application is an MIT-licensed working prototype, version 0.2.0.

## Start with a real workflow

1. [Install Observer and open the sample](/docs/installation). The sample contains 720 synthetic requests and needs no provider credential. Sign in with the local dashboard token.
2. [Point a local application at the proxy](/docs/connecting). Save a database key, select TypeSafe, OpenRouter or a local Laya server, then configure the matching SDK credential.
3. [Explore the dashboard](/docs/dashboard). Follow question distributions, inspect requests, and add review labels.
4. [Keep or share the useful records](/docs/data-and-privacy). Export filtered history as JSONL or CSV.

## What happens to a request

Your application sends a compatible System One request to Observer on `127.0.0.1:8765`. Observer forwards it to one configured upstream endpoint and captures bounded copies of the request and response. A background writer normalizes those copies and saves observations in SQLite. The browser reads that local history.

Repeated question definitions form groups automatically. A changed definition keeps its own statistics, so an edited rubric is not silently mixed with the previous one. A request with multiple answers still contributes usage and cost once.

The native forwarding route is `POST /v1/systemone`. The default upstream is `https://api.typesafe.ai/v1/systemone`.

## A local application

Observer requires no project account or subscription and sends no analytics or automatic event uploads. The dashboard uses a local access token. Live inference still goes to your configured provider and remains subject to its charges. After installation, the sample and saved-history inspection work offline, including fonts and charts.

Input state is not saved by default. Definitions, answers and supported extension fields are retained and may contain sensitive information. Live history is encrypted with SQLCipher using your saved database key; demo history and JSONL/CSV exports remain plaintext. Read [data and privacy](/docs/data-and-privacy) before capturing a sensitive workload.

## What changed in 0.2.0

Connect a local Laya System One server with explicit loopback authentication settings, or use Jev through OpenRouter. The connection panel shows the provider, endpoint and matching SDK setup. OpenRouter-reported USD cost remains distinct from configured estimates.

Explore older requests and question groups with pagination, search all groups within a scope, and select custom date bounds. Definition comparisons show distributions, review coverage and sample sizes. Structurally valid Score discrepancies keep their original values with consistency warnings.

Credential replacement preserves the previous credential when storage updates fail, and unsupported database schemas are rejected before rewriting. Read the [upgrade guide](/docs/installation#update-an-existing-build) before replacing an older executable, especially if you may downgrade. See the [release notes](https://github.com/LimePencil/jev-observer/blob/v0.2.0/docs/releases/0.2.0.md) for verification limits.

## Current scope

The prototype supports Choice, Score and Noul observations, definition versions, local review labels, Observer JSONL imports, a reviewed JevRouter receipt import, and JSONL/CSV exports. Python and JavaScript SDK compatibility has been checked with pinned versions against a local mock. Separate real-inference checks cover OpenRouter and local Laya; these do not establish live compatibility of every official SDK or the direct TypeSafe service.

The public 0.2.0 release provides six native packages: x86-64 and ARM64 for Linux, macOS and Windows. The release workflow requires native Rust, browser, SDK and packaged live/demo checks for every target before publishing. macOS and Windows executables are unsigned; WSL2 has not been separately tested. See [installation](/docs/installation#supported-packages) for details. Universal provider routing, matched-dataset replay, offline threshold previews and automatic semantic mappings are outside the current scope.

Jev Observer is an independent project. Its name remains provisional. These docs describe the public 0.2.0 release, reviewed October 3, 2026. See the [project README](https://github.com/LimePencil/jev-observer/blob/main/README.md) for the implementation baseline and [development guide](/docs/development) to work on the application.
