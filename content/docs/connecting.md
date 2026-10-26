---
title: "Connect an application"
description: "Connect System One, native Decisions or local models with encrypted history and local authentication."
section: "Getting started"
order: 3
---

Install Observer using the [installation guide](/docs/installation), then stop any running demo with `Ctrl-C`. For a source build, replace `jev-observer` below with `./target/release/jev-observer`.

## Know which key to use

| Credential             | Where you use it                                  | Where it comes from                                     |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| Database key           | `JEV_OBSERVER_DB_KEY` when starting live Observer | Generate once below and save for this database          |
| Dashboard access token | Browser password for username `observer`          | The database filename plus `.token`, printed at startup |
| Provider API key       | **Connect an application** in the live dashboard  | Your configured upstream provider account               |
| Local client token     | Your application's SDK `api_key` or `apiKey`      | Returned after registering the provider key             |

Demo needs only its dashboard access token. A local server using `--upstream-auth none` uses that workspace token as its SDK credential and needs no provider key.

## Save a database key

Generate a key once and save its printed 64-character hexadecimal value in a password manager. Losing it makes encrypted history unreadable. In Bash:

```bash
openssl rand -hex 32
```

On every live startup, read the saved key without putting it in shell history:

```bash
read -r -s -p 'Saved database key: ' JEV_OBSERVER_DB_KEY; echo
export JEV_OBSERVER_DB_KEY
```

In Windows PowerShell, generate the key once:

```powershell
$keyBytes = New-Object byte[] 32
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
$random.GetBytes($keyBytes)
$random.Dispose()
[BitConverter]::ToString($keyBytes).Replace('-', '').ToLowerInvariant()
```

Save the printed value, then use this block on each live startup:

```powershell
$savedKey = Read-Host 'Saved database key' -AsSecureString
$env:JEV_OBSERVER_DB_KEY = [Net.NetworkCredential]::new('', $savedKey).Password
```

Do not generate a replacement key for an existing database. Demo needs no database key and disables forwarding.

## Sign in and register a provider key

Start Observer from your application's directory:

```bash
jev-observer
```

On Windows, use `& "$env:LOCALAPPDATA\JevObserver\bin\jev-observer.exe"`. For another provider or local model, use its upstream command below instead.

