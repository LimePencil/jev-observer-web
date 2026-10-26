---
title: "Local development"
description: "Build Observer, run the dashboard and verify your changes."
section: "Developer guide"
order: 8
---

The [application repository](https://github.com/LimePencil/jev-observer/tree/v0.4.0) contains the Rust executable and React dashboard. This documentation website is a separate Next.js project; website changes do not rebuild Observer.

Use the pinned Rust **1.98.1** toolchain, a native C compiler, and Node.js **22.12 or later** with npm. See [installation](/docs/installation) for checkout instructions and Windows build prerequisites.

## Run the application locally

From the application repository, build the dashboard before compiling Rust:

```bash
npm ci --prefix ui
npm run build --prefix ui
cargo run --locked -- --demo
```

Open `http://127.0.0.1:8765`. Sign in as `observer` with the demo token from the file path printed at startup. Demo mode uses an isolated sample database and makes no provider calls.

For frontend development, leave the backend running and start Vite in another terminal:

```bash
npm run dev --prefix ui
```

Open the address Vite prints. It forwards `/api` to port 8765 and uses the same demo credentials. Its proxy adjusts Origin only for its own development requests. For live collection, [set the saved database key and configure credentials](/docs/connecting), run without `--demo`, and send SDK traffic to the backend origin.

## Build the distributable executable

```bash
npm run build --prefix ui
cargo build --release --locked
./target/release/jev-observer --demo
```

On Windows, use `.\target\release\jev-observer.exe --demo`. The build embeds `ui/dist/`; rebuild the frontend before Rust whenever dashboard source changes. The resulting executable needs no Node.js runtime or separate database service.

## Run the checks

After installing dependencies and building the dashboard:

```bash
cargo fmt --all --check
cargo clippy --locked --all-targets -- -D warnings
cargo test --locked
python3 scripts/test-install.py
python3 scripts/test-decision-capture.py
python3 scripts/test-model-catalog.py
python3 scripts/test-token-layouts.py
npx --prefix ui playwright install chromium
OBSERVER_UI_PREVIEW=1 npm test --prefix ui
cargo build --release --locked
OBSERVER_BINARY="$PWD/target/release/jev-observer" npm run test:integration --prefix ui
```

The environment-variable commands use Bash. Browser interaction tests use synthetic API fixtures. Integration tests exercise the embedded dashboard against the real authenticated backend in temporary demo and encrypted live workspaces, without provider calls. Rust tests cover forwarding, storage, normalization and failure handling.

See the [UI testing notes](https://github.com/LimePencil/jev-observer/blob/v0.4.0/ui/README.md) for production-preview checks and the [CI workflow](https://github.com/LimePencil/jev-observer/blob/v0.4.0/.github/workflows/ci.yml) for the complete release-metadata and license checks.

## Reproduce SDK compatibility

Two separate loopback fixtures use dummy credentials without provider calls:

| Fixture                                | Python / JavaScript pins                         | Scope                                                                                     |
| -------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `scripts/sdk-compatibility.py`         | `typesafe-sdk==0.7.1` / `@typesafe-ai/sdk@0.6.0` | Legacy identity-encoded forwarding, grouping, redaction and accounting                    |
| `scripts/current-sdk-compatibility.py` | `typesafe-sdk==0.7.5` / `@typesafe-ai/sdk@0.7.0` | Small JSON, default zstd, compressed image multipart and explicit compression disablement |

The current fixture runs on Linux; it does not establish current-SDK behavior on every platform. Its [transport contract](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/capture-decoding.md) differs from the older identity-only fixture. To reproduce it after a release build, use Python 3.12 (the locked fixture and CI runtime), install the dependencies in an isolated environment, and choose a fresh output filename; the runner refuses to overwrite an existing result:

```bash
python3.12 -m venv .venv-current-sdk
.venv-current-sdk/bin/python -m pip install -r fixtures/current-sdk/python-requirements.txt
npm ci --prefix fixtures/current-sdk --ignore-scripts --no-audit --no-fund
.venv-current-sdk/bin/python scripts/current-sdk-compatibility.py \
  --binary target/release/jev-observer \
  --node-sdk "$PWD/fixtures/current-sdk/node_modules/@typesafe-ai/sdk" \
  --output current-sdk-result.json
```

Follow the [legacy compatibility instructions](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/compatibility.md) for the older runner and separate live-inference evidence. Synthetic fixtures do not establish provider availability or model quality.

## Measure representative load

Run measurements sequentially after a release build, with a fresh output file:

```bash
node scripts/benchmark.mjs --binary=target/release/jev-observer \
  --rate=100 --seconds=60 --baseline-seconds=5 --upstream-ms=25 \
  --dashboard-search=urgency --output=reports/benchmarks/local-check.json
```

The harness uses a loopback mock and temporary encrypted database. Record the binary, host, workload and collection gaps alongside latency. Avoid concurrent builds or other load tests when comparing results.

The [performance report](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/performance.md) includes bounded-redaction diagnostics, encrypted 0.2.0 measurements and older plaintext results. The [0.3.1 broad-history checks](https://github.com/LimePencil/jev-observer/blob/v0.4.0/reports/validation/broad-history/README.md) cover query correctness, startup index creation and rollback. The [October validation archive](https://github.com/LimePencil/jev-observer/blob/v0.4.0/reports/validation/october-2026/README.md) records later improvement evidence. Each result applies to its named source and workload; none is a universal 0.4.0 capacity guarantee.
