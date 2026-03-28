---
name: skill-audit
description: "Audit an existing Claude Code skill for quality, completeness, and best-practice compliance. Checks frontmatter, content quality, workflow design, tool security, reference files, and source integrity. Interactive issue resolution with parallel code + web research forks."
disable-model-invocation: true
context: fork
argument-hint: "[skill-dir-or-SKILL.md-path]"
allowed-tools: Read, Glob, Grep, Write, Edit, Agent, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Skill Audit

Audit a Claude Code skill for quality, completeness, and correctness. Each issue is presented one at a time with multiple resolution options, always including a research option that forks parallel code + web research agents.

## Input

$ARGUMENTS — path to the skill directory or SKILL.md file.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Skill Path**: If path ends in `SKILL.md`, use its parent directory as the skill directory. Otherwise, treat as the skill directory directly.
- Verify the path exists and contains a `SKILL.md` file. If not found, report error and stop.

## Process

### Phase 1: Load Documents

1. Read `SKILL.md` from the skill directory.
2. Use Glob to scan the skill directory for any files in `references/` subdirectory.
3. Read the audit checklist at `${CLAUDE_SKILL_DIR}/references/checklist.md`.
4. Parse the SKILL.md frontmatter (YAML between `---` delimiters) and body content separately.

### Phase 2: Run All Checks

Evaluate every check from the checklist against the loaded skill. For each check:
- Determine status: PASS, FAIL, or N/A (if the check's precondition isn't met)
- For FAIL: record the severity and a specific description of what's wrong

Build a prioritized issue queue:
1. 🔴 CRITICAL issues first
2. 🟡 WARNING issues next
3. 🔵 INFO issues last
4. ❓ Open Questions last

### Phase 3: Present Summary

```
## Skill Audit Summary: [skill name]

**Skill Directory:** [path]
**SKILL.md:** [line count] lines
**Reference Files:** [count] files

Found **N issues** and **M open questions**:
- 🔴 CRITICAL: [count]
- 🟡 WARNING: [count]
- 🔵 INFO: [count]
- ❓ Open Questions: [count]

Starting sequential resolution...
```

If zero issues found, skip to Phase 5 with PASS verdict.

### Phase 4: Sequential Resolution

For each issue, present using AskUserQuestion with:
- Clear description of the issue and which checklist item it violates
- At least 2 fix options (one marked ⭐ recommended)
- **Always** include "🔍 Research code & web" option
- **Always** include "Skip" as last option

**When "🔍 Research code & web" is chosen:**

Launch two parallel agents:

```
Agent 1 — Code Research:
  "Search the codebase for examples of how other skills handle: [specific aspect].
   Look in ~/.claude/skills/, .claude/skills/, and any plugins/*/skills/ directories.
   Return findings with file:line citations."

Agent 2 — Web Research:
  "Search the official Claude Code documentation for best practices on: [specific aspect].
   Focus on: skills authoring, frontmatter fields, tool allowlisting.
   Return findings with URLs."
```

Synthesize findings, then re-present the issue with refined options informed by research.

**When a fix is chosen:** Apply the edit to SKILL.md or reference files immediately, show the change.
**When Skip is chosen:** Log as skipped with reason, move to next issue.

### Phase 5: Write Audit Report

```markdown
# Audit Report: [skill name]

**Skill Directory:** [path]
**Date:** [today's date]
**Verdict:** [PASS | PASS WITH WARNINGS | FAIL]

## Summary
[2-3 sentence overview of audit findings]

## Issues Resolved
| # | Severity | Category | Issue | Resolution | Research Used? |
|---|----------|----------|-------|------------|----------------|

## Issues Skipped
| # | Severity | Category | Issue | Reason Skipped |
|---|----------|----------|-------|----------------|

## Check Results

### Frontmatter Compliance
| Check | Status | Details |
|-------|--------|---------|

### Content Quality
| Check | Status | Details |
|-------|--------|---------|

### Workflow Design
| Check | Status | Details |
|-------|--------|---------|

### Tool Security
| Check | Status | Details |
|-------|--------|---------|

### Reference Files
| Check | Status | Details |
|-------|--------|---------|

### Source Integrity
| Check | Status | Details |
|-------|--------|---------|

### Official Docs Compliance
| Check | Status | Details |
|-------|--------|---------|
```

**Verdict logic:**
- **PASS**: All checks pass, no issues remain
- **PASS WITH WARNINGS**: No critical issues skipped, only warnings/info remain
- **FAIL**: Any critical issue was skipped

Save to the skill directory: `<skill-dir>/AUDIT.md`.

### Phase 6: Return

Report the audit verdict and file path. If FAIL, list the skipped critical issues that must be addressed.
