# CLAUDE.md — architecture-docs

## Purpose

ADR → HLD → LLD documentation pipeline with 1:N:M fan-out support, GSD-inspired workflow patterns, and cross-session state persistence. Each document type follows a 5-phase cycle: discuss → research → gather → generate → audit. Decisions are tracked as numbered contracts (D-XX) that downstream phases verify against.

## Key Files

| File/Directory | Role |
|----------------|------|
| `skills/arch-pipeline/SKILL.md` | Orchestrator — manages the full pipeline with expanded phases, state persistence, resume, and context-clearing prompts |
| `skills/adr-discuss/SKILL.md` | ADR discuss phase — identifies gray areas, captures D-XX numbered decisions |
| `skills/hld-discuss/SKILL.md` | HLD discuss phase — architecture-level gray areas with ADR constraints |
| `skills/lld-discuss/SKILL.md` | LLD discuss phase — implementation-level gray areas with HLD constraints |
| `skills/arch-research/SKILL.md` | Standalone research phase — dispatches parallel code+web research, produces RESEARCH.md with comparison tables |
| `skills/adr-gather/SKILL.md` | ADR gather/compiler — merges decisions + research into context file |
| `skills/adr-generate/SKILL.md` | ADR generate — reads context, produces MADR 4.0.0, verifies D-XX coverage |
| `skills/audit-adr/SKILL.md` | ADR audit — interactive issue walk-through with decision coverage check |
| `skills/hld-generate/references/template.md` | HLD document template |
| `skills/lld-generate/references/template.md` | LLD document template |
| `skills/audit-adr/references/checklist.md` | ADR audit checklist with DC-X decision coverage checks |
| `skills/code-research/SKILL.md` | Code exploration with tabular output and confidence tiering |
| `skills/web-research/SKILL.md` | Web research with approach comparison tables and don't-hand-roll warnings |
| `skills/doc-review/SKILL.md` | PR-aware document review — grey area analysis (R-XX), resolved/unresolved tracking, REVIEW.md state persistence, resume capability |
| `skills/doc-review/references/review-template.md` | REVIEW.md template for PR review state files |
| `skills/implement/SKILL.md` | Implementation with goal-backward verification (T-XX/A-XX/L-XX must-haves) and anti-pattern tracking |
| `skills/jira-tickets/SKILL.md` | Jira ticket extraction from ADR/HLD/LLD — creates unassigned tickets under a specified epic |
| `skills/jira-tickets/references/ticket-template.md` | Ticket description templates (Story, Investigation, Risk Mitigation) |
| `hooks/context-monitor.js` | PostToolUse hook — warns when context is getting heavy |
| `hooks/workflow-guard.js` | PreToolUse hook — advisory nudge when editing code during active pipeline |

## Local Conventions

