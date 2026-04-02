# CLAUDE.md — game-design-bible

## Purpose

Six-phase pipeline for generating comprehensive Game Design Bibles, plus a post-pipeline bible-to-HLD generator. Each phase covers a design domain (concept, core loop, systems, narrative, art/audio, technical) with a gather → generate → audit cycle. A cross-cutting review checks pillar consistency across all phases.

## Key Files

| File/Directory | Role |
|----------------|------|
| `skills/bible-pipeline/SKILL.md` | Orchestrator — coordinates all 6 phases sequentially, tracks state, presents checkpoints |
| `agents/game-hld-writer.md` | Dispatcher for bible-to-HLD generation — routes to specialist design agents |
| `skills/design-pillars/SKILL.md` | Reference skill (auto-invoked) — design pillars methodology, examples, anti-patterns |
| `skills/mda-framework/SKILL.md` | Reference skill (auto-invoked) — MDA framework cheat-sheet (Mechanics, Dynamics, Aesthetics) |
| `agents/game-design/` | 4 specialist agents: `systems-designer`, `narrative-designer`, `art-audio-director`, `game-design-reviewer` |
| `skills/concept-gather/SKILL.md` | Phase 0 gather — first phase in the pipeline, establishes pillars and vision |

## Local Conventions

- **Phase ordering is strict**: Concept → Core Loop → Systems → Narrative → Art/Audio → Technical. Each phase builds on prior phases' output.
- **Per-phase triple**: Every phase has three skills — `{phase}-gather` (interactive Q&A), `{phase}-generate` (non-interactive document production), `audit-{phase}` (interactive quality review).
- **Context isolation**: All phase skills use `context: fork` so the orchestrator stays lean. Heavy content generation happens in forked contexts that are discarded after producing their output file.
- **Reference skills**: `design-pillars` and `mda-framework` use `user-invocable: false` — they auto-activate when Claude's conversation touches their keywords, injecting methodology context without user action.
- **Nested agents**: The `agents/game-design/` subdirectory groups 4 thematically-related specialist agents. The routing mesh discovers them recursively — nesting is organizational, not functional.
- **Bible-to-HLD**: A separate post-pipeline workflow. After the bible is complete, `game-hld-writer` dispatches specialist agents to produce feature-level HLD documents from bible content.

## Gotchas

- **Phase dependencies are implicit**: Phase 2 (Systems) references Phase 1 (Core Loop) output. Skipping or reordering phases produces incoherent documents.
- **`design-pillars` and `mda-framework` are NOT user commands**: They appear in the skills list but have `user-invocable: false`. They're knowledge injection, not workflows.
- **Cross-cutting review is separate**: The `game-design-reviewer` agent checks pillar consistency across ALL phases — it's invoked after the full pipeline, not per-phase.
- **Audit checklists**: Each `audit-{phase}` skill has a `references/checklist.md` with severity-tagged checks. Resolution is interactive — per-issue walk-through with fix/skip/research options.
- **`game-hld-writer` dispatches, doesn't generate**: It coordinates the 4 specialist agents in `agents/game-design/` via the routing mesh, similar to how `arch-pipeline` coordinates architecture doc phases.
