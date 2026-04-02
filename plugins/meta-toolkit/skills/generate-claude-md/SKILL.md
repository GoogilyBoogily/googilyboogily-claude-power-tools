---
name: generate-claude-md
description: "Explore a project codebase and generate optimized, distributed CLAUDE.md files across logical sub-locations. Creates a root CLAUDE.md index/router and focused sub-CLAUDE.md files per major directory or subsystem. Intelligently merges with existing files. Use when setting up CLAUDE.md for a new project, restructuring Claude context after a major refactor, or when CLAUDE.md is bloated and needs splitting. Also use when asked to 'create CLAUDE.md', 'set up Claude context', 'distribute CLAUDE.md', 'generate CLAUDE.md hierarchy', 'split CLAUDE.md', 'optimize CLAUDE.md', or 'generate project guidance for Claude'."
disable-model-invocation: true
context: fork
argument-hint: "[project-path] [--dry-run] [--force]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, AskUserQuestion
model: opus
---

# Generate Distributed CLAUDE.md Hierarchy

Explore a project's codebase and generate an optimized hierarchy of CLAUDE.md files — a lean root file that acts as an index/router, plus focused sub-CLAUDE.md files in directories that need their own guidance. If CLAUDE.md files already exist, intelligently merge rather than overwrite.

Claude Code loads subdirectory CLAUDE.md files on-demand when it reads files there, so distributing context this way keeps startup lean while giving Claude rich, targeted guidance exactly when it needs it.

## Input

`$ARGUMENTS` — optional project path (defaults to current working directory), plus flags:
- `--dry-run`: produce the plan and show proposed content without writing any files
- `--force`: overwrite existing CLAUDE.md files instead of merging

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Project path**: first positional argument, or `.` if not provided. Resolve to absolute path.
- **`--dry-run`**: boolean flag
- **`--force`**: boolean flag

## Process

### Phase 1: Initialize

1. Resolve the project path. Verify it exists and is a directory.

2. Discover existing CLAUDE.md infrastructure:
   - Run `Glob("**/CLAUDE.md")` from the project root to find all existing CLAUDE.md files
   - Run `Glob(".claude/rules/**/*.md")` to find existing rules files
   - Read each discovered file to understand current coverage

3. Determine operating mode:
   - **CREATE**: no CLAUDE.md files exist anywhere in the project
   - **UPDATE**: a root CLAUDE.md and/or sub-CLAUDE.md files already exist
   - **HYBRID**: some locations have files, others don't

4. Present findings to the user:
   - List all discovered CLAUDE.md files with their line counts
   - List discovered rules files
   - State the operating mode
   - Ask to confirm proceeding

### Phase 2: Parallel Codebase Exploration

Dispatch **three Agent calls in a single message** using the Explore subagent type. Each agent has a focused scope to avoid duplicate work.

#### Agent 1 — Structure & Identity

> Explore this project's structure and identity. The project root is: {{project-path}}
>
> 1. Map the directory tree to depth 3 using Glob patterns
> 2. Read primary manifest files — check for: package.json, Cargo.toml, pyproject.toml, setup.py, go.mod, Gemfile, pom.xml, build.gradle, CMakeLists.txt, Makefile, justfile, deno.json, composer.json
>    - Extract: project name, version, description, license, entry points, scripts/commands
> 3. Count source files by type (e.g., *.ts, *.py, *.rs, *.go) using Glob
> 4. Classify the project type: library, CLI, web app, API, monorepo, plugin, framework, mobile app, etc.
> 5. Detect monorepo indicators: workspaces in package.json, lerna.json, nx.json, turbo.json, pnpm-workspace.yaml
> 6. Check for CI/CD: .github/workflows/, .gitlab-ci.yml, Dockerfile, docker-compose.yml
> 7. For each top-level directory, report: name, approximate file count, primary file types, apparent purpose
>
> Return a structured report with findings for each item. Cite file paths for all claims.

#### Agent 2 — Conventions & Patterns

> Explore this project's coding conventions and development patterns. The project root is: {{project-path}}
>
> 1. Look for linting/formatting configs: .eslintrc*, .prettierrc*, rustfmt.toml, .editorconfig, biome.json, ruff.toml, .pylintrc, .rubocop.yml
> 2. Detect test patterns: where tests live, naming conventions, test frameworks used, any test utilities or fixtures
> 3. Check build/dev/test/lint scripts in manifest files
> 4. Identify code organization patterns:
>    - Barrel files (index.ts re-exports)?
>    - Feature-based vs layer-based directory structure?
>    - Domain-driven design patterns?
> 5. Check for environment variable patterns: .env.example, config files, env validation
> 6. Look for import conventions: path aliases (tsconfig paths, webpack aliases), absolute vs relative imports
> 7. Identify error handling patterns: custom error classes, error middleware, Result types
> 8. Check for logging patterns: which logger, log levels, structured logging
>
> Return a structured report. Focus on patterns that someone writing new code would need to follow. Cite file paths.

#### Agent 3 — Architecture & Documentation

