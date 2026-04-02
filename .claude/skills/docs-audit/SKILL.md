---
name: docs-audit
description: "Audit skills, commands, and agents against the project's docs/ standards (templates.md, best-practices.md, audit-checklists.md). Auto-detects artifact type. Supports single artifact path or batch mode (--all, --type skill|command|agent)."
disable-model-invocation: true
context: fork
argument-hint: "[path | --all | --type skill|command|agent] [--severity critical|warning|info]"
allowed-tools: Read, Glob, Grep, Write
model: opus
---

# Docs Audit

Audit skills, commands, and agents in this repository against the canonical standards defined in `docs/`. Reads `docs/audit-checklists.md` as the single source of truth for check criteria, cross-references `docs/best-practices.md` for evaluation context, and `docs/templates.md` for valid frontmatter fields and structural patterns.

Produces a markdown report — not an interactive walkthrough. For interactive per-issue resolution, use the artifact-toolkit audit skills instead.

## Input

`$ARGUMENTS` — one of:
- **Single path**: path to a SKILL.md, agent `.md`, or command `.md` file
- **`--all`**: audit every skill, agent, and command across all plugins
- **`--type skill|command|agent`**: audit all artifacts of one type
- **`--severity critical|warning|info`** (optional, combinable): filter report to show only findings at or above this severity (default: show all)

## Process

### Phase 1: Load Documentation

Read these three files from the project root. These are the authoritative references for all checks:

1. `docs/audit-checklists.md` — checklist tables with check IDs and severity levels
2. `docs/best-practices.md` — authoring standards, decision guides, naming conventions, quality criteria
3. `docs/templates.md` — canonical frontmatter field references, structural templates, string substitution reference

Parse and retain all three in context. Every check evaluation must trace back to specific criteria from these documents.

### Phase 2: Identify Targets

Parse `$ARGUMENTS` to determine audit mode and targets.

**Mode detection:**
- If arguments contain `--all`: batch mode, all types
- If arguments contain `--type skill`: batch mode, skills only
- If arguments contain `--type command`: batch mode, commands only
- If arguments contain `--type agent`: batch mode, agents only
- Otherwise: single-artifact mode using the provided path

**Severity filter:**
- If `--severity critical`: report only 🔴 CRITICAL findings
- If `--severity warning`: report 🔴 CRITICAL and 🟡 WARNING findings
- If `--severity info` or omitted: report all findings

**Batch target discovery** — use Glob to find artifacts:
- Skills: `plugins/*/skills/*/SKILL.md` and `plugins/*/skills/*/*/SKILL.md`
- Agents: `plugins/*/agents/**/*.md` — exclude README.md files
- Commands: `plugins/*/commands/**/*.md` — exclude README.md files

**Single target type detection** — determine artifact type from path:
- Path contains `/skills/` and filename is `SKILL.md` → **skill**
- Path contains `/agents/` → **agent**
- Path contains `/commands/` → **command**
- Fallback: read the file's frontmatter. Has `tools:` field (not `allowed-tools:`) → agent. Has `allowed-tools:` and filename is `SKILL.md` → skill. Has `allowed-tools:` and filename is not `SKILL.md` → command.

Report the target count and types before proceeding. If zero targets found, report the error and stop.

### Phase 3: Audit Each Target

For each artifact, perform a full audit against the matching checklist section from `docs/audit-checklists.md`.

**Per-artifact procedure:**