- **5-phase cycle per doc type**: discuss → research → gather → generate → audit. Discuss captures decisions, research investigates them, gather compiles, generate produces, audit verifies.
- **D-XX decision tracking**: Decisions are numbered (D-01, D-02...) and annotated as "(User Decision)" or "(Claude's Discretion)". Generate skills verify coverage. Audit checklists enforce it.
- **1:N:M fan-out**: The orchestrator supports branching — 1 ADR → N HLDs → M LLDs per HLD.
- **State persistence**: `docs/context/PIPELINE-STATE.md` tracks all file paths, decisions, and verdicts across sessions. Resume with `--resume` flag.
- **Context isolation**: Every phase skill uses `context: fork`. The orchestrator never holds document content — only file paths and verdicts.
- **Compiler-mode gather**: Gather skills accept decisions + research files as inputs and compile them into context files. They still support standalone mode (direct Q&A) when no inputs are provided.
- **Gray area discussion**: Discuss skills identify 3-5 concrete decisions specific to the topic — not generic categories. Annotated with code context from codebase scouting.
- **Structured research output**: Research produces tables (Approach Comparison, Don't Hand-Roll, Common Pitfalls, Gap Analysis) with confidence-tiered sources.
- **Goal-backward verification**: The implement skill extracts must-haves (T-XX truths, A-XX artifacts, L-XX links) and verifies them after execution — checking that goals were achieved, not just tasks completed.
- **Anti-pattern tracking**: Failed or paused implementations write `.continue-here.md` with completed/remaining work, anti-patterns encountered, and specific next action.
- **Context-clearing prompts**: Pipeline prompts user to `/clear` between ADR→HLD and HLD→LLD transitions, with resume instructions.
- **Parallel research**: Code-research and web-research are dispatched as parallel Tasks during the arch-research skill (and during standalone gather mode).
- **R-XX review decision tracking**: PR review captures review decisions as R-XX entries (R-01, R-02...), distinct from D-XX pipeline decisions. R-XX decisions are scoped to reviewer feedback — they include "Reviewer concern" and "Threads addressed" fields. Grey area analysis clusters comments by concern type and identifies 3-5 decision points.
- **REVIEW.md state persistence**: `docs/context/review/<doc-name>-PR-<number>-REVIEW.md` tracks all PR review state per document — comment inventory, R-XX decisions, resolution log, drafted replies, and resume checkpoint. One file per document per PR.
- **Jira tickets always unassigned**: The jira-tickets skill creates all tickets without an assignee. Assignment is a sprint planning concern, not a ticket creation concern.
- **Epic is required for ticket creation**: The jira-tickets skill requires an existing Jira epic key. No loose tickets — every ticket is created as a child of the epic.
- **Ticket manifest persistence**: `docs/context/TICKET-MANIFEST-<doc-title>.md` records all created ticket keys, types, dependencies, and extraction coverage for cross-reference.

## Gotchas

- **The orchestrator does NOT generate content**: `arch-pipeline` only coordinates — it invokes skills, extracts file paths, and presents checkpoints. All work happens in forked contexts.
- **Discuss before gather**: In the full pipeline, `adr-discuss` runs BEFORE `adr-gather`. Gather receives the decisions file as input. Without a decisions file, gather falls back to standalone Q&A mode.
- **Decision coverage is CRITICAL**: Audit checklists include DC-1 (every User Decision D-XX addressed) and DC-2 (no scope reduction). These are 🔴 CRITICAL severity — skipping them produces a FAIL verdict.
- **Research is standalone**: `arch-research` is a separate skill that produces RESEARCH.md. It's NOT embedded in gather anymore (though gather can still dispatch research in standalone mode).
- **State file survives /clear**: `PIPELINE-STATE.md` is written to `docs/context/` (not memory or session state), so it persists across context clears and session restarts.
- **Fan-out indexing**: When processing HLD[2] of 3, the orchestrator threads the index through all five phases (discuss/research/gather/generate/audit).
- **Must-haves ≠ task completion**: The implement skill's goal-backward verification checks T-XX/A-XX/L-XX, which are derived from the design document's GOALS, not from the implementation plan's task list.
- **`.continue-here.md` requires acknowledgment**: When resuming a paused implementation, the session MUST acknowledge anti-patterns before proceeding.
- **Hooks are advisory**: context-monitor and workflow-guard never block operations — they inject `additionalContext` warnings only.
- **R-XX ≠ D-XX**: R-XX decisions come from reviewer feedback analysis in `doc-review`. D-XX decisions come from design exploration in discuss skills. They use different prefixes intentionally — D-XX flows through gather→generate→audit with coverage verification (DC-1/DC-2), while R-XX stays within the review lifecycle. Don't mix them.
- **doc-review is local-only**: Despite reading from GitHub via `gh` CLI, it NEVER posts back. Users copy-paste drafted replies manually. This is by design — review responses need human judgment before posting.
- **Grey areas reduce the comment queue**: Phase 3 grey area analysis in doc-review resolves multiple threads at once via R-XX decisions. These threads are removed from the Phase 4 sequential queue. This means fewer threads to walk through individually, not more work.
- **Cloud ID disambiguation**: The jira-tickets skill may find multiple Atlassian cloud instances. It presents options and asks the user to choose rather than guessing.
- **Issue type name variations**: Different Jira projects use different names ("Story" vs "User Story", "Sub-task" vs "Subtask"). The skill discovers available types via API and maps to the closest match, falling back to "Task" if needed.
