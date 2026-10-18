---
title: "Meet Jev Observer"
description: "A local workspace for questions, requests, and the cost of running them."
section: "Getting started"
order: 1
---

Jev Observer is a local proxy and dashboard for Jev and compatible System One models, including local Laya servers. Inspect answers, compare question definitions, and track failures, latency, token usage and cost in one place.

It runs as one executable with a SQLite database and bundled dashboard. Version **0.3.1** is an MIT-licensed working prototype with native packages for Linux, macOS and Windows.

## Start with a real workflow

1. [Install and open the sample](/docs/installation). Explore 720 synthetic requests without provider credentials.
2. [Connect your application](/docs/connecting). Save a database key, choose your upstream and point your SDK at Observer.
3. [Explore your history](/docs/dashboard). Filter requests, compare questions and add review labels.
4. [Import or export records](/docs/data-and-privacy). Move supported captures and filtered history between workspaces.

## What happens to a request

Your application sends `POST /v1/systemone` through Observer on `127.0.0.1:8765` to one configured upstream. Observer saves bounded request and response captures for local inspection. A changed question definition keeps separate statistics; a request with several answers contributes usage and cost only once.

Choice, Score and Noul answers are supported. Connections include TypeSafe, Jev through OpenRouter and local Laya. The dashboard's model catalog describes other integration paths; a catalog listing is not proof of live compatibility. See [connection setup](/docs/connecting).

## Your data stays local

No Observer account, subscription, analytics or automatic event uploads are required. Live requests still go to your configured provider and may incur charges. The sample and saved history work offline.

Input state is not saved by default. Definitions and answers may still contain sensitive content. Live history is encrypted with your saved database key; demo databases and exports are plaintext. Read [data and privacy](/docs/data-and-privacy).

## Current scope

Observer does not host models, provide universal provider routing or replay inputs across question versions. Capture limits and interruptions can leave gaps in history; check collection health.

See [what changed in 0.3.1](/docs/release-notes) and the [release README](https://github.com/LimePencil/jev-observer/blob/v0.3.1/README.md). These guides were reviewed against the published release on October 18, 2026.
