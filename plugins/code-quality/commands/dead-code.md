---
description: Detect and optionally remove dead code, unused dependencies, orphaned files, and superfluous content across any project type
allowed-tools: Task, Read, Grep, Glob, Edit, MultiEdit, Write, Bash(ls:*, cat:*, find:*, git:*, wc:*, head:*, tail:*, jq:*, python3:*, node:*, rm:*, npm:*, pip:*, cargo:*, go:*)
argument-hint: '[scope/mode] - e.g., "src/", "--fix", "--fix src/", "unused deps only"'
---

# Dead Code Finder

## Project Detection
!`ls package.json tsconfig.json pyproject.toml setup.py setup.cfg requirements.txt Cargo.toml go.mod go.sum Gemfile pom.xml build.gradle build.gradle.kts composer.json mix.exs CMakeLists.txt Makefile 2>/dev/null; ls *.uproject *.csproj *.sln 2>/dev/null`

## File Landscape
!`find . -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/vendor/*' -not -path '*/target/*' -not -path '*/__pycache__/*' -not -path '*/dist/*' -not -path '*/build/*' -not -path '*/.next/*' -type f | grep -oE '\.[a-zA-Z0-9]+$' | sort | uniq -c | sort -rn | head -20`

## Repository State
!`git status --short 2>/dev/null | head -10; echo "---"; git log --oneline -3 2>/dev/null`

## Source File Count
!`find . -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/vendor/*' -not -path '*/target/*' -not -path '*/__pycache__/*' -not -path '*/dist/*' -not -path '*/build/*' -not -path '*/.next/*' -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.py' -o -name '*.rs' -o -name '*.go' -o -name '*.rb' -o -name '*.java' -o -name '*.kt' -o -name '*.cs' -o -name '*.cpp' -o -name '*.h' -o -name '*.php' -o -name '*.ex' -o -name '*.exs' -o -name '*.md' -o -name '*.vue' -o -name '*.svelte' \) 2>/dev/null | wc -l`

## Mode Detection

Parse `$ARGUMENTS` to determine:

1. **Mode**: If arguments contain `--fix`, `fix`, `clean`, `cleanup`, or `remove` → **Fix Mode**. Otherwise → **Report Mode** (read-only).
2. **Scope**: If arguments contain a directory path (e.g., `src/`, `lib/`) or file pattern (e.g., `*.ts`), use that as the analysis scope. Otherwise, scan the full project.
3. **Category filter**: If arguments mention a specific category (e.g., "unused deps", "orphaned files", "commented code"), only run that category's analysis.

## Pre-Analysis: Determine Project Type and Strategy

Based on the detected manifest files and file extensions above, determine:

1. **Project type(s)**: JS/TS, Python, Rust, Go, Unreal Engine, C#, Ruby, Java/Kotlin, PHP, Elixir, C/C++, Content/Docs, or Multi-language
2. **Source file extensions** to analyze
3. **Import/require patterns** for this language
4. **Export/public patterns** for this language
5. **Comment syntax** for this language
6. **Dependency manifest** and how to parse it
7. **Entry points** to exclude from orphan detection
8. **Test file patterns** (e.g., `*.test.ts`, `*_test.go`, `test_*.py`)
9. **Asset directories** to scan (e.g., `public/`, `static/`, `assets/`, `Content/`)
10. **Config files** to check for staleness

Pass this context to each subagent so they know exactly what patterns to use.

## Analysis Execution

Launch dead-code-analyst subagents via the Task tool. Group into parallel batches — all tasks within a batch launch in a SINGLE message, batches run sequentially.

### Batch 1 — Structural Analysis

Launch these 4 tasks in parallel (single message with 4 Task calls):

**Task 1: Unused Dependencies**
```
Subagent: dead-code-analyst
Description: Find unused dependencies in [project type] project
Prompt: Analyze this [project type] project for unused dependencies.
Manifest file: [detected manifest]
Source extensions: [detected extensions]
Import pattern: [detected pattern]
Scope: [full project or $ARGUMENTS path]
Exclude: devDependencies used only in test/build files are OK
```

