---
name: lld-generate
description: "Generate a Low Level Design document from a gathered context file. Runs with clean context — reads the context file and produces a complete LLD with method signatures, sequence diagrams, error catalogs, and implementation plan. Non-interactive."
context: fork
argument-hint: "[context-file] [--hld path-to-hld]"
allowed-tools: Read, Write, Edit, Glob, Grep
model: opus
---

# LLD Generator

Generate a complete Low Level Design document from a previously gathered context file. This skill runs with clean context and is non-interactive — all questions were answered during the gather phase. Engineers should be able to code directly from this document.

## Input

$ARGUMENTS — path to the context file (e.g., `docs/context/lld/graphql-migration-context.md`), and optionally `--hld <path>` for cross-referencing the predecessor HLD.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Context File**: First non-flag argument
- **HLD Path**: `--hld <path>` (optional, for cross-referencing and back-reference updates)

## Source Integrity Rules

**Every factual claim in this document must be traceable to the context file.**

1. **Ground every claim.** Every factual statement must trace back to a specific entry in the context file.
2. **Flag ungrounded claims.** Mark anything not in the context file as `[ASSUMPTION]`.
3. **Never invent details.** Missing information goes in Assumptions and Open Items — don't fabricate.

## Process

### Step 1: Read Inputs

1. Read the context file from `$ARGUMENTS`.
2. If `--hld` provided, read the HLD for cross-referencing.
3. Read the LLD template at `${CLAUDE_SKILL_DIR}/references/template.md`.

Extract from the context file:
- HLD summary (problem, approach, components, decisions, phases)
- User answers (error handling, state, data contracts, integration details, performance, testing)
- Codebase findings (validated assumptions, reusable utilities, reference implementations, test patterns)
- Web research findings
- Open questions

### Step 2: Determine Output Path

1. Match the HLD's naming convention: if HLD is at `docs/hld/<name>.md`, use `docs/lld/<name>.md`
2. Create the directory if needed.

### Step 3: Generate the LLD

Write the complete LLD document section by section, following the template:

1. **Header** — HLD reference path, author, date, status (Draft).

2. **Scope** (Section 1) — One paragraph. What this LLD covers and what it doesn't. Reference the HLD. Do NOT restate the problem, goals, or architecture overview.

3. **Component Breakdown** (Section 2) — For each component from the context file:
   - **Location**: Actual file path from codebase findings
   - **Responsibility**: One sentence
   - **Public API table**: Method, parameters (with types), returns (with types), description
   - **Internal Methods table**: Same format
   - **Dependencies table**: Dependency, type (internal/external), purpose

   Every method must have concrete parameter and return types. If the context file doesn't specify, use codebase findings for existing patterns or mark as `[ASSUMPTION]`.

4. **Sequence Diagrams** (Section 3) — One mermaid diagram per distinct flow. Split happy path and error path. Ground participant names in actual component names from Section 2.

5. **User Flow Diagrams** (Section 4) — Mermaid flowcharts for user-facing interaction paths. Only include if the feature has user-facing flows.

6. **State Management** (Section 5) — State machine diagram (mermaid stateDiagram-v2) and transition table. Only include if the feature has stateful behavior. Source from user's state/concurrency answers.

7. **Error Handling** (Section 6):
   - **Error Catalog table**: Error code, type, trigger condition, user-facing message, recovery action
   - **Retry Strategy table**: Operation, max retries, backoff, timeout, circuit breaker
   Source from user's error handling answers and web research.

8. **Data Transformations** (Section 7) — For each transformation:
   - Input shape (with types and constraints)
   - Output shape (with types)
   - Transformation logic (pseudocode)
   - Edge cases table

9. **Interface Contracts** (Section 8) — Field-level contracts between components that cross boundaries. Table: field, type, required, constraints, default.

10. **Design Patterns Applied** (Section 9) — Table: pattern, location, rationale. Reference existing patterns from codebase findings.

11. **File-Level Implementation Plan** (Section 10) — Ordered for incremental development. Table: step, file(s), action (create/modify/delete), description, depends on. Each step should be independently reviewable as a PR.

12. **Testing Specifications** (Section 11):
    - **Unit Tests table**: Test case, method under test, input, expected output, fixture/mock
    - **Integration Tests table**: Test case, flow, setup, assertions
    Follow existing test patterns from codebase findings.

13. **Assumptions and Open Items** (Section 12):
    - **Assumptions table**: #, assumption, impact if wrong
    - **Open Items table**: #, question, owner, deadline

### Writing Principles

- **Tables over prose.** LLD is a reference document, not a narrative.
- **No repeated HLD sections.** Don't restate problem, goals, or architecture overview. Reference the HLD.
- **Concrete types everywhere.** Every method signature has parameter types, return types, and nullability.
- **Use existing patterns.** When codebase findings show an existing pattern (error handling, validation, etc.), follow it rather than inventing a new one.

### Step 4: Update Predecessor Documents

If `--hld` was provided:
1. Read the HLD.
2. Add a forward reference in its **References** section:
   > See [LLD: {title}]({relative-path-to-lld}) for implementation details.

3. If the HLD references an ADR, also update the ADR's "More Information" section:
   > See [LLD: {title}]({relative-path-to-lld}) for implementation details.

   Mention: "This completes the ADR → HLD → LLD pipeline for this decision."

### Step 5: Save

1. Write the complete LLD using the Write tool in a single call with the full document.
2. Re-read the saved file to verify it follows the template.
3. Report the saved file path.

## Output

Report: "LLD saved to `<path>`. Run `/architecture-docs:audit-lld <path> --context <context-file-path>` (with optional `--hld <hld-path>`) to audit it."
