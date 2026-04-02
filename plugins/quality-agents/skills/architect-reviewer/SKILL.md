---
name: architect-reviewer
description: "Conduct a comprehensive architecture review of a codebase or component. Evaluates structural patterns, data flow, resilience, security, and evolution potential. Produces a prioritized written report."
disable-model-invocation: true
context: fork
argument-hint: "[target-path-or-component] [--output report-path]"
allowed-tools: Read, Glob, Grep, Bash, Agent, AskUserQuestion, Write
model: opus
---

# Architecture Reviewer

Conduct a comprehensive architecture review by evaluating system designs, architectural decisions, and technology choices across five dimensions. Produce a prioritized report with actionable recommendations.

## Input

`$ARGUMENTS` — the target path or component to review, and optionally:
- `--output <path>` — where to write the report (default: `./architecture-review.md`)

If no target path is provided, ask using AskUserQuestion.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Target path**: The directory or file to review
- **Output path**: Value after `--output` flag, or default to `./architecture-review.md`

## Safety Rules

1. **NEVER** modify source code — review and report only
2. **NEVER** make changes to the codebase under review
3. Evaluate decisions against requirements — not against ideal theory
4. Be pragmatic: balance ideal architecture with practical constraints

## Process

### Phase 1: Scope and Context

1. Read the target path. If it is a directory, scan its structure with Glob. If a single file, read it.
2. Identify the system's purpose by reading README, CLAUDE.md, package.json, or equivalent project files.
3. Detect the tech stack: languages, frameworks, databases, infrastructure.
4. Identify scale requirements and constraints from documentation or configuration.
5. Note the project's age and maturity (check git history with `git log --oneline -20`).

**CHECKPOINT — Scope Confirmation:**

Present your understanding of:
- System purpose and domain
- Tech stack detected
- Scale/constraints identified
- Proposed review focus areas

Ask: "Is this scope correct? Any areas you'd like me to focus on or skip?"

### Phase 2: Parallel Dimension Analysis

Load review dimensions from `${CLAUDE_SKILL_DIR}/references/review-dimensions.md`.

Launch up to 5 parallel Explore agents, one per review dimension. Each agent receives:
- The target path
- The project context gathered in Phase 1
- Its specific dimension checklist from the reference file

**Agent 1 — Structural Patterns:**
Analyze component boundaries, layering, separation of concerns, dependency direction, module cohesion and coupling. Check for proper abstraction layers, circular dependencies, and god objects.

**Agent 2 — Data Flow:**
Trace data models, state management patterns, API contracts, serialization boundaries, and schema evolution strategy. Check for data consistency, transformation chains, and contract clarity.

**Agent 3 — Resilience:**
Evaluate error handling patterns, failure modes, retry and circuit-breaker patterns, graceful degradation, and observability hooks. Check for unhandled errors, missing timeouts, and silent failures.

**Agent 4 — Security:**
Assess authentication and authorization boundaries, input validation, secrets management, and attack surface. Check for exposed credentials, missing validation, and privilege escalation paths.

**Agent 5 — Evolution:**
Evaluate extension points, abstraction stability, breaking change risk, migration paths, and technical debt hotspots. Check for tight coupling to specific implementations, missing interfaces, and vendor lock-in.

Each agent must return structured findings with:
- file:line citations for every finding
- Severity: CRITICAL / WARNING / INFO
- Brief description and evidence

### Phase 3: Synthesize

1. Collect all parallel agent results.
2. Deduplicate findings that appear across multiple dimensions.
3. Identify cross-cutting concerns — patterns or issues that span multiple dimensions.
4. Prioritize all findings:
   - **CRITICAL**: Architectural risks that could cause system failures, security breaches, or block scaling
   - **WARNING**: Improvement opportunities that reduce maintainability or increase technical debt
   - **INFO**: Observations and suggestions for consideration
5. Rank the top 3 highest-risk architectural decisions with justification.

### Phase 4: Write Report

Write the report to the output path. Use this format:

```markdown
# Architecture Review: [System/Component Name]

**Scope:** [target path]
**Date:** [date]
**Reviewer:** Claude (architect-reviewer skill)

## Executive Summary

[3-5 sentences: overall assessment, key strengths, key risks]

## Architecture Scorecard

| Dimension | Rating | Key Finding |
|-----------|--------|-------------|
| Structural Patterns | [A-F] | [one-line summary] |
| Data Flow | [A-F] | [one-line summary] |
| Resilience | [A-F] | [one-line summary] |
| Security | [A-F] | [one-line summary] |
| Evolution | [A-F] | [one-line summary] |

## Critical Findings

[Prioritized list with file:line citations, severity, and recommended action]

## Recommendations

[Ordered by impact, with effort estimates: Low/Medium/High]

## Detailed Analysis

### Structural Patterns
[Full findings from Agent 1]

### Data Flow
[Full findings from Agent 2]

### Resilience
[Full findings from Agent 3]

### Security
[Full findings from Agent 4]

### Evolution
[Full findings from Agent 5]
```

**Rating scale:**
- **A**: Exemplary — follows best practices, well-documented decisions
- **B**: Good — minor issues, nothing blocking
- **C**: Adequate — some concerns, improvement recommended
- **D**: Concerning — significant issues that should be addressed
- **F**: Critical — architectural risks that need immediate attention

## Output

Report the verdict (overall assessment), the scorecard, top 3 critical findings, and the report file path.
