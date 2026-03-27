---
name: bible-review
description: "Cross-cutting audit of the entire Game Design Bible for pillar consistency, internal contradictions, and 15 common game design pitfalls. Dispatches game-design-reviewer agent for parallel 3-audit, then walks through findings interactively with resolution options including research forks."
disable-model-invocation: true
context: fork
argument-hint: "[bible-dir] [--focus all|pillars|systems|narrative|scope] [--quick]"
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion, WebSearch, WebFetch, Bash(mkdir:*)
model: opus
---

# Bible Review — Cross-Cutting Audit

## Argument Parsing

Parse the following from `$ARGUMENTS`:
- `bible-dir`: Path to the Game Design Bible root directory (required — prompt if missing)
- `--focus`: Audit focus area — one of `all` (default), `pillars`, `systems`, `narrative`, `scope`
- `--quick`: Skip interactive briefing (Step 0) and synthesis (Step 5), run audits and present findings only

## Step 0: Pre-Review Briefing (skip if --quick)

Read `<bible-dir>/INDEX.md` and `<bible-dir>/DESIGN-PILLARS.md`.

Present the bible health snapshot:
- Total file count (Glob `**/*.md`)
- Phases completed vs incomplete (from INDEX.md status markers)
- Pillar list with one-line summaries
- Open questions count (Grep for `> **Open Question` or `❓` across all files)

Ask the user:
- "Any specific concerns or areas you want me to focus on?"
- "Any known issues I should ignore during this audit?"

Record responses as audit context.

## Step 1: Pillar Consistency Audit

Dispatch the `game-design-reviewer` agent with the following task:

> **Audit Type**: Pillar Consistency
> **Bible Directory**: `<bible-dir>`
> **Instructions**: Read DESIGN-PILLARS.md and every section file. For each feature/system, verify it serves at least one pillar. For each pillar, verify at least one feature serves it. Flag any feature that contradicts a pillar's "What This Rules Out" list. Check that DESIGN-PILLARS.md matches 00-concept/design-pillars.md. Verify MDA aesthetics align with the pillar set.
> **Output**: Write findings to `<bible-dir>/reviews/pillar-consistency.md` using severity markers: 🔴 Critical, 🟡 Warning, 🔵 Info, ❓ Needs Clarification.

Wait for this audit to complete before proceeding — its results feed into Step 2.

## Step 2: Contradictions + Pitfall Detection (Parallel)

Read the pillar consistency results from `<bible-dir>/reviews/pillar-consistency.md`.

Dispatch **2 parallel Tasks**:

### Task 1: Internal Contradictions

Dispatch `game-design-reviewer` agent:

> **Audit Type**: Internal Contradictions
> **Bible Directory**: `<bible-dir>`
> **Pillar Audit Context**: [include pillar consistency findings]
> **Check Categories**:
> - Systems vs Systems: conflicting mechanics, overlapping resource economies, contradictory progression curves
> - Systems vs Narrative: mechanics that undermine story themes, narrative promises mechanics can't deliver
> - Art/Audio vs Tone: visual style mismatches with stated tone, audio direction contradicting atmosphere goals
> - Terminology: same concept with different names across files, or same name meaning different things
> - Numeric Conflicts: contradictory stats, values that don't add up, percentage allocations exceeding 100%
> **Output**: Write to `<bible-dir>/reviews/contradictions.md` with severity markers.

### Task 2: Pitfall Detection

Dispatch `game-design-reviewer` agent:

> **Audit Type**: 15 Game Design Pitfalls
> **Bible Directory**: `<bible-dir>`
> **Pillar Audit Context**: [include pillar consistency findings]
> **Pitfalls to Check**:
> 1. **No Non-Goals** — Bible lacks explicit "what this game is NOT" (🔴)
> 2. **Ambiguous Failure Conditions** — No clear definition of what losing/failing means (🔴)
> 3. **Undocumented Economy** — Resource flows, sinks, and sources not mapped (🔴)
> 4. **Magic Numbers** — Numeric values with no rationale or tuning range (🟡)
> 5. **Missing Onboarding** — No plan for teaching players the core loop (🔴)
> 6. **Feature Creep** — Features that don't trace back to a pillar or aesthetic (🟡)
> 7. **Unaddressed Accessibility** — No accessibility considerations documented (🟡)
> 8. **No Session Structure** — No definition of play session length or save points (🟡)
> 9. **Missing Feedback Loops** — Systems with no positive or negative feedback described (🔴)
> 10. **Orphaned Systems** — Systems referenced but never fully designed (🟡)
> 11. **Unfalsifiable Pillars** — Pillars so vague they can't be violated (🔴)
> 12. **Missing Difficulty Strategy** — No plan for difficulty scaling or accessibility (🟡)
> 13. **Scope vs Resources Mismatch** — Ambitious design with no scope management plan (🔴)
> 14. **No Prototype Criteria** — No definition of "when is the prototype done" (🟡)
> 15. **Missing Monetization Ethics** — If F2P/MTX, no ethical guidelines documented (🔵)
> **Output**: Write to `<bible-dir>/reviews/pitfall-detection.md` with severity markers and specific file references.

