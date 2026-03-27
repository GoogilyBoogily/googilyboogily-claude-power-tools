---
name: hld-gather
description: "Gather context and requirements for a High Level Design document. Interactive Q&A session that explores the codebase, researches online, and compiles a structured context file for the HLD generator. Use when planning significant architectural changes."
disable-model-invocation: true
context: fork
argument-hint: "[description] [--adr path-to-adr]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# HLD Context Gathering

Gather all context needed to write a High Level Design document. This skill asks clarifying questions, explores the codebase, researches online, and compiles everything into a structured context file that the `hld-generate` skill consumes.

## Input

$ARGUMENTS — a description of what to build or change, and optionally `--adr <path>` to reference a predecessor ADR.

If invoked with `--adr` or with text like "based on ADR at <path>", read the ADR and use it as the primary input — no separate description needed.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Description**: The non-flag text (or "from ADR" if ADR path provided)
- **ADR Path**: `--adr <path>` or extracted from "based on ADR at <path>"

## Source Integrity Rules

**Every factual claim in the context file must be traceable to research performed in this session.**

1. **Cite your work.** Reference specific file paths + line numbers from Read, Grep results, or Explore agent findings.
2. **Never reference prior Claude sessions or Claude memory.**
3. **Assumptions are labeled, not hidden.** Unresearched claims go in Open Questions.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Phase 1: Understand the Goal

1. Read the user's description. If an ADR path is provided, read the ADR and extract:
   - The decision, context, and decision drivers
   - The chosen option and its rationale
   - Consequences and confirmation strategy
   - Any open questions carried forward

2. Confirm understanding with the user.

**CHECKPOINT — Confirm Understanding:**
Present your understanding of:
- The problem being solved
- The envisioned end state
- Stated constraints (tech choices, timelines, compatibility)

Ask: "Is my understanding correct? Anything I'm missing before I start asking detailed questions?"

### Phase 2: Clarifying Questions

Ask clarifying questions using AskUserQuestion. Focus on areas where the answer materially changes the architecture. Batch related questions.

**Before asking questions**, present which question areas are relevant and why. Ask the user to confirm, add, or remove topics.

**Question areas:**

1. **Scope Boundaries** — What's in and out of scope? What adjacent concerns should NOT be addressed?
2. **Consumers & Expectations** — Who/what uses this? What are their performance, reliability, and API expectations?
3. **Data Entities** — What new data entities are needed? Where do they live? What are their lifecycles?
4. **External Systems** — What external systems are involved? What are their failure modes and SLAs?
5. **Non-Functional Requirements** — Performance targets, scale expectations, security requirements, backward compatibility needs.
6. **Deployment & Rollout** — Deployment strategy, feature flags, rollback plan, migration needs.

### Phase 3: Research

Dispatch two parallel Tasks in a single message:

**Task 1 — Code Research:**
```
Invoke /architecture-docs:code-research focused on:
- Existing patterns in the affected area
- Current implementation state
- Integration points and dependencies
- Similar features or prior approaches as precedent
- Existing test patterns
```

**Task 2 — Web Research:**
```
Invoke /architecture-docs:web-research focused on:
- Best practices for the architectural approach
- Known pitfalls and failure modes
- Relevant framework/library documentation
- Industry patterns and standards
```

After both return, review and filter findings for relevance.

**CHECKPOINT — Present Research Findings:**
Present structured findings:
- Affected modules and files
- Existing patterns and conventions discovered
- Integration points and dependencies
- Precedent found (similar features, prior approaches)
- Relevant external best practices

Ask: "Does this match your understanding? Should I explore any area more deeply?"

### Phase 4: Codebase Impact Analysis

Using the exploration findings, produce a concrete change map:

1. **Files to modify** — existing files that need changes
2. **Files to create** — new files/modules needed
3. **Files to delete/deprecate** — code being replaced
4. **Configuration changes** — env vars, feature flags, build changes
5. **Database/schema changes** — new tables, columns, indexes, migrations

**CHECKPOINT — Present Change Map:**
Present the change map and highlight:
- Scope surprises (larger or smaller than expected)
- Risks or concerns discovered

Ask: "Does this scope look right? Anything missing or unexpected?"

After approval, organize into **Implementation Phases**:
1. Foundational changes first (schema, shared infrastructure)
2. Group related changes that should ship together
3. Note parallelizable vs strictly sequential work
4. Define a clear deliverable per phase

### Phase 5: Compile Context File

Assemble all gathered information:

```markdown
# HLD Context: [Feature/Change Title]

**Gathered:** [today's date]
**Description:** [what is being built/changed]
**ADR Reference:** [path to ADR, if applicable]

## Problem Statement

[From ADR or user description]

## Goals and Non-Goals

### Goals
- [Specific, measurable outcomes]

### Non-Goals
- [Explicitly out of scope]

## User Answers

### Scope Boundaries
[User's answers]

### Consumers & Expectations
[User's answers]

### Data Entities
[User's answers]

### External Systems
[User's answers]

### Non-Functional Requirements
[User's answers]

### Deployment & Rollout
[User's answers]

## ADR Context

[If applicable: extracted decision, drivers, chosen option, rationale, consequences]

## Codebase Findings

[Structured findings with file:line citations]

### Affected Modules
- [module] at [path] — [what it does, why it's affected]

### Existing Patterns
- [pattern name] found at [path:line] — [how it's relevant]

### Integration Points
- [component A] ↔ [component B] — [how they interact]

## Web Research Findings

[Structured findings with URLs]

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
| `path/to/old` | [why it's being removed] |

### Configuration Changes
- [env vars, feature flags, build changes]

### Database/Schema Changes
- [tables, columns, indexes, migrations]

## Implementation Phases

| Phase | Scope Summary | Depends On | Deliverable |
|-------|---------------|------------|-------------|
| 1 | [scope] | — | [deliverable] |
| 2 | [scope] | Phase 1 | [deliverable] |

## Open Questions

- [Anything unresolved]

## Template

The HLD must follow the template at `${CLAUDE_SKILL_DIR}/../hld-generate/references/template.md`.
Key sections: Problem Statement, Goals/Non-Goals, Proposed Solution (Overview, Architecture, Data Model, API Design, Key Design Decisions), Alternatives Considered (≥2 with honest tradeoffs), Codebase Impact, Security, Performance, Reliability, Observability, Migration, Testing, Open Questions, Implementation Phases, References.
```

### Phase 6: Save and Return

1. Determine the kebab-case name from the feature/change title.
2. Create the directory if needed: `docs/context/hld/`
3. Write the context file to `docs/context/hld/<name>-context.md`
4. Return the context file path.

Tell the user: "Context file saved to `<path>`. Review and edit it if needed, then run `/architecture-docs:hld-generate <path>` (with optional `--adr <adr-path>`) to generate the HLD."
