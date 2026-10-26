---
title: "Data and privacy"
description: "Understand local capture, move records between workspaces and keep a useful history."
section: "User guide"
order: 5
---

Observer stores history in a local SQLite database. It sends no analytics or automatic event uploads. Live inference still sends application requests to the upstream provider you configure.

The commands below use the installed `jev-observer` executable. For a source build, use `./target/release/jev-observer`; on Windows, use the executable path from [installation](/docs/installation).

## Know what is retained

Input state and recognized envelope media, including assets, are excluded from saved history by default, including imports. Forwarding is unchanged. Definitions, answers and extension fields are retained and may contain sensitive content.

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

Observer discovers secrets in original inputs before discarding known input paths, so matching values in retained fields still get redacted. Redaction cannot promise to recognize every sensitive value. Definitions changed by redaction are kept separate because their original equivalence is no longer verifiable.

If privacy filtering merges distinct object keys or answer identifiers, or would turn invalid validation metadata into a valid answer, imports fail as a whole. Live forwarding continues, but Observer saves a minimal incomplete record without the original content or answers and reports a collection gap. These checks apply to new captures and imports; saved history is not rewritten.

## Inspect compressed and image requests

Observer can inspect one complete gzip member or zstd frame and supported image multipart requests after forwarding. Raw and decoded bodies must each fit `--capture-limit` (256 KiB by default); these limits are not a total memory cap. Multipart supports a JSON `request` part followed by referenced PNG/JPEG parts. Unsupported, malformed or oversized inspection data produces a minimal incomplete record with a static reason; forwarded bytes remain unchanged.

Image bytes are retained as bounded base64 only with `--capture-state`. Observer does not open image paths or URLs, decode pixels or promise a replayable SDK request. See the [captured transport limits](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/capture-decoding.md).

## Encryption and local access

