---
name: the-critic
description: "Launch 11 specialist code critics in parallel, each attacking code from a different angle — approach, architecture, best practices, simplicity, testability, maintainability, security, performance, error handling, readability, and SOLID principles. Consolidates findings into a unified severity-ranked report with cross-cutting pattern analysis. Use when you want a comprehensive multi-dimensional code review."
disable-model-invocation: true
context: fork
argument-hint: "[target] [--critics approach,architecture,...] [--severity critical|high] [--output report.md]"
allowed-tools: Skill, Read, Write, Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(git show:*)
model: opus
---

# The Critic — Orchestrator

Launch all specialist critics in parallel, consolidate their findings into a unified report with cross-cutting pattern analysis.

You coordinate — you do NOT review code yourself. Your job is to dispatch, collect, deduplicate, and synthesize.

## Input

`$ARGUMENTS` — target to review plus optional flags:
- **Target**: file path, directory, git ref, "recent changes", "unstaged changes", or empty (auto-detect)
- `--critics <list>` — comma-separated critic names without the `-critic` suffix (e.g., `--critics approach,security,solid`). Default: auto-select based on file types
- `--severity <level>` — filter consolidated output to this severity and above (critical, high, medium, low). Default: all
- `--output <path>` — write consolidated report to file. Default: conversation only

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Target**: everything before the first `--` flag
- **Critics filter**: comma-separated value after `--critics`
- **Severity filter**: value after `--severity`
- **Output path**: value after `--output`

## Step 1: Determine Target

If no explicit target provided, auto-detect:

1. Run `git status --short` — if unstaged/staged changes exist, collect those file paths
2. If no changes, run `git log --oneline -1` and `git show HEAD --name-only --format=""` — use the most recent commit
3. If no commits, run `git diff --name-only HEAD~5..HEAD 2>/dev/null` — use recently modified files

Determine the target description string to pass to each critic. This should be the exact same value for all critics — either the original `$ARGUMENTS` target, or a description like "unstaged changes" or "HEAD commit".

## Step 2: Determine File Types

Examine the target files to classify them:
- **Source code**: *.ts, *.js, *.py, *.go, *.rs, *.java, *.rb, *.php, *.cs, *.swift, *.kt, *.tsx, *.jsx
- **Test files**: *.test.*, *.spec.*, *_test.*, test_*.*
- **Config files**: *.json, *.yaml, *.yml, *.toml, *.ini, *.env*
- **Markup/docs**: *.md, *.txt, *.rst, *.adoc
- **SQL**: *.sql
- **Shell scripts**: *.sh, *.bash, *.zsh
- **Styles**: *.css, *.scss, *.less

If the target contains ANY source code files, classify as "mixed" and run all 11 critics.

## Step 3: Select Critics

Load the relevance matrix:

Read `${CLAUDE_SKILL_DIR}/references/relevance-matrix.md`

If `--critics` flag is set, use ONLY those critics (override the matrix).

Otherwise, apply the relevance matrix based on file types detected in Step 2.

Present to the user:

```
Targeting: [N files / commit SHA / description]
Launching [M] critics: [comma-separated list]
Skipped [K] critics: [comma-separated list] (reason: [file types])
```

## Step 4: Launch Critics in Parallel

**CRITICAL: Launch ALL selected critics in a SINGLE message for maximum parallelism.**

Use the Skill tool to invoke each selected critic. Pass the target as the argument:

```
skill: "the-critic:approach-critic", args: "[target]"
skill: "the-critic:architecture-critic", args: "[target]"
skill: "the-critic:best-practices-critic", args: "[target]"
skill: "the-critic:simplicity-critic", args: "[target]"
skill: "the-critic:testability-critic", args: "[target]"
skill: "the-critic:maintainability-critic", args: "[target]"
skill: "the-critic:security-critic", args: "[target]"
skill: "the-critic:performance-critic", args: "[target]"
skill: "the-critic:error-handling-critic", args: "[target]"
skill: "the-critic:readability-critic", args: "[target]"
skill: "the-critic:solid-critic", args: "[target]"
```

Only invoke the critics selected in Step 3.

## Step 5: Consolidate Results

After ALL critics complete, process their reports:

### 5a. Collect Scores

Extract the score (X/10) and top concern from each critic's Verdict section. Build a summary table.

### 5b. Deduplicate

Compare findings across critics. If two or more critics flagged the same `file:line` with overlapping concerns:
- Merge into a single finding
- Note which critics flagged it (convergence = high confidence)
- Use the highest severity among the duplicates

### 5c. Cross-Cutting Pattern Analysis

Look for systemic patterns:
- **Convergence**: 3+ critics flagging the same area → surface as a systemic issue
- **Root causes**: If multiple issues trace to the same design decision, name it
- **Contradictions**: If one critic recommends X and another recommends the opposite, flag the tension with a reasoned recommendation
- **Cascading impacts**: If one CRITICAL finding would resolve multiple HIGH/MEDIUM findings, highlight that

## Step 6: Present Consolidated Report

Present the report in this format:

```
# The Critic — Consolidated Report

## Target
[what was reviewed]

## Critic Scores

| Critic | Score | Top Concern |
|--------|-------|-------------|
| Approach | X/10 | [one-liner] |
| Architecture | X/10 | [one-liner] |
| ... | ... | ... |

**Overall Score: [average]/10**

## CRITICAL Issues ([count])

- **[Issue Title]** — `file:line` — flagged by: [critic1, critic2]
  Why: [explanation]
  Fix: [recommendation]

## HIGH Issues ([count])

- **[Issue Title]** — `file:line` — flagged by: [critic1]
  Why: [explanation]
  Fix: [recommendation]

## MEDIUM Issues ([count])

- **[Issue Title]** — `file:line`
  Fix: [recommendation]

## LOW Issues ([count])

- **[Issue Title]** — `file:line`
  Fix: [recommendation]

## Cross-Cutting Patterns

### [Pattern Name]
- Flagged by: [critic1, critic2, critic3]
- Root cause: [what's driving this]
- Impact: [what happens if not addressed]
- Recommendation: [actionable fix]

## Contradictions & Tensions

### [Tension Description]
- [Critic A] says: [recommendation]
- [Critic B] says: [recommendation]
- Reasoned take: [which to follow and why]

## Priority Action Items

1. [Most impactful fix — describe what to do and why it matters most]
2. [Second most impactful fix]
3. [Third most impactful fix]
```

Omit any section with zero items (e.g., if no contradictions, skip that section).
Apply severity filter if `--severity` flag was set.

## Step 7: Optional File Output

If `--output` flag was set, write the consolidated report to the specified path using the Write tool.

If no `--output` flag, do NOT write any files.
