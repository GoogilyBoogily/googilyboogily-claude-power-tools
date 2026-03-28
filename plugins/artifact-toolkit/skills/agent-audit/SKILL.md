---
name: agent-audit
description: "Audit an existing Claude Code agent/subagent for quality, routing mesh compliance, and best-practice adherence. Checks frontmatter, domain expert criteria, routing mesh, content quality, proactive triggers, and source integrity. Interactive issue resolution with parallel code + web research forks."
disable-model-invocation: true
context: fork
argument-hint: "[agent-file-path]"
allowed-tools: Read, Glob, Grep, Write, Edit, Agent, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Agent Audit

Audit a Claude Code agent/subagent for quality, routing mesh compliance, and correctness. Each issue is presented one at a time with multiple resolution options, always including a research option that forks parallel code + web research agents.

## Input

$ARGUMENTS — path to the agent `.md` file.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Agent Path**: Path to the `.md` file
- Verify the file exists and has `.md` extension. If not found, report error and stop.
- Extract agent name from filename (without `.md` extension).

## Process

### Phase 1: Load Documents

1. Read the agent `.md` file.
2. Read the audit checklist at `${CLAUDE_SKILL_DIR}/references/checklist.md`.
3. Parse the frontmatter (YAML between `---` delimiters) and body content separately.
4. Scan the agent's sibling directory for other agents (to check routing mesh references).
5. Optionally scan other installed plugin agent directories to verify cross-delegation targets exist.

### Phase 2: Run All Checks

Evaluate every check from the checklist against the loaded agent. For each check:
- Determine status: PASS, FAIL, or N/A
- For FAIL: record the severity and a specific description of what's wrong

Build a prioritized issue queue:
1. 🔴 CRITICAL issues first
2. 🟡 WARNING issues next
3. 🔵 INFO issues last
4. ❓ Open Questions last

### Phase 3: Present Summary

```
## Agent Audit Summary: [agent name]

**File:** [path]
**Lines:** [line count]
**Routing Mesh:** [delegation targets found, if any]

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
  "Search the codebase for examples of how other agents handle: [specific aspect].
   Look in ~/.claude/agents/, .claude/agents/, and any plugins/*/agents/ directories.
   Focus on routing mesh patterns, delegation conventions, and description triggers.
   Return findings with file:line citations."

Agent 2 — Web Research:
  "Search the official Claude Code documentation for best practices on: [specific aspect].
   Focus on: sub-agent authoring, frontmatter fields, tool grants, proactive invocation.
   Return findings with URLs."
```

Synthesize findings, then re-present the issue with refined options informed by research.

**When a fix is chosen:** Apply the edit immediately, show the change.
**When Skip is chosen:** Log as skipped with reason, move to next issue.

### Phase 5: Write Audit Report

```markdown
# Audit Report: [agent name]

**File:** [agent-path]
**Date:** [today's date]
**Verdict:** [PASS | PASS WITH WARNINGS | FAIL]

## Summary
[2-3 sentence overview of audit findings]

## Routing Mesh Analysis
- **Delegation targets:** [list of agents this agent delegates to]
- **Delegated from:** [list of agents that reference this agent, if discoverable]
- **Circular delegation risk:** [none detected / potential cycles listed]

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

### Domain Expert Criteria
| Check | Status | Details |
|-------|--------|---------|

### Routing Mesh
| Check | Status | Details |
|-------|--------|---------|

### Content Quality
| Check | Status | Details |
|-------|--------|---------|

### Proactive Triggers
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

Save alongside the agent: `<agent-dir>/<agent-name>-AUDIT.md`.

### Phase 6: Return

Report the audit verdict and file path. If FAIL, list the skipped critical issues that must be addressed.
