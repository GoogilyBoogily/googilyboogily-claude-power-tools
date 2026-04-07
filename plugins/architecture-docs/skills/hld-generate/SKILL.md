---
name: hld-generate
description: "Generate a High Level Design document from a gathered context file. Runs with clean context — reads the context file and produces a complete HLD. Non-interactive."
version: 2.0.0
context: fork
argument-hint: "[context-file] [--adr path-to-adr]"
allowed-tools: Read, Write, Edit, Glob, Grep
model: opus
---

# HLD Generator

Generate a complete High Level Design document from a previously gathered context file. This skill runs with clean context and is non-interactive — all questions were answered during the gather phase.

## Input

$ARGUMENTS — path to the context file (e.g., `docs/context/hld/graphql-migration-context.md`), and optionally `--adr <path>` for cross-referencing the predecessor ADR.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Context File**: First non-flag argument
- **ADR Path**: `--adr <path>` (optional, for cross-referencing and back-reference updates)

## Source Integrity Rules

**Every factual claim in this document must be traceable to the context file.**

1. **Ground every claim.** Every factual statement must trace back to a specific entry in the context file (user answers, codebase findings with file:line, or web research with URLs).
2. **Flag ungrounded claims.** If you need to state something not in the context file, mark it explicitly as `[ASSUMPTION]`.
3. **Never invent details.** If the context file doesn't cover something, put it in Open Questions — don't fabricate.

## Process

### Step 1: Read Inputs

1. Read the context file from `$ARGUMENTS`.
2. If `--adr` provided, read the ADR for cross-referencing.
3. Read the HLD template at `${CLAUDE_SKILL_DIR}/references/template.md`.

Extract from the context file:
- Problem statement and goals/non-goals
- User answers (scope, consumers, data entities, external systems, NFRs, deployment)
- ADR context (if applicable)
- Codebase findings with file:line citations
- Web research findings with URLs
- Change map (files to modify/create/delete, config changes, schema changes)
- Implementation phases
- Open questions

### Step 2: Determine Output Path

1. If `docs/` exists, propose `docs/hld/<kebab-case-name>.md`
2. If `rfcs/` or `designs/` exists, use that directory
3. Otherwise, propose `docs/hld/<kebab-case-name>.md`
4. Create the directory if needed.

### Step 3: Generate the HLD

Write the complete HLD document section by section, following the template structure:

1. **Header** — Author, date, status (Draft), reviewers from context file stakeholders.

2. **Problem Statement** (Section 1) — From context file's problem statement. Ground in codebase/research findings.

3. **Goals and Non-Goals** (Section 2) — From context file. Goals must be specific and measurable. Non-goals explicitly scope out adjacent concerns.

4. **Proposed Solution** (Section 3):
   - **Overview**: 2-3 paragraph summary from context file's approach.
   - **Architecture**: Component-level description using codebase findings. Include mermaid diagrams (system architecture, sequence for key flows).
   - **Data Model**: From context file's data entities answers. Include entity definitions, relationships, storage, access patterns.
   - **API Design**: From context file. Endpoint/method signatures, request/response shapes, error cases.
   - **Key Design Decisions**: From ADR decisions and user answers. Explain what, why, and tradeoffs.

5. **Alternatives Considered** (Section 4) — At least 2 alternatives with honest tradeoff analysis. A design claiming no downsides is hiding something. Source from ADR's rejected options if available.

6. **Codebase Impact** (Section 5) — Direct translation of the context file's change map. Reference actual file paths from codebase findings.

7. **Security Considerations** (Section 6) — From NFR answers and web research.

8. **Performance & Scalability** (Section 7) — From NFR answers and web research. Include specific targets if provided.

9. **Reliability & Failure Modes** (Section 8) — From external systems answers. What can go wrong and how the system handles it.

10. **Observability** (Section 9) — Key metrics, alerting, logging strategy.

11. **Migration & Rollout Strategy** (Section 10) — From deployment answers. Deployment sequence, feature flags, rollback.

12. **Testing Strategy** (Section 11) — From context file. New test categories, key scenarios, infrastructure changes.

13. **Open Questions** (Section 12) — Unresolved items from context file plus any gaps discovered during generation.

14. **Implementation Phases** (Section 13) — From context file's implementation phases. Format as table with dependencies + mermaid dependency diagram.

15. **References** (Section 14) — ADR reference, related docs, external documentation from web research.

### Writing Guidelines

- **Be concrete about the codebase.** Reference actual file paths and function names from codebase findings.
- **Acknowledge tradeoffs honestly.** Every design has tradeoffs.
- **Keep it scannable.** Aim for 3-10 pages. If exceeding 10 pages, note that splitting may be warranted.
- **Use mermaid diagrams** for architecture, sequence flows, data models, and phase dependencies.

### Step 4: Update Predecessor Documents

If `--adr` was provided:
1. Read the ADR.
2. Add a forward reference in its "More Information" section (create the section if needed):
   > See [HLD: {title}]({relative-path-to-hld}) for implementation design.

### Step 5: Decision Coverage Verification

Before saving, verify that every D-XX decision from the context file is addressed in the HLD.

**Build an internal coverage matrix (do NOT include in the output document):**

| Decision | Section(s) Addressing It | Coverage |
|----------|-------------------------|----------|
| D-01 | Key Design Decisions, §3.1 Architecture | Full |
| D-02 | API Design, §3.4 | Full |
| D-03 | — | MISSING |

**Rules:**
- Every **User Decision** D-XX MUST map to at least one section → if MISSING, add content to address it before saving
- **Claude's Discretion** D-XX should be addressed where relevant, but gaps are acceptable
- **Scope reduction prevention:** If a User Decision is addressed but with weakened language ("placeholder", "v1", "simplified", "for now", "basic version", "static for now"), strengthen it to match the decision's full intent
- If the context file has no D-XX decisions (standalone mode), skip this step

### Step 6: Save

1. Write the complete HLD using the Write tool in a single call with the full document.
2. Re-read the saved file to verify it follows the template.
3. Report the saved file path.

## Output

Report: "HLD saved to `<path>`. Run `/architecture-docs:audit-hld <path> --context <context-file-path>` (with optional `--adr <adr-path>`) to audit it."
