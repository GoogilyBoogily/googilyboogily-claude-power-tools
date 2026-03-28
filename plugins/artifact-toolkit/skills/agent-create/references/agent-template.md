# Agent Template Reference

This file documents the structural template for Claude Code agents/subagents. Use it as a reference when assembling the agent during Phase 4.

## Domain Expert Template

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

## Sub-Domain Specialist Template

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

## Valid Frontmatter Fields

| Field | Required | Values | Notes |
|-------|----------|--------|-------|
| `name` | Yes | kebab-case string | Must match filename without `.md` |
| `description` | Yes | string | Must include proactive triggers |
| `tools` | No | comma-separated tool names | Omit = all tools; empty = no tools |
| `disallowedTools` | No | comma-separated tool names | Tools to exclude (alternative to allowlisting) |
| `model` | No | `opus`, `sonnet`, `haiku` | Override default. Also accepts full model IDs (e.g., `claude-opus-4-6`) and extended context variants (`opus[1m]`, `sonnet[1m]`) |
| `effort` | No | `low`, `medium`, `high`, `max` | Reasoning depth (`max` is Opus only) |
| `memory` | No | `project` | Session context access |
| `isolation` | No | `worktree` | Run in isolated git worktree |
| `background` | No | `true` | Run in background |
| `skills` | No | array of strings | Skills available to this agent |
| `maxTurns` | No | number | Maximum conversation turns |
| `initialPrompt` | No | string | Starting prompt for agent |

**Plugin restrictions:** Agents shipped in plugins (`plugins/`) must NOT use: `hooks`, `mcpServers`, `permissionMode`.

## Domain Expert Quality Criteria

| Criterion | Test | Threshold |
|-----------|------|-----------|
| **Coverage** | Count distinct problems handled | 5-15 problems |
| **Resume** | "Would someone list this as expertise?" | Must be yes |
| **Value** | "Would you pay $5/month for this?" | Must be yes |
| **Specificity** | "Is the knowledge non-obvious?" | Must encode specialized knowledge |
| **Conciseness** | Line count of agent body | Under 80 lines |

## Naming Conventions

| Pattern | Example | Use When |
|---------|---------|----------|
| `domain-expert` | `typescript-expert` | Broad domain expert |
| `domain-subdomain-expert` | `typescript-type-expert` | Sub-domain specialist |
| `domain-subdomain` | `database-optimizer` | Functional specialist (not "expert" role) |

**Anti-patterns to avoid:**
- `fix-X` (e.g., `fix-types`) — too narrow, should be a skill
- `enhanced-X` (e.g., `enhanced-ts-helper`) — vague, non-standard
- `X-helper` (e.g., `react-helper`) — too generic
- `X-v2`, `X-new`, `better-X` — versioning in names is a smell

## Routing Mesh Patterns

**Broad → Specialist delegation:**
```
database-expert delegates to:
  - postgres-expert (PostgreSQL-specific)
  - mongodb-expert (MongoDB-specific)
  - database-optimizer (query plans, indexes)
```

**Specialist → Broad escalation:**
```
postgres-expert escalates to:
  - database-expert (cross-DB patterns)
  - devops-expert (deployment/infra)
```

**Peer delegation:**
```
nextjs-expert delegates to:
  - react-expert (React-only, no Next.js)
  - typescript-expert (TS config, no Next.js)
  - testing-expert (test failures)
```
