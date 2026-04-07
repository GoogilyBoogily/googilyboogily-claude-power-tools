---
name: lld-gather
description: "Compile a structured context file for LLD generation by merging decisions (from lld-discuss), research (from arch-research), and HLD constraints with gap-fill questions. Can also run standalone with direct Q&A when no decisions file exists."
version: 3.0.0
context: fork
argument-hint: "[decisions-file-path] [--hld path-to-hld] [--research path-to-research]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# LLD Context Gathering — Compiler Mode

Compile all context needed to write a Low Level Design document. In the full pipeline, this skill receives a decisions file (from `lld-discuss`), a research file (from `arch-research`), and an HLD reference, then merges them with gap-fill questions to produce the final context file.

**Can also run standalone** — if no decisions file is provided, falls back to direct Q&A mode.

## Input

$ARGUMENTS — path to a decisions file or HLD, and optionally flags.

Parse for:
- **Decisions path** — `docs/context/lld/<name>-decisions.md`
- **HLD path** — `--hld <path>` or first arg if it looks like an HLD file path
- **Research path** — `--research <path>`
- **Description** — if no files, treated as topic for standalone mode

## Source Integrity Rules

**Every factual claim in the context file must be traceable to research performed in this session.**

1. **Cite your work.** Reference specific file paths + line numbers.
2. **Never reference prior Claude sessions or Claude memory.**
3. **Assumptions are labeled, not hidden.**

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Mode Detection

Check if `$ARGUMENTS` points to a decisions file:
- If YES → **Compiler Mode** (Phase 1-4)
- If NO → **Standalone Mode** (Phase S1-S5)

---

## Compiler Mode

### Phase 1: Load Inputs

1. Read the decisions file. Extract all D-XX decisions, HLD Constraints, Existing Code Patterns, Deferred Ideas, Open Questions.
2. If `--hld` provided, read the HLD. Extract:
   - Component boundaries and responsibilities
   - API contracts and data models
   - Key design decisions and rationale
   - Implementation phases and dependencies
3. If `--research` provided, read the RESEARCH.md. If not, check for `<name>-RESEARCH.md`.
4. Scan `docs/lld/` for existing LLDs.

### Phase 2: Gap-Fill Questions

Compare decisions + research + HLD against LLD context needs:

| Required Section | Source | Gap-Fill Needed? |
|-----------------|--------|-----------------|
| Error Handling & Edge Cases | Decisions file (D-XX on error handling) | Ask for specific error codes if missing |
| State & Concurrency | Decisions file | Ask if stateful and not covered |
| Data Contracts | Decisions + HLD API contracts | Ask for exact types if missing |
| Integration Details | Decisions + HLD external systems | Ask for timeouts/retries if missing |
| Performance Constraints | Decisions | Ask for specific numbers if missing |
| Testing Strategy | Decisions (D-XX on testing) | Ask if approach unclear |

**Only ask about genuine gaps.** Present compilation plan:

> "I have implementation decisions, research, and HLD context. Here's what I'll compile. Any gaps?"

### Phase 3: Compile Context File

```markdown
# LLD Context: [Feature/Change Title]

**Gathered:** [today's date]
**HLD Reference:** [path to HLD]
**Decisions file:** [path]
**Research file:** [path, if used]

## HLD Summary

### Problem & Approach
[Extracted from HLD]

### Component Boundaries
| Component | Location | Responsibility |
|-----------|----------|---------------|
| [name] | [path] | [one sentence] |

### Key Design Decisions (from HLD)
- [decision 1] — [rationale]
- [decision 2] — [rationale]

### Implementation Phases (from HLD)
| Phase | Scope | Depends On | Deliverable |
|-------|-------|------------|-------------|

## Implementation Decisions

[Preserved from decisions file — D-XX numbering intact]

### [Category]
- **D-01:** [decision] (User Decision)
  - Rationale: [rationale]
  - Code context: [file:line]
  - Follows/diverges: [consistency with existing patterns]
  - Testing: [test approach]

### Claude's Discretion
- **D-03:** [area] — following existing patterns

## Existing Code Patterns

[From decisions file — patterns that inform implementation]
- Error handling: [pattern] (file:line)
- State management: [pattern] (file:line)
- Testing: [pattern] (file:line)

## User Answers

[Gap-fill answers — only sections where gaps existed]

## Research Summary

### Decision Impact Analysis
[From RESEARCH.md]

### Approach Comparison
[Preserved as table]

### Don't Hand-Roll
[Preserved as table]

| Problem | Don't Build | Use Instead | Why |
|---------|------------|-------------|-----|

### Codebase Findings
[With file:line citations]

| Pattern | Location (file:line) | Reusable? | Adaptation Needed |
|---------|---------------------|-----------|-------------------|

### Gap Analysis

| Expected | Actual | Severity | Impact |
|----------|--------|----------|--------|

### Common Pitfalls

| Pitfall | What Goes Wrong | How to Avoid |
|---------|----------------|--------------|

## Validated HLD Assumptions
- [assumption] — ✅ Confirmed at [path:line]
- [assumption] — ❌ Discrepancy: [what's actually there]

## Reusable Utilities
| Utility | Location | Purpose |
|---------|----------|---------|
| [name] | [path:line] | [what it does] |

## Existing Test Patterns
- Test framework: [framework] at [config path]
- Fixture pattern: [description] at [path]
- Mock pattern: [description] at [path]

## Deferred Ideas

[From decisions file]

## Open Questions

[Merged from decisions + research + gap-fill]

## Template

The LLD must follow the template at `${CLAUDE_SKILL_DIR}/../lld-generate/references/template.md`.
Key sections: Scope, Component Breakdown (public API tables, internal methods, dependencies), Sequence Diagrams, User Flow Diagrams, State Management, Error Handling (error catalog + retry strategy), Data Transformations, Interface Contracts, Design Patterns, File-Level Implementation Plan, Testing Specifications, Assumptions and Open Items.
```

### Phase 4: Save and Return

1. Determine kebab-case name.
2. Create `docs/context/lld/` if needed.
3. Write to `docs/context/lld/<name>-context.md`
4. Tell user: "Context file saved to `<path>`. Run `/architecture-docs:lld-generate <path>` to generate the LLD."

---

## Standalone Mode

Falls back to direct interactive gathering when no decisions file is provided.

### Phase S1: Absorb the HLD

Read the HLD. Extract architecture, components, decisions, phases.

**CHECKPOINT** — Confirm understanding.

### Phase S2: Gap Analysis Questions

Question areas: Error Handling, State & Concurrency, Data Contracts, Integration Details, Performance, Testing Strategy.

### Phase S3: Codebase Exploration

Dispatch parallel code + web research Tasks.

**CHECKPOINT** — Present findings with HLD assumption validation.

### Phase S4: Compile Context File

Same template as Compiler Mode Phase 3, but without D-XX numbering.

### Phase S5: Save and Return

Same as Compiler Mode Phase 4.
