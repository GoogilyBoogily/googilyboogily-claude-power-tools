---
name: skill-create
description: "Author a new Claude Code skill with interactive requirements gathering, codebase pattern research, official docs consultation, and quality-checked output. Produces a skill directory with SKILL.md and optional reference files."
disable-model-invocation: true
context: fork
argument-hint: "[skill-name or description] [--project|--user|--plugin plugin-name]"
allowed-tools: Read, Write, Glob, Grep, Bash, Agent, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Skill Creation

Author a new Claude Code skill through interactive requirements gathering, codebase research, and official documentation consultation. Produces a complete skill directory with SKILL.md and optional reference files.

## Input

$ARGUMENTS — a skill name or description, and optionally a location flag:
- `--project` — create in `.claude/skills/` (shared with team)
- `--user` — create in `~/.claude/skills/` (personal, all projects)
- `--plugin <name>` — create in a plugin's `skills/` directory

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Name/Description**: The non-flag text
- **Location Flag**: `--project`, `--user`, or `--plugin <name>`

If no location flag is provided, ask the user in Phase 1.

## Source Integrity Rules

**Every design decision must be traceable to user answers, codebase research, or official documentation.**

1. Cite codebase findings with file:line references.
2. Cite documentation with URLs.
3. Label assumptions explicitly — do not present guesses as facts.

## Process

### Phase 1: Understand Intent

1. If only a name was provided (no description), ask what the skill should do.
2. Classify the skill type:
   - **Task skill** — Procedural workflow with phases, user interaction, explicit invocation (`disable-model-invocation: true`)
   - **Reference skill** — Knowledge/context provider, auto-triggered by description matching (`user-invocable: false`)
3. If no location flag provided, ask using AskUserQuestion:
   - Project level (`.claude/skills/`) — shared with team via version control
   - User level (`~/.claude/skills/`) — personal, works across all projects
   - Plugin (`plugins/<name>/skills/`) — part of a distributable plugin

**CHECKPOINT — Confirm Understanding:**
Present your understanding of:
- What the skill does
- Skill type (task vs reference)
- Target location
- Expected invocation pattern

Ask: "Is my understanding correct? Anything to adjust before I gather detailed requirements?"

### Phase 2: Gather Requirements

Ask clarifying questions using AskUserQuestion. Batch related questions. Present which areas are relevant and let the user skip irrelevant ones.

**Question areas:**

1. **Workflow Design** — What are the main steps/phases? Is it interactive (user Q&A) or autonomous? What checkpoints should exist?
2. **Inputs & Arguments** — What does the skill accept? Flags, file paths, descriptions? What's the argument hint?
3. **Tool Requirements** — Which tools does the skill need? (Read, Write, Edit, Bash, Glob, Grep, Agent, AskUserQuestion, WebSearch, WebFetch). Apply least-privilege — only grant what's used.
4. **Supporting Files** — Does the skill need reference files? (templates, checklists, examples, schemas). These go in `references/` and are loaded via `${CLAUDE_SKILL_DIR}`.
5. **Output** — What does the skill produce? Files written, reports displayed, artifacts generated?
6. **Context & Model** — Does it need context isolation (`context: fork`)? Does it need a specific model (opus for complex reasoning, sonnet for moderate tasks)?

### Phase 3: Research

Launch two parallel agents:

**Agent 1 — Codebase Research:**
```
Search for existing skills that are similar to what we're building.
Look in:
- ~/.claude/skills/
- .claude/skills/
- Any plugins/*/skills/ directories

For each relevant skill found, note:
- Frontmatter pattern (fields used, tool grants)
- Workflow structure (phases, checkpoints)
- Reference file patterns
- How it handles arguments and user interaction

Also check for naming conflicts — does a skill with this name already exist?
Return findings with file:line citations.
```

**Agent 2 — Documentation Research:**
```
Search the official Claude Code documentation for best practices on skill authoring.
Use Context7 MCP if available, otherwise WebSearch.
Focus on:
- Valid frontmatter fields and their semantics
- Tool allowlisting patterns and security
- String substitution syntax ($ARGUMENTS, ${CLAUDE_SKILL_DIR}, etc.)
- Context isolation options
- Best practices for skill content structure
Return findings with URLs.
```

**CHECKPOINT — Present Research Findings:**
Present:
- Similar skills found (patterns to follow or differentiate from)
- Naming conflicts (if any)
- Relevant documentation findings
- Recommended patterns based on research

Ask: "Any of these patterns you'd like to adopt or avoid?"

### Phase 4: Draft & Review

Assemble the complete skill based on gathered requirements and research.

**For SKILL.md, follow this structure:**

1. **Frontmatter** with all required fields:
   - `name`: kebab-case, matching directory name
   - `description`: substantive, with trigger keywords for auto-invocation
   - `disable-model-invocation` or `user-invocable`: based on skill type
   - `context`: `fork` if multi-phase or interactive
   - `argument-hint`: if skill accepts arguments
   - `allowed-tools`: explicit, least-privilege list
   - `model`: only if non-default is justified

2. **Title and summary** — one paragraph explaining what the skill does

3. **Input section** — what `$ARGUMENTS` expects

4. **Parse Arguments section** — how to extract inputs

5. **Process section** — numbered phases with:
   - Clear phase names
   - Step-by-step instructions in imperative mood
   - CHECKPOINT markers where user approval is needed
   - Exit conditions for each phase

6. **Output section** — what the skill produces

**For reference files**, create each in `references/` with:
- Clear title header
- Consistent formatting (tables for checklists, code blocks for templates)
- Placeholder markers that are obviously not real content

**Present the draft to the user.** Show:
- Proposed SKILL.md (full content)
- Proposed reference files (if any)
- Design decisions and rationale

Ask: "Does this look right? I can revise the workflow, tools, or structure. (Up to 2 revision rounds)"

Allow up to 2 revision rounds. After revisions, proceed to generation.

### Phase 5: Generate

1. Determine the full target path:
   - Project: `.claude/skills/<skill-name>/`
   - User: `~/.claude/skills/<skill-name>/`
   - Plugin: `plugins/<plugin-name>/skills/<skill-name>/`

2. Check if directory already exists. If so, warn and ask to confirm overwrite or choose a different name.

3. Create the skill directory.

4. Write `SKILL.md` to the skill directory.

5. If reference files are needed, create `references/` subdirectory and write each file.

### Phase 6: Post-Generation

1. Confirm what was created:
   ```
   Created skill at: [full path]
   - SKILL.md ([line count] lines)
   - references/[file1] (if applicable)
   - references/[file2] (if applicable)
   ```

2. Suggest auditing: "Run `/artifact-toolkit:skill-audit [skill-dir]` to validate quality and best-practice compliance."
