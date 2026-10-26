---
title: "Configuration"
description: "Set the upstream, retention, capture limits and cost estimates."
section: "User guide"
order: 6
---

Configure Observer with startup flags. **Settings** shows the active configuration; changing it requires restarting Observer. Run `jev-observer --help` for the full CLI reference.

## Listener and history

| Option                    | Default                                | Purpose                                                                  |
| ------------------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| `--port`                  | `8765`                                 | Port on `127.0.0.1`                                                      |
| `--db`                    | `.jev-observer/observer.sqlite`        | History location                                                         |
| `--upstream`              | `https://api.typesafe.ai/v1/systemone` | One fixed upstream endpoint                                              |
| `--upstream-auth`         | `bearer`                               | Use `none` only for a loopback server without a provider key             |
| `--upstream-timeout-secs` | `300`                                  | Total upload, inference and response deadline; 1–86,400 seconds          |
| `--provider`              | Inferred from known hosts              | Credential and billing provider; set for local models                    |
| `--protocol`              | `systemone`                            | Wire contract: `systemone`, `openai-decisions` or `cloudflare-systemone` |
| `--model-profile`         | Provider fallback                      | Reviewed catalog validator, separate from the requested model name       |
| `--retention-days`        | `7`                                    | Maximum record age                                                       |
| `--max-records`           | `1000000`                              | Soft retained-record cap                                                 |
| `--demo`                  | Disabled                               | Separate synthetic history; forwarding disabled                          |

Observer binds only to IPv4 loopback. Relative database paths resolve from the startup directory. Demo uses a separate `*.demo.sqlite` file.

Remote upstreams require HTTPS; HTTP is accepted on loopback for local models and mocks. URLs cannot contain credentials, query parameters or fragments. An origin without a path uses the selected protocol's local path: `/v1/systemone` or `/v1/decisions`. Cloudflare requires its complete account/model endpoint. Set an explicit upstream when selecting a non-default protocol. See [connection examples](/docs/connecting).

Unknown explicit model profiles are rejected. Without an explicit profile, the provider retains its legacy validation fallback. Choosing a catalog entry prepares a command; it does not change the running connection.

Retention values must be positive. Cleanup runs every 30 seconds; these are record and age limits, not disk-byte limits.

## Credentials and privacy

| Setting               | Purpose                                                      |
| --------------------- | ------------------------------------------------------------ |
| `JEV_OBSERVER_DB_KEY` | Required saved 64-character hexadecimal key for live history |
| `TYPESAFE_API_KEY`    | Optional fallback provider credential in bearer mode         |
| `--capture-state`     | Opt in to retaining input state and envelope media fields    |
| `--redact-key KEY`    | Add a field name to redaction; repeat as needed              |

Supply the database key through the environment. Sign in with username `observer` and the workspace access token printed by path at startup. Its filename is the complete database filename plus `.token`, such as `.jev-observer/observer.sqlite.token`. See [token upgrades](/docs/connecting#sign-in-and-register-a-provider-key) if coming from a legacy `*.access-token` workspace.

For bearer mode, register a provider key in **Connect an application** and use its local client token in your SDK. For `--upstream-auth none`, authenticate locally with the workspace token; no authorization is sent upstream. [Complete credential setup](/docs/connecting).

Definitions and answers are retained even with input capture off. See [data and privacy](/docs/data-and-privacy).

## Capture capacity

| Option             | Default                 | Range        |
| ------------------ | ----------------------- | ------------ |
| `--capture-limit`  | `262144` bytes per body | 1–16,777,216 |
| `--capture-slots`  | `1024`                  | 1–4,096      |
| `--queue-capacity` | `1024`                  | 1–4,096      |

A slot covers an active call through queued writing and persistence. The configured body budget must satisfy:

```text
2 × capture slots × capture limit <= 512 MiB
```

Defaults reach that budget, so increasing slots requires a smaller per-body limit. Buffers grow on demand. This is not a total process-memory cap: HTTP buffers, decoding state, parsed JSON and database work are additional.

Supported gzip/zstd inspection applies `--capture-limit` independently to both raw and decoded bodies. The zstd window is limited to 8 MiB; supported image multipart bodies have additional part and header limits. See [transport inspection bounds](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/capture-decoding.md#inspection-formats-and-limits).

Size slots for concurrent calls plus queued writes. Full bodies can still forward when their saved captures are truncated. Full capture slots or queues drop observation work and report it in collection health.

## Estimate costs

OpenRouter-reported USD cost takes precedence over estimates. For estimates, provide both rates; usable input and output token counts are also required:

```bash
jev-observer \
  --input-price-per-million 1.00 \
  --output-price-per-million 2.00
```

These are illustrative USD rates per million tokens, not provider pricing. Rates must be finite and nonnegative; `0` is allowed. Missing information stays unknown. Each request is charged to the displayed total once, with coverage shown for partial totals.

Observer does not maintain a price list or calculate invoices. Changing rates does not recalculate saved records; synthetic sample costs remain labeled separately.

## Check effective settings

Open **Settings**, or use the authenticated local API:

```bash
curl --user observer http://127.0.0.1:8765/api/settings
```

Curl prompts for the workspace token. The response excludes secrets and includes the version, protocol, model profile, provider, configuration and offline model catalog. `/api/health` reports collection health with the same authentication.

[Full CLI reference](https://github.com/LimePencil/jev-observer/blob/v0.4.0/src/config.rs).
