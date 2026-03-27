---
name: audit-narrative
description: "Audit the Narrative phase (Phase 3) for consistency with pillars, systems, and scope. Checks narrative weight appropriateness, character-gameplay integration, and dialogue feasibility. Interactive resolution."
disable-model-invocation: true
context: fork
argument-hint: "[bible-dir] [--context path]"
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Narrative Phase — Audit

Audit the Narrative phase (Phase 3) of a Game Design Bible for consistency with design pillars, systems designs, and project scope. Checks narrative weight appropriateness, character-gameplay integration, dialogue feasibility, and source integrity. Produces a structured audit report with interactive resolution of findings.

## Input

$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Directory**: First non-flag argument (default: `docs/game-design-bible/`)
- **Context File**: `--context <path>` (default: `<bible-dir>/context/narrative-context.md`)

## Source Integrity Rules

**The audit itself must be grounded in evidence from the documents being audited.**

1. **Cite every finding.** Reference specific file paths, section headers, and quoted text when flagging an issue.
2. **Never reference prior Claude sessions or Claude memory.**
3. **Distinguish facts from opinions.** Objective issues (contradictions, missing sections) are findings. Subjective preferences are suggestions.

## Process

### Step 1: Load Documents

1. Validate `<bible-dir>/INDEX.md` exists. If not, STOP with an error message.
2. Read the context file (if provided) to understand the original intent and narrative weight.
3. Read `<bible-dir>/DESIGN-PILLARS.md` — the standard against which everything is measured.
4. Read all files in `<bible-dir>/03-narrative/` using Glob.
5. Read all files in `<bible-dir>/02-systems/` using Glob — needed for systems integration checks.
6. Read `<bible-dir>/01-core-loop/core-loop.md` — needed for gameplay-narrative integration.

### Step 2: Load Checklist

Read the audit checklist from `${CLAUDE_SKILL_DIR}/references/checklist.md`.

### Step 3: Run Checklist

Evaluate every item in the checklist against the loaded documents. For each item:

- **✅ PASS** — Requirement is met. Note the evidence (file + section).
- **⚠️ WARN** — Partially met or needs attention. Note what's missing.
- **❌ FAIL** — Requirement not met. Note the specific gap.
- **⏭️ SKIP** — Not applicable (e.g., voice acting checks for LIGHT narrative weight).

Track severity from the checklist:
- 🔴 **Critical** — Must fix before proceeding to next phase
- 🟡 **Important** — Should fix, may cause problems downstream
- 🔵 **Nice-to-have** — Improvement opportunity, not blocking

### Step 4: Research (if needed)

If any findings require external validation (e.g., "Is this dialogue scope realistic for an indie project?"), dispatch research Tasks:

```
Search the web for [specific question related to finding].
Use WebSearch and WebFetch. Return structured findings with URLs.
```

### Step 5: Present Findings

Present all findings grouped by category, with a summary verdict:

```markdown
## Audit Summary

**Phase:** 3 — Narrative
**Narrative Weight:** [HEAVY / MEDIUM / LIGHT]
**Verdict:** [🟢 PASS / 🟡 PASS WITH WARNINGS / 🔴 FAIL]

**Critical Issues:** [count]
**Important Issues:** [count]
**Nice-to-have:** [count]

## Findings by Category

### [Category Name]

| # | Item | Severity | Status | Evidence / Notes |
|---|------|----------|--------|------------------|
| 1 | [Check item] | 🔴 | ❌ FAIL | [Specific evidence] |
| 2 | [Check item] | 🟡 | ✅ PASS | [File + section ref] |
```

### Step 6: Interactive Resolution

For each ❌ FAIL and ⚠️ WARN finding, ask the user how to resolve it:

1. **Auto-fix** — The audit can fix it directly (e.g., adding a missing section, correcting a cross-reference).
2. **Manual fix** — The user will fix it themselves.
3. **Accept risk** — The user acknowledges the issue but wants to proceed anyway.
4. **Dispute** — The user disagrees with the finding; discuss and re-evaluate.

For auto-fixes, apply the fix immediately using Edit and note the change in the audit report.

### Step 7: Write Audit Report

Write the complete audit report to `<bible-dir>/reviews/narrative-AUDIT.md`:

```markdown
# Narrative Phase Audit — [Game Name]

**Date:** [today's date]
**Narrative Weight:** [HEAVY / MEDIUM / LIGHT]
**Verdict:** [🟢 PASS / 🟡 PASS WITH WARNINGS / 🔴 FAIL]
**Documents Audited:** [list of files]
**Context File:** [path or "not provided"]

## Summary

**Critical:** [count] ([passed/failed/accepted])
**Important:** [count] ([passed/failed/accepted])
**Nice-to-have:** [count] ([passed/failed/accepted])

## Detailed Findings

### [Category]

| # | Check | Severity | Result | Notes |
|---|-------|----------|--------|-------|
| 1 | [item] | [severity] | [result] | [notes] |

## Resolutions Applied

| Finding | Resolution | Change Made |
|---------|-----------|-------------|
| [finding] | [auto-fix/manual/accepted/disputed] | [description of change, if any] |

## Recommendations

- [Any forward-looking advice for Phase 4+]

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| [today] | Initial audit | Phase 3 review |
```

### Step 8: Update INDEX.md

Update the Reviews table in `<bible-dir>/INDEX.md`:

Add or update the Phase 3 row:
```markdown
| Phase 3: Narrative | [🟢/🟡/🔴] | [verdict] | [today's date] |
```

## Output

Report: "Narrative audit complete. Verdict: [verdict]. Report saved to `<path>`. [N] issues found, [M] auto-fixed."

Return the audit report path.
