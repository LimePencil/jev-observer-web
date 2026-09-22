---
title: "Architecture and local API"
description: "Follow bounded capture from HTTP forwarding through normalization, SQLite and the dashboard."
section: "Developer guide"
order: 9
---

Observer separates forwarding from observation work. Request and response bodies continue through the proxy while bounded copies are offered to a background collector. The browser queries normalized local history.

```text
Application -> Local HTTP proxy -> Configured upstream
                     |
              bounded capture
                     |
              background writer
                     |
                   SQLite <- Local API <- Dashboard
```

## Module map

| Location           | Responsibility                                                          |
| ------------------ | ----------------------------------------------------------------------- |
| `src/main.rs`      | Parse configuration, initialize storage, seed demo, start services      |
| `src/config.rs`    | CLI defaults, limits, upstream validation and public settings           |
| `src/server.rs`    | Proxy, local API, embedded UI, origin guards and shutdown               |
| `src/collector.rs` | Capture reservations, bounded queue, writer and health counters         |
| `src/model.rs`     | Normalization, deterministic grouping, privacy, sample data and imports |
| `src/store.rs`     | SQLite schema, batched writes, queries, export, labels and deletion     |
| `build.rs`         | Copy built frontend assets for executable embedding                     |
| `ui/`              | React, TypeScript and Vite dashboard with bundled assets                |

## Forwarding and capture

The proxy handles native `POST /v1/systemone` at one configured upstream URL. Caller authorization takes precedence over the optional process fallback. Observer strips hop-by-hop and local `x-observer-*` metadata headers before forwarding.

The upstream client disables redirects, automatic retries and response decompression. It forwards full bodies while separately retaining bounded copies. An oversized or unsupported compressed body can therefore have a successful forwarded response and an incomplete saved capture.

A semaphore reservation covers both captured bodies and stays held until normalization and persistence finish. A request does not wait for a reservation. Exhausted reservations or a full pending queue drop observation work and update health counters.

One dedicated writer handles normalization and batched persistence outside the async forwarding runtime. SQLite uses WAL. Local HTTP handlers run database work through blocking tasks with bounded concurrency.

## Normalized records and grouping

The model contains parent request records, typed answers, imported application actions and local review labels. Usage and configured cost belong to the parent request. Invalid answers and failed-request placeholders do not enter valid distributions.

Grouping fingerprints include source, key, full definition, presentation and supplied task version. JSON object insertion order must be preserved so presentation differences remain inspectable. Families are separate from strict identity and require an explicit reviewed adapter.

Unknown values remain null. Redacted definitions are isolated. Imported application actions preserve provenance without inventing transport measurements or inference charges. Source event IDs support deduplication when identity is established.

## Local API

The API serves the local dashboard and is part of the current prototype. Use the same loopback origin as the browser. All local API mutations require `X-Observer-Request: 1`. Requests with an Origin must pass same-origin validation, and Host validation also applies to reads.

| Method and path                 | Result                                                         |
| ------------------------------- | -------------------------------------------------------------- |
| `GET /api/dashboard`            | Filtered summary, timeline, groups, recent requests and health |
| `GET /api/health`               | Independent collector and maintenance health                   |
| `GET /api/settings`             | Public configuration, excluding credentials                    |
| `GET /api/requests/{id}`        | Complete normalized record                                     |
| `GET /api/groups/{id}`          | Group details, versions, activity and bounded observations     |
| `POST /api/requests/{id}/label` | Save a review for one answer key                               |
| `POST /api/import`              | Import a supported record format                               |
| `GET /api/export`               | Download matching records as JSONL or CSV                      |
| `DELETE /api/data`              | Remove local history                                           |

The dashboard, group and export queries accept supported filters including `source`, `model`, `window`, `group`, `status` and `search`. Windows are `1h`, `24h`, `7d` and `all`; the default is `24h`. Use `status=error` for failure filtering.

```bash
curl --get http://127.0.0.1:8765/api/dashboard \
  --data-urlencode 'window=1h' \
  --data-urlencode 'source=my-application'
```

To label an existing answer, replace the request ID and key with values from a saved record:

```bash
curl -X POST \
  http://127.0.0.1:8765/api/requests/REQUEST_ID/label \
  -H 'Content-Type: application/json' \
  -H 'X-Observer-Request: 1' \
  --data '{"key":"department","label":"correct"}'
```

Accepted labels are `correct`, `incorrect` and `unknown`. Import bodies use `{"text":"...","format":"observer-jsonl"}` or the `jevrouter-receipt` format. Imports require JSON content type and obey the upload and record limits.

```bash
curl --get http://127.0.0.1:8765/api/export \
  --data-urlencode 'format=jsonl' \
  --data-urlencode 'window=24h' \
  --output observer-history.jsonl
```

Exports use a fixed sequence ceiling and short paged reads. They exclude newer arrivals, but concurrent retention, deletion and label edits can affect later pages. The server allows one export at a time.

## Dashboard updates

The browser uses independent, bounded, sequential dashboard and health polling. Hidden tabs pause polling. A user pause or open details panel holds the visible dashboard while newer data can be retained for the next visible update. Collection itself continues.

Lists are bounded and disclose their limits. Whole-window summaries are not limited to the visible request feed. Charts use SVG with accessible data tables; fonts and assets are bundled locally.

## Shutdown and durability

Shutdown cancels upstream work, allows up to 10 seconds for HTTP completion and drains queued captures. A separate watchdog enforces a 15-second total deadline. Forced termination can lose observations. Process health counters reset on restart, so they do not establish a durable history of every gap.

For precise structures and current source, see the [implementation contract](https://github.com/LimePencil/jev-observer/blob/main/docs/implementation-contract.md), [server](https://github.com/LimePencil/jev-observer/blob/main/src/server.rs) and [model](https://github.com/LimePencil/jev-observer/blob/main/src/model.rs).
