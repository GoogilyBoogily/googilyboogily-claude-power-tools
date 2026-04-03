---
name: update-readme
description: "Update, audit, or create a project's README.md to match its current state. Explores the codebase in parallel to discover structure, dependencies, recent changes, and API surface, then compares findings against the existing README to identify missing sections, outdated content, and stale references. Use this skill when the README is out of date, after major refactors or version bumps, before a release, during onboarding to a new repo, or whenever the user mentions updating, fixing, refreshing, auditing, or syncing their README. Also triggers when the user says things like 'the README is wrong', 'README needs work', 'docs are stale', 'bring it up to date', 'check the readme', 'create a readme from scratch', or wants a dry-run audit of README accuracy. This skill is specifically for README.md files — not for CHANGELOG, CONTRIBUTING, API docs, JSDoc, or documentation sites."
disable-model-invocation: true
model: opus
context: fork
argument-hint: "[path-to-readme] [--dry-run] [--section <name>]"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent, AskUserQuestion
---

# Update README

Update a project's README.md by exploring the project in parallel and comparing what the README says against what the project actually is. Add what's missing, remove what's gone, update what's changed — and preserve the README's existing voice and structure throughout.

## Arguments

Parse `$ARGUMENTS` for:
- **Path** (positional, optional): Path to the README file. Default: `./README.md`
- **`--dry-run`**: Show the discrepancy report without applying any changes
- **`--section <name>`**: Only analyze and update a specific section (matched by heading text, case-insensitive)

## Phase 1: Read & Analyze the Existing README

1. Check if the README file exists at the resolved path.
   - **If it does not exist**: Set a `CREATE_MODE` flag and skip ahead to Phase 2. You'll create a README from scratch based on exploration findings.
   - **If it exists**: Read the full file and continue with analysis.

2. Extract the **section inventory** — every heading (H1, H2, H3) with its line range. This is your map of what the README covers.

3. Extract the **style fingerprint** so you can match it later:
   - Heading style: `#` markers vs underlines
   - List style: `-` vs `*` vs `1.`
   - Code blocks: fenced with language annotations, or indented?
   - Badges/shields: present? What format?
   - Emoji usage: frequent, rare, or none?
   - Tone: formal, casual, technical?
   - Person: "you" (second), "we" (first plural), or impersonal?

4. Extract **factual claims** — these are the things that can drift:
   - Version numbers
   - File/directory counts or lists
   - Command names and usage examples
   - Dependency names
   - URLs and links
   - Platform/environment requirements
   - Install and setup instructions

Hold all of this in memory. You'll compare it against reality in Phase 3.

## Phase 2: Parallel Project Exploration

Dispatch **three Agent calls in a single message** (Explore subagent type). Each agent has a focused area so they don't duplicate work.

### Agent 1 — Structure & Identity

> Explore this project's structure and identity.
>
> 1. List the top-level directory layout
> 2. Map the directory tree to depth 2-3 using Glob
> 3. Read primary manifest files — check for: package.json, Cargo.toml, pyproject.toml, setup.py, go.mod, Gemfile, pom.xml, build.gradle, CMakeLists.txt, Makefile, justfile
>    - Extract: project name, version, description, license, entry points, scripts/commands
> 4. Check for CI/CD: .github/workflows/, .gitlab-ci.yml, Dockerfile, docker-compose.yml
> 5. Count source files by type using Glob (e.g., *.ts, *.py, *.rs)
> 6. Classify the project: library, CLI, web app, API, monorepo, plugin, framework, etc.
> 7. Detect monorepo indicators: workspaces, lerna.json, nx.json, turbo.json, pnpm-workspace.yaml
>
> Return a structured report with findings for each item above. Cite file paths.

### Agent 2 — Dependencies & API Surface

> Explore this project's dependencies, exports, and how users interact with it.
>
> 1. Read dependency files — package.json (dependencies, not devDependencies), requirements.txt, pyproject.toml [dependencies], Cargo.toml [dependencies], go.mod
> 2. Identify main entry points and the public API:
>    - Look for index files, lib files, main files
>    - Grep for exports, public functions, CLI command definitions
> 3. Check for CLI binaries (bin field in package.json, console_scripts in pyproject.toml, etc.)
> 4. Look for config files users need: .env.example, config templates, environment variable references
> 5. Check for examples/ or docs/ directories and what they contain
> 6. Look for install or setup instructions in any existing documentation files
>
> Return a structured report. Focus on what a README reader would need to know — not internal implementation details.

### Agent 3 — Recent Changes & Current State

> Explore recent project changes and its current development state.
>
> 1. Run `git log --oneline -20` for recent commits
> 2. Run `git log --oneline --since="3 months ago" --format="%s" | head -30` for broader recent history
> 3. Check for CHANGELOG.md, CHANGES.md, or HISTORY.md
> 4. Grep for "deprecated", "removed", "breaking" in recent files
> 5. Look for test infrastructure: test directories, test scripts in manifests
> 6. Check for community files: CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
> 7. Check if badges/shields data has changed (CI status, coverage, npm/crates version)
> 8. Look for recently added or removed top-level files or directories
>
> Return a structured report. Flag anything that looks like it would cause README drift — new features, removed features, version bumps, new infrastructure.

