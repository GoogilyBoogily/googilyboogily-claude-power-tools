# Location Heuristics

Decision framework for determining which directories warrant their own CLAUDE.md file.

## Scoring Rubric

Score each candidate directory on these dimensions. A directory should get a sub-CLAUDE.md if it scores 3+ points.

| Dimension | Points | Criteria |
|-----------|--------|----------|
| **File volume** | 1 | Contains >10 meaningful source files (not configs, assets, or generated code) |
| **Distinct tech** | 2 | Uses a different language, framework, or runtime than the project root (e.g., Python backend + React frontend) |
| **Own conventions** | 1 | Has naming patterns, architectural patterns, or code organization that differs from the rest of the project |
| **Gotcha density** | 2 | Contains non-obvious behavior, surprising patterns, or common pitfalls that Claude would likely get wrong without guidance |
| **Depth** | 1 | Has subdirectory depth >2 (deeper structures benefit more from local guidance) |
| **Edit frequency** | 1 | Frequently modified area (check `git log --oneline --since="3 months ago" -- <dir> | wc -l` if git is available) |

## Always Create Sub-CLAUDE.md

These directory patterns almost always warrant their own file:

- **Monorepo packages/workspaces**: each package has its own ecosystem
- **Frontend + backend split**: `src/app/`, `src/api/`, `client/`, `server/`, etc.
- **Distinct language boundaries**: `python/`, `rust/`, `go/` alongside JS/TS
- **Database/migration directories**: migration ordering, schema conventions, ORM patterns
- **Infrastructure directories**: Terraform, CDK, Pulumi — their own DSL and conventions

## Skip Sub-CLAUDE.md

Don't create sub-files for:

- **Thin wrapper directories**: `utils/`, `helpers/`, `lib/` with <10 files and no special patterns
- **Config-only directories**: `.github/`, `.vscode/`, etc. (unless there are complex CI workflows worth documenting)
- **Generated code directories**: `dist/`, `build/`, `.next/`, `node_modules/`
- **Asset directories**: `public/`, `static/`, `assets/` (unless there's a naming/processing convention)
- **Test directories** that mirror source structure with no special patterns of their own
- **Single-file directories**: a directory with just an `index.ts` doesn't need its own CLAUDE.md

## Consolidation Rules

When too many directories qualify (>12), consolidate:

1. **Merge siblings**: if `src/components/` and `src/hooks/` both qualify but share conventions, combine into a single `src/CLAUDE.md`
2. **Promote to parent**: if 3+ subdirectories of `src/features/` qualify, consider one `src/features/CLAUDE.md` instead of per-feature files
3. **Prioritize by gotcha density**: when forced to choose, keep the directories with the most non-obvious behavior

## Cap

Aim for **4-8 sub-CLAUDE.md files** for typical projects, up to **12 for large monorepos**. Beyond 12, the maintenance burden outweighs the benefit — consolidate aggressively.

## Monorepo Handling

For monorepos, apply a two-level strategy:

1. **Root CLAUDE.md**: project-wide conventions, workspace structure, shared tooling, cross-package patterns
2. **Per-package CLAUDE.md**: each workspace/package gets its own file covering its local stack, conventions, and gotchas
3. **Shared packages** (e.g., `packages/shared/`, `packages/ui/`): document the public API contract and how other packages should consume them