1. Read the artifact file.
2. Parse YAML frontmatter (between `---` delimiters) and body content separately.
3. Select the matching checklist: "Skill Audit Checklist" for skills, "Agent Audit Checklist" for agents, "Command Audit Checklist" for commands.
4. Evaluate every check in the selected checklist. For each check, determine:
   - **PASS**: the artifact satisfies the check
   - **FAIL**: the artifact violates the check — record specific evidence (what's wrong, what line, what value)
   - **N/A**: the check's precondition doesn't apply (e.g., RF-1 for a skill with no references/ directory)
5. Derive the artifact's plugin name from its path (the directory under `plugins/`).

**For skills specifically** — also check:
- Glob for files in the skill's `references/` subdirectory
- Verify all `${CLAUDE_SKILL_DIR}/references/` paths in SKILL.md point to files that exist (RF-1)
- Check for orphan reference files not mentioned in SKILL.md (RF-2)

**For agents specifically** — also check:
- Grep the agent body for "Step 0" or "Route or Stay" to verify RM-1
- Grep the description for "PROACTIVELY" to verify FM-2
- Count distinct problem types covered in the body to evaluate DE-1

**Cross-reference evaluation:**
- For subjective checks (CQ-1 imperative mood, FM-2/FM-3 description quality, DE-1 problem coverage, DE-2 resume test), consult the specific criteria in `docs/best-practices.md` to make your judgment.
- For field validity checks (OD-1, OD-2), consult the frontmatter field reference tables in `docs/templates.md` to verify only valid fields are used.
- Mark checks that have a deterministic fix with 🔧 (e.g., FM-1 name mismatch, CQ-5 TODO present, SI-2 hardcoded path).

**Per-artifact verdict:**
- **PASS**: all checks pass or are N/A
- **PASS WITH WARNINGS**: no 🔴 CRITICAL failures, only 🟡 or 🔵
- **FAIL**: one or more 🔴 CRITICAL checks failed

### Phase 4: Generate Report

Create the audit report as a markdown file.

**For batch mode**, use this structure:

```markdown
# Docs Audit Report

**Date:** [YYYY-MM-DD]
**Scope:** [--all | --type skill | --type command | --type agent]
**Artifacts Audited:** [total] ([N] skills, [N] agents, [N] commands)
**Severity Filter:** [critical | warning | all]
**Reference Docs:** docs/audit-checklists.md, docs/best-practices.md, docs/templates.md

## Health Score

| Type | Total | ✅ PASS | ⚠️ WARNINGS | ❌ FAIL |
|------|-------|---------|-------------|---------|
| Skills | N | n | n | n |
| Agents | N | n | n | n |
| Commands | N | n | n | n |
| **Total** | **N** | **n** | **n** | **n** |

## Critical Failures

[List only artifacts with 🔴 CRITICAL failures, sorted by failure count descending.
Show: plugin, artifact name, type, and the specific critical check IDs that failed.]

| Plugin | Artifact | Type | Critical Failures |
|--------|----------|------|-------------------|

## Summary by Artifact

[One row per artifact, sorted by plugin then artifact name.]

| Plugin | Artifact | Type | Verdict | 🔴 | 🟡 | 🔵 |
|--------|----------|------|---------|-----|-----|-----|

## Detailed Findings

[Group by plugin. Within each plugin, show each artifact that has at least one failure.
Only show FAIL checks (not PASS or N/A). Respect the --severity filter.]

### [plugin-name]/

#### [artifact-name] ([type]) — [VERDICT]

| Check | Severity | Evidence |
|-------|----------|----------|

[If a check is auto-fixable, prefix the evidence with 🔧.]

## Common Issues

[Top 5 most frequently failing checks across all audited artifacts.]

| # | Check | Severity | Failures | Description |
|---|-------|----------|----------|-------------|

## Next Steps

- For interactive issue resolution: `/artifact-toolkit:skill-audit`, `/artifact-toolkit:agent-audit`, `/artifact-toolkit:command-audit`
- Checks marked 🔧 have deterministic fixes — consider batch-fixing these first
- Re-run this audit after fixes to verify: `/docs-audit [same arguments]`
```

**For single-artifact mode**, use a simplified structure:

```markdown
# Docs Audit: [artifact-name]

**Path:** [full path]
**Type:** [skill | agent | command]
**Plugin:** [plugin-name]
**Date:** [YYYY-MM-DD]
**Verdict:** [PASS | PASS WITH WARNINGS | FAIL]

## Check Results

### [Category Name]

| Check | Severity | Status | Evidence |
|-------|----------|--------|----------|

[Show all checks (PASS, FAIL, N/A). Mark auto-fixable with 🔧.]

[Repeat for each category in the checklist.]

## Next Steps

[If FAIL: list the critical issues that must be addressed.]
[Suggest the matching artifact-toolkit audit skill for interactive fixes.]
```

**Save location:**
- Batch mode: `.claude/audit-reports/audit-report-YYYY-MM-DD.md`
- Single mode: `.claude/audit-reports/audit-report-[artifact-name]-YYYY-MM-DD.md`

Create the `.claude/audit-reports/` directory if it does not exist.

### Phase 5: Present Results

After saving the report, present a condensed summary to the user:

1. Show the Health Score table (batch) or verdict (single).
2. List any critical failures with their check IDs.
3. Report the saved file path.
4. If batch mode, mention the top 3 most common issues.

Do not reproduce the full detailed findings inline — the report file has them.
