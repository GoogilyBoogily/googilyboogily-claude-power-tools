# CLAUDE.md — the-critic

## Purpose

11 specialist code critics plus an orchestrator that launches them in parallel. Each critic attacks code from a single lens and produces a severity-ranked issue report. The orchestrator consolidates, deduplicates, and surfaces cross-cutting patterns.

## Key Files

| File/Directory | Role |
|----------------|------|
| `skills/the-critic/` | Orchestrator — launches all critics in parallel, consolidates findings |
| `skills/approach-critic/` | Is the overall approach correct? Better alternatives? |
| `skills/architecture-critic/` | Structural soundness, boundaries, coupling |
| `skills/best-practices-critic/` | Language/framework conventions, anti-patterns |
| `skills/simplicity-critic/` | Over-engineering, YAGNI, unnecessary complexity |
| `skills/testability-critic/` | DI, seams, mocking, test isolation |
| `skills/maintainability-critic/` | Future-dev readability, change resilience |
| `skills/security-critic/` | OWASP, auth, injection, secrets |
| `skills/performance-critic/` | Algorithmic complexity, memory, I/O, caching |
| `skills/error-handling-critic/` | Edge cases, failure modes, graceful degradation |
| `skills/readability-critic/` | Naming, clarity, self-documenting code |
| `skills/solid-critic/` | SRP, OCP, LSP, ISP, DIP |

## Local Conventions

- **All critics are read-only**: They never modify source code. No Write or Edit tools.
- **Orchestrator uses Skill tool**: Each critic is invoked via `skill: "the-critic:<name>"`. All selected critics launch in a single message for parallel execution.
- **Severity scale is shared**: CRITICAL > HIGH > MEDIUM > LOW. Defined in orchestrator references.
- **Ruthless tone**: Critics assume the worst, flag everything, give zero benefit of the doubt. They are not here to praise — they are here to expose problems.
- **Auto-detection**: When no target specified, critics check unstaged changes → recent commit → recently modified files.
- **Individual critics are independently usable**: Users can run `/the-critic:security-critic src/` without the orchestrator.

## Gotchas

- **Context budget**: 11 parallel forked skills can be expensive. The orchestrator's relevance analysis skips irrelevant critics to save tokens.
- **Deduplication matters**: Multiple critics will flag the same issue from different angles. The orchestrator must merge these.
- **No Agent sub-delegation in critics**: Critics are leaf nodes. They read code and report. They do not spawn sub-agents.
- **Orchestrator owns Write, critics don't**: Only the orchestrator can write a report file (via `--output`). Individual critics present findings in conversation only.
