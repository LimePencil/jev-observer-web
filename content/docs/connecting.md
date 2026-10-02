---
title: "Connect an application"
description: "Save a database key, register provider credentials, and route a local SDK through Observer."
section: "Getting started"
order: 3
---

Live collection needs a saved database key and local authentication. Install Observer using the [installation guide](/docs/installation) before connecting an application. For a source build, replace `jev-observer` below with `./target/release/jev-observer`.

If the sample is still running, stop it with `Ctrl-C` before starting live Observer on the same port.

## Know which key to use

| Credential             | Where you use it                                  | Where it comes from                                  |
| ---------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| Database key           | `JEV_OBSERVER_DB_KEY` when starting live Observer | Generate once below and save for this database       |
| Dashboard access token | Browser password for username `observer`          | The `*.access-token` file whose path Observer prints |
| Provider API key       | **Connect an application** in the live dashboard  | Your TypeSafe provider account                       |
| Local client token     | Your application's SDK `api_key` or `apiKey`      | Shown once after registering the provider key        |

Demo needs only its dashboard access token. For live collection, keep the database key available across restarts and copy the local client token before leaving the connection panel.

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

In the dashboard's **Connect an application** panel, enter your provider key and choose session-only storage or your operating system's credential store. Copy the local client token shown once and set it as `JEV_OBSERVER_CLIENT_TOKEN` in your application's environment. Keep it private. If the system credential store is unavailable or locked, session-only storage remains available.

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

Remote upstreams require HTTPS. HTTP is accepted only for a loopback mock. Observer strips local forwarding metadata, cookies and browser origin/referrer headers before forwarding, and ignores provider `Set-Cookie` headers.

Observer adds no upstream retries, caching or redirects. Your SDK can still have its own retry policy, and each attempt that reaches Observer is a separate request.

## Verify the connection

Run one of your application's existing calls, then open the dashboard. Select the source name you configured and inspect the new request. Check its response status, capture completeness and typed answers. Costs remain unknown until both usage and [configured price estimates](/docs/configuration#estimate-costs) are available.

A deployed application cannot reach Observer through your computer's loopback address. This workflow is for applications that can access the same local listener. To inspect existing remote activity, use a supported [record import](/docs/data-and-privacy#import-records).

## Compatibility boundary

The pinned Python and JavaScript clients passed local checks for success/error forwarding, repeated definitions, definition changes, redaction and request-level usage accounting. No paid inference or real provider connection was used. Async Python, browser SDKs, model-list routes, provider gateway dialects and every SDK version were not covered.

For exact fixtures and reproduction commands, see [SDK compatibility evidence](https://github.com/LimePencil/jev-observer/blob/main/docs/compatibility.md).
