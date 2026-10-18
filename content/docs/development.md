---
title: "Local development"
description: "Build Observer, run the dashboard and verify your changes."
section: "Developer guide"
order: 8
---

The [application repository](https://github.com/LimePencil/jev-observer/tree/v0.3.1) contains the Rust executable and React dashboard. This documentation website is a separate Next.js project; website changes do not rebuild Observer.

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
npx --prefix ui playwright install chromium
npm test --prefix ui
cargo build --release --locked
OBSERVER_BINARY="$PWD/target/release/jev-observer" npm run test:integration --prefix ui
```

The final command uses Bash. Browser interaction tests use synthetic API fixtures. Integration tests exercise the embedded dashboard against the real authenticated backend in temporary demo and encrypted live workspaces, without provider calls. Rust tests cover forwarding, storage, normalization and failure handling.

See the [UI testing notes](https://github.com/LimePencil/jev-observer/blob/v0.3.1/ui/README.md) for production-preview checks and the [CI workflow](https://github.com/LimePencil/jev-observer/blob/v0.3.1/.github/workflows/ci.yml) for the complete release-metadata and license checks.

## Reproduce SDK compatibility

The compatibility runner checks Python `typesafe-sdk==0.7.1` and JavaScript `@typesafe-ai/sdk@0.6.0` against a loopback mock using dummy credentials. It does not call a provider. Follow the [compatibility instructions](https://github.com/LimePencil/jev-observer/blob/v0.3.1/docs/compatibility.md) for setup, assertions and separate live-inference evidence.

## Measure representative load

Run measurements sequentially after a release build, with a fresh output file:

```bash
node scripts/benchmark.mjs --binary=target/release/jev-observer \
  --rate=100 --seconds=60 --baseline-seconds=5 --upstream-ms=25 \
  --dashboard-search=urgency --output=reports/benchmarks/local-check.json
```

The harness uses a loopback mock and temporary encrypted database. Record the binary, host, workload and collection gaps alongside latency. Avoid concurrent builds or other load tests when comparing results.

The [performance report](https://github.com/LimePencil/jev-observer/blob/v0.3.1/docs/performance.md) includes encrypted 0.2.0 measurements and older plaintext results. The [0.3.1 broad-history checks](https://github.com/LimePencil/jev-observer/blob/v0.3.1/reports/validation/broad-history/README.md) cover query correctness, startup index creation and rollback. The [October validation archive](https://github.com/LimePencil/jev-observer/blob/v0.3.1/reports/validation/october-2026/README.md) records later improvement evidence. Each result applies to its named source and workload; none is a universal 0.3.1 capacity guarantee.
