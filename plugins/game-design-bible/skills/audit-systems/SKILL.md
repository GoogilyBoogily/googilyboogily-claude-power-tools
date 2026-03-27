---
name: audit-systems
description: "Audit the Systems phase (Phase 2) of a Game Design Bible for pillar alignment, cross-system consistency, feedback loops, balance levers, and edge cases. Interactive resolution with research forks."
disable-model-invocation: true
context: fork
argument-hint: "[bible-dir] [--context path]"
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Systems Phase — Audit

Audit all Phase 2 (Systems) documents for quality, completeness, pillar alignment, cross-system consistency, and design integrity. Each issue is presented to the user one at a time with multiple resolution options, always including a research option that forks parallel web research agents.

## Input

$ARGUMENTS — path to the bible directory, and optionally:
- `--context <path>` — context file from the gather phase (enables context fidelity checks)

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Directory**: First non-flag argument (default: `docs/game-design-bible/`)
- **Context File Path**: `--context <path>` (optional)

## Process

### Phase 1: Load Documents

1. Read `<bible-dir>/INDEX.md` — verify Phase 2 is `✅ Complete`. If not, warn: "Phase 2 is not marked complete. Auditing incomplete systems may produce misleading results. Continue anyway?" Wait for confirmation.

2. Read `<bible-dir>/DESIGN-PILLARS.md` — extract all pillar names and "What This Rules Out" lists.

3. Read `<bible-dir>/01-core-loop/core-loop.md` — extract the core loop cycle.

4. Use Glob to find all `.md` files in `<bible-dir>/02-systems/`. Read each one.

5. If `--context` provided, read the context file.

6. Read the audit checklist at `${CLAUDE_SKILL_DIR}/references/checklist.md`.

### Phase 2: Run All Checks

Run every check from the checklist against every system document. Build a prioritized issue queue:

1. 🔴 CRITICAL issues first
2. 🟡 WARNING issues next
3. 🔵 INFO issues last

**Per-system checks** (SC, PA categories): Run against each individual system document.

**Cross-system checks** (CS category): Run across all system documents together — look for conflicts, inconsistencies, and missing cross-references.

**Core loop checks** (CL category): Verify each system connects to the core loop without bypassing it.

**Source integrity checks** (SI category): Scan all documents for prior-session references and unlabeled assumptions.

**Context fidelity checks** (CF category): Only run if `--context` was provided. Compare documents against the gather-phase context file.

**Open question checks** (OQ category): Scan all documents for unresolved markers.

### Phase 3: Present Summary

```
## Systems Audit Summary: [Game Name]

**Bible Directory:** [bible-dir]
**Context File:** [path or "not provided"]
**Systems Audited:** [count] — [list of system names]

Found **N issues** and **M open questions**:
- 🔴 CRITICAL: [count]
- 🟡 WARNING: [count]
- 🔵 INFO: [count]

Starting sequential resolution...
```

If zero issues, skip to Phase 5 with PASS verdict.

### Phase 4: Sequential Resolution

For each issue, present using AskUserQuestion with:
- The check ID, severity, and which system document it applies to
- A clear description of the problem with a quote from the document
- At least 2 fix options (one marked ⭐ recommended)
- **Always** "🔍 Research — search web for best practices" option
- **Always** "Skip" as last option

**Format:**

```
### Issue [N/total]: [Check ID] — [Severity]
**System:** [system-name.md]
**Check:** [check description]
**Problem:** [what's wrong, with a quote from the document]

Options:
1. ⭐ [Recommended fix — describe what it does]
2. [Alternative fix — describe what it does]
3. 🔍 Research — search web for [specific question about this issue]
4. Skip
```

**When "🔍 Research" is chosen:**

Dispatch a web research Task:

```
Task(
  description="Research [specific design question]",
  prompt="Search the web to answer: [specific question about the systems design issue].
  Focus on: [best practices, patterns, known pitfalls for this system type].
  Game genre: [genre]
  Scope: [indie|aa|aaa]
  Return findings with URLs, organized by relevance."
)
```

After research returns, synthesize findings and re-present the issue with refined options informed by the research.

**When a fix is chosen:** Apply the edit to the system document, show the change, log the resolution.

**When Skip is chosen:** Log as skipped with the reason, move to next issue.

### Phase 5: Write Audit Report

Write the audit report to `<bible-dir>/reviews/systems-AUDIT.md`:

```markdown
# Audit Report: Systems Phase (Phase 2)

**Bible Directory:** [bible-dir]
**Context File:** [context-path or "not provided"]
**Date:** [today's date]
**Verdict:** [PASS | PASS WITH WARNINGS | FAIL]

## Summary
[2-3 sentence overview of the audit results]

## Systems Audited
[List of all system documents with paths]

## Issues Resolved
| # | System | Severity | Check | Issue | Resolution | Research Used? |
|---|--------|----------|-------|-------|------------|----------------|

## Issues Skipped
| # | System | Severity | Check | Issue | Reason Skipped |
|---|--------|----------|-------|-------|----------------|

## Check Results

### Per-System Completeness
| Check | Status | Details |
|-------|--------|---------|

### Pillar Alignment
| Check | Status | Details |
|-------|--------|---------|

### Cross-System Consistency
| Check | Status | Details |
|-------|--------|---------|

### Core Loop Integration
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

Create the `reviews/` directory if needed.

**Verdict logic:**
- **PASS**: All checks pass, no critical issues skipped
- **PASS WITH WARNINGS**: No critical issues skipped, warnings remain
- **FAIL**: Any critical issues skipped

### Phase 6: Return

Report the audit verdict, the report file path, and a summary of what was found and resolved.

Offer next steps based on verdict:
- **PASS**: "Systems are ready. Run `/game-design-bible:bible:continue` to proceed to Phase 3 (Narrative) and Phase 4 (Art & Audio)."
- **PASS WITH WARNINGS**: "Systems are acceptable with noted warnings. Consider addressing them before proceeding."
- **FAIL**: "Critical issues remain unresolved. Re-run the audit after addressing them, or use `/game-design-bible:systems-generate` to regenerate problematic systems."
