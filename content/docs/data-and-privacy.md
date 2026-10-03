---
title: "Data and privacy"
description: "Understand local capture, move records between workspaces and keep a useful history."
section: "User guide"
order: 5
---

Observer stores history in a local SQLite database. It sends no analytics or automatic event uploads. Live inference still sends application requests to the upstream provider you configure.

The commands below use the installed `jev-observer` executable. For a source build, use `./target/release/jev-observer`; on Windows, use the executable path from [installation](/docs/installation).

## Know what is retained

Raw input state is discarded from saved history by default. Question definitions, answers and supported extension fields are retained, and those fields may themselves contain sensitive content.

To retain input state deliberately, start Observer with:

```bash
jev-observer --capture-state
```

Known credential fields and the forwarded secret are redacted from saved data. You can add field names with repeated `--redact-key` options:

```bash
jev-observer \
  --redact-key email \
  --redact-key customer_secret
```

Redaction cannot promise to recognize every sensitive value. Definitions changed by redaction are kept separate because their original equivalence is no longer verifiable.

## Encryption and local access

Live SQLite history is encrypted with SQLCipher using the externally supplied `JEV_OBSERVER_DB_KEY`. [Generate and save a 32-byte database key](/docs/connecting#save-a-database-key) before starting normal collection, and supply the same 64-character hexadecimal value on every live startup. Losing the key makes encrypted history unreadable.

On first startup with an existing plaintext database, Observer migrates it before serving requests. Stop older Observer processes first. Old backups and deleted disk blocks may still contain plaintext. The demo database remains plaintext, including any records you import into it. JSONL and CSV exports are deliberate plaintext downloads; protect them when storing or sharing them.

Version 0.2.0 rejects unsupported plaintext and encrypted database schemas before changing their contents, including checking committed crash-left WAL state. Keep the database and any remaining sidecars together when backing up or restoring.

The dashboard and local API require HTTP Basic authentication: username `observer` and the random workspace token in the database's sibling `*.access-token` file. Startup output gives its exact path. The default live token is `.jev-observer/observer.access-token`; demo uses `.jev-observer/observer.demo.access-token`. Keep this token private.

On Windows, the default `.jev-observer` directory receives a private current-user ACL. Custom database directories must already restrict access to the current user, SYSTEM and administrators. Token files have protected current-user ACLs; permissive files and reparse points are rejected.

## Import records

Select **Import records** in the dashboard sidebar, or open **Export**, then **Import local records**. Choose the matching source format, then select a local file or paste its contents. An empty workspace also offers an **Import records** button. Imports support:

| Format                     | What it contains                                                       |
| -------------------------- | ---------------------------------------------------------------------- |
| Observer JSONL export      | Normalized records previously exported by Observer                     |
| JevRouter decision receipt | The reviewed JevRouter receipt format, retained as application actions |

Imports go into the currently open workspace. To keep imported history encrypted, [start live Observer with your saved database key](/docs/connecting#save-a-database-key), then import there. Importing into the demo stores those records in its plaintext database alongside the sample; demo mode does not make imported records synthetic.

An import accepts at most 10,000 records and 8 MiB of UTF-8 import text. This limit applies to the file or pasted text before the API wraps it in JSON; JSON escaping overhead is allowed within a separate transport limit. Split larger histories into smaller batches.

Explicit source event IDs prevent repeat imports of the same event. Identical payloads from separate calls are still separate observations. Imported records are validated, and supplied grouping fingerprints are not blindly trusted.

Imports also use the current capture and redaction settings. Raw input state is discarded by default even when it was present in the exported file; start with `--capture-state` before importing if you intend to retain it. Configured redaction still applies.

JevRouter receipts describe application actions with their provenance. They do not become extra inference requests or invented token charges. Timing or transport facts missing from a receipt remain unknown, with import timing labeled separately.

## Export a selected history

Set the source, model, time-window and search filters you need, then choose **Export**:

| Export | Best use                                                    |
| ------ | ----------------------------------------------------------- |
| JSONL  | Portable records with detail; can be imported into Observer |
| CSV    | Spreadsheet inspection and analysis                         |

An export covers matching retained records, not just the recent rows visible in the request feed. Exports use paged reads and exclude later arrivals using a fixed upper sequence. Concurrent retention, deletion or review-label edits can still affect later pages. One export runs at a time.

Exported records may contain sensitive definitions, answers or opted-in state. Review the file before sharing it.

## Retention and disk use

Defaults keep up to seven days of records with a soft cap of one million. Maintenance runs every 30 seconds. The record cap can produce a much shorter history: at a steady 500 requests per second, one million records represents about 33 minutes.

```bash
jev-observer \
  --retention-days 3 \
  --max-records 250000
```

These are age and record limits, not a disk-byte limit. Deleting rows does not necessarily shrink SQLite's allocated files. Actual storage use depends on definitions, answers, extensions and state capture.

## Back up the database

For a complete filesystem backup, stop Observer cleanly before copying the configured database, any remaining SQLite sidecar files and the workspace dashboard-token file. By default they live under `.jev-observer` in the working directory. Use your normal filesystem backup tool after the process has exited. Retain the live database key separately in a password manager; the encrypted backup cannot be read without it. Older plaintext backups remain plaintext after the active database is migrated.

Restore files only while every Observer process using that workspace is stopped. OS-store credentials are separate from a database backup. After rotating a persisted provider key in 0.2.0, downgrading to 0.1.0 requires registering the provider key again and updating the application's client token. Restoring an older SQLite backup cannot recover an OS credential entry removed by a later rotation. Session-only keys need registration after every restart.

JSONL exports are useful portable application records. They are not a replacement for a complete database backup.

## Delete history

Open **Settings**, choose **Delete history**, then type `DELETE` to confirm. This removes stored requests, answers and review labels from that workspace. Future forwarding and collection continue, so new records can appear after deletion.

Importing or deleting history refreshes a paused dashboard once while keeping it paused. In demo mode, deleting all history clears the sample until the next demo startup, which recreates synthetic records when the workspace is empty.

Demo mode uses a separate database. Check the workspace mode and database configuration before deleting or backing up history.

## Stop Observer cleanly

Use `Ctrl-C` or `SIGTERM`. Observer cancels upstream work, gives HTTP connections up to 10 seconds to finish, then drains queued captures. A separate watchdog caps total shutdown at 15 seconds. A forced deadline or abrupt termination can lose pending observations and may produce a nonzero exit status.

The collector is not a durable audit log. Calls also cannot pass through a stopped Observer process. For operating limits and capacity settings, read [configuration](/docs/configuration).

Source: [storage and operating limits](https://github.com/LimePencil/jev-observer/blob/main/README.md#storage-and-operating-limits), [normalization and imports](https://github.com/LimePencil/jev-observer/blob/main/src/model.rs).
