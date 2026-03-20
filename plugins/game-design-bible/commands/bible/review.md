---
description: Audit the Game Design Bible for pillar consistency, contradictions, and common design pitfalls
argument-hint: "[output-dir] [--focus pillars|systems|narrative|scope|all] [--quick]"
allowed-tools: Task, Read, Write, Glob, Grep, Bash(mkdir:*), AskUserQuestion
model: opus
category: workflow
---

# 🔎 Interactive Design Bible Review

Audit an existing Game Design Bible for pillar consistency, internal contradictions, and common game design pitfalls — with interactive triage at every stage.

## Arguments
$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Output Directory**: Path to bible root (default: `docs/game-design-bible/`)
- **Focus**: `--focus pillars|systems|narrative|scope|all` (default: `all`)
- **Quick Mode**: `--quick` flag — skips Steps 0 and 4 (pre-review briefing and synthesis conversation)

## Step 0: Pre-Review Briefing

**Skip this step entirely if `--quick` flag is set.** Jump directly to Step 1.

Read `<output-dir>/INDEX.md`, `<output-dir>/DESIGN-PILLARS.md`, and scan all section files using Glob (`<output-dir>/**/*.md`).

Present a **bible health snapshot** to the user:
- File count (total `.md` files)
- Phases completed (based on INDEX.md structure)
- Pillar list (from DESIGN-PILLARS.md)
- Open questions count (grep for `> ❓` or `Open Questions` across all files)

Then ask the user these 2 questions using AskUserQuestion (one at a time):

**Question 1:** "Are there specific areas you're concerned about or have recently changed? (e.g., 'the economy section was just rewritten', 'combat feels disconnected from pillars')"

Store the response as `USER_CONTEXT`.

**Question 2:** "Any known issues to ignore? (e.g., placeholder sections, intentionally incomplete areas, things you're already planning to fix)"

Store the response as `KNOWN_ISSUES`.

If the user declines to answer either question, store an empty string. These values will be injected into all agent prompts.

## Step 1: Pillar Consistency Audit

Read `<output-dir>/DESIGN-PILLARS.md` to establish pillar context.

Create the reviews output directory:
```bash
mkdir -p <output-dir>/reviews
```

Launch a SINGLE `game-design-reviewer` subagent for pillar consistency. This runs first because pillar consistency is foundational — its findings inform the contradictions and pitfall checks.

```
Task(
  description="Pillar consistency audit",
  prompt="AUDIT MODE: Pillar Consistency

BIBLE DIRECTORY: <output-dir>
REPORT OUTPUT PATH: <output-dir>/reviews/pillar-consistency.md

USER_CONTEXT: <user_context or 'None provided'>
KNOWN_ISSUES: <known_issues or 'None provided'>

Read ALL files in the bible directory recursively, then run the Pillar Consistency Audit checklist from your audit methodology. Also check that each pillar in 00-concept/design-pillars.md and DESIGN-PILLARS.md includes explicit 'What This Rules Out' statements. Flag missing or weak counterexamples. Write your full report to the output path.

After writing, return ONLY:
1. File path written
2. ALL findings with severity and one-sentence justification each
3. Counts: X critical, Y high, Z medium, W low",
  subagent_type="game-design-reviewer"
)
```

### Interactive Triage

When the agent returns, present findings organized by severity (CRITICAL → HIGH → MEDIUM → LOW).

**For each CRITICAL and HIGH finding**, ask the user via AskUserQuestion to triage it. Present the finding with its severity justification, then offer three options:

> **[Finding title]** — Severity: CRITICAL — [justification]
> [Details of the finding]
>
> How would you like to handle this?
> 1. **Confirm** — Keep in report as a confirmed issue
> 2. **Dismiss** — Move to "Acknowledged" section (please provide your reason)
> 3. **Add Context** — Annotate with additional information

Store the user's triage decision for each finding:
- **Confirmed** findings stay in the report as-is
- **Dismissed** findings move to an "Acknowledged/Dismissed" section with the user's reason
- **Context-added** findings get annotated with the user's clarification

**For MEDIUM and LOW findings**, present them as a batch:

> Here are **N lower-priority findings** (MEDIUM/LOW). Would you like to:
> 1. Review each one individually
> 2. Accept all as-is

If the user chooses to review individually, triage each one. Otherwise, confirm all as-is.

After triage is complete, ask:

> "Pillar consistency audit complete. **Ready to proceed to contradiction and pitfall checking?**"

Wait for the user's confirmation before proceeding.

## Step 2: Parallel Remaining Audits

Launch contradictions + pitfalls agents IN A SINGLE MESSAGE using Task. Both receive the triaged pillar results as additional context.

Build a `PILLAR_AUDIT_RESULTS` string containing:
- All **confirmed** findings (with severity)
- List of **dismissed** finding titles (so agents skip re-flagging them)
- Any **user context annotations**

