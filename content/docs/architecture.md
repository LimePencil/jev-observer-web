---
title: "Architecture and local API"
description: "Understand the proxy, local history and dashboard API."
section: "Developer guide"
order: 9
---

Observer 0.3.1 forwards requests to one configured upstream while a background collector saves bounded copies. The browser reads normalized local history.

```text
Application -> Local HTTP proxy -> Model provider or local server
                     |
              bounded capture
                     |
              background writer
                     |
                   SQLite <- Local API <- Dashboard
```

## Code map

| Location                                   | Responsibility                                              |
| ------------------------------------------ | ----------------------------------------------------------- |
| `src/main.rs`, `src/config.rs`             | Startup, CLI settings and shutdown                          |
| `src/access.rs`, `src/credentials.rs`      | Workspace authentication, client tokens and provider keys   |
| `src/server.rs`                            | Forwarding, local API and embedded dashboard                |
| `src/collector.rs`                         | Capture reservations, background writer and health counters |
| `src/model.rs`, `src/normalized_json.rs`   | Normalization, grouping, privacy and bounded import parsing |
| `src/catalog.rs`, `src/model_catalog.json` | Offline model catalog and validation profiles               |
| `src/store.rs`                             | Storage, history queries, reviews and exports               |
| `ui/`, `build.rs`                          | Dashboard and executable asset embedding                    |

## Forwarding and storage

The proxy handles `POST /v1/systemone`. Registered local client tokens are replaced with the provider key before forwarding. Direct provider keys also require the workspace token in `X-Observer-Access`. For a loopback server using `--upstream-auth none`, the workspace token authenticates the caller and no authorization reaches the upstream. See [connection options](/docs/connecting).

Remote upstreams require HTTPS. Redirects, automatic retries and response decompression are disabled. The upstream deadline includes upload, inference and response transfer; it defaults to 300 seconds and is configurable with `--upstream-timeout-secs`. Choosing a catalog entry shows setup instructions without changing the configured upstream.

Forwarding does not wait for a capture reservation or space in the observation queue. Recording pressure drops observations and updates collection health. Oversized bodies, unsupported compression or interrupted transfers can leave incomplete captures. Successful forwarding does not guarantee a complete saved record.

One background writer normalizes and batches records. Live history uses SQLCipher encryption and requires `JEV_OBSERVER_DB_KEY`; demo history and exports are plaintext. Database work runs outside the async HTTP executor.

## Record semantics

Usage and cost belong to the parent request, even when it contains several answers. Missing values remain unknown, and failed or invalid answers do not enter valid distributions. Changed definitions, presentation order and supplied task versions stay distinguishable.

Provider profiles preserve reported values and validation warnings. Imported actions retain their provenance; imports recompute validity and grouping rather than trusting supplied claims. See the [model and capture contracts](https://github.com/LimePencil/jev-observer/blob/v0.3.1/docs/models.md) for supported response shapes and mappings.

## Local API

Dashboard assets and API endpoints use HTTP Basic authentication: username `observer`, password the workspace access token whose file path is printed at startup. Mutations also require `X-Observer-Request: 1`. Host, Origin and browser cross-site checks protect the local service.

| Method and path                                   | Purpose                                         |
| ------------------------------------------------- | ----------------------------------------------- |
| `GET /api/dashboard`                              | Filtered summary, timeline, groups and requests |
| `GET /api/health`                                 | Independent collection and maintenance health   |
| `GET /api/settings`                               | Public settings and offline model catalog       |
| `GET /api/credentials`                            | Provider-key status, excluding secrets          |
| `PUT /api/credentials`, `DELETE /api/credentials` | Register, rotate or remove a provider key       |
| `GET /api/requests/{id}`                          | Complete normalized record                      |
| `GET /api/groups/{id}`                            | Group details and version comparisons           |
| `POST /api/requests/{id}/label`                   | Review one answer                               |
| `POST /api/import`                                | Import records                                  |
| `GET /api/export`                                 | Download JSONL or CSV                           |
| `DELETE /api/data`                                | Delete local history                            |

Filters include `source`, `model`, `window`, `group`, `status` and `search`. Windows are `1h`, `24h`, `7d` and `all`, with `24h` as the default; `status=error` selects failures. Optional `from` and `to` are inclusive Unix-millisecond bounds. Request and group cursors page their lists while summaries and exports keep the full selected scope.

```bash
# Curl prompts for the workspace token.
curl --user observer --get http://127.0.0.1:8765/api/dashboard \
  --data-urlencode 'window=1h' \
  --data-urlencode 'source=my-application'
```

Labels use `{"key":"department","label":"correct"}`, with `correct`, `incorrect` or `unknown`. Imports use `{"text":"...","format":"observer-jsonl"}`; `systemone-capture` and `jevrouter-receipt` are also supported. Imports allow at most 8 MiB of decoded text and 10,000 records, with additional normalization and nesting limits. Rejected batches save no partial history. Consult the [import contract](https://github.com/LimePencil/jev-observer/blob/v0.3.1/docs/models.md#library-results-and-custom-apis) before implementing an integration.

## Updates and durability

Dashboard and health polling run independently without overlapping requests. Hidden tabs pause polling; pausing the visible dashboard or opening details does not stop collection. Dashboard reads time out after 45 seconds and show slow-query feedback after five seconds. Other reads use 15 seconds; mutations are not automatically retried. Broad history queries remain workload-dependent.

Shutdown drains queued captures within a 15-second total deadline. Forced termination can lose observations, and health counters reset on restart.

Source: [0.3.1 release notes](https://github.com/LimePencil/jev-observer/blob/v0.3.1/docs/releases/0.3.1.md), [server](https://github.com/LimePencil/jev-observer/blob/v0.3.1/src/server.rs), [store](https://github.com/LimePencil/jev-observer/blob/v0.3.1/src/store.rs) and [browser API handling](https://github.com/LimePencil/jev-observer/blob/v0.3.1/ui/src/api.ts).
