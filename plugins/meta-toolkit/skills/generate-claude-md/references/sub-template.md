# Sub-CLAUDE.md Template

Use this template when generating CLAUDE.md files for subdirectories. Each sub-file should be self-contained — Claude loads it independently when entering that directory, without assuming the root CLAUDE.md is in context.

## Template

```markdown
# CLAUDE.md — {{directory name}}

## Purpose

{{1 paragraph: what this directory contains and its role in the larger project. Be specific — "React components for the dashboard UI" not "frontend code".}}

## Key Files

| File/Directory | Role |
|----------------|------|
| `{{file}}` | {{what it does, why it matters}} |

## Local Conventions

{{Patterns and conventions specific to this directory that differ from or extend the project-wide conventions. Examples:}}
{{- Component naming: PascalCase files export a single default component}}
{{- All API handlers follow request → validate → process → respond pattern}}
{{- Database queries use the repository pattern via `*.repo.ts` files}}

## Gotchas

{{Non-obvious behavior, surprising patterns, or common mistakes specific to this area. Examples:}}
{{- `useAuth()` hook silently returns null during SSR — always check before accessing user properties}}
{{- Migration files are order-sensitive — never rename existing files, only add new ones}}
{{- The `legacy/` subdirectory uses CommonJS requires, not ES imports}}

## Testing

{{How to test code in this directory — test file locations, naming patterns, special setup needed, which test runner to use if it differs from the project default.}}
```

## Guidance

- **Budget**: aim for 50-150 lines. Sub-files should be focused and scannable.
- **Self-contained**: don't reference the root CLAUDE.md or assume it's loaded. Claude may enter this directory from any starting point.
- **Local over global**: only document conventions that are specific to this directory or that override project-wide patterns. If the convention applies everywhere, it belongs in the root file.
- **Key Files should be selective**: list 5-10 most important files, not every file. Focus on entry points, configuration, and files with non-obvious behavior.
- **Skip sections that don't apply**: if a directory has no special testing patterns, omit the Testing section entirely rather than writing "uses the project default".
