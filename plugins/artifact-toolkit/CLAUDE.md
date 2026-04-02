# CLAUDE.md — artifact-toolkit

## Purpose

Authoring and auditing tools for the three Claude Code artifact types: commands, skills, and agents. Every artifact type has a paired `-create` and `-audit` skill (6 total), with templates and checklists in `references/` subdirectories.

## Key Files

| File/Directory | Role |
|----------------|------|
| `skills/skill-create/SKILL.md` | Interactive skill creation workflow — gathers requirements, applies template |
| `skills/skill-audit/SKILL.md` | Quality audit for existing skills — walks through checklist interactively |
| `skills/command-create/SKILL.md` | Command creation workflow |
| `skills/command-audit/SKILL.md` | Command quality audit |
| `skills/agent-create/SKILL.md` | Agent creation workflow — includes routing mesh pattern as mandatory structure |
| `skills/agent-audit/SKILL.md` | Agent quality audit |
| `skills/skill-create/references/skill-template.md` | Canonical template for task and reference skills |
| `skills/skill-audit/references/checklist.md` | Audit checklist with severity-tagged checks across 7 categories |
| `skills/agent-create/references/agent-template.md` | Agent template with Step 0 routing table built in |
| `skills/command-create/references/command-template.md` | Command template with frontmatter and content patterns |

## Local Conventions

- **Paired create/audit**: Every artifact type has both a `-create` skill (guided authoring) and an `-audit` skill (quality review). They share reference material but serve opposite workflows.
- **Templates are the source of truth**: Create skills apply templates from their `references/` subdirectory. When authoring patterns change, update the template — individual create skills inherit the changes.
- **Checklist ID scheme**: Audit checklists use prefixed IDs — `FM-*` (Frontmatter), `TS-*` (Tool Security), `CT-*` (Content), `RM-*` (Routing Mesh), `CP-*` (Checkpoints), `PH-*` (Phases). These IDs are stable and referenced in audit reports.
- **Interactive audit resolution**: Each audit issue presents 4 options — Recommended fix, Alternative fix, Research fork (parallel agents investigate), Skip. The audit walks through issues one at a time, not as a batch report.
- **Severity levels**: Audit checks are tagged 🔴 CRITICAL (must fix), 🟡 WARNING (should fix), 🔵 INFO (optional), ❓ Open Questions.

## Gotchas

- **`agent-create` enforces the routing mesh**: The agent template includes "Step 0: Route or Stay" as mandatory structure. Agents created without a routing table will fail the subsequent audit.
- **Checklist IDs are stable references**: Don't renumber or rename checklist IDs (e.g., FM-1, TS-2) — they may be referenced in existing audit reports or documentation.
- **Create skills dispatch parallel research**: During creation, the skill may fork agents to research the codebase and existing patterns before applying the template. This is expected behavior, not a bug.
- **Audit is iterative**: Running an audit, fixing issues, and re-auditing is the intended workflow. A single pass rarely produces a clean result for complex artifacts.
