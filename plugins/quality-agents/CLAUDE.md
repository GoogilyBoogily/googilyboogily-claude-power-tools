# CLAUDE.md — quality-agents

## Purpose

Eight interconnected quality-focused agents forming a hub-and-spoke routing cluster. Covers code review, architecture review, refactoring, linting, triage, code search, dead code analysis, and file organization. These agents have the most extensive cross-plugin routing in the marketplace.

## Key Files

| File/Directory | Role |
|----------------|------|
| `agents/code-review-expert.md` | Hub agent — central entry point for code review, routes to 10+ cross-plugin specialists |
| `agents/triage-expert.md` | Entry point for unknown issues — gathers context, diagnoses, then delegates |
| `agents/architect-reviewer.md` | Read-only architecture review — validates design patterns, no edit permissions |
| `agents/refactoring-expert.md` | Detects code smells, applies refactoring patterns without changing behavior |
| `agents/code-search.md` | Utility agent — read-only codebase search used by other agents, not users directly |
| `agents/dead-code-analyst.md` | Detects unused code with confidence-level filtering |
| `agents/file-organizer.md` | Directory structure and naming convention specialist |
| `agents/linting-expert.md` | ESLint/Prettier/Stylelint configuration and rule conflict resolution |

## Local Conventions

- **Hub-and-spoke routing**: `code-review-expert` is the central hub. It can delegate to any of the 7 other quality agents AND to 15+ agents in other plugins (react-expert, typescript-expert, database-expert, etc.).
- **`triage-expert` is the recommended entry point**: For unknown or ambiguous issues, start with triage. It gathers context using read-only tools, diagnoses the category, then delegates to the appropriate specialist.
- **`code-search` is a utility, not user-facing**: It provides focused file search capabilities (Read, Grep, Glob, LS only) for other agents to invoke. Users shouldn't invoke it directly.
- **Bidirectional routing**: All 8 agents route to each other within the cluster. They also route outbound to domain specialists in other plugins (e.g., `refactoring-expert` → `react-expert` for React-specific refactoring).
- **Confidence-level filtering**: `dead-code-analyst` and `file-organizer` report findings with confidence scores to reduce false positives. Only high-confidence findings are flagged as actionable.

## Gotchas

- **`code-review-expert` has the largest routing table in the marketplace**: It cross-references agents from react-agents, typescript-agents, testing-agents, database-agents, devops-agents, framework-agents, build-tools-agents, systems-agents, and frontend-agents. When modifying its routing table, verify target agents still exist.
- **`architect-reviewer` is read-only**: It has no Edit or Write tool grants — it reviews and reports but cannot fix. This is intentional to prevent review agents from making unsupervised changes.
- **`dead-code-analyst` is structural, not runtime**: It detects unused exports, orphaned files, and unreferenced dependencies through static analysis. It cannot detect code that's only used at runtime via dynamic imports or reflection.
- **Routing targets are cross-plugin**: These agents reference agents in 10+ other plugins by stable name. If a target plugin isn't installed, delegation degrades gracefully (the agent handles it locally instead of crashing).
