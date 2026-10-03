---
title: "Explore the dashboard"
description: "Move from a recurring question to the requests, definitions and answers behind it."
section: "User guide"
order: 4
---

The dashboard brings three views together: recurring questions, individual requests and resource usage. Shared filters make it possible to investigate the same slice of history across those views.

## Select the history you need

Filter by source, model and time window. Available windows are the last hour, last 24 hours, last seven days and all retained history. The default is 24 hours. In 0.2.0, **Custom date range** also sets explicit start and end bounds. Filters are saved in the page's local URL so you can bookmark or share the same selection with another user of that workspace.

The request search matches source names, request IDs and question keys. Press `Ctrl-K` (`⌘K` on macOS) to focus it when no details panel is open. The separate question-list search queries all groups in the selected scope on the server; it does not change request totals. Select the failures filter when investigating unsuccessful requests.

The request feed initially displays 12 records; **Show 100 records** expands a full page to at most 100. Use **Older requests** and **Newer requests** to traverse retained history, and the equivalent group controls to page through questions. The summary and activity chart cover the full selected scope rather than just the visible page. The timeline spans the selected range with at most 168 adaptive time buckets, including empty intervals.

## Read the summary

| Metric                     | Meaning                                                   |
| -------------------------- | --------------------------------------------------------- |
| Requests                   | Recorded inference requests in the selected window        |
| Failures                   | Recorded HTTP errors or failed response transfers         |
| Request latency            | Observed round-trip p50 and p95, when available           |
| Reported tokens            | Available input and output token usage                    |
| Request cost or known cost | Reported USD costs or configured estimates, with coverage |

A request can contain several answers. Usage and cost stay on that parent request so they are counted once. Imported application actions retain their own event kind and do not create extra inference charges.

Unknown values remain unknown. A partial cost total means only some requests have usable reported costs or enough information for an estimate. Sample-mode costs are explicitly synthetic. A response transfer that fails after an upstream HTTP 200 still appears as a failure; capture-only gaps remain separate.

## Inspect recurring questions

Select a question group to see its distribution and valid-answer count. Open the group details to inspect its activity, requests and separate definition versions.

Choice questions show selected options. Score questions describe a value within their rubric. Noul questions describe a probability. Invalid or missing answers are excluded from valid distributions; a failed request is not interpreted as a negative Noul answer.

Structurally valid Score values are preserved when their weighted displayed probabilities differ by more than 0.001; the dashboard shows a consistency warning. This does not repair the values or establish why they differ. Malformed distributions, missing answers and out-of-range scores remain invalid.

Definition comparisons include outcome distributions, review coverage, request sample sizes, failures, warnings, latency, tokens and known-cost coverage. Histories with different inputs are not a controlled accuracy comparison. Check sample sizes and review coverage before interpreting a change.

Observer groups using source, question key, full definition, presentation order and supplied task version. Changes to instructions or criteria keep distinct statistics. This helps you investigate a change without silently mixing incompatible questions.

Definitions that have been redacted are isolated. Indexed families are available only for the explicit, reviewed `jgrep-v1` adapter. See [connection metadata](/docs/connecting#name-sources-and-task-versions).

## Inspect a request

Open a row in the request stream to review its typed answers, probabilities, question definitions, captured extension data and supplied application actions. Check the capture status before treating missing fields as an upstream result.

For an individual answer, add a local review label: `correct`, `incorrect` or `unknown`. A reported confidence or probability is model output, not a measured accuracy rate. Review labels record your assessment without inventing an outcome for unreviewed answers.

## Pause while investigating

Select the live-updates control to hold the visible dashboard. Opening a details panel also holds the visible snapshot. Collection continues in both cases.

When newer records are available, select **Resume live** or **Show latest** to display the latest snapshot. Changing filters loads the newly selected history even while paused. Importing or deleting history refreshes the view once and keeps its paused state. The health view uses independent polling, so recording problems can still be reported while you inspect a paused snapshot. Browser polling pauses in hidden tabs.

## Follow collection health

Collection health reports forwarding, persistence, dropped or incomplete captures, queue state and storage problems. These counters describe the current process and reset after restart. A healthy new process does not prove older retained history has no gaps.

Captured bodies are bounded independently from forwarding. A call can succeed at the provider while Observer records only part of it or drops its observation under pressure. Use the health signal alongside request counts when judging the completeness of an investigation.

For missing records or slow refreshes, see [troubleshooting](/docs/troubleshooting). For exports and review data, see [data and privacy](/docs/data-and-privacy).

Source: [dashboard implementation](https://github.com/LimePencil/jev-observer/tree/main/ui/src) and [application contract](https://github.com/LimePencil/jev-observer/blob/main/docs/implementation-contract.md#dashboard-behavior).
