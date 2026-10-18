---
title: "Troubleshooting"
description: "Check connections, missing observations, unknown costs and local build problems."
section: "User guide"
order: 7
---

Start with process output and the dashboard's collection-health signal. A successful response and a complete saved observation are separate facts. Windows users can use the executable path from [installation](/docs/installation).

## The dashboard build is missing

The Rust executable embeds whatever dashboard build exists when it is compiled. Build the UI first, then rebuild Rust:

```bash
npm ci --prefix ui
npm run build --prefix ui
cargo build --release --locked
```

Restart using `./target/release/jev-observer`. A development server is not required for the completed release build.

## The local page will not open

Confirm that the Observer process is still running and inspect its terminal output. Use `http://127.0.0.1:8765`, or the port you supplied with `--port`.

```bash
curl --user observer http://127.0.0.1:8765/api/health
```

Curl prompts for the workspace access token as the password. Use the token file whose exact path Observer prints at startup; demo and live history have separate tokens. If another process occupies the port, select a different one and update both the browser address and SDK base URL:

```bash
jev-observer --port 8770
```

Observer binds to IPv4 loopback. A remote application or a separate machine cannot use your computer's `127.0.0.1` address to reach it.

## Live startup reports a database key error

Supply `JEV_OBSERVER_DB_KEY` as the saved 64-character hexadecimal key for this database. A missing or wrong key prevents live startup. Do not generate a new key for existing encrypted history. See [database-key setup](/docs/connecting#save-a-database-key). Demo needs no database key. Stop older Observer processes before migrating a plaintext database.

## The dashboard or API asks for a password

Use username `observer` and the workspace access token, not your provider key or database key. The default token paths are `.jev-observer/observer.access-token` for live mode and `.jev-observer/observer.demo.access-token` for demo. Startup output gives the exact path for custom databases. Direct API calls require HTTP Basic authentication too; `curl --user observer` prompts for the token.

## The application cannot make a request

Check these in order:

1. Supply the saved database key and start normal mode, without `--demo`. Demo intentionally disables forwarding.
2. Set the SDK base URL to the origin only. The tested SDKs append `/v1/systemone` themselves.
3. Use a registered local client token, or a provider key plus `x-observer-access`. With `--upstream-auth none`, use the workspace token as the SDK credential.
4. Verify the configured upstream endpoint and its availability.
5. Confirm that your client uses the supported native System One route.

If the system credential store is locked, use session-only storage. Remote upstreams require HTTPS; authentication-free upstreams must be loopback. Observer adds no retries or redirects. See [connection examples and provider setup](/docs/connecting).

## Slow inference times out

Increase the SDK timeout for local inference: Python uses seconds (`timeout=180`), JavaScript milliseconds (`timeout: 180000`). Observer allows 300 seconds for the full upload, inference and response transfer; change it with `--upstream-timeout-secs`. The shorter timeout wins. An Observer deadline before headers returns 504; during the body it ends the stream and records an incomplete transfer.

## Calls succeed but captures are incomplete

Add `Accept-Encoding: identity` to SDK requests. Compressed response bodies pass through unchanged, but this version cannot decode them for typed-answer capture.

Also compare your body sizes with `--capture-limit`. The default is 256 KiB independently for each request and response body. Larger bodies still forward, while the stored observation can be incomplete. Canceled transfers can also produce incomplete captures.

Use [capture-capacity settings](/docs/configuration#capture-capacity) to adjust the limit within the total body budget, then verify with your actual workload.

## Requests are missing from history

Check collection health for drops, queue pressure and writer failures. Slow upstreams can exhaust capture slots, which cover active calls and queued writes. The latest storage failure shows its time, operation and sanitized category; it can remain visible after recovery.

Check source, model, search and date filters, then page through the request list. Summary counts cover the full selected scope. Retention may already have removed older records. Request details show 50 answers per page; saved records and JSONL retain all answers.

Health counters reset when the process restarts. Zero drops in a newly started process do not establish that retained history is complete.

## Cost or usage is unknown

OpenRouter's valid reported USD cost takes precedence over estimates. Other providers' `usage.cost` fields are not assumed to be USD. Without recognized reported cost, estimates need usable token usage and both configured rates.

Check cost coverage and separate input/output token coverage before comparing totals. Reported zero is known; absent usage stays unknown. Imported application actions do not create token charges. See [cost estimates](/docs/configuration#estimate-costs).

## An answer has a validation warning

Warnings preserve reported values; otherwise valid answers can still count in distributions. Malformed answers remain invalid. Current validation applies to new captures and imports; upgrading does not reclassify saved history. See [model-specific interpretation](https://github.com/LimePencil/jev-observer/blob/v0.3.1/docs/models.md#compatible-http-servers).

## A recurring question appears in separate groups

Compare its source, key, full definition, presentation order and task version. A change in those grouping inputs may create a distinct version. Redacted definitions are deliberately isolated because Observer cannot verify their original equivalence.

If rules are carried in input state, add a meaningful `x-observer-task-version`. Missing context is marked unverified. There is no universal semantic mapping that merges differently worded questions.

## Dashboard refresh feels slow

Narrow the source or date range and check host load. Dashboard reads allow 45 seconds and show slow-query feedback after five seconds; broad histories can still exceed that deadline. A refresh waits for the current snapshot before starting another.

Pausing or opening details holds the view while collection continues. Question-group comparison metrics load when you open the group. Performance depends on workload and retained history; the timeout is not a latency guarantee.

See [release performance limits](https://github.com/LimePencil/jev-observer/blob/v0.3.1/docs/releases/0.3.1.md#performance-and-upgrade-notes).

## An import fails

Choose the matching format: Observer JSONL, JevRouter receipt or System One capture. Limit each batch to 10,000 records and 8 MiB of UTF-8 text. Normalization has additional per-record and per-batch limits: 413 means excessive size or work; 400 means malformed or excessively nested input. Neither saves a partial batch.

Split larger files between complete JSONL lines; splitting cannot fix an oversized individual record. Only one import runs at a time. Duplicate counts mean matching event IDs were already imported. See [import records](/docs/data-and-privacy#import-records).

## A local API call returns 403

Use the loopback URL with the configured port. Browser origins must match the local listener. Local API mutations additionally require `X-Observer-Request: 1`; the dashboard includes it automatically.

API calls also require HTTP Basic authentication as described above. A proxy call using a provider key directly or the process fallback needs the workspace token in `x-observer-access`; fallback additionally requires `application/json`. Registered local client tokens need no additional access header.

For custom integrations, see [the local API](/docs/architecture#local-api). The frontend development server already has a narrowly scoped API proxy configured for local development.