Wait for both Tasks to complete.

## Step 3: Prioritized Finding Queue

Collect ALL findings from all 3 audit reports:
- `reviews/pillar-consistency.md`
- `reviews/contradictions.md`
- `reviews/pitfall-detection.md`

Merge into a single prioritized queue sorted by severity:
1. 🔴 Critical — Must fix before proceeding
2. 🟡 Warning — Should fix, may cause problems later
3. 🔵 Info — Nice to fix, low impact
4. ❓ Needs Clarification — Requires user input

Deduplicate findings that appear in multiple audits (keep the highest severity version).

Present the queue summary:
```
📋 Audit Complete — X findings total
   🔴 Critical: N  |  🟡 Warning: N  |  🔵 Info: N  |  ❓ Unclear: N
```

## Step 4: Sequential Resolution

For each finding in priority order:

1. **Present the finding** with:
   - Severity marker and category (e.g., "🔴 Pillar Consistency — PC-3")
   - File(s) affected
   - Specific text or values in conflict
   - Why this matters

2. **Offer 2+ fix options**, marking the recommended option with ⭐:
   - ⭐ [Recommended fix with brief description]
   - [Alternative fix approach]
   - 🔍 **Research code & web** — Dispatch 2 parallel Tasks: one to search the codebase for related patterns, one to search the web for best practices on this specific game design issue
   - ⏭️ **Skip** — Leave as-is, log as dismissed

3. **Apply the chosen fix**:
   - Edit the relevant file(s)
   - Log the resolution (finding ID, chosen option, files modified)

4. **Proceed to next finding**

If the user selects "Skip" 3+ times in a row, ask: "You've skipped several findings. Want to skip all remaining [current severity] items and move to the next severity level?"

## Step 5: Synthesis (skip if --quick)

Present an executive summary:
- Total findings: N resolved, N skipped, N researched
- Top 3 strengths of the bible (positive reinforcement)
- Biggest risk area remaining

Ask the user: "What are your top 1-3 priorities for the bible going forward?"

Record their response for the final report.

## Step 6: Write Consolidated Audit Report

Write the final report to `<bible-dir>/reviews/bible-review-AUDIT.md`:

```markdown
# Game Design Bible — Cross-Cutting Audit Report

> Generated: [date]
> Focus: [--focus value]
> Mode: [full | quick]

## Review Context
- Bible directory: [path]
- Files audited: [count]
- Phases complete: [list]
- User concerns: [from Step 0, or "N/A (quick mode)"]

## Executive Summary
[2-3 sentence overall assessment]

## Confirmed Issues (by severity)

### 🔴 Critical
[List with resolution status: ✅ Fixed | ⏭️ Skipped | 🔍 Researched]

### 🟡 Warning
[List with resolution status]

### 🔵 Info
[List with resolution status]

## Dismissed Issues
[Issues the user chose to skip, with brief reason if given]

## Strengths
[3-5 things the bible does well — positive reinforcement matters]

## Health Metrics
| Metric | Value |
|--------|-------|
| Pillar Coverage | X/Y features serve a pillar |
| Orphaned Features | N features serve no pillar |
| Contradictions Found | N (M resolved) |
| Pitfalls Triggered | N/15 |
| Open Questions | N across all files |

## Prioritized Next Steps
1. [User's stated priority from Step 5, or top unresolved critical]
2. [Next priority]
3. [Next priority]
```

## Return Verdict

Report the final status:
- ✅ **PASS** — No unresolved 🔴 issues
- ⚠️ **CONDITIONAL PASS** — 🔴 issues skipped but acknowledged
- ❌ **FAIL** — Unresolved 🔴 issues that were not reviewed
