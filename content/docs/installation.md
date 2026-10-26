---
title: "Install and run"
description: "Install the native executable, try the sample, then connect your application."
section: "Getting started"
order: 2
---

Jev Observer **0.4.0** includes its dashboard, fonts and SQLite. Prebuilt releases need no Rust, Node.js, database server or administrator access.

## Install a release

Linux and macOS:

```sh
curl -fsSL https://raw.githubusercontent.com/LimePencil/jev-observer/v0.4.0/install.sh -o install.sh
sh install.sh --version 0.4.0
export PATH="$HOME/.local/bin:$PATH"
jev-observer --demo
```

Windows PowerShell:

```powershell
Invoke-WebRequest https://raw.githubusercontent.com/LimePencil/jev-observer/v0.4.0/install.ps1 -OutFile install.ps1
.\install.ps1 -Version 0.4.0
& "$env:LOCALAPPDATA\JevObserver\bin\jev-observer.exe" --demo
```

The installers verify the package checksum and executable version. They install into `~/.local/bin` on Unix or `%LOCALAPPDATA%\JevObserver\bin` on Windows without changing shell profiles or starting a service.

You can also [download and extract a package](https://github.com/LimePencil/jev-observer/releases/tag/v0.4.0) directly. If Windows blocks scripts, follow your organization's policy or use the ZIP's `jev-observer.exe`.

## Supported packages

| Platform | Architectures         | Package                           |
| -------- | --------------------- | --------------------------------- |
| Linux    | x86-64 / ARM64        | Static musl executable, `.tar.gz` |
| macOS    | Intel / Apple silicon | `.tar.gz`                         |
| Windows  | x86-64 / ARM64        | `.zip`                            |

All six packages pass native release checks. The release also includes `SHA256SUMS`. macOS and Windows binaries are unsigned; OS policies may block them. Checksums verify downloaded bytes, not publisher identity. WSL2 uses the Linux package and has not been separately tested. [Platform requirements](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/installation.md#supported-packages).

## Open the sample

Open [http://127.0.0.1:8765](http://127.0.0.1:8765) and sign in:

- **Username:** `observer`
- **Password:** the token in `.jev-observer/observer.demo.sqlite.token`

Startup output gives the exact token-file path. Leave Observer running while you copy the token into the browser's password prompt.

The sample contains 720 synthetic requests and works offline. It needs no provider credentials or database key and disables forwarding. Try **Question groups**, then open a request to inspect its answers. Press `Ctrl-C` to stop.

Demo uses a separate plaintext `*.demo.sqlite` database, including any records you import. Nonempty history is kept across restarts. Use [live mode](/docs/connecting) for encrypted history.

## Start normal collection

Stop the sample first. [Generate and save a database key](/docs/connecting#save-a-database-key), supply it as `JEV_OBSERVER_DB_KEY`, then run:

```bash
jev-observer
```

On Windows, use `& "$env:LOCALAPPDATA\JevObserver\bin\jev-observer.exe"`.

Sign in at the same address using `observer` and the live token in `.jev-observer/observer.sqlite.token`. [Connect an application](/docs/connecting) or [import records](/docs/data-and-privacy#import-records) to populate the dashboard. Keep the database key: losing it makes encrypted history unreadable.

## Choose a port or database

```bash
jev-observer --port 8770 --db ./observer-data/history.sqlite
```

Use `http://127.0.0.1:8770` in the browser and SDK. Relative database paths resolve from your startup directory; supply the same saved key for that database. The token path appends `.token` to the complete database filename: `history.sqlite.token`. Demo uses a separate `history.demo.sqlite` and `history.demo.sqlite.token`.

Windows custom database directories must restrict access to the current user, SYSTEM and administrators. The default `.jev-observer` directory receives a private ACL automatically.

## Prerequisites

Only source builds need Git, the Rust toolchain pinned in `rust-toolchain.toml`, a native C compiler, and Node.js 22.12 or later with npm. Windows also needs Visual Studio C++ Build Tools, native Windows Perl and NASM. If Git Bash Perl is on `PATH`, set `$env:OPENSSL_SRC_PERL` to your native Perl executable. See [development](/docs/development).

## Build from source

Build the dashboard before Rust so its assets are embedded:

```bash
git clone --branch v0.4.0 https://github.com/LimePencil/jev-observer.git
cd jev-observer
npm ci --prefix ui
npm run build --prefix ui
cargo build --release --locked
./target/release/jev-observer --demo
```

In PowerShell, run `.\target\release\jev-observer.exe --demo`. Replace `jev-observer` in other examples with this build path.

## Update an existing build

Stop Observer, then [back up the database and SQLite sidecars](/docs/data-and-privacy#back-up-the-database), current and legacy workspace token files, and saved database key. Keep required provider credentials, the previous executable and its startup/client configuration if rollback matters.

Rerun the installer for 0.4.0. Failed downloads or verification preserve the installed executable. Installation does not change history; starting the new executable can update supported query indexes or migrate legacy plaintext history. Large histories can need extra startup time and disk space for index creation.

When upgrading a workspace that only has a legacy `*.access-token` file, 0.4.0 creates a fresh token at the new `<database-filename>.token` path and leaves the old file untouched. Sign in again with the new token and update clients using workspace authentication through Basic auth, `X-Observer-Access` or `--upstream-auth none`. Registered `jo_local_` tokens, saved provider credentials and the database key are unchanged by this token-path upgrade; session-only credentials still expire on restart.

**New Box records are incompatible with older readers.** Earlier dashboard/group queries can fail on them even though the schema is unchanged. Older versions also lack native Decisions and the new protocol/profile flags. Swapping executables or exporting new records as JSONL does not make this history backward compatible.

For rollback, keep the upgraded workspace separately and restore the stopped pre-upgrade snapshot with the earlier executable and configuration. That snapshot excludes later observations. Keep both token files private; the older executable uses its legacy token. Restore files only while every Observer process using that workspace is stopped.

Unix database paths containing invalid UTF-8 bytes require provider-key re-registration and updated local client tokens after the credential-path change. Valid UTF-8 paths retain their credential accounts. Downgrading to 0.1.0 after later provider-key rotations also requires re-registration; restoring SQLite alone does not restore an OS credential-store entry. See the [full backup and rollback guide](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/installation.md#history-backups-and-downgrades) or [troubleshooting](/docs/troubleshooting).
