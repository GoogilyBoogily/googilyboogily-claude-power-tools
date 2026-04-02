# Docs Audit: triage-expert

**Path:** plugins/quality-agents/agents/triage-expert.md
**Type:** agent
**Plugin:** quality-agents
**Date:** 2026-04-02
**Verdict:** PASS WITH WARNINGS

## Check Results

### Frontmatter Compliance

| Check | Severity | Status | Evidence |
|-------|----------|--------|----------|
| FM-1 | 🔴 | PASS | `name: triage-expert` matches filename `triage-expert.md` |
| FM-2 | 🔴 | PASS | Description includes "Use PROACTIVELY when encountering errors, performance issues, or unexpected behavior" |
| FM-3 | 🔴 | PASS | Description lists domain (context gathering, problem diagnosis), problem types (errors, performance issues, unexpected behavior), and trigger timing (before engaging specialized experts) |
| FM-4 | 🟡 | PASS | `tools: Read, Grep, Glob, Bash, Edit` — intentionally listed |
| FM-5 | 🟡 | FAIL | `Edit` is granted but the agent explicitly states "You MUST NOT implement fixes" and "Leave any code changes behind". Edit is unnecessary for a diagnosis-only agent. 🔧 Remove `Edit` from tools list |
| FM-6 | 🔵 | PASS | `model: sonnet` — justified for triage (fast routing, not deep reasoning) |

### Domain Expert Criteria

| Check | Severity | Status | Evidence |
|-------|----------|--------|----------|
| DE-1 | 🔴 | PASS | Covers ~8 problem types: type errors, module errors, async errors, database issues, build failures, performance, architecture concerns, and general unknown issues |
| DE-2 | 🟡 | PASS | "Triage specialist" / "incident response" is a recognized specialty |
| DE-3 | 🟡 | PASS | `triage-expert` follows the `domain-expert` naming pattern |
| DE-4 | 🟡 | PASS | No anti-patterns in name |
| DE-5 | 🔵 | PASS | Encodes non-obvious knowledge: alternative hypothesis analysis, first principles escalation, error pattern recognition |

### Routing Mesh

| Check | Severity | Status | Evidence |
|-------|----------|--------|----------|
| RM-1 | 🔴 | PASS | "Step 0: Quick Route" section exists at line 14 (variant naming but functionally equivalent) |
| RM-2 | 🟡 | FAIL | Step 0 routing uses some vague descriptions: "domain-specific expert" (line 18) and "domain-specific build expert" (line 19) instead of naming specific agents. 🔧 Replace with specific agent names (e.g., `typescript-expert`, `vite-expert`) |
| RM-3 | 🟡 | PASS | Step 0 includes "then STOP" at line 25. STOP conditions section at lines 88-94 includes explicit STOP language for each delegation |
| RM-4 | 🔴 | PASS | No circular delegation risk — triage delegates outward and no specialist routes back to triage for the same problem types |
| RM-5 | 🟡 | PASS | Triage is a broad entry point that delegates to specialists — correct pattern |
| RM-6 | 🟡 | PASS | Stop conditions clearly defined at lines 88-94 |

### Content Quality

| Check | Severity | Status | Evidence |
|-------|----------|--------|----------|
| CQ-1 | 🔴 | PASS | Clear role: "You are a triage specialist. You diagnose problems, gather evidence, and route to the right expert." |
| CQ-2 | 🟡 | PASS | Environment detection at step 1 of "When Invoked" — checks project type, tooling, framework, config files |
| CQ-3 | 🟡 | PASS | Problem analysis covers error patterns (TypeError, module, async), alternative hypotheses, and first principles escalation |
| CQ-4 | 🔵 | N/A | Triage doesn't implement solutions — it diagnoses and routes. Progressive solutions not applicable |
| CQ-5 | 🟡 | FAIL | Agent body is 87 lines (excluding frontmatter). Exceeds 80-line threshold by 7 lines. The "Error Pattern Recognition" section (lines 59-70) could be trimmed or moved to a reference skill |
| CQ-6 | 🟡 | PASS | No TODO/TBD/FIXME/placeholder text found |

### Proactive Triggers

| Check | Severity | Status | Evidence |
|-------|----------|--------|----------|
| PT-1 | 🔴 | PASS | Trigger conditions: "encountering errors, performance issues, or unexpected behavior before engaging specialized experts" — specific and actionable |
| PT-2 | 🟡 | PASS | Triggers match body: error classification, performance diagnosis, and routing to specialists are all covered |
| PT-3 | 🔵 | PASS | Triage is deliberately the broad entry point — overlap with specialists is by design (it routes to them) |

### Source Integrity

| Check | Severity | Status | Evidence |
|-------|----------|--------|----------|
| SI-1 | 🔴 | PASS | No prior-session references found |
| SI-2 | 🟡 | PASS | No hardcoded user-specific paths found |

### Official Docs Compliance

| Check | Severity | Status | Evidence |
|-------|----------|--------|----------|
| OD-1 | 🟡 | FAIL | Frontmatter uses `category`, `displayName`, `color`, and `disableHooks` — none of these appear in the valid agent frontmatter fields table in `docs/templates.md`. Valid fields are: `name`, `description`, `tools`, `disallowedTools`, `model`, `effort`, `memory`, `isolation`, `background`, `skills`, `maxTurns`, `initialPrompt` |
| OD-2 | 🔴 | PASS | No restricted fields (`hooks`, `mcpServers`, `permissionMode`) used |

## Summary

| Severity | PASS | FAIL | N/A |
|----------|------|------|-----|
| 🔴 CRITICAL | 10 | 0 | 0 |
| 🟡 WARNING | 13 | 3 | 0 |
| 🔵 INFO | 3 | 0 | 1 |
| **Total** | **26** | **3** | **1** |

## Findings

3 warnings found, 0 critical failures:

1. **FM-5** (🟡): `Edit` tool granted but agent is diagnosis-only — remove it 🔧
2. **RM-2** (🟡): Step 0 uses vague "domain-specific expert" instead of naming specific agents 🔧
3. **CQ-5** (🟡): 87 lines — 7 over the 80-line guideline
4. **OD-1** (🟡): Unknown frontmatter fields: `category`, `displayName`, `color`, `disableHooks`

## Next Steps

- For interactive issue resolution: `/artifact-toolkit:agent-audit plugins/quality-agents/agents/triage-expert.md`
- Checks marked 🔧 have deterministic fixes
- Re-run this audit after fixes: `/docs-audit plugins/quality-agents/agents/triage-expert.md`
