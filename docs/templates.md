# Templates: Skills, Commands, and Agents

Copy-paste templates for all three Claude Code artifact types. These match the canonical templates in `plugins/artifact-toolkit/skills/*/references/`.

---

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

---

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

---

## Command Template

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

### Command with Arguments

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

### Command with Dynamic Bash

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

Analyze the recent git history shown above.
````

### Command with File References

```yaml
---
description: "Review the project configuration"
allowed-tools: Read, Grep, Glob
---
```

```markdown
# Config Review

Review the project configuration:

@package.json
@tsconfig.json

Analyze for outdated dependencies and inconsistencies.
```

---

## Domain Expert Agent Template

```yaml
---
name: {{domain-expert}}
description: "{{Domain}} expert handling {{problem-1, problem-2, problem-3, ...}}. Use PROACTIVELY for {{trigger-condition-1, trigger-condition-2, trigger-condition-3}}."
tools: {{Read, Grep, Glob, Bash, Edit, Write}}
model: {{opus|sonnet|haiku — only if justified}}
---
```

```markdown
# {{Domain}} Expert

You are a {{domain}} expert with deep knowledge of {{specific-areas}}.

## Step 0: Route or Stay

If the issue is **not** {{domain}}-specific, delegate and STOP:
- {{Problem type 1}} → **{{specialist-agent}}**, STOP
- {{Problem type 2}} → **{{specialist-agent}}**, STOP
- {{Problem type 3}} → **{{specialist-agent}}**, STOP

**Stay here** when: {{list of conditions for handling locally}}

## Core Process

1. **Environment Detection** (prefer Read/Grep/Glob over Bash):
   - Check {{config-file-1}} for {{what to look for}}
   - Detect {{framework/tool}} version and configuration
   - Analyze {{project structure patterns}}

2. **Problem Analysis**:
   - **{{Category 1}}**: {{description and what to check}}
   - **{{Category 2}}**: {{description and what to check}}
   - **{{Category 3}}**: {{description and what to check}}
   - **{{Category 4}}**: {{description and what to check}}

3. **Solution Implementation**:
   - **Quick fix**: {{fast, safe, minimal change}}
   - **Proper solution**: {{correct, follows conventions}}
   - **Best practice**: {{ideal, may require refactoring}}
   - Validate with {{verification command or check}}

## Stop Conditions
- Resolved when {{success criteria}}
- STOP if {{out-of-scope indicator}}
```

---

## Sub-Domain Specialist Agent Template

```yaml
---
name: {{domain-subdomain-expert}}
description: "{{Sub-domain}} specialist for {{specific-problems}}. Use PROACTIVELY when {{narrow-trigger-conditions}}."
tools: {{Read, Edit, Grep, Glob}}
---
```

```markdown
# {{Sub-Domain}} Specialist

You are a {{sub-domain}} specialist with deep expertise in {{narrow-area}}.

## Step 0: Route or Stay

If different expertise is needed, delegate and STOP:
- General {{domain}} issues → **{{parent-domain-expert}}**, STOP
- {{Adjacent domain}} → **{{adjacent-expert}}**, STOP

**Stay here** when: {{specific conditions for this sub-domain}}

## Core Process

1. {{Specialized detection steps}}
2. {{Deep analysis specific to sub-domain}}
3. {{Expert-level solutions}}

## Stop Conditions
- Resolved when {{sub-domain success criteria}}
- Escalate to **{{parent-expert}}** when {{complexity exceeds sub-domain}}
```

---

## Frontmatter Field Reference

### Skill Fields

| Field | Required | Values | Notes |
|-------|----------|--------|-------|
| `name` | Yes | kebab-case string | Must match directory name |
| `description` | Yes | string | Include trigger keywords |
| `allowed-tools` | Recommended | comma-separated tool names | Omit = all tools |
| `disable-model-invocation` | No | `true` | Manual-only invocation |
| `user-invocable` | No | `false` | Hidden from menu, auto-triggered |
| `context` | No | `fork` | Clean execution context |
| `argument-hint` | No | string | Help text shown to users |
| `model` | No | `opus`, `sonnet`, `haiku` | Also accepts full model IDs and `opus[1m]`, `sonnet[1m]` |
| `effort` | No | `low`, `medium`, `high`, `max` | Reasoning depth (`max` is Opus only) |
| `paths` | No | glob patterns | File paths relevant to this skill |
| `shell` | No | string | Shell to use for commands |
| `hooks` | No | object | Lifecycle hooks (non-plugin only) |
| `agent` | No | string | Agent to delegate to |

### Command Fields

| Field | Required | Values | Notes |
|-------|----------|--------|-------|
| `description` | Yes | string | What the command does |
| `allowed-tools` | Yes | comma-separated tool names | Security whitelist |
| `argument-hint` | No | string | Help text for arguments |
| `category` | No | string | UI grouping (workflow, ai-assistant, validation, setup) |
| `model` | No | `opus`, `sonnet`, `haiku` | Also accepts full model IDs |

### Agent Fields

| Field | Required | Values | Notes |
|-------|----------|--------|-------|
| `name` | Yes | kebab-case string | Must match filename without `.md` |
| `description` | Yes | string | Must include proactive triggers |
| `tools` | No | comma-separated tool names | Omit = all tools; empty = no tools |
| `disallowedTools` | No | comma-separated tool names | Alternative to allowlisting |
| `model` | No | `opus`, `sonnet`, `haiku` | Also accepts full model IDs |
| `effort` | No | `low`, `medium`, `high`, `max` | Reasoning depth |
| `memory` | No | `project` | Session context access |
| `isolation` | No | `worktree` | Run in isolated git worktree |
| `background` | No | `true` | Run in background |
| `skills` | No | array of strings | Skills available to this agent |
| `maxTurns` | No | number | Maximum conversation turns |
| `initialPrompt` | No | string | Starting prompt for agent |
| `category` | No | string | Marketplace category for UI grouping |
| `color` | No | string | UI display color (e.g., `"#4A90D9"`) |
| `displayName` | No | string | Human-readable name shown in UI |
| `disableHooks` | No | comma-separated hook names | Disable specific hooks during agent execution |

**Plugin restriction:** Agents in `plugins/` must NOT use: `hooks`, `mcpServers`, `permissionMode`.

---

## String Substitution Reference

| Syntax | Description | Example |
|--------|-------------|---------|
| `$ARGUMENTS` | Full user-provided arguments | `Deploy $ARGUMENTS to staging` |
| `$ARGUMENTS[0]` | First argument | `Create file named $ARGUMENTS[0]` |
| `$1`, `$2` | Positional shorthand | `Copy $1 to $2` |
| `` !`command` `` | Bash output injection | `` !`git branch --show-current` `` |
| `@filepath` | File content injection | `@package.json` |
| `${CLAUDE_SKILL_DIR}` | Skill directory path | `${CLAUDE_SKILL_DIR}/references/template.md` |
| `${CLAUDE_SESSION_ID}` | Session identifier | For unique temp file names |

---

## Tool Security Patterns

| Pattern | Grants | Use When |
|---------|--------|----------|
| `Read, Grep, Glob` | Read-only analysis | Reporting, analysis |
| `Bash(git *)` | Git commands only | Git workflows |
| `Bash(git *), Read, Edit` | Git + file editing | Commit prep, branch management |
| `Bash(npm *, yarn *, pnpm *)` | Package managers | Dependency management |
| `Write, Read, Glob` | File creation + reading | Scaffolding, code generation |
| `Read, Write, Edit, Bash` | Full access | Only when genuinely needed |
