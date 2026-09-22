---
title: "Install and run"
description: "Build one executable, open the sample, then start collecting your own requests."
section: "Getting started"
order: 2
---

Build Jev Observer from source. The release executable embeds the dashboard and SQLite, so it does not need a separate frontend server or database service when running.

> The source repository is currently private. These build instructions require GitHub access to `LimePencil/jev-observer`. Source, license and issue links also require that access.

## Prerequisites

Have these available in your development environment:

| Tool              | Requirement                                |
| ----------------- | ------------------------------------------ |
| Git               | To clone the source repository             |
| Rust              | A recent stable toolchain, including Cargo |
| Native C compiler | Required to compile bundled SQLite         |
| Node.js           | Version 22.12 or later                     |
| npm               | To install and build the dashboard         |

The verified build environment is Linux. macOS and Windows packaging have not been verified. Node.js is needed for frontend development and build tools, not to run the completed executable.

## Build from source

Clone the application repository and build the interface before the Rust executable. That ordering ensures the dashboard assets are embedded.

```bash
git clone https://github.com/LimePencil/jev-observer.git
cd jev-observer
npm ci --prefix ui
npm run build --prefix ui
cargo build --release --locked
```

The resulting executable is `target/release/jev-observer`. Build steps need access to the relevant source and package registries.

## Open the sample

```bash
./target/release/jev-observer --demo
```

Open [http://127.0.0.1:8765](http://127.0.0.1:8765) in your browser. The sample includes 720 clearly synthetic requests with Choice, Score and Noul questions, changed definitions, failures and indexed families.

Sample mode needs no credential and disables upstream forwarding. It uses a separate `*.demo.sqlite` database, so it does not add sample requests to your normal collection history. An existing nonempty sample history is kept across restarts rather than reseeded.

Once the executable has been built, this sample and saved-history browsing work offline. The dashboard assets, fonts and charts are bundled locally.

## Start normal collection

Stop the sample process with `Ctrl-C`, then start Observer without `--demo`:

```bash
./target/release/jev-observer
```

The default dashboard address remains `http://127.0.0.1:8765`. Normal history is stored at `.jev-observer/observer.sqlite`, relative to the directory where you start the process.

The dashboard starts empty until you [connect an application](/docs/connecting) or [import existing records](/docs/data-and-privacy#import-records). Keep Observer running while applications use its local URL. A stopped proxy cannot forward requests.

## Choose a port or database

```bash
./target/release/jev-observer \
  --port 8770 \
  --db ./observer-data/history.sqlite
```

Open `http://127.0.0.1:8770` and use that same origin in your SDK configuration. Demo mode with the example database path would use `./observer-data/history.demo.sqlite`.

Run `./target/release/jev-observer --help` for CLI help. See [configuration](/docs/configuration) for defaults, capture limits, retention and cost estimates.

## Update an existing build

After updating your source checkout, rebuild the interface and executable using the same sequence:

```bash
npm ci --prefix ui
npm run build --prefix ui
cargo build --release --locked
```

Stop the running process before replacing its executable. For valuable history, make a [complete filesystem backup](/docs/data-and-privacy#back-up-the-database) before changing versions. The project is a working prototype.

If the browser says the dashboard build is missing, repeat the interface build and then the Cargo build. More checks are in [troubleshooting](/docs/troubleshooting).

Source: [build instructions](https://github.com/LimePencil/jev-observer/blob/main/README.md#build-and-try-the-sample) and [asset embedding](https://github.com/LimePencil/jev-observer/blob/main/build.rs).
