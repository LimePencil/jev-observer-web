---
title: "Troubleshooting"
description: "Check connections, missing observations, unknown costs and local build problems."
section: "User guide"
order: 7
---

Start with the process output and the dashboard's collection-health signal. A successful upstream response and a complete saved observation are separate facts.

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
curl http://127.0.0.1:8765/api/health
```

If another process occupies the port, select a different one and update both the browser address and SDK base URL:

```bash
./target/release/jev-observer --port 8770
```

Observer binds to IPv4 loopback. A remote application or a separate machine cannot use your computer's `127.0.0.1` address to reach it.

## The application cannot make a request

Check these in order:

1. Start normal mode, without `--demo`. Demo intentionally disables forwarding.
2. Set the SDK base URL to the origin only. The tested SDKs append `/v1/systemone` themselves.
3. Keep the provider credential in your application environment.
4. Verify the configured upstream endpoint and its availability.
5. Confirm that your client uses the supported native System One route.

Observer adds no retries or redirects. Your SDK's error handling may expose an upstream error response. Other endpoints and untested provider dialects are outside the native forwarding scope. See the exact [SDK connection examples](/docs/connecting).

## Calls succeed but captures are incomplete

Add `Accept-Encoding: identity` to SDK requests. Compressed response bodies pass through unchanged, but this version cannot decode them for typed-answer capture.

Also compare your body sizes with `--capture-limit`. The default is 256 KiB independently for each request and response body. Larger bodies still forward, while the stored observation can be incomplete. Canceled transfers can also produce incomplete captures.

Use [capture-capacity settings](/docs/configuration#capture-capacity) to adjust the limit within the total body budget, then verify with your actual workload.

## Requests are missing from history

Check collection health for drops, queue pressure and writer failures. Capture slots cover active upstream calls as well as queued writes. Slow upstreams can exhaust slots even when the request rate is unchanged.

Check the active source, model, search and time filters. Summary counts cover the full selected window, but the request feed is bounded. Finally, consider retention age and the record cap; old records may already have been removed.

Health counters reset when the process restarts. Zero drops in a newly started process do not establish that retained history is complete.

## Cost or usage is unknown

Unknown is intentional when the provider did not supply usable usage, either estimate rate is missing, or a captured body could not be interpreted. Supply both input and output price rates to estimate cost for records with usable usage.

Check the cost-coverage denominator before comparing totals. Imported application actions are not inference requests and must not generate token charges. See [cost estimates](/docs/configuration#estimate-costs).

## A recurring question appears in separate groups

Compare its source, key, full definition, presentation order and task version. A change in those grouping inputs may create a distinct version. Redacted definitions are deliberately isolated because Observer cannot verify their original equivalence.

If rules are carried in input state, add a meaningful `x-observer-task-version`. Missing context is marked unverified. There is no universal semantic mapping that merges differently worded questions.

## Dashboard refresh feels slow

Whole-window summaries get more expensive as retained history grows. Narrow the source or time window and inspect the database's size and host load. A refresh waits for the current snapshot before scheduling the next one.

Pausing the visible dashboard or opening details intentionally holds the view while collection continues. The local performance report records multi-second dashboard queries at around 150,000 records on its test machine; it does not promise one-second freshness at every history size.

See [measured performance and limits](https://github.com/LimePencil/jev-observer/blob/main/docs/performance.md).

## An import fails

Choose the format that matches the file, then check valid JSON/JSONL structure. Imports support Observer exports and the reviewed JevRouter receipt format. Limit each batch to 10,000 records and an 8 MiB upload, including the JSON wrapper.

Only one import runs at a time. A duplicate count can mean records with the same explicit source event IDs were already imported. See [import records](/docs/data-and-privacy#import-records).

## A local API call returns 403

Use the loopback URL with the configured port. Browser origins must match the local listener. Local API mutations additionally require `X-Observer-Request: 1`; the dashboard includes it automatically.

For custom integrations, see [the local API](/docs/architecture#local-api). The frontend development server already has a narrowly scoped API proxy configured for local development.
