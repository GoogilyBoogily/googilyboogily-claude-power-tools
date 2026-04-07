# PR Review: {PR_TITLE}

## PR Metadata

| Field | Value |
|-------|-------|
| PR Number | #{PR_NUMBER} |
| Title | {PR_TITLE} |
| URL | {PR_URL} |
| Branch | {HEAD_BRANCH} -> {BASE_BRANCH} |
| Reviewers | {REVIEWER_LIST} |
| Document | {DOC_PATH} |
| Date Started | {START_DATE} |
| Last Activity | {LAST_ACTIVITY_TIMESTAMP} — {LAST_ACTIVITY_DESCRIPTION} |
| Status | {In Progress / Paused / Complete} |

## Comment Inventory

| # | Thread ID | Author | Section | GitHub Status | Action Taken | Resolution |
|---|-----------|--------|---------|---------------|--------------|------------|
| {N} | {THREAD_ID} | @{AUTHOR} | {SECTION} | {Resolved/Unresolved/Outdated} | {Accepted/Rejected/Resolved (R-XX)/Deferred/Skipped/Pending} | {DETAILS} |

### Comment Statistics

- **Total threads:** {TOTAL}
- **Resolved on GitHub:** {RESOLVED_COUNT} (tracked, no action needed)
- **Unresolved on GitHub:** {UNRESOLVED_COUNT} (action required)
- **Outdated:** {OUTDATED_COUNT} (code has changed since comment)
- **By reviewer:** @{REVIEWER_1} ({COUNT}), @{REVIEWER_2} ({COUNT})

## Grey Area Decisions (R-XX)

### {THEME_TITLE}

- **R-{NN}:** {DECISION} (User Decision)
  - Reviewer concern: "{PARAPHRASE}, raised by @{AUTHOR} in thread #{THREAD_N}"
  - Rationale: {USER_REASONING}
  - Code context: {FILE:LINE}
  - Affects: {IMPACT}
  - Threads addressed: #{THREAD_1}, #{THREAD_2}

### Claude's Discretion

- **R-{NN}:** {AREA} — Claude applies during resolution

## Resolution Log

| # | Thread ID | Action | Details | Draft Reply |
|---|-----------|--------|---------|-------------|
| {N} | {THREAD_ID} | {ACTION} | {DETAILS} | {REPLY_SUMMARY_OR_DASH} |

## Drafted Replies

### Thread {THREAD_ID} — @{AUTHOR}

> {ORIGINAL_COMMENT_TRUNCATED}

**Draft reply:**

> {REPLY_TEXT_FOR_COPY_PASTE}

## Resume Checkpoint

| Field | Value |
|-------|-------|
| Phase | {CURRENT_PHASE} |
| Next action | {SPECIFIC_NEXT_ACTION} |
| Document | {DOC_PATH} |
| Completed threads | {LIST_OR_COUNT} |
| Remaining threads | {LIST_OR_COUNT} |
| Grey areas resolved | {YES_NO_OR_R_XX_RANGE} |
