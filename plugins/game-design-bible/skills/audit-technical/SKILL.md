---
name: audit-technical
description: "Audit the Technical & Production phase (Phase 5) for engine justification, timeline realism, scope/resource alignment, and completeness. Interactive resolution with research forks."
disable-model-invocation: true
context: fork
argument-hint: "[bible-dir] [--context path]"
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Technical & Production Audit

Audit the Technical & Production phase (Phase 5) of a Game Design Bible for engine justification, timeline realism, scope/resource alignment, monetization ethics, and document completeness. Findings are written to an audit report with interactive resolution.

## Input

$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Directory**: First non-flag argument (default: `docs/game-design-bible/`)
- **Context File**: `--context <path>` (optional — enables Context Fidelity checks)

## Source Integrity Rules

**The audit itself must not introduce ungrounded claims.**

1. **Cite what you check.** Reference specific file paths, section names, and line content when reporting findings.
2. **Never reference prior Claude sessions or Claude memory.**
3. **Distinguish fact from judgment.** Findings are grounded in the checklist; recommendations are clearly labeled as such.

## Process

### Step 1: Load Documents

1. Read `<bible-dir>/DESIGN-PILLARS.md`
2. Read all files in `<bible-dir>/05-technical-production/`:
   - `engine-and-tools.md`
   - `asset-breakdown.md`
   - `timeline.md`
   - `monetization.md` (may not exist — check first)
3. Scan prior phase directories for scope comparison:
   - `<bible-dir>/00-concept/`
   - `<bible-dir>/01-core-loop/`
   - `<bible-dir>/02-systems/`
   - `<bible-dir>/03-narrative/`
   - `<bible-dir>/04-art-audio/`
4. If `--context` was provided, read the context file.

### Step 2: Load Checklist

Read the checklist from `${CLAUDE_SKILL_DIR}/references/checklist.md`.

### Step 3: Run Checklist

Evaluate every check item against the loaded documents. For each item, determine:
- **✅ PASS** — requirement is met with evidence
- **❌ FAIL** — requirement is not met, cite what's missing or wrong
- **⚠️ PARTIAL** — partially met, explain the gap
- **⏭️ SKIP** — not applicable (e.g., Context Fidelity checks when no `--context` provided, monetization ethics when no monetization file)

**Special attention areas:**

**Scope/Resource Alignment (SR checks):**
- For SR-1 (timeline realism): Cross-reference the asset breakdown totals against the timeline duration and team size. Use web research benchmarks if available in the context file. A solo developer producing 200+ assets in 3 months should be flagged.
- For SR-3 (asset coverage): Compare the asset breakdown categories against content actually designed in phases 2-4. If phase 3 defined 8 characters but the asset breakdown only lists 5, that's a FAIL.

**Monetization Ethics (ME checks):**
- If no monetization.md exists, check whether INDEX.md or context file indicates monetization was intentionally skipped. If so, ME-1 passes with "explicitly none." If there's no indication either way, ME-1 fails.
- ME-2 and ME-3 are CRITICAL for F2P models — read monetization.md carefully against each design pillar.

**Context Fidelity (CF checks):**
- Only run if `--context` was provided. Compare context file values against what appears in the generated documents. Flag any drift.

### Step 4: Compile Audit Report

Write to `<bible-dir>/reviews/technical-AUDIT.md`:

