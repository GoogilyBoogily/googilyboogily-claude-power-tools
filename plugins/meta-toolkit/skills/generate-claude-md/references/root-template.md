# Root CLAUDE.md Template

Use this template as structural guidance when generating the root CLAUDE.md. Adapt sections based on what the exploration actually discovered — skip sections that don't apply, and add project-specific sections when warranted.

## Template

```markdown
# CLAUDE.md

## Project Overview

{{1-2 paragraphs: what this project is, what problem it solves, who it's for. Include project type (library, CLI, web app, API, monorepo, etc.)}}

## Tech Stack

{{Bullet list of primary technologies, frameworks, and languages. Include versions only when they matter for behavior (e.g., Next.js 14 vs 15 has different routing).}}

## Architecture

{{3-5 bullet points describing the high-level structure. Focus on what Claude needs to understand to navigate the codebase — not exhaustive documentation. Example: "Frontend (src/app/) is Next.js App Router with Server Components by default" or "API layer (src/api/) uses Express with middleware chain: auth → validate → handler"}}

## Key Commands

{{Table or bullet list of the commands Claude will need most often:}}

| Command | Purpose |
|---------|---------|
| `{{build command}}` | {{what it does}} |
| `{{test command}}` | {{what it does}} |
| `{{lint command}}` | {{what it does}} |
| `{{dev command}}` | {{what it does}} |

## Sub-CLAUDE.md Index

The following subdirectories have their own CLAUDE.md with focused guidance. Claude loads these automatically when working in those directories.

| Path | Covers | Consult When |
|------|--------|--------------|
| `{{path/CLAUDE.md}}` | {{1-line scope description}} | {{when Claude should look here}} |

## Project-Wide Conventions

{{Conventions that apply everywhere — naming patterns, error handling approach, logging standards, import ordering, etc. Only include conventions that aren't obvious from linting configs.}}

## Common Gotchas

{{Non-obvious behaviors, surprising patterns, or things that frequently trip people up. These are the highest-value items in CLAUDE.md — the things you can't figure out just by reading the code.}}
```

## Guidance

- **Budget**: aim for 100-200 lines. The root file is loaded every session, so every line costs context.
- **Sub-CLAUDE.md Index is critical**: this is the routing mechanism. Claude reads this at startup and uses it to decide which sub-files to consult. Make the "Consult When" column specific and actionable.
- **Conventions over documentation**: CLAUDE.md is not a README. Focus on what Claude needs to know to write *correct* code in this project — not what a human needs to understand the project.
- **Gotchas are gold**: if you found something non-obvious during exploration, it belongs in Gotchas. Examples: "Don't use `fetch` directly — use the `apiClient` wrapper which handles auth token refresh" or "Tests in `src/legacy/` use Mocha, not Jest".
