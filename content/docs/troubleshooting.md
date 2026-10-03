---
title: "Troubleshooting"
description: "Check connections, missing observations, unknown costs and local build problems."
section: "User guide"
order: 7
---

Start with the process output and the dashboard's collection-health signal. A successful upstream response and a complete saved observation are separate facts. Commands below use the installed executable unless they explicitly rebuild from source; Windows users can use the executable path from [installation](/docs/installation).

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
3. In bearer mode, use the local client token from **Connect an application**, or a direct provider key with the workspace token in `x-observer-access`. For a loopback model with `--upstream-auth none`, use the workspace dashboard token as the SDK credential.
4. Verify the configured upstream endpoint and its availability.
5. Confirm that your client uses the supported native System One route.

If the system credential store is locked or unavailable, register the provider key with session-only storage. Remote upstreams require HTTPS. Observer adds no retries or redirects. Your SDK's error handling may expose an upstream error response. Other endpoints and untested provider dialects are outside the native forwarding scope. See the exact [SDK connection examples](/docs/connecting).

## Calls succeed but captures are incomplete

Add `Accept-Encoding: identity` to SDK requests. Compressed response bodies pass through unchanged, but this version cannot decode them for typed-answer capture.

Also compare your body sizes with `--capture-limit`. The default is 256 KiB independently for each request and response body. Larger bodies still forward, while the stored observation can be incomplete. Canceled transfers can also produce incomplete captures.

Use [capture-capacity settings](/docs/configuration#capture-capacity) to adjust the limit within the total body budget, then verify with your actual workload.

## Requests are missing from history

Check collection health for drops, queue pressure and writer failures. Capture slots cover active upstream calls as well as queued writes. Slow upstreams can exhaust slots even when the request rate is unchanged.

Check the active source, model, search and time filters, including custom date bounds. Summary counts cover the full selected scope; use **Older requests** and **Newer requests** to traverse feed pages. The group search covers all groups in the selected scope, with its own pagination. Finally, consider retention age and the record cap; old records may already have been removed.

Health counters reset when the process restarts. Zero drops in a newly started process do not establish that retained history is complete.

## Cost or usage is unknown

Unknown is intentional when no usable provider-reported USD cost is available and the provider did not supply usable usage, either estimate rate is missing, or a captured body could not be interpreted. Validated OpenRouter `usage.cost` takes precedence over configured estimates; undocumented cost fields from other providers are not assumed to be USD. Supply both input and output price rates to estimate cost for records with usable usage.

Check the cost-coverage denominator before comparing totals. Imported application actions are not inference requests and must not generate token charges. See [cost estimates](/docs/configuration#estimate-costs).

## A recurring question appears in separate groups

Compare its source, key, full definition, presentation order and task version. A change in those grouping inputs may create a distinct version. Redacted definitions are deliberately isolated because Observer cannot verify their original equivalence.

If rules are carried in input state, add a meaningful `x-observer-task-version`. Missing context is marked unverified. There is no universal semantic mapping that merges differently worded questions.

## Dashboard refresh feels slow

Whole-window summaries get more expensive as retained history grows. Narrow the source or time window and inspect the database's size and host load. A refresh waits for the current snapshot before scheduling the next one.

Pausing the visible dashboard or opening details intentionally holds the view while collection continues. The 0.2.0 measurements include encrypted mixed-load and large-history checks. Their recorded workloads and shared-host timings do not promise one-second freshness at every history size; older September measurements predate encryption.

See [measured performance and limits](https://github.com/LimePencil/jev-observer/blob/main/docs/performance.md).

## An import fails

Choose the format that matches the file, then check valid JSON/JSONL structure. Imports support Observer exports and the reviewed JevRouter receipt format. Limit each batch to 10,000 records and 8 MiB of UTF-8 file or pasted text. The API permits JSON wrapper and escaping overhead separately.

Only one import runs at a time. A duplicate count can mean records with the same explicit source event IDs were already imported. See [import records](/docs/data-and-privacy#import-records).

## A local API call returns 403

Use the loopback URL with the configured port. Browser origins must match the local listener. Local API mutations additionally require `X-Observer-Request: 1`; the dashboard includes it automatically.

API calls also require HTTP Basic authentication as described above. A proxy call using a provider key directly or the process fallback needs the workspace token in `x-observer-access`; fallback additionally requires `application/json`. Registered local client tokens need no additional access header.

For custom integrations, see [the local API](/docs/architecture#local-api). The frontend development server already has a narrowly scoped API proxy configured for local development.

## Local Laya calls fail or time out

Start Laya separately on loopback and configure Observer with `--upstream http://127.0.0.1:8000/v1/systemone --upstream-auth none --provider laya` when the model server requires no provider key. Use the workspace dashboard token as the SDK credential; no provider-key registration is needed. Observer still requires its saved database key for live history.

Use model `english` for the reviewed English checkpoint. CPU inference can exceed the SDKs' default ten seconds; set Python `timeout=180` or JavaScript `timeout: 180000` and tune for your machine. If Laya requires a key, keep bearer mode, register that key and use the returned local client token instead. See [local Laya setup](/docs/connecting#local-laya-models).

## A Score has a consistency warning

Observer 0.2.0 preserves structurally valid Score values when they differ from weighted displayed probabilities by more than 0.001. The warning keeps both original fields inspectable; it does not establish why they differ. Malformed distributions and out-of-range scores still fail validation and stay out of valid distributions.

## A saved key stops working after downgrade

After saving or rotating an OS-store provider key in 0.2.0, Observer 0.1.0 cannot read the newer credential entry. Register the provider key again in the older version and update your application's local client token. A SQLite backup does not restore a removed operating-system credential entry. See [upgrade and rollback guidance](/docs/installation#update-an-existing-build).
