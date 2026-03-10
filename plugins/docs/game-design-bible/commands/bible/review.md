---
description: Audit the Game Design Bible for pillar consistency, contradictions, and common design pitfalls
argument-hint: "[output-dir] [--focus pillars|systems|narrative|scope|all]"
allowed-tools: Task, Read, Write, Glob, Grep, Bash(mkdir:*)
model: opus
category: workflow
---

# 🔎 Design Bible Review

Audit an existing Game Design Bible for pillar consistency, internal contradictions, and common game design pitfalls.

## Arguments
$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Output Directory**: Path to bible root (default: `docs/game-design-bible/`)
- **Focus**: `--focus pillars|systems|narrative|scope|all` (default: `all`)

## Step 1: Verify Bible Exists

Read `<output-dir>/INDEX.md`. If it doesn't exist, inform the user: "No bible found at `<output-dir>`. Use `/game-design-bible:bible:create` to start one."

Read `<output-dir>/DESIGN-PILLARS.md` to establish pillar context for all reviewers.

Create the reviews output directory:
```bash
mkdir -p <output-dir>/reviews
```

## Step 2: Launch Parallel Review Agents

Launch 3 `game-design-reviewer` subagents IN A SINGLE MESSAGE using Task. Each reads the full bible and writes its report to `<output-dir>/reviews/`.

### Agent 1: Pillar Consistency Audit
```
Task(
  description="Pillar consistency audit",
  prompt="AUDIT MODE: Pillar Consistency

BIBLE DIRECTORY: <output-dir>
REPORT OUTPUT PATH: <output-dir>/reviews/pillar-consistency.md

Read ALL files in the bible directory recursively, then run the Pillar Consistency Audit checklist from your audit methodology. Write your full report to the output path.

After writing, return ONLY:
1. File path written
2. Top 3 findings with severity
3. Counts: X critical, Y high, Z medium, W low",
  subagent_type="game-design-reviewer"
)
```

### Agent 2: Internal Contradictions Check
```
Task(
  description="Internal contradictions check",
  prompt="AUDIT MODE: Internal Contradictions

BIBLE DIRECTORY: <output-dir>
REPORT OUTPUT PATH: <output-dir>/reviews/contradictions.md

Read ALL files in the bible directory recursively, then run the Internal Contradictions Check checklist from your audit methodology. Write your full report to the output path.

After writing, return ONLY:
1. File path written
2. Top 3 findings with severity
3. Counts: X critical, Y high, Z medium, W low",
  subagent_type="game-design-reviewer"
)
```

### Agent 3: Pitfall Detection
```
Task(
  description="Design pitfall detection",
  prompt="AUDIT MODE: Pitfall Detection

BIBLE DIRECTORY: <output-dir>
REPORT OUTPUT PATH: <output-dir>/reviews/pitfall-detection.md

Read ALL files in the bible directory recursively, then run the Pitfall Detection checklist (all 15 pitfalls) from your audit methodology. Write your full report to the output path.

After writing, return ONLY:
1. File path written
2. Top 3 findings with severity
3. Counts: X critical, Y high, Z medium, W low",
  subagent_type="game-design-reviewer"
)
```

## Step 3: Consolidate Report

After all 3 review agents complete:

1. Read all three report files from `<output-dir>/reviews/`
2. Consolidate into a single report using this format:

```markdown
# 🔎 Design Bible Audit Report — [Game Name]

## Executive Summary
[2-3 sentence overview of bible health]

## 🔴 CRITICAL Issues (Must Address)
1. [Issue] — Source: [which audit found it]
   - **File(s)**: [paths]
   - **Problem**: [description]
   - **Fix**: [actionable suggestion]

## 🟠 HIGH Priority Issues
[Same format]

## 🟡 MEDIUM Priority Issues
[Same format]

## 🟢 LOW Priority / Suggestions
[Same format]

## ✅ Strengths
[What the bible does well — important for morale]

## 📊 Health Metrics
| Metric | Score |
|--------|-------|
| Pillar Coverage | X/X pillars served |
| Orphaned Features | X found |
| Contradictions | X found |
| Pitfalls | X/15 triggered |
| Open Questions | X total across all sections |

## Recommended Next Steps
1. [Most impactful action to take]
2. [Second priority]
3. [Third priority]
```

3. Write the consolidated report to `<output-dir>/reviews/audit-report.md`
4. Present the consolidated report to the user
5. Update `INDEX.md` to add a reviews section link if not already present
6. Suggest using `bible/continue` to address specific issues or `bible/expand` to fill gaps
