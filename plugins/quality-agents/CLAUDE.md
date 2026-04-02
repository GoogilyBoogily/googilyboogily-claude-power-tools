# CLAUDE.md — quality-agents

## Purpose

Six quality-focused agents and two executable skills forming a hub-and-spoke cluster. Agents handle code review, refactoring, linting, triage, code search, and dead code analysis with extensive cross-plugin routing. Skills provide user-invoked architecture review and file organization workflows.

## Key Files

| File/Directory | Role |
|----------------|------|
| `agents/code-review-expert.md` | Hub agent — central entry point for code review, routes to 10+ cross-plugin specialists |
| `agents/triage-expert.md` | Entry point for unknown issues — gathers context, diagnoses, then delegates |
| `agents/refactoring-expert.md` | Detects code smells, applies refactoring patterns without changing behavior |
| `agents/code-search.md` | Utility agent — read-only codebase search used by other agents, not users directly |
| `agents/dead-code-analyst.md` | Detects unused code with confidence-level filtering |
| `agents/linting-expert.md` | ESLint/Prettier/Stylelint configuration and rule conflict resolution |
| `skills/architect-reviewer/` | Opus skill — comprehensive architecture review with parallel dimension analysis and scored report |
| `skills/file-organizer/` | Opus skill — directory restructuring using PARA, Diataxis, and MECE methodologies |

## Local Conventions

- **Hub-and-spoke routing**: `code-review-expert` is the central hub. It can delegate to the 5 other quality agents AND to 15+ agents in other plugins (react-expert, typescript-expert, database-expert, etc.).
- **`triage-expert` is the recommended entry point**: For unknown or ambiguous issues, start with triage. It gathers context using read-only tools, diagnoses the category, then delegates to the appropriate specialist.
- **`code-search` is a utility, not user-facing**: It provides focused file search capabilities (Read, Grep, Glob, LS only) for other agents to invoke. Users shouldn't invoke it directly.
- **Bidirectional routing**: The 6 agents route to each other within the cluster. They also route outbound to domain specialists in other plugins (e.g., `refactoring-expert` → `react-expert` for React-specific refactoring).
- **Confidence-level filtering**: `dead-code-analyst` reports findings with confidence scores to reduce false positives. Only high-confidence findings are flagged as actionable.
- **Skills are user-invoked, not agent-delegated**: `architect-reviewer` and `file-organizer` are now skills invoked via `/quality-agents:architect-reviewer` and `/quality-agents:file-organizer`. Agents that previously delegated to `architect-reviewer` now suggest the user run the skill instead.

## Gotchas

- **`code-review-expert` has the largest routing table in the marketplace**: It cross-references agents from react-agents, typescript-agents, testing-agents, database-agents, devops-agents, framework-agents, build-tools-agents, systems-agents, and frontend-agents. When modifying its routing table, verify target agents still exist.
- **`architect-reviewer` is a skill, not an agent**: Other agents cannot delegate to it directly. They should suggest the user run `/quality-agents:architect-reviewer`. The skill itself never modifies source code — it only reads and writes its review report.
- **`dead-code-analyst` is structural, not runtime**: It detects unused exports, orphaned files, and unreferenced dependencies through static analysis. It cannot detect code that's only used at runtime via dynamic imports or reflection.
- **Routing targets are cross-plugin**: These agents reference agents in 10+ other plugins by stable name. If a target plugin isn't installed, delegation degrades gracefully (the agent handles it locally instead of crashing).