Open [http://127.0.0.1:8765](http://127.0.0.1:8765). Sign in as `observer` with the token in `.jev-observer/observer.sqlite.token`. Startup prints the exact path; demo uses `.jev-observer/observer.demo.sqlite.token`. The suffix preserves the complete database filename, so `team.db` uses `team.db.token`.

Upgrading a workspace that has only a legacy `*.access-token` file creates a fresh token and leaves the old file untouched. Sign in with the new token and update clients using `x-observer-access` or `--upstream-auth none`. Registered local client tokens are unchanged; their session and system persistence rules still apply.

In **Connect an application**, enter your provider key and choose session-only or operating-system credential storage. Copy the returned local client token into your application's `JEV_OBSERVER_CLIENT_TOKEN` environment variable. You can reopen the panel to copy it until the page reloads or closes, or the key is replaced or removed. Keep it private. Session-only storage works if the system store is unavailable or locked.

Observer replaces the local token with your provider key before forwarding. Session-only credentials need registration after every restart. Keep the same database path when using system credential storage.

For System One, change the TypeSafe SDK base URL to the local origin, `http://127.0.0.1:8765`. Do not append `/v1/systemone`: the tested clients add that route themselves.

## Python

```bash
python -m pip install "typesafe-sdk[zstd]==0.7.5"
```

```python
import os
from typesafe_sdk import TypeSafeClient

client = TypeSafeClient(
    api_key=os.environ["JEV_OBSERVER_CLIENT_TOKEN"],
    base_url="http://127.0.0.1:8765",
    headers={
        "x-observer-source": "my-application",
        "Accept-Encoding": "identity",
    },
)
```

Use this client for your existing System One calls. A registered local token needs no additional access header.

## JavaScript

```bash
npm install @typesafe-ai/sdk@0.7.0
```

```javascript
import { TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient({
  apiKey: process.env.JEV_OBSERVER_CLIENT_TOKEN,
  baseURL: "http://127.0.0.1:8765",
  defaultHeaders: {
    "x-observer-source": "my-application",
    "Accept-Encoding": "identity",
  },
});
```

The JavaScript option is `baseURL`; the Python option is `base_url`.

## Use a provider key directly

Use your provider key as the SDK credential and add `x-observer-access` with the workspace dashboard token. Registered local client tokens need no extra access header. See [direct-key examples and fallback credentials](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/connection.md#credential-handling-and-metadata).

## Request readable captures

Both examples request `Accept-Encoding: identity`. Observer can also inspect one complete gzip member or zstd frame and supported image multipart requests after forwarding the original bytes unchanged. Both raw and decoded bodies must fit `--capture-limit`; malformed, unsupported, ambiguous or oversized bodies leave incomplete captures.

Input capture stays off by default. With `--capture-state`, supported PNG/JPEG parts can be retained as inline inspection data; this is not a guaranteed replay request. See [transport formats and privacy limits](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/capture-decoding.md).

## Name sources and task versions

Optional metadata headers add local context and are stripped before forwarding:

| Header                         | Use                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `x-observer-source`            | Give an application a recognizable source name and its own question namespace |
| `x-observer-task-version`      | Distinguish rule changes carried in input state                               |
| `x-observer-adapter: jgrep-v1` | Enable the narrowly matched, reviewed jgrep indexed-family adapter            |

Grouping uses the source, original key, full definition, presentation order and task version. Update the task version when rules in state change. Missing context is unverified; redacted definitions stay separate. The jgrep adapter recognizes one specific pattern.

## Choose the upstream

Observer forwards native `POST /v1/systemone` traffic to `https://api.typesafe.ai/v1/systemone` by default. To select another fixed compatible endpoint:

```bash
jev-observer \
  --upstream https://your-provider.example/v1/systemone
```

Each process has one fixed upstream; stop and restart it to change endpoints. Remote endpoints require HTTPS; HTTP is allowed on loopback.

Use `--protocol` for the wire contract (`systemone`, `openai-decisions` or `cloudflare-systemone`), `--model-profile` for a reviewed catalog validator, and `--provider` for credential and billing attribution. The profile is separate from the model name in your request. Selecting a catalog entry prepares instructions; it does not change the running process.

Observer adds no retries or redirects. Its full-exchange deadline is 300 seconds; adjust `--upstream-timeout-secs` for longer calls. Your SDK's timeout also applies.

## OpenAI Decisions

With your saved database key set, start Observer for the native Decisions API:

```bash
jev-observer --upstream https://api.openai.com/v1/decisions \
  --provider openai --protocol openai-decisions --model-profile openai-decisions
```

Register the provider key and use the returned local client token. Set the OpenAI client's base URL to `http://127.0.0.1:8765/v1`; it calls `POST /v1/decisions`. The connection panel generates Python and JavaScript examples; this API requires Python `openai>=3.26.0` or JavaScript `openai>=7.30.0`.

Keep native `input` and ordered `questions` arrays. Observer preserves original definitions and distinguishes Boolean choices such as `true` from strings such as `"true"`. Predicates appear as yes-probabilities. The requested model must support Decisions for your account; live calls may incur charges. See [native examples](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/connection.md#openai-decisions).

## Cloudflare System One

Choose a Cloudflare catalog entry and replace its account placeholder. Use `--provider cloudflare --protocol cloudflare-systemone` with that entry's `--model-profile` and full account/model upstream URL. Send native System One JSON to Observer's local `POST /v1/systemone` route.

Use the panel's Python HTTP or JavaScript `fetch` example. Check both the HTTP status and the response envelope's `success` field before reading `result`. Observer preserves that wrapper on the wire and inspects its inner typed response; a TypeSafe SDK expecting an unwrapped response cannot consume it directly.

## Jev through OpenRouter

With your saved database key set, start Observer against OpenRouter's System One endpoint:

```bash
jev-observer --upstream https://openrouter.ai/api/v1/systemone
```

Register your OpenRouter key, use its local client token in the SDK, and request a Jev model such as `jev-1.13`. Inference is billed to your OpenRouter account. Observer recognizes the hostname and shows valid reported USD cost ahead of configured estimates.

## Local Laya models

Start Laya separately on loopback with its English checkpoint and `LAYA_API_KEY` unset. With your saved database key set, run:

```bash
jev-observer --upstream http://127.0.0.1:8000/v1/systemone \
  --upstream-auth none --provider laya
```

Use the workspace access token as the SDK's `api_key` or `apiKey`, keep the local base URL and identity encoding, and request model `english`. CPU inference may need Python's `timeout=180` (seconds) or JavaScript's `timeout: 180000` (milliseconds). Increase both SDK and Observer deadlines for longer calls.

`--upstream-auth none` is loopback-only, still authenticates callers and strips authorization before forwarding. If Laya requires a key, use bearer mode and register that key instead. See the [tested Laya setup and limits](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/connection.md#laya-and-other-local-system-one-models).

## Find a decision-model connection

Open **Connect an application → Decision models** for compatible servers and [mapped capture imports](/docs/data-and-privacy#import-records). Selecting an entry shows instructions; it does not change the running upstream. Follow its protocol, model-profile and provider settings; use separate processes, ports and databases for concurrent upstreams.

The 54 catalog entries document reviewed integration paths, with live evidence only for Jev through OpenRouter and Laya. Chat, extraction, ranking and custom batch APIs are outside native forwarding. See the [model guide](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/models.md) for profiles and mappings.

## Inspect Box answers

Reviewed TypeSafe and H2O profiles support Box answers with normalized `top`, `bottom`, `left` and `right` edges. Request details show coordinates and a unit-plane outline without fetching the image or claiming its aspect ratio. Confidence is separate from geometry; groups retain individual observations and reviews without a scalar mean or geometry histogram.

H2O's `found:false` indicates no localization, not proven target absence. Optional `present` evidence is separate from confidence. Raw answers retain original extensions and invalid geometry. See [Box and provider semantics](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/connection.md#box-geometry-and-provider-extensions).

## Verify the connection

Run an existing application call, then inspect its source in the dashboard. Check response status, transfer outcome, capture completeness and typed answers. Cost stays unknown without valid OpenRouter reported cost or usable usage and both [configured price rates](/docs/configuration#estimate-costs).

A deployed application cannot reach Observer through your computer's loopback address. This workflow is for applications that can access the same local listener. To inspect existing remote activity, use a supported [record import](/docs/data-and-privacy#import-records).

## Compatibility boundary

The current Python 0.7.5 and JavaScript 0.7.0 [Linux fixture](https://github.com/LimePencil/jev-observer/tree/v0.4.0/fixtures/current-sdk) checks identity JSON, default zstd, image multipart and disabled compression, with input capture off and on. Separate legacy Python 0.7.1 and JavaScript 0.6.0 [mock checks](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/compatibility.md#sdk-mock-compatibility) cover forwarding, grouping, redaction and usage accounting. Neither calls a real provider or establishes every OS or SDK version.

Separate live evidence covers Jev through OpenRouter and Laya. New protocol/profile fixtures establish inspection behavior, not live provider availability or model quality. Async Python, browser SDKs and model-list routes remain outside these checks.
