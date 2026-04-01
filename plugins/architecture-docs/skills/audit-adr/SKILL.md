---
name: audit-adr
description: "Audit an Architecture Decision Record for MADR 4.0.0 compliance, source integrity, completeness, and internal consistency. Walks through each issue interactively with resolution options including parallel code + web research."
context: fork
argument-hint: "[adr-path] [--context path-to-context-file]"
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# ADR Audit

Audit an Architecture Decision Record for quality, completeness, and correctness. Each issue is presented to the user one at a time with multiple resolution options, always including a research option that forks parallel code + web research agents.

## Input

$ARGUMENTS — path to the ADR document, and optionally `--context <path>` to the context file from the gather phase.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **ADR Path**: First non-flag argument
- **Context File Path**: `--context <path>` (optional, enables context fidelity checks)

## Process

### Phase 1: Load Documents

1. Read the ADR at the provided path.
2. If `--context` provided, read the context file.
3. Read the audit checklist at `${CLAUDE_SKILL_DIR}/references/checklist.md`.

### Phase 2: Run All Checks

Run every check from the checklist against the ADR. For each check, record:
- **Check name** and category
- **Status**: PASS, WARN, or FAIL
- **Details**: What was found (or not found)
- **Severity**: 🔴 CRITICAL, 🟡 WARNING, or 🔵 INFO
- **Suggested fix**: How to resolve

Also scan for open questions: `TODO`, `TBD`, `FIXME`, `[ASSUMPTION]`, vague/placeholder text, or any unresolved items.

Build a prioritized **issue queue** ordered:
1. 🔴 CRITICAL issues first
2. 🟡 WARNING issues next
3. 🔵 INFO issues last
4. ❓ Open Questions last

### Phase 3: Present Summary

Show the user the full breakdown before diving in:

```
## ADR Audit Summary: [ADR Title]

**Document:** [path]
**Context file:** [path or "not provided"]

Found **N issues** and **M open questions**:
- 🔴 CRITICAL: [count] — must fix before proceeding
- 🟡 WARNING: [count] — should fix
- 🔵 INFO: [count] — optional improvements
- ❓ Open Questions: [count]

Starting sequential resolution...
```

If zero issues found, skip to Phase 5 with a PASS verdict.

### Phase 4: Sequential Resolution

For **each issue/question** in the queue, present it with resolution options using AskUserQuestion.

**Format for each issue:**

```
### Issue [N]/[total] — [severity]: [title]

**Category:** [Template Compliance | Source Integrity | Context Fidelity | Internal Consistency | Open Question]
**Section:** [which ADR section is affected]
**Problem:** [clear description of the issue]

**Options:**
1. ⭐ [Recommended fix] — [description of what will change]
2. [Alternative fix] — [description]
3. 🔍 Research code & web — Fork two agents to investigate this issue deeper before deciding
4. Skip — Leave as-is, log in audit report
```

**Rules for presenting options:**
- Always provide at least 2 fix options (one recommended with ⭐)
- **Always include "🔍 Research code & web"** as an option
- **Always include "Skip"** as the last option
- The recommended option should be the one most likely correct based on available evidence
- Options should be distinct — not minor variations of the same fix

**When user picks "🔍 Research code & web":**

Dispatch two parallel Tasks in a single message:

```
Task 1 — Code Research:
  "Search the codebase to answer: [specific question derived from the issue].
   Use Glob, Grep, and Read. Return structured findings with file:line citations."

Task 2 — Web Research:
  "Search online to answer: [specific question derived from the issue].
   Use WebSearch, WebFetch, and Context7 (for library docs). Return findings with URLs."
```

After both return:
1. Synthesize findings from both agents
2. Present the synthesis to the user
3. **Re-present the same issue** with updated/refined resolution options informed by research
4. The research option is no longer shown for this issue (already used)

**When user picks a fix option:**

1. Apply the edit to the ADR document immediately using the Edit tool
2. Show the diff (what changed)
3. Log the resolution in the audit trail
4. Move to the next issue

**When user picks "Skip":**

1. Log the issue as skipped with the severity
2. Move to the next issue

### Phase 5: Write Audit Report

After all issues are resolved or skipped, write the audit report:

```markdown
# Audit Report: [ADR Title]

**Document:** [adr-path]
**Context File:** [context-path or "not provided"]
**Date:** [today's date]
**Verdict:** [PASS | PASS WITH WARNINGS | FAIL]

## Summary

[2-3 sentence overview of findings and resolutions]

## Issues Resolved

| # | Severity | Category | Issue | Resolution | Research Used? |
|---|----------|----------|-------|------------|----------------|
| 1 | 🔴 | [category] | [title] | [how resolved] | Yes/No |

## Issues Skipped

| # | Severity | Category | Issue | Reason Skipped |
|---|----------|----------|-------|----------------|

## Open Questions Resolved

| # | Question | Answer | Source |
|---|----------|--------|--------|

## Check Results

### Template Compliance
| Check | Status | Details |
|-------|--------|---------|

### Source Integrity
| Check | Status | Details |
|-------|--------|---------|

### Internal Consistency
| Check | Status | Details |
|-------|--------|---------|

### Context Fidelity
| Check | Status | Details |
|-------|--------|---------|
```

**Verdict logic:**
- **PASS**: All checks pass, no critical issues skipped
- **PASS WITH WARNINGS**: No critical issues skipped, but warnings remain
- **FAIL**: One or more critical issues were skipped

Save the audit report to the same directory as the ADR: if ADR is at `docs/decisions/0005-migrate-to-graphql.md`, save audit to `docs/decisions/0005-migrate-to-graphql-AUDIT.md`.

### Phase 6: Return

Report the audit verdict and file path. If part of the pipeline, the orchestrator uses the verdict to decide whether to proceed.
