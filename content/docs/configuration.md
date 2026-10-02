---
title: "Configuration"
description: "Set the listener, retention, capture capacity, privacy options and explicit cost estimates."
section: "User guide"
order: 6
---

Observer is configured through startup flags. The dashboard's Settings view shows the active configuration; it does not replace the command line.

```bash
./target/release/jev-observer --help
```

## Listener and history

| Option             | Default                                | Purpose                                             |
| ------------------ | -------------------------------------- | --------------------------------------------------- |
| `--port`           | `8765`                                 | Port on `127.0.0.1`                                 |
| `--db`             | `.jev-observer/observer.sqlite`        | SQLite file path                                    |
| `--upstream`       | `https://api.typesafe.ai/v1/systemone` | Fixed upstream endpoint                             |
| `--retention-days` | `7`                                    | Maximum record age                                  |
| `--max-records`    | `1000000`                              | Soft retained-record cap                            |
| `--demo`           | Disabled                               | Isolated synthetic history with forwarding disabled |

There is no configurable public bind address. Relative database paths are resolved from the directory where you start Observer. Demo mode uses a separate `*.demo.sqlite` sibling file.

The upstream must be an absolute HTTPS URL for remote providers; HTTP is accepted only for loopback mocks. Credentials, query parameters and fragments are rejected. If you supply an origin with only `/` as its path, Observer uses `/v1/systemone`.

Retention settings must be positive. Maintenance runs every 30 seconds, so the record cap is soft and does not bound allocated disk bytes.

## Credentials and privacy

| Option                                     | Default       | Purpose                                                                              |
| ------------------------------------------ | ------------- | ------------------------------------------------------------------------------------ |
| `JEV_OBSERVER_DB_KEY` environment variable | Unset         | Required 64-character hexadecimal key for encrypted live history; not needed in demo |
| `TYPESAFE_API_KEY` environment variable    | Unset         | Optional fallback credential for upstream forwarding                                 |
| `--capture-state`                          | Disabled      | Retain raw input state                                                               |
| `--redact-key KEY`                         | No extra keys | Add a field name to stored-data redaction; repeat as needed                          |

Live startup requires the same saved database key for the selected database. Supply it through the environment, never a command-line argument. The dashboard requires username `observer` and the workspace access token whose path is printed at startup.

Register a provider key in **Connect an application** and use the generated local client token in your SDK, or use a provider key directly with `x-observer-access` containing the dashboard token. Caller authorization takes precedence over the fallback environment variable. Fallback requests also require the access token and `application/json`. See [connection setup](/docs/connecting) for complete examples.

Definitions, answers and supported extensions are retained even when state capture is disabled. See [data and privacy](/docs/data-and-privacy) for the limits of redaction and local storage.

## Capture capacity

| Option             | Default                 | Accepted range        |
| ------------------ | ----------------------- | --------------------- |
| `--capture-limit`  | `262144` bytes per body | 1 to 16,777,216 bytes |
| `--capture-slots`  | `1024`                  | 1 to 4,096            |
| `--queue-capacity` | `1024`                  | 1 to 4,096            |

The capture limit applies separately to a request body and response body. A capture slot stays reserved across an active request, the pending queue, normalization and persistence. The body budget must satisfy:

```text
2 × capture slots × capture limit <= 512 MiB
```

This budget excludes HTTP buffers and parsed-record overhead. Capture buffers grow on demand. The default settings reach the allowed configured body budget, so increasing slots requires reducing the per-body limit.

Size slots for concurrent calls plus queued writes. For example, 500 requests per second with a one-second upstream needs more than 500 slots. Slower calls can need more concurrent slots even at the same request rate.

Full bodies can forward while their saved observations are truncated. If the capture budget or pending queue is full, observation work is dropped and counted in collection health. Forwarding does not deliberately wait for a capture reservation.

## Estimate costs

Provide both an input and output rate in USD per million tokens. Use rates appropriate for your own provider and model arrangement.

```bash
./target/release/jev-observer \
  --input-price-per-million 1.00 \
  --output-price-per-million 2.00
```

These numbers are illustrative arithmetic, not TypeSafe pricing. Each rate must be finite and nonnegative. A free output rate can be expressed as `0`.

An estimate needs both rates and usable token counts. Missing inputs remain unknown rather than becoming a zero cost. Cost is attached once to the parent request, even when that request contains several answers. The dashboard displays coverage when only some requests have estimates.

Observer does not maintain an automatic provider price list or calculate an invoice. Synthetic sample costs are labeled separately.

## Check effective settings

Open **Settings** in the dashboard, or read the local API:

```bash
curl --user observer http://127.0.0.1:8765/api/settings
```

Curl prompts for the workspace access token as the password, keeping it out of the command line. The response contains public configuration and the application version. Credentials are excluded. Independent collection health is available at `/api/health` and also requires authentication.

Source: [CLI implementation and validation](https://github.com/LimePencil/jev-observer/blob/main/src/config.rs).
