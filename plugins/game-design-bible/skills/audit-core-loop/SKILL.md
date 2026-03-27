---
name: audit-core-loop
description: "Audit the Core Loop phase (Phase 1) of a Game Design Bible for loop completeness, pillar coverage, prototype actionability, and session structure. Interactive resolution with research forks."
disable-model-invocation: true
context: fork
argument-hint: "[bible-dir] [--context path]"
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Core Loop Audit

Audit the Core Loop phase (Phase 1) of a Game Design Bible for quality, completeness, and correctness. Each issue is presented to the user one at a time with multiple resolution options, always including a research option that forks parallel web research agents.

## Input

$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Directory**: First non-flag argument (default: `docs/game-design-bible/`)
- **Context File Path**: `--context <path>` (optional, enables context fidelity checks)

## Process

### Phase 1: Load Documents

1. Read `<bible-dir>/01-core-loop/core-loop.md`.
2. Read `<bible-dir>/01-core-loop/prototype-spec.md`.
3. Read `<bible-dir>/DESIGN-PILLARS.md` — extract all pillar names.
4. If `--context` provided, read the context file.
5. Read the audit checklist at `${CLAUDE_SKILL_DIR}/references/checklist.md`.

If core-loop.md does not exist, inform the user: "No core loop documents found at `<bible-dir>/01-core-loop/`. Generate them first with `/game-design-bible:core-loop-generate`." — then STOP.

### Phase 2: Run All Checks

Run every check from the checklist against the core loop documents. For each check, record:
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
## Core Loop Audit Summary: [Game Name]

**Bible Directory:** [bible-dir]
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

**Category:** [Loop Completeness | Pillar Coverage | Prototype Spec | Source Integrity | Context Fidelity | Open Question]
**Document:** [which file is affected — core-loop.md or prototype-spec.md]
**Section:** [which section is affected]
**Problem:** [clear description of the issue]

**Options:**
1. ⭐ [Recommended fix] — [description of what will change]
2. [Alternative fix] — [description]
3. 🔍 Research — Fork two agents to investigate this issue deeper before deciding
4. Skip — Leave as-is, log in audit report
```

**Rules for presenting options:**
- Always provide at least 2 fix options (one recommended with ⭐)
- **Always include "🔍 Research"** as an option
- **Always include "Skip"** as the last option
- The recommended option should be the one most likely correct based on available evidence
- Options should be distinct — not minor variations of the same fix

**When user picks "🔍 Research":**

Dispatch two parallel Tasks in a single message:

```
Task 1 — Genre Research:
  "Search the web to answer: [specific question derived from the issue].
   Focus on how successful [genre] games handle this aspect of their core loop.
   Use WebSearch and WebFetch. Return structured findings with URLs."

Task 2 — Design Theory Research:
  "Search the web to answer: [specific question derived from the issue].
   Focus on game design theory, GDC talks, and published post-mortems.
   Use WebSearch and WebFetch. Return structured findings with URLs."
```

After both return:
1. Synthesize findings from both agents
2. Present the synthesis to the user
3. **Re-present the same issue** with updated/refined resolution options informed by research
4. The research option is no longer shown for this issue (already used)

**When user picks a fix option:**

1. Apply the edit to the affected document immediately using the Edit tool
2. Show the diff (what changed)
3. Log the resolution in the audit trail
4. Move to the next issue

**When user picks "Skip":**

1. Log the issue as skipped with the severity
2. Move to the next issue

### Phase 5: Write Audit Report

After all issues are resolved or skipped, write the audit report:

```markdown
# Core Loop Audit Report: [Game Name]

**Bible Directory:** [bible-dir]
**Context File:** [context-path or "not provided"]
**Date:** [today's date]
**Verdict:** [PASS | PASS WITH WARNINGS | FAIL]

## Summary

[2-3 sentence overview of findings and resolutions]

## Issues Resolved

| # | Severity | Category | Document | Issue | Resolution | Research Used? |
|---|----------|----------|----------|-------|------------|----------------|
| 1 | 🔴 | [category] | [file] | [title] | [how resolved] | Yes/No |

## Issues Skipped

| # | Severity | Category | Document | Issue | Reason Skipped |
|---|----------|----------|----------|-------|----------------|

## Open Questions Resolved

| # | Question | Answer | Source |
|---|----------|--------|--------|

## Check Results

### Loop Completeness
| Check | Status | Details |
|-------|--------|---------|

### Pillar Coverage
| Check | Status | Details |
|-------|--------|---------|

### Prototype Spec
| Check | Status | Details |
|-------|--------|---------|

### Source Integrity
| Check | Status | Details |
|-------|--------|---------|

### Context Fidelity
| Check | Status | Details |
|-------|--------|---------|

### Open Questions
| Check | Status | Details |
|-------|--------|---------|
```

**Verdict logic:**
- **PASS**: All checks pass, no critical issues skipped
- **PASS WITH WARNINGS**: No critical issues skipped, but warnings remain
- **FAIL**: One or more critical issues were skipped

Save the audit report to `<bible-dir>/reviews/core-loop-AUDIT.md`. Create the `reviews/` directory if it doesn't exist.

### Phase 6: Return

Report the audit verdict and file path. If part of a pipeline, the orchestrator uses the verdict to decide whether to proceed to Phase 2 (Systems Design).
