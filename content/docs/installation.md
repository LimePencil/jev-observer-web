---
title: "Install and run"
description: "Install the native executable, sign in to the sample, then connect your application."
section: "Getting started"
order: 2
---

Jev Observer 0.1.0 runs as one executable with its dashboard, fonts and SQLite included. Prebuilt releases need no Rust, Node.js, database server or administrator access. The [application source](https://github.com/LimePencil/jev-observer) and [release downloads](https://github.com/LimePencil/jev-observer/releases/tag/v0.1.0) are public.

## Install a release

Linux and macOS:

```sh
curl -fsSL https://raw.githubusercontent.com/LimePencil/jev-observer/main/install.sh -o install.sh
sh install.sh --version 0.1.0
export PATH="$HOME/.local/bin:$PATH"
jev-observer --demo
```

Windows PowerShell:

```powershell
Invoke-WebRequest https://raw.githubusercontent.com/LimePencil/jev-observer/main/install.ps1 -OutFile install.ps1
.\install.ps1 -Version 0.1.0
& "$env:LOCALAPPDATA\JevObserver\bin\jev-observer.exe" --demo
```

The installers detect the native OS and CPU, verify the archive's SHA-256 checksum and executable version, then install into `~/.local/bin` on Unix or `%LOCALAPPDATA%\JevObserver\bin` on Windows. They do not edit shell profiles or start a background service. Downloads need no GitHub account. For private forks, see the application's [authenticated installation instructions](https://github.com/LimePencil/jev-observer/blob/main/docs/installation.md#private-repository-access).

If Windows policy blocks scripts, follow your organization's policy or extract the matching release ZIP and run `jev-observer.exe` directly.

## Supported packages

| Platform | Architectures         | Package                           |
| -------- | --------------------- | --------------------------------- |
| Linux    | x86-64 / ARM64        | Static musl executable, `.tar.gz` |
| macOS    | Intel / Apple silicon | Native executable, `.tar.gz`      |
| Windows  | x86-64 / ARM64        | Native MSVC executable, `.zip`    |

All six native packages must pass release verification before publication. Each release includes `SHA256SUMS`. macOS and Windows executables are unsigned and not notarized; OS security policies may block them. Checksums verify downloaded-byte consistency, not publisher identity. WSL2 uses the Linux package and has not been separately tested. See the [platform details](https://github.com/LimePencil/jev-observer/blob/main/docs/installation.md#supported-packages) for tested operating systems and runtime requirements.

## Open the sample

The install commands above start `--demo`. To start it again, run `jev-observer --demo` on Unix or the installed executable's full path on Windows.

Open [http://127.0.0.1:8765](http://127.0.0.1:8765), then sign in with:

- **Username:** `observer`
- **Password:** the token in `.jev-observer/observer.demo.access-token`

Observer prints the exact token-file path at startup, including with a custom database path. The sample contains 720 synthetic requests with Choice, Score and Noul questions, changed definitions and failures. It needs no provider credentials or database key and disables upstream forwarding.

Demo uses a separate plaintext `*.demo.sqlite` database. An existing nonempty sample history is kept across restarts rather than reseeded. The dashboard, fonts and charts work offline. Press `Ctrl-C` to stop Observer.

## Start normal collection

Live history requires a saved 32-byte database key. [Generate and save that key](/docs/connecting#save-a-database-key), supply it as `JEV_OBSERVER_DB_KEY` on every live startup, then start without `--demo`:

```bash
jev-observer
```

On Windows, run `& "$env:LOCALAPPDATA\JevObserver\bin\jev-observer.exe"` after setting the key in PowerShell as described in the connection guide.

Sign in at the same local address with username `observer` and the token in `.jev-observer/observer.access-token`. Normal history uses `.jev-observer/observer.sqlite`, relative to the directory where you start Observer, and is encrypted with SQLCipher. Keep the database key safe: losing it makes encrypted history unreadable.

The dashboard starts empty until you [connect an application](/docs/connecting) or [import records](/docs/data-and-privacy#import-records). Keep Observer running while applications use its local URL.

## Choose a port or database

```bash
jev-observer --port 8770 --db ./observer-data/history.sqlite
```

Supply the same saved database key for this database on each live startup. Open `http://127.0.0.1:8770` and use that origin in your SDK. Demo with this path uses `./observer-data/history.demo.sqlite` and a separate token file; startup output gives the exact path.

On Windows, custom database directories must already restrict access to the current user, SYSTEM and administrators. Shared directories and reparse points are rejected. The default `.jev-observer` directory receives a private current-user ACL.

Run `jev-observer --help` for CLI help. See [configuration](/docs/configuration) for capture, retention and cost settings.

## Prerequisites

Only source builds need the following tools:

| Tool              | Requirement                                |
| ----------------- | ------------------------------------------ |
| Git               | To clone the public source repository      |
| Rust              | A recent stable toolchain, including Cargo |
| Native C compiler | To compile bundled SQLite and OpenSSL      |
| Node.js           | Version 22.12 or later                     |
| npm               | To install and build the dashboard         |

Windows source builds use MSVC and require Visual Studio C++ Build Tools, native Windows Perl (such as Strawberry Perl) and NASM for bundled OpenSSL. If Git Bash Perl is on `PATH`, set `$env:OPENSSL_SRC_PERL` to your native Perl executable before building.

## Build from source

Build the dashboard before Rust so its assets are embedded:

```bash
git clone https://github.com/LimePencil/jev-observer.git
cd jev-observer
npm ci --prefix ui
npm run build --prefix ui
cargo build --release --locked
./target/release/jev-observer --demo
```

In PowerShell, run `npm` and `cargo` as above, then `.\target\release\jev-observer.exe --demo`. Sign in with the demo token as described above. For source builds, replace `jev-observer` in other examples with the executable's build path.

## Update an existing build

Stop Observer before upgrading. Rerun the installer with the desired version; omit the version option to select the latest published release. Failed downloads or verification preserve the installed executable. An upgrade does not itself move, delete or migrate history.

For source builds, rebuild the dashboard and executable using the same sequence. Make a [complete filesystem backup](/docs/data-and-privacy#back-up-the-database) before changing versions and retain the database key separately. Stop older processes before starting the current version against a legacy plaintext database; migration runs before requests are served.

Discard development binaries from the earlier private release history and install this public `v0.1.0` before collecting live traffic. Those discarded release numbers do not identify the current build.

See [troubleshooting](/docs/troubleshooting) and the application's [installation guide](https://github.com/LimePencil/jev-observer/blob/main/docs/installation.md) for paths, uninstalling and platform errors.

Source: [current installation](https://github.com/LimePencil/jev-observer/blob/main/README.md#install-and-try-the-sample), [source builds](https://github.com/LimePencil/jev-observer/blob/main/README.md#build-from-source) and [asset embedding](https://github.com/LimePencil/jev-observer/blob/main/build.rs).
