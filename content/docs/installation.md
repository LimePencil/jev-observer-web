---
title: "Install and run"
description: "Install the native executable, try the sample, then connect your application."
section: "Getting started"
order: 2
---

Jev Observer **0.3.1** includes its dashboard, fonts and SQLite. Prebuilt releases need no Rust, Node.js, database server or administrator access.

## Install a release

Linux and macOS:

```sh
curl -fsSL https://raw.githubusercontent.com/LimePencil/jev-observer/v0.3.1/install.sh -o install.sh
sh install.sh --version 0.3.1
export PATH="$HOME/.local/bin:$PATH"
jev-observer --demo
```

Windows PowerShell:

```powershell
Invoke-WebRequest https://raw.githubusercontent.com/LimePencil/jev-observer/v0.3.1/install.ps1 -OutFile install.ps1
.\install.ps1 -Version 0.3.1
& "$env:LOCALAPPDATA\JevObserver\bin\jev-observer.exe" --demo
```

The installers verify the package checksum and executable version. They install into `~/.local/bin` on Unix or `%LOCALAPPDATA%\JevObserver\bin` on Windows without changing shell profiles or starting a service.

You can also [download and extract a package](https://github.com/LimePencil/jev-observer/releases/tag/v0.3.1) directly. If Windows blocks scripts, follow your organization's policy or use the ZIP's `jev-observer.exe`.

## Supported packages

| Platform | Architectures         | Package                           |
| -------- | --------------------- | --------------------------------- |
| Linux    | x86-64 / ARM64        | Static musl executable, `.tar.gz` |
| macOS    | Intel / Apple silicon | `.tar.gz`                         |
| Windows  | x86-64 / ARM64        | `.zip`                            |

All six packages pass native release checks. The release also includes `SHA256SUMS`. macOS and Windows binaries are unsigned; OS policies may block them. Checksums verify downloaded bytes, not publisher identity. WSL2 uses the Linux package and has not been separately tested. [Platform requirements](https://github.com/LimePencil/jev-observer/blob/v0.3.1/docs/installation.md#supported-packages).

## Open the sample

Open [http://127.0.0.1:8765](http://127.0.0.1:8765) and sign in:

- **Username:** `observer`
- **Password:** the token in `.jev-observer/observer.demo.access-token`

Startup output gives the exact token-file path. Leave Observer running while you copy the token into the browser's password prompt.

The sample contains 720 synthetic requests and works offline. It needs no provider credentials or database key and disables forwarding. Try **Question groups**, then open a request to inspect its answers. Press `Ctrl-C` to stop.

Demo uses a separate plaintext `*.demo.sqlite` database, including any records you import. Nonempty history is kept across restarts. Use [live mode](/docs/connecting) for encrypted history.

## Start normal collection

Stop the sample first. [Generate and save a database key](/docs/connecting#save-a-database-key), supply it as `JEV_OBSERVER_DB_KEY`, then run:

```bash
jev-observer
```

On Windows, use `& "$env:LOCALAPPDATA\JevObserver\bin\jev-observer.exe"`.

Sign in at the same address using `observer` and the live token in `.jev-observer/observer.access-token`. [Connect an application](/docs/connecting) or [import records](/docs/data-and-privacy#import-records) to populate the dashboard. Keep the database key: losing it makes encrypted history unreadable.

## Choose a port or database

```bash
jev-observer --port 8770 --db ./observer-data/history.sqlite
```

Use `http://127.0.0.1:8770` in the browser and SDK. Relative database paths resolve from your startup directory; supply the same saved key for that database. Demo uses a separate `history.demo.sqlite` and token file.

Windows custom database directories must restrict access to the current user, SYSTEM and administrators. The default `.jev-observer` directory receives a private ACL automatically.

## Prerequisites

Only source builds need Git, the Rust toolchain pinned in `rust-toolchain.toml`, a native C compiler, and Node.js 22.12 or later with npm. Windows also needs Visual Studio C++ Build Tools, native Windows Perl and NASM. If Git Bash Perl is on `PATH`, set `$env:OPENSSL_SRC_PERL` to your native Perl executable. See [development](/docs/development).

## Build from source

Build the dashboard before Rust so its assets are embedded:

```bash
git clone --branch v0.3.1 https://github.com/LimePencil/jev-observer.git
cd jev-observer
npm ci --prefix ui
npm run build --prefix ui
cargo build --release --locked
./target/release/jev-observer --demo
```

In PowerShell, run `.\target\release\jev-observer.exe --demo`. Replace `jev-observer` in other examples with this build path.

## Update an existing build

Stop Observer, then [back up the database and SQLite sidecars](/docs/data-and-privacy#back-up-the-database), workspace access-token file and saved database key. Keep the previous executable if rollback matters.

Rerun the installer for 0.3.1. Failed downloads or verification preserve the installed executable. Installation does not change history; starting the new executable can update supported query indexes or migrate legacy plaintext history.

First startup creates new query indexes automatically. Large histories need extra startup time and disk space, including temporary index-building files. Existing tables remain readable by older versions; saved-credential identities are unchanged. If you downgrade to 0.1.0 after saving or rotating a provider key in 0.2.0 or later, register that key again and update the application's local client token. Restoring SQLite alone does not restore an OS credential-store entry.

See the [full backup and rollback guide](https://github.com/LimePencil/jev-observer/blob/v0.3.1/docs/installation.md#history-backups-and-downgrades) or [troubleshooting](/docs/troubleshooting).