Live SQLite history is encrypted with SQLCipher using the externally supplied `JEV_OBSERVER_DB_KEY`. [Generate and save a 32-byte database key](/docs/connecting#save-a-database-key) before starting normal collection, and supply the same 64-character hexadecimal value on every live startup. Losing the key makes encrypted history unreadable.

On first startup with an existing plaintext database, Observer migrates it before serving requests. Stop older Observer processes first. Old backups and deleted disk blocks may still contain plaintext. The demo database remains plaintext, including any records you import into it. JSONL and CSV exports are deliberate plaintext downloads; protect them when storing or sharing them.

The dashboard and local API require HTTP Basic authentication: username `observer` and the random workspace token at the complete database filename plus `.token`. Startup output gives its exact path. The default live token is `.jev-observer/observer.sqlite.token`; demo uses `.jev-observer/observer.demo.sqlite.token`. Keep this token private.

The first upgrade from a legacy `*.access-token` workspace creates a fresh token and leaves the legacy file untouched. Sign in again and update clients using workspace authentication. See [upgrade guidance](/docs/installation#update-an-existing-build).

On Windows, the default `.jev-observer` directory receives a private current-user ACL. Custom database directories must already restrict access to the current user, SYSTEM and administrators. Token files have protected current-user ACLs; permissive files and reparse points are rejected.

## Import records

Select **Import records** in the dashboard sidebar, or open **Export**, then **Import local records**. Choose the matching source format, then select a local file or paste its contents. An empty workspace also offers an **Import records** button. Imports support:

| Format                            | What it contains                                                       |
| --------------------------------- | ---------------------------------------------------------------------- |
| Observer JSONL export             | Normalized records previously exported by Observer                     |
| JevRouter decision receipt        | The reviewed JevRouter receipt format, retained as application actions |
| Decision request/response capture | Original questions and reported results in a supported protocol        |

Imports go into the currently open workspace. To keep imported history encrypted, [start live Observer with your saved database key](/docs/connecting#save-a-database-key), then import there. Importing into the demo stores those records in its plaintext database alongside the sample; demo mode does not make imported records synthetic.

Each import allows 10,000 records and 8 MiB of UTF-8 text, with additional normalization limits. Rejected batches save no partial history. Split large JSONL files between complete lines; reduce oversized individual records at their source. See the [format and size limits](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/models.md#library-results-and-custom-apis).

Stable source event IDs prevent duplicate imports; identical payloads from independent calls remain separate observations. Use non-sensitive identities: privacy filtering that changes an Observer record's ID, source or effective event ID, or a receipt's decision ID, rejects the whole import. Observer recomputes validation and grouping. Unknown event times stay unknown and outside the timeline, with a separate import timestamp for history placement.

Imports follow current capture and redaction settings. Start with `--capture-state` before importing if you intend to retain input state; configured redaction still applies.

JevRouter receipts remain application actions, without invented inference requests, token charges or transport facts.

## Import mapped model results

Choose **Decision request/response capture** for calls made outside Observer. Its format ID remains `systemone-capture`. Each JSONL line needs one original call with a stable event ID, source, provider, original question definitions and reported answers. System One is the default protocol; native Decisions and Cloudflare captures can specify `protocol` and `model_profile` while retaining their original shape. Choice and Score need complete probability distributions; a winning label or truncated top-k result is insufficient. Missing facts remain unknown.

The offline converter supports reviewed System One, NanoJev, AgentJev, AnyJev, SemIf, AutoTrust, OmniJev and Jev-Omni results without calling a model. The two Omni formats have distinct adapters; unsupported or ambiguous mappings are rejected. Abstention mass stays visible and invalid for complete-distribution statistics. Raw converter files may contain sensitive content before import privacy settings apply. Follow the [capture format and conversion examples](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/models.md#library-results-and-custom-apis).

## Export a selected history

Set the source, model, time-window or custom date-range and search filters you need, then choose **Export**:

| Export | Best use                                                    |
| ------ | ----------------------------------------------------------- |
| JSONL  | Portable records with detail; can be imported into Observer |
| CSV    | Parent-request summaries for spreadsheet inspection         |

An export covers matching retained records, not just the recent rows visible in the request feed. Exports select matching record identities once, then fetch bounded pages in fresh read transactions. Later arrivals are excluded; concurrent retention, deletion or review-label edits can still affect later pages. One export runs at a time.

JSONL retains all saved answers, including those beyond the current details page. Oversized records can stop an export; see [export limits](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/storage.md).

Exported records may contain sensitive definitions, answers or opted-in state. Review the file before sharing it.

## Retention and disk use

Defaults keep up to seven days of records with a soft cap of one million. Cleanup runs every 30 seconds; high traffic can fill the record cap before seven days.

```bash
jev-observer \
  --retention-days 3 \
  --max-records 250000
```

These are age and record limits, not a disk-byte limit. Deleting rows does not necessarily shrink SQLite's allocated files. Actual storage use depends on definitions, answers, extensions and state capture. Retention and Delete all history use bounded delete statements inside one transaction, preserving atomic visibility and rollback. The row bound is not a total memory cap.

## Back up the database

For a complete filesystem backup, stop Observer cleanly before copying the configured database and any remaining SQLite sidecar files. By default they live under `.jev-observer` in the working directory. Use your normal filesystem backup tool after the process has exited. Retain the live database key and both current and legacy dashboard token files separately; the encrypted backup cannot be read without its database key. Older plaintext backups remain plaintext after the active database is migrated.

JSONL is not a full database or credential-store backup. New Box records can break older dashboard/group readers even though the database schema is unchanged; JSONL export does not make them backward compatible. For rollback, preserve the upgraded workspace separately and restore a stopped pre-upgrade snapshot with the previous executable and configuration. Keep required provider credentials available and read [upgrade guidance](/docs/installation#update-an-existing-build) for token and credential-store changes.

## Delete history

Open **Settings**, choose **Delete history**, then type `DELETE` to confirm. This removes stored requests, answers and review labels from that workspace. Future forwarding and collection continue, so new records can appear after deletion.

Closing an import or deletion drawer does not cancel the pending operation; its status remains available when reopened. Importing or deleting history refreshes a paused dashboard once while keeping it paused. In demo mode, deleting all history clears the sample until the next demo startup, which recreates synthetic records when the workspace is empty.

Demo mode uses a separate database. Check the workspace mode and database configuration before deleting or backing up history.

## Stop Observer cleanly

Use `Ctrl-C` or `SIGTERM`; Windows also supports `Ctrl-Break`. Observer cancels upstream work and drains captures within a 15-second total shutdown deadline. Forced or abrupt termination can lose pending observations.

The collector is not a durable audit log. Calls also cannot pass through a stopped Observer process. For operating limits and capacity settings, read [configuration](/docs/configuration).

Source: [0.4.0 storage and operating limits](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/storage.md), [model captures and import limits](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/models.md).
