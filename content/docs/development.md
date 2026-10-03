---
title: "Local development"
description: "Run the Rust backend and React interface, then verify the parts you change."
section: "Developer guide"
order: 8
---

The application repository contains the local Rust executable and its React dashboard. This documentation website is a separate Next.js project. Website changes do not rebuild the Observer executable.

Follow [installation](/docs/installation) for prerequisites and the initial checkout. The application uses Rust edition 2024, SQLCipher through bundled `rusqlite` for live history, and React, TypeScript and Vite for the dashboard.

## Run the application locally

Install and build the dashboard once before compiling the backend:

```bash
npm ci --prefix ui
npm run build --prefix ui
cargo run -- --demo
```

This starts the backend on `127.0.0.1:8765` using the isolated sample database. In another terminal at the repository root, start the frontend development server:

```bash
npm run dev --prefix ui
```

Open the address Vite prints. Its development server forwards `/api` to the backend on port 8765. Authenticate API requests with username `observer` and the demo workspace token whose path the backend prints. The backend's own dashboard at `http://127.0.0.1:8765` uses the same credentials. For normal collection, [supply the saved database key and configure credentials](/docs/connecting), run without `--demo`, and send SDK traffic to the backend's origin.

The Vite proxy adjusts the Origin only for its own same-origin development requests. Foreign origins remain subject to the backend guard. Keep the backend on port 8765 unless you deliberately update the development proxy configuration.

## Build the distributable executable

```bash
npm run build --prefix ui
cargo build --release --locked
```

`build.rs` copies the frontend output into the Rust build directory, where `include_dir` embeds it. Changes to source UI files require a fresh frontend build before the executable will contain them.

The final executable serves its own dashboard and API. There is no hosted frontend runtime, separate database service or Node.js runtime requirement for the local application.

## Run the checks

From the application repository root:

```bash
cargo fmt --all --check
cargo clippy --locked --all-targets -- -D warnings
cargo test --locked
python3 scripts/test-install.py
npx --prefix ui playwright install chromium
npm test --prefix ui
```

The browser tests start Vite through Playwright configuration. They intercept API responses with explicit synthetic fixtures and cover interaction, accessibility, accounting presentation, pause/resume, import failures, downloads, review labels and mobile navigation. A separate production-bundle journey uses the actual executable to check connection registration, capture, review labels, imports, exports, pagination and retained history after a real process restart. These complement Rust backend tests and SDK integration checks.

Rust tests cover model normalization, storage, grouping, proxy forwarding, recording pressure, origin checks, retention, exports and shutdown behavior. See the source tests alongside each module.

## Reproduce SDK compatibility

The compatibility runner starts its own loopback mock, proxy process and temporary database. It uses dummy credentials and guards client transports to the exact local proxy origin. Dependency installation still requires package registry access.

With the executable built and `uv` available:

```bash
SDK_WORK=$(mktemp -d)
uv venv --python 3.12 "$SDK_WORK/python"
uv pip install --python "$SDK_WORK/python/bin/python" \
  -r fixtures/sdk/python-requirements.txt
cp fixtures/sdk/package.json fixtures/sdk/package-lock.json "$SDK_WORK/"
npm ci --prefix "$SDK_WORK" --ignore-scripts --no-audit --no-fund
"$SDK_WORK/python/bin/python" scripts/sdk-compatibility.py \
  --binary target/release/jev-observer \
  --node-sdk "$SDK_WORK/node_modules/@typesafe-ai/sdk" \
  --output "$SDK_WORK/result.json"
```

The check pins Python `typesafe-sdk==0.7.1` and JavaScript `@typesafe-ai/sdk@0.6.0`. See [compatibility evidence](https://github.com/LimePencil/jev-observer/blob/main/docs/compatibility.md) for exact assertions and exclusions.

## Measure representative load

After a release build, run the local benchmark scenarios sequentially:

```bash
node scripts/benchmark.mjs \
  --seconds=300 --rate=500 \
  --output=reports/benchmarks/sustained.json

node scripts/benchmark.mjs \
  --seconds=60 --rate=500 --upstream-ms=1000 --no-burst \
  --output=reports/benchmarks/slow-upstream.json
```

The harness uses a loopback mock and temporary database. Results identify the executable, workload, settings, counts and host. Do not run other builds or load tests concurrently when you need interpretable measurements.

Read the [performance report](https://github.com/LimePencil/jev-observer/blob/main/docs/performance.md) before interpreting numbers. The 0.2.0 reports include encrypted mixed-payload, retained-history and overload-recovery checks with exact executable hashes. Older September results predate encryption and are preserved as historical evidence. These checks measure a specific local workload, not provider capacity, a latency guarantee or every possible history shape.

## Understand continuous integration

The application workflow builds the dashboard before compiling Rust, runs formatting, Clippy, Rust, installer and browser checks, builds the release executable, and runs both pinned SDKs against a local mock. Release verification also checks a checksum-verified published 0.1.0 baseline for upgrade, rollback and backup restoration, plus unsupported future-schema rejection. Metadata and release notes are checked before native builds. The separate [release workflow](https://github.com/LimePencil/jev-observer/blob/main/.github/workflows/release.yml) verifies all six native packages, including authenticated live/demo startup, before publication; Windows also runs PowerShell installation and upgrade checks.

Use the [CI workflow](https://github.com/LimePencil/jev-observer/blob/main/.github/workflows/ci.yml) as the reproducible check sequence. For design boundaries and module ownership, continue to [architecture](/docs/architecture).
