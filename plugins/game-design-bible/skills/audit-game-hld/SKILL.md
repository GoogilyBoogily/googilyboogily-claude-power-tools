---
name: audit-game-hld
description: "Audit generated game HLD documents for pillar alignment, template compliance, bible fidelity, and architectural quality. Interactive resolution with research forks."
disable-model-invocation: true
context: fork
argument-hint: "[hld-dir] [--bible-dir path] [--context path]"
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Game HLD — Audit

Audit generated game HLD documents for template compliance, pillar alignment, bible fidelity, cross-HLD consistency, and architectural quality. Each issue is presented to the user one at a time with multiple resolution options, always including a research option that forks parallel code + web research agents.

## Input

$ARGUMENTS — path to the HLD directory, and optional flags:
- `--bible-dir <path>` — bible directory for fidelity checks (enables Bible Fidelity and Pillar Coverage checks)
- `--context <path>` — context file from the gather phase (enables Context Fidelity checks)

## Parse Arguments

Extract from `$ARGUMENTS`:
- **HLD Dir**: First non-flag argument (e.g., `docs/hld/`)
- **Bible Dir**: `--bible-dir <path>` (optional)
- **Context File Path**: `--context <path>` (optional)

## Process

### Phase 1: Load Documents

1. Use Glob to find all `hld-*.md` files in `<hld-dir>/`. Read each one.
2. If `<hld-dir>/INDEX.md` exists, read it for the pillar coverage matrix.
3. If `--bible-dir` provided:
   - Read `<bible-dir>/DESIGN-PILLARS.md`
   - For each HLD, extract the `Bible Source` path from its header and read the corresponding bible feature file
4. If `--context` provided, read the context file for fidelity checks.
5. Read the audit checklist at `${CLAUDE_SKILL_DIR}/references/checklist.md`.

If any HLD file is missing or unreadable, log it as a 🔴 CRITICAL issue and continue with what exists.

### Phase 2: Run All Checks

Run every check from the checklist against the loaded documents. Build a prioritized issue queue:
1. 🔴 CRITICAL issues first
2. 🟡 WARNING issues next
3. 🔵 INFO issues last

For each check, record:
- Check ID (e.g., TC-1)
- Severity
- Status (PASS / FAIL)
- Affected HLD(s)
- Details (what was found or what's missing)

**Per-HLD checks** (TC, PA categories) run against each individual HLD.
**Cross-HLD checks** (CH, PM categories) run across all HLDs together.
**Conditional checks** (BF, CF categories) only run when the required flag is provided.

### Phase 3: Present Summary

```
## Game HLD Audit Summary

**HLD Directory:** [path]
**Bible Directory:** [path or "not provided"]
**Context File:** [path or "not provided"]
**HLDs Audited:** [count]

Found **N issues** across [count] HLDs:
- 🔴 CRITICAL: [count]
- 🟡 WARNING: [count]
- 🔵 INFO: [count]

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
   Focus on: [relevant game design files, existing HLDs, bible sections].
   Return findings with file:line citations."

Task 2 — Web Research:
  "Search online for: [specific question about the audit issue].
   Focus on: [game architecture best practices, comparable game architectures, GDC talks].
   Return findings with URLs."
```

Synthesize findings, then re-present the issue with refined options.

**When a fix is chosen:** Apply the edit to the relevant HLD file, show diff, log resolution.
**When Skip is chosen:** Log as skipped, move to next.

### Phase 5: Write Audit Report

```markdown
# Audit Report: Game HLD Documents

**HLD Directory:** [hld-dir]
**Bible Directory:** [bible-dir or "not provided"]
**Context File:** [context-path or "not provided"]
**Date:** [today's date]
**HLDs Audited:** [count]
**Verdict:** [PASS | PASS WITH WARNINGS | FAIL]

## Summary
[2-3 sentence overview]

## Issues Resolved
| # | Severity | Category | HLD | Issue | Resolution | Research Used? |
|---|----------|----------|-----|-------|------------|----------------|

## Issues Skipped
| # | Severity | Category | HLD | Issue | Reason Skipped |
|---|----------|----------|-----|-------|----------------|

## Check Results

### Template Compliance
| Check | Status | HLD(s) | Details |
|-------|--------|--------|---------|

### Pillar Alignment
| Check | Status | HLD(s) | Details |
|-------|--------|--------|---------|

### Bible Fidelity
| Check | Status | HLD(s) | Details |
|-------|--------|--------|---------|

### Cross-HLD Consistency
| Check | Status | Details |
|-------|--------|---------|

### Pillar Coverage Matrix
| Check | Status | Details |
|-------|--------|---------|

### Context Fidelity
| Check | Status | Details |
|-------|--------|---------|

### Open Questions
| Check | Status | HLD(s) | Details |
|-------|--------|--------|---------|
```

**Verdict logic:**
- **PASS**: All checks pass, no critical issues skipped
- **PASS WITH WARNINGS**: No critical issues skipped, warnings remain
- **FAIL**: Critical issues skipped

Save to `<hld-dir>/AUDIT.md`.

### Phase 6: Return

Report the audit verdict and file path.

## Output

Report: "Audit complete — verdict: [VERDICT]. Report saved to `<hld-dir>/AUDIT.md`."

Return the audit verdict and report path.
