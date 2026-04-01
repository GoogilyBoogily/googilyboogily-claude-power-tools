---
name: lld-gather
description: "Gather context and requirements for a Low Level Design document. Interactive Q&A session that explores the codebase, researches online, and compiles a structured context file for the LLD generator. Use after an HLD is stable and ready for implementation detail."
context: fork
argument-hint: "[description] [--hld path-to-hld]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# LLD Context Gathering

Gather all context needed to write a Low Level Design document. This skill reads the HLD, asks implementation-level questions, explores the codebase for reusable utilities and real interfaces, researches online, and compiles everything into a structured context file that the `lld-generate` skill consumes.

## Input

$ARGUMENTS — a description or path to an HLD, and optionally `--hld <path>` to explicitly reference the predecessor HLD.

If no HLD path is provided, ask which HLD to drill into.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Description**: The non-flag text
- **HLD Path**: `--hld <path>` or the first argument if it looks like a file path

## Source Integrity Rules

**Every factual claim in the context file must be traceable to research performed in this session.**

1. **Cite your work.** Reference specific file paths + line numbers.
2. **Never reference prior Claude sessions or Claude memory.**
3. **Assumptions are labeled, not hidden.** Unresearched claims go in Open Questions.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Phase 1: Absorb the HLD

Read the HLD document. Extract and internalize:
- Problem, approach, and architecture
- Component boundaries and responsibilities
- Key design decisions and their rationale
- Codebase impact (files to modify/create/delete)
- Implementation phases
- Open questions and assumptions

**CHECKPOINT — Confirm HLD Understanding:**
Present a summary covering:
- The approach and architecture
- Component boundaries and responsibilities
- Key design decisions
- Open questions carried forward

Ask: "Is my understanding of the HLD correct? Anything I'm misreading before I proceed?"

### Phase 2: Gap Analysis Questions

Identify implementation-level ambiguities the HLD intentionally left unresolved. Batch questions using AskUserQuestion. Focus on gaps where the answer materially changes implementation.

**Question areas:**

1. **Error Handling & Edge Cases** — What happens when X fails? What are the error codes? How are errors surfaced to users?
2. **State & Concurrency** — What state transitions exist? Are there race conditions to handle? Locking strategy?
3. **Data Contracts** — Exact types, nullability, defaults, validation rules for interfaces between components.
4. **Integration Details** — Timeouts, retries, circuit breakers, rate limits for external dependencies.
5. **Performance Constraints** — Hot paths to optimize, size limits, batching strategies, caching decisions.
6. **Testing Strategy** — What test patterns to follow? What fixtures/mocks are needed? Integration test infrastructure requirements?

If the user says "use your judgment," make a reasonable decision but note it as an assumption.

### Phase 3: Codebase Exploration

Dispatch two parallel Tasks in a single message:

**Task 1 — Code Research:**
```
Invoke /architecture-docs:code-research focused on:
- Validate that interfaces assumed in the HLD actually exist
- Find reusable utilities (error handling, validation, logging patterns)
- Trace a similar flow end-to-end as a reference implementation
- Check for conflicts with in-progress work
- Identify existing test patterns and fixtures
```

**Task 2 — Web Research:**
```
Invoke /architecture-docs:web-research focused on:
- Implementation patterns for the specific technologies involved
- Library/SDK API details for external dependencies
- Known gotchas and edge cases in similar implementations
```

After both return, review and filter findings.

**CHECKPOINT — Present Exploration Findings:**
Present findings:
- HLD assumptions validated against codebase reality
- Discrepancies between HLD and actual codebase
- Reusable utilities and patterns discovered
- Reference implementations traced
- Conflicts with in-progress work

Ask: "Any discrepancies concern you? Should I investigate any area more deeply?"

### Phase 4: Compile Context File

Assemble all gathered information:

```markdown
# LLD Context: [Feature/Change Title]

**Gathered:** [today's date]
**HLD Reference:** [path to HLD]
**Description:** [what is being detailed]

## HLD Summary

### Problem & Approach
[Extracted from HLD]

### Component Boundaries
| Component | Location | Responsibility |
|-----------|----------|---------------|
| [name] | [path] | [one sentence] |

### Key Design Decisions
- [decision 1] — [rationale]
- [decision 2] — [rationale]

### Implementation Phases (from HLD)
| Phase | Scope | Depends On | Deliverable |
|-------|-------|------------|-------------|
| 1 | [scope] | — | [deliverable] |

## User Answers

### Error Handling & Edge Cases
[User's answers]

### State & Concurrency
[User's answers]

### Data Contracts
[User's answers]

### Integration Details
[User's answers]

### Performance Constraints
[User's answers]

### Testing Strategy
[User's answers]

## Codebase Findings

### Validated HLD Assumptions
- [assumption] — ✅ Confirmed at [path:line]
- [assumption] — ❌ Discrepancy: [what's actually there]

### Reusable Utilities
| Utility | Location | Purpose |
|---------|----------|---------|
| [name] | [path:line] | [what it does] |

### Reference Implementation
[Path to similar flow traced end-to-end, with key file:line markers]

### Existing Test Patterns
- Test framework: [framework] at [config path]
- Fixture pattern: [description] at [path]
- Mock pattern: [description] at [path]

### Conflicts with In-Progress Work
- [conflict description, if any]

## Web Research Findings

[Structured findings with URLs]

## Open Questions

- [Anything unresolved or marked as assumptions]

## Template

The LLD must follow the template at `${CLAUDE_SKILL_DIR}/../lld-generate/references/template.md`.
Key sections: Scope, Component Breakdown (public API tables, internal methods, dependencies), Sequence Diagrams (happy + error paths), User Flow Diagrams, State Management (state machine + transition table), Error Handling (error catalog + retry strategy), Data Transformations, Interface Contracts, Design Patterns, File-Level Implementation Plan, Testing Specifications, Assumptions and Open Items.
```

### Phase 5: Save and Return

1. Determine the kebab-case name from the feature/change title.
2. Create the directory if needed: `docs/context/lld/`
3. Write the context file to `docs/context/lld/<name>-context.md`
4. Return the context file path.

Tell the user: "Context file saved to `<path>`. Review and edit it if needed, then run `/architecture-docs:lld-generate <path>` (with optional `--hld <hld-path>`) to generate the LLD."
