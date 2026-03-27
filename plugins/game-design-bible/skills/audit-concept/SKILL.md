---
name: audit-concept
description: "Audit the Concept phase (Phase 0) of a Game Design Bible for pillar quality, MDA alignment, non-goals completeness, and vision clarity. Interactive issue resolution with research forks."
disable-model-invocation: true
context: fork
argument-hint: "[bible-dir] [--context path]"
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Concept Phase — Audit

Audit the Concept phase (Phase 0) of a Game Design Bible for quality, completeness, and correctness. Each issue is presented to the user one at a time with multiple resolution options, always including a research option that forks parallel code + web research agents.

## Input

$ARGUMENTS — path to the bible directory, and optionally:
- `--context <path>` — context file from the gather phase (enables context fidelity checks)

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Dir**: First non-flag argument (e.g., `docs/game-design-bible/`)
- **Context File Path**: `--context <path>` (optional)

## Process

### Phase 1: Load Documents

1. Read the Phase 0 outputs:
   - `<bible-dir>/DESIGN-PILLARS.md`
   - `<bible-dir>/00-concept/vision.md`
   - `<bible-dir>/00-concept/design-pillars.md`
   - `<bible-dir>/00-concept/mda-analysis.md`
   - `<bible-dir>/00-concept/non-goals.md`
   - `<bible-dir>/INDEX.md`
2. If `--context` provided, read the context file for fidelity checks.
3. Read the audit checklist at `${CLAUDE_SKILL_DIR}/references/checklist.md`.

If any required file is missing, log it as a 🔴 CRITICAL issue and continue with what exists.

### Phase 2: Run All Checks

Run every check from the checklist against the loaded documents. Build a prioritized issue queue:
1. 🔴 CRITICAL issues first
2. 🟡 WARNING issues next
3. 🔵 INFO issues last
4. ❓ Open Questions last

For each check, record:
- Check ID (e.g., PQ-1)
- Severity
- Status (PASS / FAIL)
- Details (what was found or what's missing)

### Phase 3: Present Summary

```
## Concept Audit Summary: [Game Title]

**Bible Directory:** [path]
**Context file:** [path or "not provided"]

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
  "Search the codebase for: [specific question about the audit issue].
   Focus on: [relevant game design files, existing documentation, prior art].
   Return findings with file:line citations."

Task 2 — Web Research:
  "Search online for: [specific question about the audit issue].
   Focus on: [game design best practices, comparable titles, GDC talks, design frameworks].
   Return findings with URLs."
```

Synthesize findings, then re-present the issue with refined options.

**When a fix is chosen:** Apply the edit to the relevant file, show diff, log resolution.
**When Skip is chosen:** Log as skipped, move to next.

### Phase 5: Write Audit Report

```markdown
# Audit Report: Concept Phase (Phase 0)

**Bible Directory:** [bible-dir]
**Context File:** [context-path or "not provided"]
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

### Pillar Quality
| Check | Status | Details |
|-------|--------|---------|

### MDA Alignment
| Check | Status | Details |
|-------|--------|---------|

### Non-Goals
| Check | Status | Details |
|-------|--------|---------|

### Vision Clarity
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
- **PASS WITH WARNINGS**: No critical issues skipped, warnings remain
- **FAIL**: Critical issues skipped

Save to `<bible-dir>/reviews/concept-AUDIT.md`.

### Phase 6: Return

Report the audit verdict and file path.
