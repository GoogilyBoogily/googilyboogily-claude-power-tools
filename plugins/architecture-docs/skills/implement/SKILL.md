---
name: implement
description: "Architecture Document Implementation — ingests an HLD or LLD, performs gap analysis, establishes goal-backward must-haves, creates a phased plan, executes with verification, and validates goals were achieved. Supports pause/resume for multi-session implementation."
version: 3.0.0
argument-hint: "[path-to-hld-or-lld] [--resume]"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent, AskUserQuestion
model: opus
---

# Architecture Document Implementation

Translate an HLD or LLD into working code through phased, verified implementation with goal-backward verification. Performs gap analysis, establishes must-haves before execution, and verifies the actual goals were achieved — not just that tasks completed.

## When to Use

Use after an HLD or LLD is finalized and ready for implementation. Works best with LLDs (which contain file-level implementation plans), but can also work from HLDs at a higher level.

Use `--resume` to continue from a paused implementation session.

## Source Integrity Rules

**Every factual claim about the codebase must be verified through tool calls in this session.**

1. **Cite your work.** When referencing code, patterns, or architecture, cite the specific tool call that discovered it (file path + line number from Read, Grep result, Explore agent finding).
2. **Never reference prior Claude sessions or Claude memory.** Do not source implementation decisions from auto-memory, MCP memory tools, or cross-session context.
3. **Assumptions are labeled, not hidden.** If you lack evidence for a claim and cannot research it, explicitly label it as an assumption.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.** Each implementation phase requires explicit sign-off before moving to the next.

### Resume Check

If `--resume` is set or `.continue-here.md` exists in the project root:

1. Read `.continue-here.md`
2. Present what was completed, what remains, and any anti-patterns encountered
3. Ask: "Resume from where we left off?"
4. If yes: skip to the recorded next action
5. If no: start fresh (rename `.continue-here.md` to `.continue-here-<timestamp>.md`)

---

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
   - **D-XX decisions** — if the context file has numbered decisions, extract them for coverage tracking

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
- 🔴 **Blocking** — cannot proceed without resolution
- 🟡 **Warning** — can proceed but implementation will diverge from doc
- 🔵 **Info** — noted for awareness, no impact

**CHECKPOINT — Gap Analysis Results:**
Present all gaps organized by category and severity.

The design document is **never modified** — gaps are noted and implementation proceeds based on codebase reality.

Ask the user:
1. **Proceed** — implement with gaps noted as known discrepancies
2. **Research** — do additional code or web research on specific gaps
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

Ask: "Does this plan look right? Would you like to reorder, merge, split, or modify any phases?"

Do NOT begin implementation until the user approves the plan.

### Phase 3.5: Establish Must-Haves (Goal-Backward Verification Targets)

Before executing, extract verifiable goals from the design document. These are what we'll check AFTER implementation to confirm success — not task completion, but goal achievement.

**Extract three categories:**

1. **Observable Truths (T-XX)** — 3-7 testable behaviors that MUST be true when done:
   - "T-01: GraphQL endpoint responds at /graphql with valid schema introspection"
   - "T-02: Auth middleware rejects requests without valid JWT with 401 status"
   - "T-03: Database migration runs without error on empty and populated databases"

2. **Concrete Artifacts (A-XX)** — files that MUST exist with substantive content (not stubs):
   - "A-01: `src/graphql/schema.ts` — must contain type definitions, not just re-exports"
   - "A-02: `src/graphql/resolvers/` — must have resolver files with actual query implementations"

3. **Key Links (L-XX)** — critical wiring between components where stubs hide:
   - "L-01: Router at `src/routes/index.ts` imports and mounts the GraphQL handler"
   - "L-02: GraphQL resolvers import and call the data access layer, not hardcoded data"

**CHECKPOINT — Approve Must-Haves:**

Present the must-haves table:

| ID | Category | Description | How to Verify |
|----|----------|-------------|---------------|
| T-01 | Truth | GraphQL responds with schema | `curl /graphql` + check introspection |
| A-01 | Artifact | schema.ts has type defs | Read file, check >10 lines with type keywords |
| L-01 | Link | Router mounts handler | Grep for import in routes/index.ts |

