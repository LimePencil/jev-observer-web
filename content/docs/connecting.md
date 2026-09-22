---
title: "Connect an application"
description: "Route a local TypeSafe client through Observer with your existing provider credentials."
section: "Getting started"
order: 3
---

Start Observer in normal mode before connecting an application:

```bash
./target/release/jev-observer
```

Change your SDK base URL to the local origin, `http://127.0.0.1:8765`. Do not append `/v1/systemone`: the tested clients add that route themselves. Keep your existing provider credential in the application environment.

## Python

The synchronous `typesafe-sdk==0.7.1` client was checked with Python 3.12.14 against a loopback mock upstream.

```bash
python -m pip install typesafe-sdk==0.7.1
```

```python
import os
from typesafe_sdk import TypeSafeClient

client = TypeSafeClient(
    api_key=os.environ["TYPESAFE_API_KEY"],
    base_url="http://127.0.0.1:8765",
    headers={
        "x-observer-source": "my-application",
        "Accept-Encoding": "identity",
    },
)
```

Use this configured client for your existing System One calls. The environment variable must already contain your provider credential.

## JavaScript

The `@typesafe-ai/sdk@0.6.0` client was checked with Node.js 22.22.1 against the same local mock.

```bash
npm install @typesafe-ai/sdk@0.6.0
```

```javascript
import { TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient({
  apiKey: process.env.TYPESAFE_API_KEY,
  baseURL: "http://127.0.0.1:8765",
  defaultHeaders: {
    "x-observer-source": "my-application",
    "Accept-Encoding": "identity",
  },
});
```

The JavaScript option is `baseURL`; the Python option is `base_url`.

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
./target/release/jev-observer \
  --upstream https://your-provider.example/v1/systemone
```

Replace the example with your actual endpoint. The endpoint is configured when Observer starts and cannot be selected by an individual request. A caller's authorization takes precedence over an optional `TYPESAFE_API_KEY` fallback in Observer's environment.

Observer adds no upstream retries, caching or redirects. Your SDK can still have its own retry policy, and each attempt that reaches Observer is a separate request.

## Verify the connection

Run one of your application's existing calls, then open the dashboard. Select the source name you configured and inspect the new request. Check its response status, capture completeness and typed answers. Costs remain unknown until both usage and [configured price estimates](/docs/configuration#estimate-costs) are available.

A deployed application cannot reach Observer through your computer's loopback address. This workflow is for applications that can access the same local listener. To inspect existing remote activity, use a supported [record import](/docs/data-and-privacy#import-records).

## Compatibility boundary

The pinned Python and JavaScript clients passed local checks for success/error forwarding, repeated definitions, definition changes, redaction and request-level usage accounting. No paid inference or real provider connection was used. Async Python, browser SDKs, model-list routes, provider gateway dialects and every SDK version were not covered.

For exact fixtures and reproduction commands, see [SDK compatibility evidence](https://github.com/LimePencil/jev-observer/blob/main/docs/compatibility.md).
