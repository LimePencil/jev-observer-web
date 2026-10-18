---
title: "What's new in 0.3.1"
description: "Faster large-history queries and updated Linux saved-credential support."
section: "Getting started"
order: 3.5
---

Released October 18, 2026. [Install or update Observer](/docs/installation#update-an-existing-build).

## Faster history browsing

Large-history dashboard queries and question-key searches do less work while preserving counts, ordering and search results. Performance still depends on your history and machine; narrow the date range or filters when needed.

## Linux saved credentials

Updated Linux credential-store support preserves existing saved keys and their identities. Upgrade and rollback compatibility with 0.3.0 is checked, including credential-store restarts. No new setup is required.

## Before updating

Stop Observer and back up your workspace, database key and previous executable. First startup creates new query indexes automatically, so large histories need extra startup time and disk space. Existing tables remain readable by older versions.

Follow the [upgrade instructions](/docs/installation#update-an-existing-build), especially when returning to 0.1.0. The dashboard's 45-second query deadline and five-second slow-query notice are unchanged.

[Full release notes and downloads](https://github.com/LimePencil/jev-observer/releases/tag/v0.3.1).