Wait for all three agents to return before proceeding.

## Phase 3: Diff & Discrepancy Report

Now compare what the README says (Phase 1) against what the project actually is (Phase 2).

If `CREATE_MODE` is set (no README existed), skip the diffing. Instead, produce a **proposed section outline** based on the exploration findings, following standard conventions for the detected project type. Then go to Phase 4.

**If `--section` was specified**: Only compare claims and content that fall within the matched section's heading boundaries (from its heading line to the next heading of equal or higher level). Ignore discrepancies in other sections entirely — even if they're obviously wrong. The user asked for a focused check and that's what they should get.

For existing READMEs, go through each factual claim and each section (or just the target section if `--section` is active), and categorize discrepancies:

| Category | What it means | Example |
|----------|--------------|---------|
| **MISSING** | The project has something the README doesn't mention | A new CLI command exists but isn't documented |
| **STALE** | The README mentions something that has changed | Version says 1.2.0 but manifest says 2.0.0 |
| **REMOVED** | The README describes something that no longer exists | A deprecated API endpoint still documented |
| **INCOMPLETE** | A section exists but is materially lacking | Install section exists but doesn't mention Docker, despite a Dockerfile being present |
| **STRUCTURAL** | A standard section is missing entirely for this project type | CONTRIBUTING.md exists but README has no Contributing section |

For each discrepancy, record:
- Which README section it affects (or "new section needed")
- What the README currently says (quote the text)
- What the project actually shows (cite the agent finding)
- Proposed action: add, update, remove, or restructure

**Important**: Only flag things that are clearly wrong or missing. Don't rewrite prose that's simply written differently than you would write it. The goal is accuracy, not editorial preference. If a description is technically correct but phrased casually, leave it alone.

Also check in reverse — for each significant finding from the exploration agents, verify the README covers it. This bidirectional check catches both "README says wrong thing" and "README is silent about important thing."

### Monorepo detection

If Agent 1 detected a monorepo, ask the user before proceeding:
> "This appears to be a monorepo. Should I update the root README, a specific package's README, or both?"

### Auto-generated README detection

If the README contains markers like `<!-- AUTO-GENERATED -->`, `<!-- DO NOT EDIT -->`, or tool-specific headers (typedoc, cargo-readme, rustdoc, etc.), warn the user:
> "This README appears to be auto-generated by [tool]. Manual edits may be overwritten on the next generation. Do you want to proceed anyway, or update the generation config instead?"

## Phase 4: User Checkpoint

Present the discrepancy report in a clean, scannable format. Group by category.

**If `--dry-run` was specified**: Display the report and stop. Do not ask about applying changes.

**If `--section` was specified**: The report should already be scoped to that section from Phase 3. Confirm it contains only discrepancies within the target section's boundaries.

**Otherwise**: Ask the user what to do using AskUserQuestion with these options:
- **Apply all** — Update the README with all proposed changes
- **Let me pick** — Show a numbered list so the user can select which changes to apply (comma-separated numbers)
- **Abort** — Don't change anything

If the user picks "Let me pick", present each discrepancy numbered and let them provide their selections.

### Extensive drift warning

If more than 70% of sections have discrepancies, add an extra option:
- **Full rewrite** — Regenerate the README from scratch while preserving the existing style

## Phase 5: Apply Updates

Apply the approved changes. The approach depends on the situation:

### Existing README (normal case)

Use **Edit** (not Write) for surgical updates. This preserves untouched sections exactly and avoids voice/style drift.

Processing order matters to avoid line-number shifts:
1. **Removals first** — Delete stale/removed content
2. **Updates second** — Modify existing text in-place
3. **Additions last** — Insert new sections at the right position

When adding new content, match the existing README's style fingerprint from Phase 1:
- Same heading level convention
- Same list style
- Same code block formatting
- Same tone and voice

### Creating from scratch (CREATE_MODE)

Use **Write** to create a new README based on the section outline approved in Phase 4. Follow standard conventions for the detected project type:
- Title + badges
- Description (from manifest)
- Install/setup
- Usage with examples
- API reference (if library)
- CLI reference (if CLI)
- Configuration
- Contributing
- License

### Full rewrite (user chose this option)

Use **Write** to replace the entire README. Preserve the existing style fingerprint but regenerate all content from exploration findings.

## After applying changes

Present a summary:

```
## README Updated

Applied N changes:
  [+] Added: ...
  [~] Updated: ...
  [-] Removed: ...

Unchanged sections: ...
```

If any changes were skipped, note them too:
```
Skipped (by user choice):
  - ...
```
