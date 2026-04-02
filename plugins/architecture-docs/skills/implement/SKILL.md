---
name: implement
description: Architecture Document Implementation — ingests an HLD or LLD, performs gap analysis against the codebase, creates a phased implementation plan, and executes phase-by-phase with user approval
argument-hint: "[path-to-hld-or-lld]"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
---

# Architecture Document Implementation

Translate an HLD or LLD into working code through phased, verified implementation. Performs gap analysis against the current codebase, creates an ordered implementation plan, and executes each phase with explicit user approval before proceeding.

## When to Use

Use after an HLD or LLD is finalized and ready for implementation. Works best with LLDs (which contain file-level implementation plans), but can also work from HLDs at a higher level.

When invoked from the LLD pipeline, the document path is provided — proceed directly to Phase 1.

## Source Integrity Rules

**Every factual claim about the codebase must be verified through tool calls in this session.**

1. **Cite your work.** When referencing code, patterns, or architecture, cite the specific tool call that discovered it (file path + line number from Read, Grep result, Explore agent finding).
2. **Never reference prior Claude sessions or Claude memory.** Do not source implementation decisions from auto-memory, MCP memory tools, or cross-session context.
3. **Assumptions are labeled, not hidden.** If you lack evidence for a claim and cannot research it, explicitly label it as an assumption.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.** Each implementation phase requires explicit sign-off before moving to the next.

### Phase 1: Absorb the Design Document

1. Read the document at the path provided via `$ARGUMENTS`. If no path is provided, ask which HLD or LLD to implement.
2. Detect document type (HLD vs LLD) from content and structure:
   - LLD indicators: method signatures, sequence diagrams, file-level implementation plan, error catalogs
   - HLD indicators: component diagrams, trade-off analysis, high-level architecture
3. If HLD: check if a corresponding LLD exists (look for `lld-` variant of the filename, or references in the HLD). If found, suggest reading both. If not, note that implementation will proceed at a higher level of abstraction.
4. Extract key elements:
   - **Goals** — what the implementation achieves
   - **Components** — modules, services, files involved
   - **Implementation phases** — if the doc defines them
   - **File-level plan** — specific files to create/modify (LLD)
   - **Dependencies** — libraries, services, infrastructure
   - **Assumptions** — stated assumptions that need validation
   - **Open questions** — unresolved items from the design process

**CHECKPOINT — Confirm Understanding:**
Present a summary covering:
- Document type and scope
- Goals being implemented
- Components and their responsibilities
- Implementation phases (from doc or to be derived)
- Key dependencies and assumptions

Ask: "Is my understanding of the design correct? Anything I'm misreading or missing before I analyze the codebase?"

Do NOT proceed until the user confirms.

### Phase 2: Codebase Reality Check (Gap Analysis)

Perform deep codebase exploration against every reference in the design document. Use the Explore agent, Glob, Grep, and Read tools extensively.

Detect gaps in these categories:

| Category | Description | Example |
|----------|-------------|---------|
| **Phantom references** | Files, functions, or modules referenced in the doc but don't exist | Doc says "modify `src/auth/middleware.ts`" but file doesn't exist |
| **Stale interfaces** | API signatures, types, or contracts that have changed since the doc was written | Function signature has different parameters than doc assumes |
| **Missing dependencies** | Packages, tools, or services needed but not in package.json / requirements | Doc assumes a library that isn't installed |
| **Assumption drift** | "Current State" sections that no longer match reality | Doc says "currently using REST" but codebase has migrated to GraphQL |
| **Scope gaps** | Areas not covered in design but required for implementation | No mention of database migrations, config changes, or test updates |
| **Conflict detection** | In-progress work (uncommitted changes, open PRs) that overlaps with implementation scope | Another branch is modifying the same files |

Classify each gap:
- 🔴 **Blocking** — cannot proceed without resolution (e.g., fundamental architecture assumption is wrong)
- 🟡 **Warning** — can proceed but implementation will diverge from doc (e.g., interface changed)
- 🔵 **Info** — noted for awareness, no impact on implementation (e.g., minor naming difference)

**CHECKPOINT — Gap Analysis Results:**
Present all gaps organized by category and severity.

The design document is **never modified** — gaps are noted and implementation proceeds based on codebase reality.

Ask the user:
1. **Proceed** — implement with gaps noted as known discrepancies
2. **Research** — do additional code or web research on specific gaps before proceeding
3. **Abort** — too many blocking gaps, return to design phase

Do NOT proceed until the user confirms.

### Phase 3: Create Implementation Plan

1. If the design doc defines implementation phases, use as the starting point. Otherwise, derive phases from component analysis.
2. For each phase, define:

| Field | Description |
|-------|-------------|
| **Phase name** | Short descriptive name |
| **Scope** | Files to create, modify, or delete |
| **Dependencies** | Which phases must complete first |
| **Deliverable** | What's verifiable when done |
| **Complexity** | Small / Medium / Large |
| **Test strategy** | How to verify (unit tests, type check, lint, manual) |

3. Order phases by dependency chain — no phase starts until its dependencies are complete.
4. Note any gaps from Phase 2 that affect specific phases.

**CHECKPOINT — Approve Implementation Plan:**
Present the full plan with all phases, their scope, ordering, and complexity estimates.

Ask: "Does this plan look right? Would you like to reorder, merge, split, or modify any phases? Any phases you want to skip or add?"

Do NOT begin implementation until the user approves the plan.

### Phase 4+N: Execute Phases (one per iteration)

For each implementation phase:

1. **Announce** — state the phase name, scope, and what will happen
2. **Execute** — create, modify, or delete files as planned
   - Follow existing code conventions discovered during gap analysis
   - Reference the design document for specifications
   - Handle gaps noted in Phase 2 pragmatically (use codebase reality, not stale doc references)
3. **Verify** — run applicable checks:
   - Type checking (if TypeScript/typed language)
   - Linting (if linter configured)
   - Tests (run existing tests to ensure no regressions; run new tests if written)
   - Build (if build system exists)
4. **CHECKPOINT — Phase Review:**
   Present:
   - Summary of what was implemented
   - Key diffs or file changes
   - Verification results (pass/fail)
   - Any deviations from the plan and why

   Ask: "How does this phase look? Ready for the next phase, or should something change?"

5. If the user requests changes → make them, re-verify, re-present
6. Only proceed to the next phase after explicit approval

### Final Phase: Wrap-Up

After all implementation phases are complete:

1. **Summary** — present all changes across all phases:
   - Files created, modified, deleted
   - Total scope of changes
   - All verification results
2. **Deferred items** — list any gaps from Phase 2 that remain unresolved or were worked around
3. **Open questions** — surface anything discovered during implementation that needs design-level decisions
4. **Design doc references** — if appropriate, suggest updating the design document's status or adding implementation references (but do NOT modify the design doc without user approval)

Ask the user what to do next via `AskUserQuestion`:
1. **Run full test suite** — verify everything together
2. **Commit changes** — commit with a descriptive message referencing the design doc
3. **Create PR** — commit and open a pull request
4. **Continue** — there's more to implement or adjust
5. **Done** — end the session
