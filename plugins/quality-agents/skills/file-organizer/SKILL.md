---
name: file-organizer
description: "Reorganize files and folders using PARA, Diataxis, and MECE methodologies. Use when asked to restructure directories, design taxonomies, standardize naming conventions, or detect structural anti-patterns."
disable-model-invocation: true
context: fork
argument-hint: "[target-directory-path]"
allowed-tools: Read, Glob, Grep, Bash, Edit, Write, AskUserQuestion
model: opus
---

# File Organizer

Design clean, domain-separated directory hierarchies using research-backed methodologies. Audit existing structures, detect anti-patterns, propose reorganizations, and execute migrations with user confirmation.

## Input

`$ARGUMENTS` — the target directory path to organize. If empty, ask using AskUserQuestion.

## Safety Rules

1. **NEVER** move, rename, or delete files without explicit user confirmation
2. **NEVER** touch source code directories (src/, lib/, app/) unless specifically asked
3. **NEVER** modify file contents — only move/rename files and create directories
4. Always present a complete migration plan and wait for approval before executing
5. Create a backup reference (list of original paths) before any bulk operation

## Core Principles

1. **MECE** (Mutually Exclusive, Collectively Exhaustive) — every file belongs in exactly one place, every file has a place
2. **Primary Home Rule** — each file gets one canonical location; use symlinks or references for cross-cutting concerns
3. **Single Axis Per Level** — each directory level sorts by one dimension only (by type, by domain, by stage — never mixed)
4. **Depth Limit** — max 3-4 levels deep; flatten if deeper
5. **Goldilocks Breadth** — 5-12 top-level categories; fewer than 5 means categories are too broad, more than 12 means they need grouping

## Decision Script: Where Does This File Go?

For any file, answer these questions in order. The first match wins:

1. **Is it configuration?** (dotfiles, .json/.yaml config, CI files) → `config/` or project root
2. **Is it documentation?** (.md, .rst, .adoc about how/why/what) → `docs/` subtree (apply Diataxis within)
3. **Is it a template or generator?** (scaffolding, boilerplate, cookiecutter) → `templates/`
4. **Is it test data or fixtures?** (sample inputs, mocks, snapshots) → alongside tests or `fixtures/`
5. **Is it a static asset?** (images, fonts, icons, media) → `assets/` subdivided by type
6. **Is it a script or tool?** (build scripts, dev utilities, one-off scripts) → `scripts/` or `tools/`
7. **Is it domain content?** → categorize by domain using PARA or Diataxis (see Phase 2)

## Process

### Phase 1: Audit

Scan the target directory to understand current structure. Load audit commands from `${CLAUDE_SKILL_DIR}/references/anti-patterns.md` and run:

1. Map the current structure (max 4 levels deep, first 200 files)
2. Count files per directory to identify hotspots
3. Identify file type distribution
4. Run all anti-pattern detection commands
5. Present a summary of findings: file count, type distribution, anti-patterns detected

### Phase 2: Classify

Determine which taxonomy applies. Load taxonomies from `${CLAUDE_SKILL_DIR}/references/taxonomies.md`.

**Decision:**
- If >70% of files are `.md`, `.rst`, `.adoc` → use **Diataxis** taxonomy
- Otherwise → use **PARA** taxonomy
- For hybrid projects → apply PARA at top level, Diataxis within a `docs/` subtree

Present the chosen taxonomy and reasoning to the user.

### Phase 3: Propose

Generate a migration plan with two parts:

**1. Tree diagram** with annotations explaining each category:

```
project/
├── category-a/          # [annotation: what goes here]
│   ├── subcategory/
│   └── ...
├── category-b/          # [annotation]
└── archive/             # [annotation]
```

**2. Migration table** showing every file move:

| # | Current Path | New Path | Action |
|---|---|---|---|
| 1 | `old/path/file.md` | `new/path/file.md` | move |
| 2 | `misc/random.txt` | `resources/random.txt` | move + rename dir |
| 3 | `empty-dir/` | — | delete |

**3. Summary:**
- Files moved: N
- Directories created: N
- Directories removed: N
- Naming changes: N

### Phase 4: Confirm

**CHECKPOINT — Migration Approval:**

Present the complete migration plan from Phase 3 to the user.

Ask: "This will move N files and create N directories. Should I proceed, or would you like to adjust the plan?"

**Do NOT proceed without explicit approval.**

### Phase 5: Execute

1. Save the original path listing as a backup reference (write to a temp file or display)
2. Create all new directories with `mkdir -p`
3. Move files using `mv` commands
4. Log every operation as it executes
5. Remove empty directories left behind

### Phase 6: Validate

Load the validation checklist from `${CLAUDE_SKILL_DIR}/references/validation-checklist.md`.

Run every check. Report results as:
- ✅ Passed checks
- ❌ Failed checks with details and suggested fixes

If any critical checks fail, present them and ask the user how to proceed.

## Output

Present the final validated structure as a tree diagram with the validation results summary.
