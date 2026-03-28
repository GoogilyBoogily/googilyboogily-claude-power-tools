---
name: command-create
description: "Author a new Claude Code command with interactive requirements gathering, security-conscious tool grants, codebase research, and quality-checked output. Produces a single command .md file with proper frontmatter and imperative instructions."
disable-model-invocation: true
context: fork
argument-hint: "[command-name or description] [--project|--user|--plugin plugin-name]"
allowed-tools: Read, Write, Glob, Grep, Bash, Agent, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Command Creation

Author a new Claude Code command through interactive requirements gathering, codebase research, and security-conscious design. Produces a complete command `.md` file.

## Input

$ARGUMENTS — a command name or description, and optionally a location flag:
- `--project` — create in `.claude/commands/` (shared with team)
- `--user` — create in `~/.claude/commands/` (personal, all projects)
- `--plugin <name>` — create in a plugin's `commands/` directory

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Name/Description**: The non-flag text
- **Location Flag**: `--project`, `--user`, or `--plugin <name>`

If no location flag is provided, ask the user in Phase 1.

## Source Integrity Rules

**Every design decision must be traceable to user answers, codebase research, or official documentation.**

## Process

### Phase 1: Understand Intent

1. If only a name was provided (no description), ask what the command should do.
2. Determine the command's nature:
   - Does it accept arguments? What kind?
   - Does it need inline bash execution (`!command`)?
   - Does it need file content injection (`@filename`)?
   - Does it use namespacing (subdirectories)?
3. If no location flag provided, ask using AskUserQuestion:
   - Project level (`.claude/commands/`) — shared with team
   - User level (`~/.claude/commands/`) — personal
   - Plugin (`plugins/<name>/commands/`) — distributable

**CHECKPOINT — Confirm Understanding:**
Present:
- What the command does
- Target location and resulting command name (e.g., `commands/deploy.md` → `/deploy`)
- Key features needed (arguments, bash, file refs)

Ask: "Is my understanding correct?"

### Phase 2: Gather Requirements

Ask clarifying questions using AskUserQuestion. Batch related questions.

**Question areas:**

1. **Purpose & Workflow** — What steps does the command perform? Is it a single action or multi-step procedure?
2. **Arguments** — What does `$ARGUMENTS` contain? Format the `argument-hint`. Does it need positional indexing (`$ARGUMENTS[0]`, `$1`)?
3. **Tool Requirements (Security Focus)** — Which tools are needed? For Bash, what prefix restrictions apply?
   - Read-only analysis: `Read, Grep, Glob`
   - Git operations: `Bash(git *), Read`
   - File generation: `Write, Read, Glob`
   - Full editing: `Read, Write, Edit, Bash`
   - Present tool categories and ask the user to select or customize.
4. **Dynamic Features** — Does the command need:
   - Inline bash output? (`` !`git status --short` ``)
   - File content injection? (`@package.json`)
   - Both?
5. **Output** — What does the command produce? What should the user see?

### Phase 3: Research

Launch two parallel agents:

**Agent 1 — Codebase Research:**
```
Search for existing commands similar to what we're building.
Look in:
- ~/.claude/commands/
- .claude/commands/
- Any plugins/*/commands/ directories

For each relevant command found, note:
- Frontmatter pattern (allowed-tools, argument-hint)
- How it uses $ARGUMENTS, !command, @file
- Content structure and length
- Security patterns (Bash restrictions)

Also check for naming conflicts — does a command with this name already exist?
Return findings with file:line citations.
```

**Agent 2 — Documentation Research:**
```
Search the official Claude Code documentation for best practices on command authoring.
Use Context7 MCP if available, otherwise WebSearch.
Focus on:
- Valid frontmatter fields for commands
- allowed-tools security patterns and Bash prefix restrictions
- String substitution syntax ($ARGUMENTS, !command, @file)
- Command naming and namespace conventions
Return findings with URLs.
```

**CHECKPOINT — Present Research Findings:**
Present:
- Similar commands found
- Naming conflicts (if any)
- Security patterns from documentation
- Recommended tool grants

Ask: "Any patterns to adopt or avoid?"

### Phase 4: Draft & Review

Assemble the complete command file.

**Follow this structure:**

1. **Frontmatter:**
   ```yaml
   ---
   description: "{{Substantive description of what the command does}}"
   allowed-tools: {{minimal, security-conscious tool list}}
   argument-hint: "{{[required] [--optional]}}"
   category: {{workflow|ai-assistant|validation|setup}}
   model: {{only if justified}}
   ---
   ```

2. **Title** — `# {{Command Name}}`

3. **Instructions in imperative mood** — written TO the AI:
   - "Run git status to check the current state"
   - "Read the configuration file at $ARGUMENTS"
   - "Create a new file at the specified path"
   - NOT "The command will run git status" or "I will read the file"

4. **Dynamic content** where needed:
   - `` !`command` `` for bash output injected before the AI sees instructions
   - `@filename` for file contents injected inline
   - `$ARGUMENTS` for user-provided input

**Present the draft to the user.** Show:
- Complete command `.md` content
- Resulting command name and invocation pattern
- Security analysis of tool grants

Ask: "Does this look right? I can revise. (Up to 2 revision rounds)"

Allow up to 2 revision rounds.

### Phase 5: Generate

1. Determine the full target path:
   - Project: `.claude/commands/<name>.md`
   - User: `~/.claude/commands/<name>.md`
   - Plugin: `plugins/<plugin-name>/commands/<name>.md`
   - For namespaced commands: `commands/<namespace>/<name>.md`

2. Check if file already exists. If so, warn and ask to confirm overwrite or choose a different name.

3. Create parent directories if needed.

4. Write the command file.

### Phase 6: Post-Generation

1. Confirm what was created:
   ```
   Created command at: [full path]
   Invoke with: /[plugin:]command-name [arguments]
   Lines: [count]
   Tools granted: [list]
   ```

2. Suggest auditing: "Run `/artifact-toolkit:command-audit [path]` to validate quality and security compliance."
