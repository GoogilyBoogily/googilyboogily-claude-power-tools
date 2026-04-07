---
name: hld-gather
description: "Compile a structured context file for HLD generation by merging decisions (from hld-discuss), research (from arch-research), and ADR constraints with gap-fill questions. Can also run standalone with direct Q&A when no decisions file exists."
version: 3.0.0
context: fork
argument-hint: "[decisions-file-path] [--adr path-to-adr] [--research path-to-research]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# HLD Context Gathering — Compiler Mode

Compile all context needed to write a High Level Design document. In the full pipeline, this skill receives a decisions file (from `hld-discuss`), a research file (from `arch-research`), and an ADR reference, then merges them with gap-fill questions to produce the final context file.

**Can also run standalone** — if no decisions file is provided, falls back to direct Q&A mode.

## Input

$ARGUMENTS — path to a decisions file, and optionally flags.

Parse for:
- **Decisions path** — `docs/context/hld/<name>-decisions.md`
- **ADR path** — `--adr <path>`
- **Research path** — `--research <path>`
- **Description** — if no files, treated as topic for standalone mode

If invoked with `--adr` or text like "based on ADR at <path>", read the ADR as primary input.

## Source Integrity Rules

**Every factual claim in the context file must be traceable to research performed in this session.**

1. **Cite your work.** Reference specific file paths + line numbers.
2. **Never reference prior Claude sessions or Claude memory.**
3. **Assumptions are labeled, not hidden.** Unresearched claims go in Open Questions.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Mode Detection

Check if `$ARGUMENTS` points to a decisions file:
- If YES → **Compiler Mode** (Phase 1-4)
- If NO → **Standalone Mode** (Phase S1-S6)

---

## Compiler Mode

### Phase 1: Load Inputs

1. Read the decisions file. Extract all D-XX decisions, ADR Constraints, Deferred Ideas, Open Questions.
2. If `--adr` provided, read the ADR. Extract decision, drivers, chosen option, rationale, consequences, confirmation.
3. If `--research` provided, read the RESEARCH.md. If not provided, check for `<name>-RESEARCH.md` at same location.
4. Scan `docs/hld/` for existing HLDs to understand the landscape.

### Phase 2: Gap-Fill Questions

Compare decisions + research + ADR against what an HLD context file needs:

| Required Section | Source | Gap-Fill Needed? |
|-----------------|--------|-----------------|
| Problem Statement | ADR or decisions topic | Usually covered |
| Goals / Non-Goals | Decisions file (D-XX scope) | Ask if non-goals unclear |
| Scope Boundaries | Decisions file | Usually covered |
| Consumers & Expectations | May not be in decisions | Ask if missing |
| Data Entities | May be partially covered | Ask for detail if needed |
| External Systems | Decisions file (integration D-XX) | Usually covered |
| NFRs | Decisions file or gaps | Ask if specific numbers missing |
| Deployment & Rollout | May not be in decisions | Ask if not mentioned |

**Only ask about genuine gaps.** Present compilation plan:

> "I have decisions, research, and ADR context. Here's what I'll compile. Any gaps?"

### Phase 3: Compile Context File

```markdown
# HLD Context: [Feature/Change Title]

**Gathered:** [today's date]
**Description:** [what is being built/changed]
**ADR Reference:** [path to ADR]
**Decisions file:** [path]
**Research file:** [path, if used]

## Problem Statement

[From ADR or decisions topic]

## Goals and Non-Goals

### Goals
- [Specific, measurable outcomes — from decisions + ADR]

### Non-Goals
- [Explicitly out of scope — from decisions Deferred Ideas]

## Implementation Decisions

[Preserved from decisions file — D-XX numbering intact]

### [Category]
- **D-01:** [decision] (User Decision)
  - Rationale: [rationale]
  - Code context: [file:line]
  - Affects: [downstream impact]

### Claude's Discretion
- **D-03:** [area]

## ADR Context

[Extracted from ADR — decision, drivers, chosen option, rationale, consequences]

## User Answers

[Gap-fill answers organized by question area — only sections where gaps existed]

## Research Summary

### Decision Impact Analysis
[From RESEARCH.md]

### Approach Comparison
[From RESEARCH.md — preserved as table]

| Approach | Pros | Cons | Adoption | Risk |
|----------|------|------|----------|------|

### Don't Hand-Roll
[From RESEARCH.md — preserved as table]

| Problem | Don't Build | Use Instead | Why |
|---------|------------|-------------|-----|

### Codebase Findings
[From RESEARCH.md — with file:line citations]

| Pattern | Location (file:line) | Reusable? | Adaptation Needed |
|---------|---------------------|-----------|-------------------|

### Gap Analysis
[From RESEARCH.md]

| Expected | Actual | Severity | Impact |
|----------|--------|----------|--------|

### Common Pitfalls
[From RESEARCH.md]

| Pitfall | What Goes Wrong | How to Avoid |
|---------|----------------|--------------|

## Change Map

### Files to Modify
| File/Module | Change Description |
|---|---|
| `path/to/file` | [what changes] |

### New Files
| File/Module | Purpose |
|---|---|
| `path/to/new` | [what it does] |

### Files to Remove/Deprecate
| File/Module | Reason |
|---|---|

### Configuration Changes
- [env vars, feature flags, build changes]

### Database/Schema Changes
- [tables, columns, indexes, migrations]

## Implementation Phases

| Phase | Scope Summary | Depends On | Deliverable |
|-------|---------------|------------|-------------|
| 1 | [scope] | — | [deliverable] |
| 2 | [scope] | Phase 1 | [deliverable] |

## Deferred Ideas

[From decisions file]

## Open Questions

[Merged from decisions + research + gap-fill]

## Template

The HLD must follow the template at `${CLAUDE_SKILL_DIR}/../hld-generate/references/template.md`.
Key sections: Problem Statement, Goals/Non-Goals, Proposed Solution (Overview, Architecture, Data Model, API Design, Key Design Decisions), Alternatives Considered (≥2), Codebase Impact, Security, Performance, Reliability, Observability, Migration, Testing, Open Questions, Implementation Phases, References.
```

### Phase 4: Save and Return

1. Determine kebab-case name.
2. Create `docs/context/hld/` if needed.
3. Write to `docs/context/hld/<name>-context.md`
4. Tell user: "Context file saved to `<path>`. Run `/architecture-docs:hld-generate <path>` to generate the HLD."

---

## Standalone Mode

Falls back to direct interactive gathering when no decisions file is provided.

### Phase S1: Understand the Goal

1. Read description/ADR. Extract decision, context, drivers, consequences.
2. **CHECKPOINT** — Confirm understanding.

### Phase S2: Clarifying Questions

Question areas: Scope Boundaries, Consumers & Expectations, Data Entities, External Systems, NFRs, Deployment & Rollout.

### Phase S3: Research

Dispatch parallel code + web research Tasks.

**CHECKPOINT** — Present findings.

### Phase S4: Codebase Impact Analysis

Produce change map: files to modify/create/delete, config changes, schema changes.

**CHECKPOINT** — Present and organize into implementation phases.

### Phase S5: Compile Context File

Same template as Compiler Mode Phase 3, but without D-XX numbering.

### Phase S6: Save and Return

Same as Compiler Mode Phase 4.