Ask: "These are the goals I'll verify after implementation. Any to add, remove, or adjust?"

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

   Ask the user via AskUserQuestion:
   - **Next phase** — "Looks good, continue" ⭐
   - **Adjust** — "Make changes before continuing"
   - **Pause** — "Save progress and continue later"

5. If the user requests changes → make them, re-verify, re-present
6. If **Pause** → write `.continue-here.md` (see Anti-Pattern Tracking below), update PIPELINE-STATE.md if it exists
7. Only proceed to the next phase after explicit approval

### Final Phase: Goal-Backward Verification + Wrap-Up

After all implementation phases are complete, verify the must-haves established in Phase 3.5:

**For each must-have:**
- **T-XX (Truths):** Verify via grep, read, test command, or curl — the behavior must be observable
- **A-XX (Artifacts):** Verify file exists AND has substantive content:
  - Check file exists (Glob)
  - Check line count (>10 lines for non-trivial artifacts)
  - Check for actual logic (not just imports/re-exports/empty functions)
- **L-XX (Links):** Verify the wiring chain exists:
  - Check import statements (Grep)
  - Check function calls / usage (Grep for function name in consuming file)
  - Trace from entry point to implementation

**Present verification results:**

| ID | Description | Status | Evidence |
|----|-------------|--------|----------|
| T-01 | GraphQL responds | ✅ VERIFIED | schema introspection returns 12 types |
| A-01 | schema.ts exists | ✅ VERIFIED | 142 lines, 8 type definitions |
| A-02 | Resolvers exist | ⚠️ PARTIAL | 3 of 5 resolvers implemented |
| L-01 | Router mounts handler | ❌ FAILED | No import found in routes/index.ts |

**If any must-haves FAILED or PARTIAL:**

Ask via AskUserQuestion:
- **Fix now** — "Add an implementation phase to address the gaps" ⭐
- **Defer** — "Document as known gap, continue to wrap-up"
- **Accept** — "This is acceptable as-is, explain why"

If **Fix now:** Create and execute additional phase(s) targeting only the failed must-haves. Re-verify after.

**Wrap-Up (after verification passes or gaps are accepted):**

1. **Summary** — present all changes across all phases:
   - Files created, modified, deleted
   - Total scope of changes
   - All verification results (including must-haves)
2. **Must-haves status** — final pass/fail table
3. **Deferred items** — list any gaps from Phase 2 or failed must-haves that remain
4. **Open questions** — surface anything discovered during implementation that needs design-level decisions
5. **Design doc references** — suggest updating the design document's status (but do NOT modify without approval)

Ask the user what to do next via AskUserQuestion:
1. **Run full test suite** — verify everything together
2. **Commit changes** — commit with a descriptive message referencing the design doc
3. **Create PR** — commit and open a pull request
4. **Continue** — there's more to implement or adjust
5. **Done** — end the session

---

## Anti-Pattern Tracking

If implementation is paused or fails mid-flight, write `.continue-here.md` in the project root:

```markdown
# Implementation Handoff: [topic]

**Design doc:** [path]
**Paused at:** [YYYY-MM-DD HH:MM]
**Paused during:** Phase [N]: [name]

## Completed Phases
| Phase | Name | Files Changed | Status |
|-------|------|---------------|--------|
| 1 | [name] | [count] | Complete |
| 2 | [name] | [count] | Complete |

## Remaining Phases
| Phase | Name | Scope | Blocked By |
|-------|------|-------|------------|
| 3 | [name] | [scope] | [blocker or —] |

## Must-Haves Status
| ID | Description | Status |
|----|-------------|--------|
| T-01 | [truth] | Not yet verified |
| A-01 | [artifact] | Partially complete |

## Anti-Patterns Encountered
| Issue | Severity | What Happened | Prevention |
|-------|----------|---------------|------------|
| [issue] | [blocking/warning] | [description] | [how to prevent recurrence] |

## Next Action
[Specific instruction for the resuming session, e.g., "Wire handler to router at src/routes/index.ts, then continue Phase 3"]
```

**On resume:** The next session MUST acknowledge anti-patterns before proceeding. For each blocking anti-pattern, answer: "What is it? How will I prevent it this time?"