**Task 2: Unused Exports/Functions**
```
Subagent: dead-code-analyst
Description: Find unused exports and public functions
Prompt: Find exported/public functions, classes, types, and constants that are never imported or referenced by other files in this [project type] project.
Source extensions: [detected extensions]
Export pattern: [detected pattern]
Import pattern: [detected pattern]
Scope: [full project or $ARGUMENTS path]
Exclude: entry points, public API barrel files, framework-required exports
```

**Task 3: Orphaned Files**
```
Subagent: dead-code-analyst
Description: Find orphaned source files
Prompt: Find source files not imported, required, included, or referenced by any other file in this [project type] project.
Source extensions: [detected extensions]
Import pattern: [detected pattern]
Scope: [full project or $ARGUMENTS path]
Exclude entry points: [detected entry points]
Exclude patterns: test files, config files, migration files, scripts in bin/
```

**Task 4: Unused Assets**
```
Subagent: dead-code-analyst
Description: Find unused media and asset files
Prompt: Find image, font, media, and other asset files not referenced in any source, markup, or stylesheet.
Asset directories: [detected asset dirs]
Source extensions: [detected extensions plus .html, .css, .scss, .less, .md]
Scope: [full project or $ARGUMENTS path]
```

### Batch 2 — Code-Level Analysis

After Batch 1 completes, launch these 4 tasks in parallel:

**Task 5: Unreachable Code**
```
Subagent: dead-code-analyst
Description: Find unreachable code blocks
Prompt: Find code that can never execute: statements after return/throw/break, if(false) blocks, dead branches, unreachable switch cases.
Source extensions: [detected extensions]
Comment syntax: [detected syntax]
Scope: [full project or $ARGUMENTS path]
```

**Task 6: Unused Variables/Parameters**
```
Subagent: dead-code-analyst
Description: Find unused variables and parameters
Prompt: Find variables that are assigned but never read, and function parameters that are never used in the function body.
Source extensions: [detected extensions]
Scope: [full project or $ARGUMENTS path]
Exclude: interface-required parameters (e.g., Express middleware `next`), underscore-prefixed vars
```

**Task 7: Commented-Out Code**
```
Subagent: dead-code-analyst
Description: Find commented-out code blocks
Prompt: Find blocks of 3+ consecutive lines of commented-out code containing code-like patterns (function calls, assignments, control flow, brackets).
Source extensions: [detected extensions]
Comment syntax: [detected syntax]
Scope: [full project or $ARGUMENTS path]
Exclude: documentation comments (JSDoc, docstrings, rustdoc), license headers
```

**Task 8: Empty/Stub Implementations**
```
Subagent: dead-code-analyst
Description: Find empty and stub function implementations
Prompt: Find functions/methods with empty bodies, pass-only implementations, TODO-only bodies, or NotImplementedError/todo!() stubs.
Source extensions: [detected extensions]
Scope: [full project or $ARGUMENTS path]
Exclude: intentional no-ops (event handlers, interface stubs with clear documentation)
```

### Batch 3 — Metadata Analysis

After Batch 2 completes, launch these 2 tasks in parallel:

**Task 9: Stale Configuration**
```
Subagent: dead-code-analyst
Description: Find stale configuration entries
Prompt: Find config entries referencing non-existent files, modules, paths, or scripts. Check tsconfig paths, webpack aliases, eslint overrides, CI configs, Dockerfile references, package.json scripts.
Config files: [list detected config files]
Scope: [full project or $ARGUMENTS path]
```

**Task 10: Dead Test Code**
```
Subagent: dead-code-analyst
Description: Find dead and skipped test code
Prompt: Find skipped/disabled tests (it.skip, @pytest.mark.skip, #[ignore], @Disabled) and tests that reference functions/classes that no longer exist.
Test patterns: [detected test file patterns]
Source extensions: [detected extensions]
Scope: [full project or $ARGUMENTS path]
```

## Report Consolidation

After ALL tasks complete, merge all findings into this report format:

