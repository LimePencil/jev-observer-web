---
title: "Explore the dashboard"
description: "Find requests, compare question definitions and review answers."
section: "User guide"
order: 4
---

Use shared filters to investigate requests, recurring questions and usage in the same slice of history.

## Select the history you need

Filter by source, model and time window: last hour, 24 hours, seven days or all history. The default is 24 hours. **Custom date range** accepts local start and end times. Filters are saved in the page URL.

Search requests by source, request ID or question key; `Ctrl-K` (`⌘K` on macOS) focuses search when details are closed. The separate **Find a question group** field searches all groups in the selected scope without changing request totals. Select **Failures** to investigate unsuccessful requests.

The feed initially shows 12 records; **Show 100 records** expands the current page when enough records are available. Use **Older requests / Newer requests** and **Older groups / Newer groups** to browse beyond it. Request navigation remains available during a question-group search. Summaries cover the full selected history, not just the current page. A failed page load keeps the last loaded page and offers a retry.

## Read the summary

| Metric                         | Meaning                                                   |
| ------------------------------ | --------------------------------------------------------- |
| Requests                       | Recorded inference requests in the selected window        |
| Failures                       | HTTP errors or interrupted transfers                      |
| Request latency                | Observed round-trip p50 and p95                           |
| Reported tokens / Known tokens | Available input/output usage with coverage                |
| Request cost or known cost     | Reported USD costs or configured estimates, with coverage |

Each request contributes usage and cost once, even with multiple answers. Imported application actions do not create inference charges. Missing values stay unknown; sample costs are synthetic. Open a request to check its cost basis.

## Inspect recurring questions

Select a group to see its distribution and valid-answer count. **Inspect group** opens activity, observations and definition versions. Choose **Compare with** to compare observed outcomes. Different input histories are not a controlled accuracy comparison. Detail observations are bounded; use the request stream to continue investigating.

Choice shows selected options, Score shows a rubric value, and Noul shows a probability. Native Decisions preserves typed Choice values: boolean `true` and string `"true"` remain distinct in answers and distributions. Score rubrics retain their original order and labels. Invalid, missing or refused answers are excluded from valid distributions. A failed request is not a negative Noul answer.

Box answers show geometry, confidence and supported presence fields for reviewed TypeSafe and H2O profiles. Inspect and review each observation individually; boxes have no scalar mean or histogram. H2O's no-localization result does not establish that a target is absent. See [model-specific interpretation](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/models.md#compatible-http-servers).

Grouping uses source, question key, full definition, presentation order and task version. Changed or redacted definitions keep separate statistics. See [grouping metadata](/docs/connecting#name-sources-and-task-versions).

## Inspect a request

Open a request for answers, probabilities, definitions, captured extensions and application actions. Native Decisions retains question order, optional names and refusals. Check capture completeness before interpreting missing data. Requests with many decisions have **Previous decisions / Next decisions** controls. Inspection timestamps include full dates and offsets; large JSON sections load when expanded.

Label an answer `correct`, `incorrect` or `unknown` and watch for **Saved**. Feedback follows the current saved label. Pending reviews survive closing and reopening details; failures remain visible. Pending imports and deletion also retain their status after their drawers close. Model confidence is not measured accuracy.

## Pause while investigating

**Live updates** pauses the visible view; opening details also holds it. Collection continues. Close details and select **Resume live** or **Show latest** to return to current history.

Changing filters loads the selected history even while paused. Importing or deleting history refreshes once and preserves the pause. Collection health updates independently; browser polling pauses in hidden tabs.

## Follow collection health

Check dropped captures, incomplete captures, queue state and write failures. These counters reset after restart and do not prove older history is complete. A provider call can succeed even when its saved observation is incomplete or dropped.

Slow history queries show feedback after five seconds and can run for up to 45 seconds. Narrow filters for large workspaces; this deadline is not a speed guarantee. See [troubleshooting](/docs/troubleshooting#dashboard-refresh-feels-slow).
