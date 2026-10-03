---
title: "Connect an application"
description: "Connect TypeSafe, OpenRouter or a local Laya model with encrypted history and local authentication."
section: "Getting started"
order: 3
---

Live collection needs a saved database key and local authentication. Install Observer using the [installation guide](/docs/installation) before connecting an application. For a source build, replace `jev-observer` below with `./target/release/jev-observer`.

If the sample is still running, stop it with `Ctrl-C` before starting live Observer on the same port.

## Know which key to use

| Credential             | Where you use it                                  | Where it comes from                                     |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| Database key           | `JEV_OBSERVER_DB_KEY` when starting live Observer | Generate once below and save for this database          |
| Dashboard access token | Browser password for username `observer`          | The `*.access-token` file whose path Observer prints    |
| Provider API key       | **Connect an application** in bearer mode         | Your TypeSafe, OpenRouter or authenticated local server |
| Local client token     | Your application's SDK `api_key` or `apiKey`      | Shown once after registering the provider key           |

Demo needs only its dashboard access token. For live collection, keep the database key available across restarts and copy the local client token before leaving the connection panel. A local model running with `--upstream-auth none` needs no provider key or registration: use the dashboard access token as the SDK credential, as described in [local Laya setup](/docs/connecting#local-laya-models).

## Save a database key

Generate a 32-byte key once and save its printed 64-character hexadecimal value in a password manager. Losing this key makes encrypted history unreadable. Supply the same key on every live startup.

In Bash, generate the key once:

```bash
openssl rand -hex 32
```

Save the printed value before continuing. On this and every later startup, read that saved value without putting it in a command-line argument or shell history:

```bash
read -r -s -p 'Saved database key: ' JEV_OBSERVER_DB_KEY; echo
export JEV_OBSERVER_DB_KEY
jev-observer
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
& "$env:LOCALAPPDATA\JevObserver\bin\jev-observer.exe"
```

On later starts, read the saved key again; do not generate a replacement for an existing database. Demo mode needs no database key and disables upstream forwarding.

## Sign in and register a provider key

Open [http://127.0.0.1:8765](http://127.0.0.1:8765). Sign in with username `observer` and the token in `.jev-observer/observer.access-token`. Live mode uses a different dashboard token from demo mode. Observer prints the exact token-file path at startup, including when using `--db`.

Run Observer from your application's directory, or choose a stable history location:

```bash
jev-observer --db /path/to/observer.sqlite
```

In the dashboard's **Connect an application** panel, check the configured provider, endpoint and authentication mode, then enter your provider key and choose session-only storage or your operating system's credential store. Copy the local client token shown once and set it as `JEV_OBSERVER_CLIENT_TOKEN` in your application's environment. Keep it private. If the system credential store is unavailable or locked, session-only storage remains available. In 0.2.0, a failed credential replacement preserves the previous active credential and saved approval.

Observer validates this token and replaces it with the registered provider key before forwarding. The local token works for its registered workspace and is never sent to the provider. Losing it requires registering the provider key again to rotate the token. Session storage ends when Observer stops; system storage is scoped to the workspace database path. Leave `TYPESAFE_API_KEY` unset in Observer's environment if you want to use only the registered key.

Change the SDK base URL to the local origin, `http://127.0.0.1:8765`. Do not append `/v1/systemone`: the tested clients add that route themselves.

## Python

The synchronous `typesafe-sdk==0.7.1` client was checked with Python 3.12.14 against a loopback mock upstream.

```bash
python -m pip install typesafe-sdk==0.7.1
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

Use this configured client for your existing System One calls. The environment variable contains the local client token from Observer; no additional dashboard-access header is needed.

## JavaScript

The `@typesafe-ai/sdk@0.6.0` client was checked with Node.js 22.22.1 against the same local mock.

```bash
npm install @typesafe-ai/sdk@0.6.0
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

If your application keeps the provider key, use `TYPESAFE_API_KEY` for the SDK credential and set `JEV_OBSERVER_ACCESS_TOKEN` to the workspace dashboard token. Direct provider-key requests must also include `x-observer-access`.

In Python, change `api_key` to `os.environ["TYPESAFE_API_KEY"]` and add this to `headers`:

```python
"x-observer-access": os.environ["JEV_OBSERVER_ACCESS_TOKEN"]
```

In JavaScript, change `apiKey` to `process.env.TYPESAFE_API_KEY` and add this to `defaultHeaders`:

```javascript
"x-observer-access": process.env.JEV_OBSERVER_ACCESS_TOKEN
```

These tokens are separate: the dashboard access token protects local history and settings, while the registered client token authorizes forwarding with its registered provider key. Keep both private. The optional `TYPESAFE_API_KEY` fallback in Observer's process also requires the workspace access token and an `application/json` request Content-Type.

Registration does not write the provider key or local client token to SQLite, exports or the status API. SQLite keeps only a hash of the local token to approve restoring a saved system credential. Replacing or removing a registered key revokes that approval. Both secrets are redacted if echoed in captured traffic.

## Request readable captures

Both examples send `Accept-Encoding: identity`. Observer forwards compressed response bytes unchanged, but this version does not decode those bodies for typed-answer capture. A compressed response is therefore saved as an incomplete observation.

The header asks the upstream for an uncompressed response. If that upstream returns compressed data anyway, the capture will still be incomplete.

## Name sources and task versions

Optional metadata headers add local context and are stripped before forwarding:

| Header                         | Use                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `x-observer-source`            | Give an application a recognizable source name and its own question namespace |
| `x-observer-task-version`      | Distinguish rule changes carried in input state                               |
| `x-observer-adapter: jgrep-v1` | Enable the narrowly matched, reviewed jgrep indexed-family adapter            |

Grouping uses the source, original question key, full definition, presentation order and supplied task version. Changing a definition retains a separate group. If important rules live in the input state, update your task-version header when those rules change.

Missing task context is marked unverified. Redacted definitions are conservatively isolated because Observer cannot prove they are equivalent. The jgrep adapter recognizes one specific pattern; it is not a general semantic matching feature.

## Choose the upstream

Observer forwards native `POST /v1/systemone` traffic to `https://api.typesafe.ai/v1/systemone` by default. To select another fixed compatible endpoint:

```bash
jev-observer \
  --upstream https://your-provider.example/v1/systemone
```

Replace the example with your actual endpoint. The endpoint is configured when Observer starts and cannot be selected by an individual request. A caller's authorization takes precedence over an optional `TYPESAFE_API_KEY` fallback in Observer's environment.

Remote upstreams require HTTPS. HTTP is accepted only for loopback servers, including local models and mocks. Observer strips local forwarding metadata, cookies and browser origin/referrer headers before forwarding, and ignores provider `Set-Cookie` headers.

Observer adds no upstream retries, caching or redirects. Your SDK can still have its own retry policy, and each attempt that reaches Observer is a separate request.

## Jev through OpenRouter

After supplying your saved `JEV_OBSERVER_DB_KEY`, start Observer with OpenRouter's System One endpoint:

```bash
jev-observer --upstream https://openrouter.ai/api/v1/systemone
```

Register your OpenRouter key in **Connect an application**, then use the returned local client token in either SDK example above. Keep the SDK base URL at `http://127.0.0.1:8765` and request identity encoding. Use a Jev model such as `jev-1.13` in your application's System One call. Observer recognizes OpenRouter from its hostname and records validated `usage.cost` as provider-reported USD, ahead of configured estimates. Calls are billed to your OpenRouter account.

The [real OpenRouter check](https://github.com/LimePencil/jev-observer/blob/v0.2.0/docs/compatibility.md#live-openrouter-check) used Python's standard HTTP client. It is separate from the official SDK mock checks and does not establish live compatibility of every SDK.

## Local Laya models

This setup requires Observer **0.2.0 or later**. Start the model server separately; Observer does not download or host it. The reviewed setup used `laya[serve]==0.3.23` with its English checkpoint and CPU inference. Install that package in a separate Python environment, then start it bound to loopback with `LAYA_API_KEY` unset:

```bash
LAYA_HOST=127.0.0.1 LAYA_PORT=8000 LAYA_MODELS=english \
  LAYA_DEFAULT_MODEL=english LAYA_DEVICE=cpu laya-serve
```

In another terminal, supply your saved `JEV_OBSERVER_DB_KEY` and start Observer:

```bash
jev-observer --upstream http://127.0.0.1:8000/v1/systemone \
  --upstream-auth none --provider laya
```

Sign in to Observer normally. Read the token from `.jev-observer/observer.access-token` into `JEV_OBSERVER_ACCESS_TOKEN` privately. Use that workspace token as the SDK credential, keep the base URL at Observer's origin, and set the model to `english` in your existing call. No provider-key registration is needed in this mode.

For Python:

```python
client = TypeSafeClient(
    api_key=os.environ["JEV_OBSERVER_ACCESS_TOKEN"],
    base_url="http://127.0.0.1:8765",
    timeout=180,
    headers={
        "x-observer-source": "local-laya",
        "Accept-Encoding": "identity",
    },
)
```

For JavaScript:

```javascript
const client = new TypeSafeClient({
  apiKey: process.env.JEV_OBSERVER_ACCESS_TOKEN,
  baseURL: "http://127.0.0.1:8765",
  timeout: 180000,
  defaultHeaders: {
    "x-observer-source": "local-laya",
    "Accept-Encoding": "identity",
  },
});
```

Use the imports and pinned SDK installs from the examples above. Python's timeout is in seconds; JavaScript's is in milliseconds. CPU inference can exceed the SDKs' ten-second defaults, so tune the timeout for your model and machine.

`--upstream-auth none` requires a loopback upstream. Observer still authenticates every caller and removes local authorization before forwarding. Inherited `TYPESAFE_API_KEY` values are ignored. If Laya requires `LAYA_API_KEY`, keep Observer's default bearer mode, register that key, and use its local client token instead; keep the longer timeout.

The `laya` adapter handles four-decimal probabilities, string-list or object Choice criteria, and one to 32 Score levels. Zero reported output tokens stay zero; unreported costs stay unknown. Batch routes, extended numeric Choice labels, abstention-specific semantics and chat endpoints are outside this typed-capture scope. Other compatible local servers can use a descriptive `--provider` label and standard Jev validation. See the [exact local inference evidence](https://github.com/LimePencil/jev-observer/blob/v0.2.0/docs/compatibility.md#live-laya-check) for tested versions and limits.

## Verify the connection

Run one of your application's existing calls, then open the dashboard. The connection panel confirms the first saved request. Select the source name you configured and inspect the response status, capture completeness and typed answers. Costs remain unknown unless usable provider-reported USD cost or usage with [configured price estimates](/docs/configuration#estimate-costs) is available.

A deployed application cannot reach Observer through your computer's loopback address. This workflow is for applications that can access the same local listener. To inspect existing remote activity, use a supported [record import](/docs/data-and-privacy#import-records).

## Compatibility boundary

The pinned Python and JavaScript clients passed local mock checks for success/error forwarding, repeated definitions, definition changes, redaction and request-level usage accounting. Those SDK checks used no paid inference or real provider credentials. Separate 0.2.0 checks exercised real OpenRouter and local Laya inference; they do not establish live official-SDK or direct TypeSafe compatibility. Async Python, browser SDKs, model-list routes, arbitrary provider gateway dialects and every SDK version were not covered.

For exact fixtures and reproduction commands, see [SDK compatibility evidence](https://github.com/LimePencil/jev-observer/blob/main/docs/compatibility.md).
