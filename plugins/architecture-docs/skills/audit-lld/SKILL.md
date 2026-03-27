---
name: audit-lld
description: "Audit a Low Level Design document for template compliance, source integrity, HLD alignment, implementation readiness, and context fidelity. Walks through each issue interactively with resolution options including parallel code + web research."
disable-model-invocation: true
context: fork
argument-hint: "[lld-path] [--context path] [--hld path]"
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# LLD Audit

Audit a Low Level Design document for quality, completeness, and implementation readiness. Each issue is presented to the user one at a time with multiple resolution options, always including a research option that forks parallel code + web research agents.

## Input

$ARGUMENTS — path to the LLD document, and optionally:
- `--context <path>` — context file from the gather phase (enables context fidelity checks)
- `--hld <path>` — predecessor HLD (enables HLD alignment checks)

## Parse Arguments

Extract from `$ARGUMENTS`:
- **LLD Path**: First non-flag argument
- **Context File Path**: `--context <path>` (optional)
- **HLD Path**: `--hld <path>` (optional)

## Process

### Phase 1: Load Documents

1. Read the LLD at the provided path.
2. If `--context` provided, read the context file.
3. If `--hld` provided, read the HLD.
4. Read the audit checklist at `${CLAUDE_SKILL_DIR}/references/checklist.md`.

### Phase 2: Run All Checks

Run every check from the checklist. Build a prioritized issue queue:
1. 🔴 CRITICAL issues first
2. 🟡 WARNING issues next
3. 🔵 INFO issues last
4. ❓ Open Questions last

### Phase 3: Present Summary

```
## LLD Audit Summary: [LLD Title]

**Document:** [path]
**Context file:** [path or "not provided"]
**HLD:** [path or "not provided"]

Found **N issues** and **M open questions**:
- 🔴 CRITICAL: [count]
- 🟡 WARNING: [count]
- 🔵 INFO: [count]
- ❓ Open Questions: [count]

Starting sequential resolution...
```

If zero issues, skip to Phase 5 with PASS verdict.

### Phase 4: Sequential Resolution

For each issue, present using AskUserQuestion with:
- At least 2 fix options (one marked ⭐ recommended)
- **Always** "🔍 Research code & web" option
- **Always** "Skip" as last option

**When "🔍 Research code & web" is chosen:**

Dispatch two parallel Tasks:

```
Task 1 — Code Research:
  "Search the codebase to answer: [specific question about the LLD issue].
   Focus on: [relevant interfaces, existing implementations, test patterns].
   Return findings with file:line citations."

Task 2 — Web Research:
  "Search online to answer: [specific question about the LLD issue].
   Focus on: [API docs, implementation patterns, known issues].
   Return findings with URLs."
```

Synthesize findings, then re-present the issue with refined options.

**When a fix is chosen:** Apply edit, show diff, log resolution.
**When Skip is chosen:** Log as skipped, move to next.

### Phase 5: Write Audit Report

```markdown
# Audit Report: [LLD Title]

**Document:** [lld-path]
**Context File:** [context-path or "not provided"]
**HLD:** [hld-path or "not provided"]
**Date:** [today's date]
**Verdict:** [PASS | PASS WITH WARNINGS | FAIL]

## Summary
[2-3 sentence overview]

## Issues Resolved
| # | Severity | Category | Issue | Resolution | Research Used? |
|---|----------|----------|-------|------------|----------------|

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

### HLD Alignment
| Check | Status | Details |
|-------|--------|---------|

### Implementation Readiness
| Check | Status | Details |
|-------|--------|---------|

### Context Fidelity
| Check | Status | Details |
|-------|--------|---------|
```

**Verdict logic:**
- **PASS**: All checks pass, no critical issues skipped
- **PASS WITH WARNINGS**: No critical issues skipped, warnings remain
- **FAIL**: Critical issues skipped

Save to same directory as LLD: `docs/lld/<name>-AUDIT.md`.

### Phase 6: Return

Report the audit verdict and file path.