### Agent 1: Internal Contradictions Check
```
Task(
  description="Internal contradictions check",
  prompt="AUDIT MODE: Internal Contradictions

BIBLE DIRECTORY: <output-dir>
REPORT OUTPUT PATH: <output-dir>/reviews/contradictions.md

USER_CONTEXT: <user_context or 'None provided'>
KNOWN_ISSUES: <known_issues or 'None provided'>

PILLAR_AUDIT_RESULTS (from prior audit — use confirmed findings as signal, skip dismissed items):
<pillar_audit_results>

Read ALL files in the bible directory recursively, then run the Internal Contradictions Check checklist from your audit methodology. Write your full report to the output path.

After writing, return ONLY:
1. File path written
2. ALL findings with severity and one-sentence justification each
3. Counts: X critical, Y high, Z medium, W low",
  subagent_type="game-design-reviewer"
)
```

### Agent 2: Pitfall Detection
```
Task(
  description="Design pitfall detection",
  prompt="AUDIT MODE: Pitfall Detection

BIBLE DIRECTORY: <output-dir>
REPORT OUTPUT PATH: <output-dir>/reviews/pitfall-detection.md

USER_CONTEXT: <user_context or 'None provided'>
KNOWN_ISSUES: <known_issues or 'None provided'>

PILLAR_AUDIT_RESULTS (from prior audit — use confirmed findings as signal, skip dismissed items):
<pillar_audit_results>

Read ALL files in the bible directory recursively, then run the Pitfall Detection checklist (all 15 pitfalls) from your audit methodology. Write your full report to the output path.

After writing, return ONLY:
1. File path written
2. ALL findings with severity and one-sentence justification each
3. Counts: X critical, Y high, Z medium, W low",
  subagent_type="game-design-reviewer"
)
```

## Step 3: Incremental Findings Triage

Process each audit's findings separately, in order.

### Contradictions Triage

Present contradiction findings organized by severity (CRITICAL → LOW).

**For each CRITICAL and HIGH finding**, ask the user to triage (same 3-option pattern as Step 1: Confirm / Dismiss / Add Context).

**For MEDIUM and LOW findings**, batch-present with the option to review individually or accept as-is.

### Pitfalls Triage

Present pitfall findings organized by severity (CRITICAL → LOW).

**For each CRITICAL and HIGH finding**, ask the user to triage (same 3-option pattern).

**For MEDIUM and LOW findings**, batch-present with the option to review individually or accept as-is.

**Positive reinforcement:** After pitfall triage, present the "Pitfalls Clear" list — pitfalls that were checked and NOT found. Frame this positively: "Your bible successfully avoids these common pitfalls: [list]"

## Step 4: Synthesis Conversation

**Skip this step entirely if `--quick` flag is set.** Jump directly to Step 5.

Present a draft **executive summary** (2-3 sentences capturing the overall state of the bible) and ask:

> "Does this capture the state of your bible? Feel free to edit or refine."

Wait for response. Incorporate any edits.

Then ask:

> "Which **1-3 confirmed issues** would you prioritize fixing first?"

Store the user's priorities — these become the ordering for "Recommended Next Steps."

Then ask:

> "Is there anything the review **missed** that you expected it to catch?"

Store any user-flagged gaps as "Review Notes" in the final report.

## Step 5: Write Interactive Audit Report

Read all three report files from `<output-dir>/reviews/` and consolidate into the interactive report format below.

If `--quick` was set, generate the executive summary and next steps ordering yourself (no user input available for those sections).

```markdown
# 🔎 Design Bible Audit Report — [Game Name]

## Review Context
- **Date**: [current date]
- **Focus**: [focus area or "all"]
- **User-Flagged Concerns**: [USER_CONTEXT or "None"]
- **Excluded Known Issues**: [KNOWN_ISSUES or "None"]

## Executive Summary
[User-approved summary, or auto-generated if --quick]

## 🔴 Confirmed CRITICAL Issues
1. [Issue] — Source: [which audit]
   - **File(s)**: [paths]
   - **Problem**: [description]
   - **Why Critical**: [severity justification]
   - **Fix**: [actionable suggestion]

## 🟠 Confirmed HIGH Priority Issues
[Same format]

## 🟡 Confirmed MEDIUM Priority Issues
[Same format]

## 🟢 Confirmed LOW Priority / Suggestions
[Same format]

## 📋 Dismissed Issues (Acknowledged)
| # | Issue | Severity | User's Reason |
|---|-------|----------|---------------|
[Table of dismissed findings with user's rationale]

## ✅ Strengths
[What the bible does well — important for morale]

## 📊 Health Metrics
| Metric | Score |
|--------|-------|
| Pillar Coverage | X/X pillars served |
| Orphaned Features | X found |
| Contradictions | X found (Y confirmed, Z dismissed) |
| Pitfalls | X/15 triggered (Y confirmed, Z dismissed) |
| Open Questions | X total across all sections |

## User-Prioritized Next Steps
1. [User's top priority]
2. [User's second priority]
3. [User's third priority]
[Additional auto-suggested steps if applicable]

## Review Notes
[Anything the user flagged as missed or expected to be caught]
```

Write the consolidated report to `<output-dir>/reviews/audit-report.md`.

Present the consolidated report to the user.

Update `INDEX.md` to add a reviews section link if not already present.

## Step 6: Next Steps

Suggest actionable follow-ups:
- Use `bible/continue` to address the top priority confirmed issues
- Re-run review after changes with `--focus` on affected areas
- If many dismissed items, consider documenting those design decisions explicitly in the bible