> Explore this project's architecture, dependencies between subsystems, and existing documentation. The project root is: {{project-path}}
>
> 1. Map the major subsystems and their boundaries by examining imports between top-level directories
> 2. Identify shared utilities, common packages, or cross-cutting concerns
> 3. Find API boundaries: REST routes, GraphQL schemas, RPC definitions, CLI command definitions
> 4. Detect database/ORM patterns: migration directories, schema files, model definitions
> 5. Identify state management patterns (frontend: Redux/Zustand/Context, backend: session/cache)
> 6. Read all existing documentation:
>    - README.md files in subdirectories
>    - CONTRIBUTING.md, ARCHITECTURE.md, DESIGN.md
>    - docs/ directory contents
>    - Inline code documentation patterns (JSDoc, docstrings, /// comments)
> 7. For each major directory, list the 3-5 most important files and why they matter
> 8. Note any non-obvious behavior, surprising patterns, or gotchas you encounter
>
> Return a structured report. Prioritize findings that would help Claude write correct code. Cite file paths.

Wait for all three agents to return before proceeding.

### Phase 3: Location Planning

1. Read the location heuristics reference:
   ```
   Read ${CLAUDE_SKILL_DIR}/references/location-heuristics.md
   ```

2. Using the scoring rubric from the heuristics, evaluate each top-level directory (and significant second-level directories in monorepos) for sub-CLAUDE.md eligibility. For each candidate:
   - Calculate its score across all dimensions
   - Note the specific content that would go in its sub-file
   - Flag whether it meets the threshold (3+ points)

3. Apply the consolidation rules if more than 12 directories qualify.

4. Plan the root CLAUDE.md outline:
   - Which sections from the root template apply
   - What content each section will contain (bullet-point summaries)
   - The complete sub-CLAUDE.md index table

5. For UPDATE/HYBRID mode, compare planned content against existing files:
   - Which existing sections are still accurate
   - Which sections need updates (content has drifted from reality)
   - Which new sections should be added
   - Which sections should be removed (reference deleted code or obsolete patterns)

**CHECKPOINT — Placement Plan:**

Present to the user:

```
## Proposed CLAUDE.md Hierarchy

### Root CLAUDE.md ({{CREATE or UPDATE}})
Sections: {{list section names with 1-line descriptions}}

### Sub-CLAUDE.md Files
| Location | Score | Justification |
|----------|-------|---------------|
| {{path}} | {{N/8}} | {{why this directory needs its own file}} |

### Skipped Directories
{{list directories that were considered but didn't qualify, with brief reason}}
```

Ask: "Does this placement plan look right? Any locations to add, remove, or consolidate?"

Incorporate the user's feedback before proceeding.

### Phase 4: Content Generation

1. Read the templates:
   ```
   Read ${CLAUDE_SKILL_DIR}/references/root-template.md
   Read ${CLAUDE_SKILL_DIR}/references/sub-template.md
   ```

2. **Generate root CLAUDE.md content:**
   - Follow the root template structure
   - Populate each section with findings from the exploration agents
   - Build the sub-CLAUDE.md index table with all planned sub-file locations
   - Keep the root file under 200 lines — be concise, link to sub-files for detail
   - Focus on what Claude needs to write correct code, not project documentation

3. **Generate each sub-CLAUDE.md:**
   - Follow the sub-template structure
   - Each file should be self-contained (Claude loads them independently)
   - Include only conventions and patterns specific to that directory
   - Focus heavily on gotchas and non-obvious behavior — these are the highest-value items
   - Keep each file under 150 lines

4. **For UPDATE/HYBRID mode — merge strategy:**
   - Read each existing CLAUDE.md file
   - Preserve sections that are still accurate and well-written (respect the author's voice)
   - Update sections where facts have drifted (file counts, command names, dependency lists)
   - Add new sections for patterns discovered during exploration that aren't yet documented
   - Remove sections that reference files, patterns, or conventions that no longer exist
   - Use Edit (not Write) for existing files to produce clean, reviewable diffs
   - If `--force` flag is set, skip merge logic and overwrite entirely

### Phase 5: Review & Write

1. Present a summary of all files to be created or updated:

   ```
   ## Files to Create
     ./CLAUDE.md ({{N}} lines)
     ./src/api/CLAUDE.md ({{N}} lines)
     ./src/frontend/CLAUDE.md ({{N}} lines)

   ## Files to Update
     ./packages/shared/CLAUDE.md ({{+N added}}, {{-N removed}}, {{~N unchanged}} lines)
   ```

2. **If `--dry-run`**: display the full proposed content of each file, then stop. Do not write anything.

3. **Otherwise**, ask the user how to proceed:
   - **Write all** — create/update every file
   - **Let me pick** — present each file individually for approval
   - **Review content first** — show full content of each file, then ask

4. Write the approved files:
   - Use **Write** for new files
   - Use **Edit** for existing files (UPDATE mode)

5. Present completion summary:
   ```
   ## CLAUDE.md Hierarchy Created

   {{tree view of all CLAUDE.md files with line counts}}

   The root CLAUDE.md indexes all sub-files. Claude will load sub-files
   automatically when working in their directories.
   ```
