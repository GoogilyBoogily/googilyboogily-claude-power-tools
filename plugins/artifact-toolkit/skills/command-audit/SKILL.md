---
name: command-audit
description: "Audit an existing Claude Code command for quality, security, and best-practice compliance. Checks frontmatter, content quality, tool security, namespace conventions, feature correctness, and source integrity. Interactive issue resolution with parallel code + web research forks."
disable-model-invocation: true
context: fork
argument-hint: "[command-file-path]"
allowed-tools: Read, Glob, Grep, Write, Edit, Agent, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Command Audit

Audit a Claude Code command for quality, security, and correctness. Each issue is presented one at a time with multiple resolution options, always including a research option that forks parallel code + web research agents.

## Input

$ARGUMENTS — path to the command `.md` file.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Command Path**: Path to the `.md` file
- Verify the file exists and has `.md` extension. If not found, report error and stop.
- Extract command name from filename (without `.md` extension).

## Process

### Phase 1: Load Documents

1. Read the command `.md` file.
2. Read the audit checklist at `${CLAUDE_SKILL_DIR}/references/checklist.md`.
3. Parse the frontmatter (YAML between `---` delimiters) and body content separately.
4. Determine the command's parent directory to check namespace conventions.

### Phase 2: Run All Checks

Evaluate every check from the checklist against the loaded command. For each check:
- Determine status: PASS, FAIL, or N/A
- For FAIL: record the severity and a specific description of what's wrong

Build a prioritized issue queue:
1. 🔴 CRITICAL issues first
2. 🟡 WARNING issues next
3. 🔵 INFO issues last
4. ❓ Open Questions last

### Phase 3: Present Summary

```
## Command Audit Summary: [command name]

**File:** [path]
**Lines:** [line count]

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
  "Search the codebase for examples of how other commands handle: [specific aspect].
   Look in ~/.claude/commands/, .claude/commands/, and any plugins/*/commands/ directories.
   Return findings with file:line citations."

Agent 2 — Web Research:
  "Search the official Claude Code documentation for best practices on: [specific aspect].
   Focus on: command authoring, allowed-tools patterns, security best practices.
   Return findings with URLs."
```

Synthesize findings, then re-present the issue with refined options informed by research.

**When a fix is chosen:** Apply the edit immediately, show the change.
**When Skip is chosen:** Log as skipped with reason, move to next issue.

### Phase 5: Write Audit Report

```markdown
# Audit Report: [command name]

**File:** [command-path]
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

### Security
| Check | Status | Details |
|-------|--------|---------|

### Namespace & Location
| Check | Status | Details |
|-------|--------|---------|

### Feature Correctness
| Check | Status | Details |
|-------|--------|---------|

### Source Integrity
| Check | Status | Details |
|-------|--------|---------|
```

**Verdict logic:**
- **PASS**: All checks pass, no issues remain
- **PASS WITH WARNINGS**: No critical issues skipped, only warnings/info remain
- **FAIL**: Any critical issue was skipped

Save alongside the command: `<command-dir>/<command-name>-AUDIT.md`.

### Phase 6: Return

Report the audit verdict and file path. If FAIL, list the skipped critical issues that must be addressed.