```
# 🔍 Dead Code Analysis Report

## Project Profile
| Property | Value |
|----------|-------|
| Type | [detected project type(s)] |
| Scope | [full project or scoped path] |
| Source files scanned | [count from subagent reports] |

## Executive Summary
| Category | HIGH | MED | LOW | Est. Removable Lines |
|----------|------|-----|-----|---------------------|
| Unused Dependencies | X | X | X | ~N |
| Unused Exports/Functions | X | X | X | ~N |
| Orphaned Files | X | X | X | ~N |
| Unused Assets | X | X | X | N files |
| Unreachable Code | X | X | X | ~N |
| Unused Variables/Params | X | X | X | ~N |
| Commented-Out Code | X | X | X | ~N |
| Empty Stubs | X | X | X | ~N |
| Stale Configuration | X | X | X | ~N |
| Dead Tests | X | X | X | ~N |
| **TOTAL** | **X** | **X** | **X** | **~N lines** |

## ⚡ Quick Wins (zero risk, remove now)
HIGH-confidence items that are completely safe to remove.
Each with file:line, what to remove, and why it's safe.

## 🔥 Hotspots
Directories ranked by dead code density:

[directory]     [bar] [N] findings ([N] HIGH)
[directory]     [bar] [N] findings ([N] HIGH)
[directory]     [bar] [N] findings ([N] HIGH)

## Detailed Findings

### Unused Dependencies
[Paste subagent findings directly]

### Unused Exports/Functions
[Paste subagent findings directly]

### Orphaned Files
[Paste subagent findings directly]

### Unused Assets
[Paste subagent findings directly]

### Unreachable Code
[Paste subagent findings directly]

### Unused Variables/Parameters
[Paste subagent findings directly]

### Commented-Out Code
[Paste subagent findings directly]

### Empty/Stub Implementations
[Paste subagent findings directly]

### Stale Configuration
[Paste subagent findings directly]

### Dead Test Code
[Paste subagent findings directly]

## Cleanup Impact Estimate
- Lines removable (HIGH confidence): ~N
- Files deletable: N
- Dependencies removable: N
- Run `/dead-code --fix` to auto-clean HIGH-confidence items
```

## Fix Mode

If Fix Mode was detected in `$ARGUMENTS`:

### Safety First
1. Create a git stash checkpoint:
   ```bash
   git stash push -m "dead-code-checkpoint-$(date +%Y%m%d-%H%M%S)"
   ```
2. Record the stash ref for rollback

### Present Findings for Confirmation
Show the user ALL HIGH-confidence findings organized by removal phase.
**Ask the user to confirm before proceeding with any removals.**

### Phased Removal (execute sequentially)

**Phase 1 — Commented-Out Code + Empty Stubs** (safest: no behavioral change)
- Remove identified commented-out code blocks
- Remove empty/stub function bodies (replace with appropriate error or remove entirely)
- Verify: run project's test/lint/build commands

**Phase 2 — Unused Dependencies + Stale Config** (manifest changes)
- Remove unused deps from package.json/pyproject.toml/Cargo.toml/etc.
- Remove stale config entries referencing non-existent paths
- Verify: run install + test/lint/build commands

**Phase 3 — Orphaned Files + Unused Assets** (file deletions)
- Delete orphaned source files
- Delete unused asset files
- Verify: run test/lint/build commands

**Phase 4 — Unused Exports + Unreachable Code + Dead Variables** (code changes)
- Remove unused export declarations
- Remove unreachable code blocks
- Remove unused variable declarations
- Verify: run test/lint/build commands

**Phase 5 — Dead Tests** (test changes: user decides per item)
- Present each skipped test and ask user whether to:
  - Remove it (if testing removed functionality)
  - Unskip it (if the skip reason is resolved)
  - Keep it (if the skip reason is still valid)
- Verify: run test suite

### After All Phases
Report what was removed vs. skipped:
```
## Cleanup Results
| Phase | Items Removed | Items Skipped | Lines Removed |
|-------|--------------|---------------|---------------|
| 1. Comments/Stubs | N | N | ~N |
| 2. Deps/Config | N | N | ~N |
| 3. Files/Assets | N | N | ~N |
| 4. Exports/Code | N | N | ~N |
| 5. Tests | N | N | ~N |
| **Total** | **N** | **N** | **~N** |

Rollback if needed: `git stash pop`
```
