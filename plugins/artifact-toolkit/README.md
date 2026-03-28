# Artifact Toolkit

Author and audit Claude Code skills, commands, and agents with research-backed workflows, quality checklists, and best-practice templates.

## Skills

### Creation Skills

| Skill | Description |
|-------|-------------|
| `/artifact-toolkit:skill-create` | Author a new skill with interactive gathering, codebase + web research, and draft review |
| `/artifact-toolkit:command-create` | Author a new command with security-conscious tool grants and pattern research |
| `/artifact-toolkit:agent-create` | Author a new agent with domain expert principles, routing mesh integration, and trigger design |

### Audit Skills

| Skill | Description |
|-------|-------------|
| `/artifact-toolkit:skill-audit` | Audit a skill against 30 checks across 7 categories with interactive issue resolution |
| `/artifact-toolkit:command-audit` | Audit a command against 24 checks across 6 categories with interactive issue resolution |
| `/artifact-toolkit:agent-audit` | Audit an agent against 30 checks across 7 categories with interactive issue resolution |

## Workflow

Creation skills follow a **gather -> generate** pipeline:

1. **Understand Intent** — classify the artifact type and target location
2. **Gather Requirements** — interactive Q&A with batched questions
3. **Research** — parallel codebase scan + official docs consultation
4. **Draft & Review** — present complete artifact for user approval (up to 2 revision rounds)
5. **Generate** — write files to the target location
6. **Post-Generation** — suggest running the corresponding audit

Audit skills follow a **load -> check -> resolve** pipeline:

1. **Load** — read the artifact and the audit checklist
2. **Run All Checks** — evaluate every checklist item, build prioritized issue queue
3. **Present Summary** — show issue counts by severity
4. **Sequential Resolution** — for each issue: present fix options, research fork, or skip
5. **Write Audit Report** — save verdict (PASS / PASS WITH WARNINGS / FAIL)

## Audit Severity Levels

- 🔴 **CRITICAL** — must fix; skipping causes FAIL verdict
- 🟡 **WARNING** — should fix; skipping causes PASS WITH WARNINGS
- 🔵 **INFO** — optional improvement
- ❓ **Open Questions** — unresolved items needing investigation

## Install

```
/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools --plugin artifact-toolkit
```
