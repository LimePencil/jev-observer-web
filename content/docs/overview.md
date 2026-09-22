---
title: "Meet Jev Observer"
description: "A local workspace for recurring questions, live requests, and the cost of running them."
section: "Getting started"
order: 1
---

Jev Observer puts recurring Jev questions, individual requests, failures, latency, token usage and cost estimates in one local history. It is a Rust proxy with a SQLite database and a bundled React dashboard.

Use it when you want to understand how a question behaves across many calls, inspect a surprising answer, or compare the definitions your application has used. The current application is an MIT-licensed working prototype, version 0.1.0.

## Start with a real workflow

1. [Build Observer and open the sample](/docs/installation). The sample contains 720 synthetic requests and needs no provider credential.
2. [Point a local application at the proxy](/docs/connecting). Keep your provider credential in the application and change the SDK base URL.
3. [Explore the dashboard](/docs/dashboard). Follow question distributions, inspect requests, and add review labels.
4. [Keep or share the useful records](/docs/data-and-privacy). Export filtered history as JSONL or CSV.

## What happens to a request

Your application sends a native TypeSafe request to Observer on `127.0.0.1:8765`. Observer forwards it to one configured upstream endpoint and captures bounded copies of the request and response. A background writer normalizes those copies and saves observations in SQLite. The browser reads that local history.

Repeated question definitions form groups automatically. A changed definition keeps its own statistics, so an edited rubric is not silently mixed with the previous one. A request with multiple answers still contributes usage and cost once.

The native forwarding route is `POST /v1/systemone`. The default upstream is `https://api.typesafe.ai/v1/systemone`.

## A local application

Observer requires no project account or subscription and sends no analytics or automatic event uploads. Live inference still goes to your configured provider. After you build the executable, the sample and saved-history inspection work offline, including fonts and charts.

Input state is not saved by default. Definitions, answers and supported extension fields are retained and may contain sensitive information. Read [data and privacy](/docs/data-and-privacy) before capturing a sensitive workload.

## Current scope

The prototype supports Choice, Score and Noul observations, definition versions, local review labels, Observer JSONL imports, a reviewed JevRouter receipt import, and JSONL/CSV exports. Python and JavaScript SDK compatibility has been checked with pinned versions against a local mock.

Linux is the verified development environment. There is no verified macOS or Windows packaging yet. Universal provider routing, matched-dataset replay, offline threshold previews and automatic semantic mappings are outside the current scope.

Jev Observer is an independent project. Its name remains provisional. These docs describe the current source workflow, reviewed September 22, 2026. See the [project README](https://github.com/LimePencil/jev-observer/blob/main/README.md) for the implementation baseline and [development guide](/docs/development) to work on the application.
