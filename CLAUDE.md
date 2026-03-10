# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Claude Code plugin marketplace** containing 4 plugins with 22 slash commands and 45 subagents. There is no build system, test suite, or compiled code — everything is markdown content with YAML frontmatter.

Install: `/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools`

## Repository Structure

```
.claude-plugin/marketplace.json    # Marketplace registry (lists all 4 plugins)
plugins/
  dev-essentials/                  # 12 commands: git, checkpoint, quality, dev, config
  architecture-toolkit/            # 4 commands: create-command, create-subagent, generate-toolkit, research
  expert-agents/                   # 41 subagents across 15 domains
  docs/game-design-bible/          # 6 commands + 4 subagents: game design bible creation
```

Each plugin has a `.claude-plugin/plugin.json` manifest. Commands live in `commands/` subdirectories, agents in `agents/` subdirectories.

## Authoring Commands

Commands are markdown files in `commands/` directories. The file path becomes the command name: `commands/git/commit.md` → `/dev-essentials:git:commit`.

Frontmatter fields:
- `description` (required): What the command does
- `allowed-tools` (required): Security whitelist of tools the command can use (e.g., `Read, Write, Bash(git:*)`)
- `argument-hint`: Help text shown to users (e.g., `"[branch-name]"`)
- `model`: Override model (opus, sonnet, haiku)

Content rules:
- Write instructions **to** the AI in imperative mood ("Run git status", not "The AI will run git status")
- Use `$ARGUMENTS` for user-provided arguments
- Use `!command` to execute bash inline, `@filename` to include file contents

## Authoring Skills

Skills are the modern, directory-based successor to commands. Each skill is a directory with a `SKILL.md` file: `.claude/skills/<skill-name>/SKILL.md` (project-level) or `~/.claude/skills/` (user-level). The `generate-toolkit` command creates skills tailored to a project.

Frontmatter fields are the same as commands, plus invocation control:
- `disable-model-invocation: true`: Manual-only — Claude cannot auto-invoke
- `user-invocable: false`: Auto-only — hidden from slash menu, triggered by description match

String substitutions (shared with commands):
- `$ARGUMENTS` / `$ARGUMENTS[N]` / `$N`: User-provided arguments (full or positional)
- `${CLAUDE_SESSION_ID}`: Current session ID
- `${CLAUDE_SKILL_DIR}`: Path to skill directory (for referencing supporting files)

Dynamic context injection: `` !`shell-command` `` executes before Claude sees content, replacing the placeholder with output.

Content types:
- **Reference**: Knowledge/context skills (often `user-invocable: false`, no tool restrictions)
- **Task**: Procedural workflows (require `allowed-tools`, typically user-invoked)

Best practices:
- Keep SKILL.md under 500 lines; move reference material to supporting files
- Write descriptions with natural language keywords for reliable auto-invocation
- One skill per concern — prefer focused skills over monolithic ones

## Authoring Subagents

Subagents are markdown files in `agents/` directories. The filename becomes the agent identifier.

Frontmatter fields:
- `name` (required): Lowercase identifier matching filename
- `description` (required): When to use — include "Use PROACTIVELY" for auto-delegation
- `tools`: Comma-separated tool list. Omit entirely = all tools; empty value = no tools
- `model`, `category`, `color`, `displayName`: Optional metadata

## Routing Mesh Pattern

Every expert agent must include a **"Step 0: Route or Stay"** section with an explicit routing table. This prevents agents from handling problems outside their specialty.

Pattern:
- **STAY** if the problem is within the agent's domain
- **DELEGATE** to a named specialist with the reason (e.g., "→ `postgres-expert` for MVCC, vacuum tuning, partitioning")

Broader experts (e.g., `database-expert`) delegate to specialists (e.g., `postgres-expert`, `mongodb-expert`). Every agent should define stop conditions for when to hand off or exit.

## Plugin Manifest Format

Each plugin's `.claude-plugin/plugin.json` declares commands and agents arrays pointing to their markdown files. The root `.claude-plugin/marketplace.json` lists all plugins with name, description, version, and source path.

## Choosing: Skill vs Command vs Subagent

| Need | Use | Why |
|------|-----|-----|
| Repeatable workflow with fixed steps | **Skill** | Procedural, explicit invocation, supports supporting files |
| Same but no supporting files needed | **Command** | Simpler single-file format (legacy, still supported) |
| Autonomous reasoning or proactive delegation | **Subagent** | Description-matched auto-invocation, routing mesh, tool grants |

Rules of thumb:
- **Skill** if it's a numbered procedure invoked explicitly with `/skill-name`
- **Subagent** if it activates autonomously from conversation context or delegates to/from other agents
- **Command** only for simple single-file cases — prefer skills for new work
