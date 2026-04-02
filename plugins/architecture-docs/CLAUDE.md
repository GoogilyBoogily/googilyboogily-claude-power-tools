# CLAUDE.md — architecture-docs

## Purpose

ADR → HLD → LLD documentation pipeline with 1:N:M fan-out support. One Architecture Decision Record can spawn multiple High Level Designs (one per subsystem), and each HLD can spawn multiple Low Level Designs (one per component). Every document type follows the same gather → generate → audit cycle with context isolation.

## Key Files

| File/Directory | Role |
|----------------|------|
| `skills/arch-pipeline/SKILL.md` | Orchestrator — manages the full ADR→HLD→LLD pipeline with fan-out loops and state tracking |
| `skills/adr-gather/SKILL.md` | ADR gather phase — interactive Q&A with parallel code + web research |
| `skills/adr-generate/SKILL.md` | ADR generate phase — reads context file, produces MADR 4.0.0 document |
| `skills/audit-adr/SKILL.md` | ADR audit phase — interactive issue walk-through with resolution options |
| `skills/hld-generate/references/template.md` | HLD document template — defines required sections and structure |
| `skills/audit-adr/references/checklist.md` | ADR audit checklist — severity-tagged quality checks |
| `skills/code-research/SKILL.md` | Parallel code exploration agent dispatched during gather phases |
| `skills/web-research/SKILL.md` | Parallel web research agent dispatched during gather phases |
| `skills/doc-review/SKILL.md` | PR-aware document review — pulls GitHub PR comments on ADR/HLD/LLD files |
| `skills/implement/SKILL.md` | Implementation skill — ingests HLD/LLD, performs gap analysis, executes phase-by-phase |

## Local Conventions

- **1:N:M fan-out**: The orchestrator supports branching — 1 ADR → N HLDs → M LLDs per HLD. Loop indices track which document is being processed.
- **State tracking via indexed arrays**: The orchestrator maintains `$ADR_PATH`, `$HLD_PATHS[]`, `$HLD_AUDIT_VERDICTS[]`, `$LLD_PATHS[i][]` to coordinate across phases.
- **Context isolation**: Every phase skill uses `context: fork`. The orchestrator never holds document content — only file paths and verdicts.
- **Gather = interactive, Generate = non-interactive, Audit = interactive**: Gather phases run Q&A with the user + parallel research forks. Generate phases read a context file and produce a document silently. Audit phases walk through issues one-by-one.
- **Parallel research during gather**: Gather phases dispatch `code-research` and `web-research` as parallel agents, merging findings into the context file before generation.
- **Templates and checklists in `references/`**: Generate skills load templates via `${CLAUDE_SKILL_DIR}/references/template.md`. Audit skills load checklists the same way.
- **MADR 4.0.0 compliance**: ADRs follow the Markdown Any Decision Records 4.0.0 specification.

## Gotchas

- **The orchestrator does NOT generate content**: `arch-pipeline` only coordinates — it invokes skills, extracts file paths from their output, and presents checkpoints. All document generation happens inside forked contexts.
- **Fan-out indexing**: When processing HLD[2] of 3, the orchestrator invokes `hld-gather` with the scope index. If you're modifying the loop logic, the index must be threaded through all three phases (gather/generate/audit).
- **Audit resolution options**: Every audit issue offers: Recommended fix, Alternative fix, Research fork (dispatches parallel agents), or Skip. The audit doesn't just report — it resolves interactively.
- **`doc-review` is PR-aware**: It pulls GitHub PR comments using `gh api` and walks through each comment with resolution options. It's not a standalone review — it requires an open PR.
- **`implement` is a separate workflow**: It ingests a completed HLD or LLD, performs gap analysis against the codebase, creates a phased implementation plan, and executes with user approval. It's post-pipeline, not part of the gather/generate/audit cycle.
