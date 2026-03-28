# Command Template Reference

This file documents the structural template for Claude Code commands. Use it as a reference when assembling the command during Phase 4.

## Basic Command Template

```yaml
---
description: "{{What the command does — clear, substantive, one sentence}}"
allowed-tools: {{comma-separated tool list}}
argument-hint: "{{[required-arg] [--flag]}}"
category: {{workflow|ai-assistant|validation|setup}}
---
```

```markdown
# {{Command Title}}

{{Imperative instructions to the AI.}}

{{Step-by-step workflow written in imperative mood.}}
```

## Command with Arguments

```yaml
---
description: "Create a new component with the specified name"
allowed-tools: Write, Read, Glob
argument-hint: "[component-name] [--type functional|class]"
---
```

```markdown
# Create Component

Create a new React component named $ARGUMENTS.

1. Check if `src/components/$ARGUMENTS` already exists using Glob.
2. If it exists, report the conflict and stop.
3. Create `src/components/$ARGUMENTS/$ARGUMENTS.tsx` with a functional component template.
4. Create `src/components/$ARGUMENTS/index.ts` with a re-export.
```

## Command with Bash Execution

```yaml
---
description: "Analyze git history and show commit statistics"
allowed-tools: Bash(git *), Read
---
```

````markdown
# Git Stats

Current repository state:
```
!`git log --oneline -20`
```

Analyze the recent git history shown above. Identify:
1. Most active files (by commit frequency)
2. Commit patterns (time of day, message conventions)
3. Any concerning patterns (large commits, missing messages)
````

## Command with File References

```yaml
---
description: "Review the project configuration and suggest improvements"
allowed-tools: Read, Grep, Glob
---
```

```markdown
# Config Review

Review the project configuration:

@package.json
@tsconfig.json

Analyze the configuration files above for:
1. Outdated dependencies
2. Missing recommended settings
3. Inconsistencies between configs
```

## Valid Frontmatter Fields

| Field | Required | Values | Notes |
|-------|----------|--------|-------|
| `description` | Yes | string | What the command does |
| `allowed-tools` | Yes | comma-separated tool names | Security whitelist |
| `argument-hint` | No | string | Help text for arguments |
| `category` | No | string | UI grouping |
| `model` | No | `opus`, `sonnet`, `haiku` | Override default. Also accepts full model IDs (e.g., `claude-opus-4-6`) and extended context variants (`opus[1m]`, `sonnet[1m]`) |

## Tool Security Patterns

| Pattern | Grants | Use When |
|---------|--------|----------|
| `Read, Grep, Glob` | Read-only analysis | Reporting, analysis commands |
| `Bash(git *)` | Git commands only | Git workflow commands |
| `Bash(git *), Read, Edit` | Git + file editing | Commit prep, branch management |
| `Bash(npm *, yarn *, pnpm *)` | Package managers | Dependency management |
| `Write, Read, Glob` | File creation + reading | Scaffolding, code generation |
| `Read, Write, Edit, Bash` | Full access | Only for commands that genuinely need it |

## String Substitution Reference

| Syntax | Description | Example |
|--------|-------------|---------|
| `$ARGUMENTS` | Full user arguments | `Deploy $ARGUMENTS to staging` |
| `$ARGUMENTS[0]` | First argument | `Create file named $ARGUMENTS[0]` |
| `$1`, `$2` | Positional shorthand | `Copy $1 to $2` |
| `` !`command` `` | Bash output injection | `` !`git branch --show-current` `` |
| `@filepath` | File content injection | `@package.json` |
| `${CLAUDE_SESSION_ID}` | Session identifier | For unique temp file names |

## Content Rules

1. **Write TO the AI** — Imperative mood: "Run X", "Create Y", "Check Z"
2. **Never write AS the AI** — Not "I will...", "The command will...", "This analyzes..."
3. **Keep it concise** — Under 200 lines. If longer, convert to a skill.
4. **One concern per command** — Don't combine unrelated workflows.
