# Skill Template Reference

This file documents the structural template for Claude Code skills. Use it as a reference when assembling the SKILL.md during Phase 4.

## Task Skill Template

```yaml
---
name: {{skill-name}}
description: "{{Substantive description with trigger keywords for auto-invocation matching}}"
disable-model-invocation: true
context: fork
argument-hint: "{{[required-arg] [--optional-flag]}}"
allowed-tools: {{comma-separated tool list}}
model: {{opus|sonnet|haiku — only if justified}}
---
```

```markdown
# {{Skill Title}}

{{One paragraph summary: what this skill does and when to use it.}}

## Input

$ARGUMENTS — {{description of expected arguments and flags}}.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **{{Arg 1}}**: {{how to extract}}
- **{{Arg 2}}**: {{how to extract}} (optional)

## Process

### Phase 1: {{Phase Name}}

1. {{Step in imperative mood}}
2. {{Step in imperative mood}}

**CHECKPOINT — {{Checkpoint Name}}:**
Present {{what to present}}.
Ask: "{{confirmation question}}"

### Phase 2: {{Phase Name}}

1. {{Step in imperative mood}}
2. {{Step in imperative mood}}

### Phase N: {{Final Phase}}

1. {{Step in imperative mood}}
2. Return {{output description}}.
```

## Reference Skill Template

```yaml
---
name: {{skill-name}}
description: "{{Description with natural language keywords that Claude matches against conversation context to auto-invoke this skill}}"
user-invocable: false
---
```

```markdown
# {{Skill Title}}

{{Knowledge or context this skill provides.}}

## {{Section 1}}

{{Reference content — facts, patterns, checklists, etc.}}

## {{Section 2}}

{{More reference content.}}
```

## Valid Frontmatter Fields

| Field | Required | Values | Notes |
|-------|----------|--------|-------|
| `name` | Yes | kebab-case string | Must match directory name |
| `description` | Yes | string | Include trigger keywords |
| `allowed-tools` | Recommended | comma-separated tool names | Omit = all tools |
| `disable-model-invocation` | No | `true` | Manual-only invocation |
| `user-invocable` | No | `false` | Hidden from menu, auto-triggered |
| `context` | No | `fork` | Clean execution context |
| `argument-hint` | No | string | Help text shown to users |
| `model` | No | `opus`, `sonnet`, `haiku` | Override default. Also accepts full model IDs (e.g., `claude-opus-4-6`) and extended context variants (`opus[1m]`, `sonnet[1m]`) |
| `effort` | No | `low`, `medium`, `high`, `max` | Reasoning depth (`max` is Opus only) |
| `paths` | No | glob patterns | File paths relevant to this skill |
| `shell` | No | string | Shell to use for commands |
| `hooks` | No | object | Lifecycle hooks |
| `agent` | No | string | Agent to delegate to |

## Valid String Substitutions

| Substitution | Description |
|-------------|-------------|
| `$ARGUMENTS` | Full user-provided arguments |
| `$ARGUMENTS[N]` | Positional argument at index N |
| `$N` | Shorthand for `$ARGUMENTS[N]` |
| `${CLAUDE_SKILL_DIR}` | Path to the skill's directory |
| `${CLAUDE_SESSION_ID}` | Current session identifier |
| `` !`shell-command` `` | Dynamic bash execution (output replaces placeholder) |

## Tool Reference

| Tool | Use For |
|------|---------|
| `Read` | Reading files |
| `Write` | Creating new files |
| `Edit` | Modifying existing files |
| `Glob` | Finding files by pattern |
| `Grep` | Searching file contents |
| `Bash` | Shell commands (use prefix restrictions: `Bash(git *)`) |
| `Agent` | Launching parallel sub-agents |
| `AskUserQuestion` | Interactive user Q&A |
| `WebSearch` | Web search |
| `WebFetch` | Fetching web pages |
| `Skill` | Invoking other skills |