```markdown
# Technical & Production Audit — [Game Name]

**Audited:** [today's date]
**Bible Directory:** [bible-dir]
**Context File:** [path or "not provided"]
**Auditor:** Claude

## Summary

| Severity | Pass | Fail | Partial | Skip |
|----------|------|------|---------|------|
| 🔴 CRITICAL | [n] | [n] | [n] | [n] |
| 🟡 WARNING | [n] | [n] | [n] | [n] |
| 🔵 INFO | [n] | [n] | [n] | [n] |

**Verdict:** [✅ PASS / ⚠️ CONDITIONAL PASS / ❌ FAIL]

A verdict of PASS requires zero CRITICAL failures. CONDITIONAL PASS means no CRITICAL failures but WARNING-level issues exist. FAIL means one or more CRITICAL failures.

## Detailed Findings

### Engine & Tools

| # | Check | Severity | Result | Evidence / Notes |
|---|-------|----------|--------|-----------------|
| ET-1 | Engine choice stated | 🔴 CRITICAL | [✅/❌/⚠️] | [cite file and section] |
| ET-2 | Engine choice justified | 🟡 WARNING | [✅/❌/⚠️] | [cite evidence] |
| ET-3 | Dev tools specified | 🔵 INFO | [✅/❌/⚠️] | [cite evidence] |
| ET-4 | Art/audio pipeline described | 🟡 WARNING | [✅/❌/⚠️] | [cite evidence] |

### Scope/Resource Alignment

| # | Check | Severity | Result | Evidence / Notes |
|---|-------|----------|--------|-----------------|
| SR-1 | Timeline realistic | 🔴 CRITICAL | [✅/❌/⚠️] | [cite team size, asset count, duration] |
| SR-2 | Team roles cover all work | 🟡 WARNING | [✅/❌/⚠️] | [cite evidence] |
| SR-3 | Asset breakdown complete | 🔴 CRITICAL | [✅/❌/⚠️] | [compare phases 2-4 content vs breakdown] |
| SR-4 | No scope exceeds constraints | 🟡 WARNING | [✅/❌/⚠️] | [cite evidence] |

### Timeline

| # | Check | Severity | Result | Evidence / Notes |
|---|-------|----------|--------|-----------------|
| TL-1 | Milestones defined | 🟡 WARNING | [✅/❌/⚠️] | [cite evidence] |
| TL-2 | Vertical slice exists | 🟡 WARNING | [✅/❌/⚠️] | [cite evidence] |
| TL-3 | Buffer time included | 🔵 INFO | [✅/❌/⚠️] | [cite evidence] |

### Monetization Ethics

| # | Check | Severity | Result | Evidence / Notes |
|---|-------|----------|--------|-----------------|
| ME-1 | Model stated | 🟡 WARNING | [✅/❌/⚠️/⏭️] | [cite evidence] |
| ME-2 | F2P ethical guidelines | 🔴 CRITICAL | [✅/❌/⚠️/⏭️] | [cite evidence or N/A] |
| ME-3 | No pillar contradiction | 🔴 CRITICAL | [✅/❌/⚠️/⏭️] | [cite evidence] |
| ME-4 | Launch criteria defined | 🟡 WARNING | [✅/❌/⚠️] | [cite evidence] |

### Source Integrity

| # | Check | Severity | Result | Evidence / Notes |
|---|-------|----------|--------|-----------------|
| SI-1 | No prior-session refs | 🔴 CRITICAL | [✅/❌] | [cite any violations] |
| SI-2 | Assumptions labeled | 🟡 WARNING | [✅/❌/⚠️] | [cite evidence] |

### Context Fidelity

| # | Check | Severity | Result | Evidence / Notes |
|---|-------|----------|--------|-----------------|
| CF-1 | Engine matches context | 🟡 WARNING | [✅/❌/⏭️] | [cite comparison] |
| CF-2 | Timeline matches context | 🟡 WARNING | [✅/❌/⏭️] | [cite comparison] |
| CF-3 | Team matches context | 🟡 WARNING | [✅/❌/⏭️] | [cite comparison] |

### Open Questions

| # | Check | Severity | Result | Evidence / Notes |
|---|-------|----------|--------|-----------------|
| OQ-1 | No TODO/TBD/FIXME | 🟡 WARNING | [✅/❌] | [cite any found] |
| OQ-2 | No placeholder text | 🟡 WARNING | [✅/❌] | [cite any found] |

## Recommendations

[Prioritized list of recommended fixes, grouped by severity]

### 🔴 Critical (must fix)
1. [recommendation with specific file and section to fix]

### 🟡 Warning (should fix)
1. [recommendation]

### 🔵 Info (nice to fix)
1. [recommendation]
```

### Step 5: Interactive Resolution

Present the audit summary and verdict to the user.

If there are CRITICAL failures:
1. List each failure with the specific fix needed.
2. Ask: "Would you like me to fix these issues? I can update the documents directly, or dispatch research if I need more information to resolve them."

If there are only WARNING-level issues:
1. Present the list.
2. Ask: "These are non-critical but worth addressing. Want me to fix any of them?"

For any fix the user approves:
- If the fix requires external information, dispatch a Task with WebSearch/WebFetch to research the answer first.
- Edit the relevant document directly.
- Re-run the specific checklist item to verify the fix.
- Update the audit report with the new result.

### Step 6: Final Report

After resolution (or if no issues found):

Tell the user: "Technical & Production audit complete. Report saved to `<bible-dir>/reviews/technical-AUDIT.md`. Verdict: [verdict]."

If all phases are now audited, suggest: "All phases have been authored and audited. Consider running a full bible review to check cross-phase consistency."

Return the audit report path.
