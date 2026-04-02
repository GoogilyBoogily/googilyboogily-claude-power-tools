# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Claude Code plugin marketplace** containing 23 granular plugins with 16 slash commands, 50 subagents, and 50 skills. Users install only the plugins they need. There is no build system, test suite, or compiled code — everything is markdown content with YAML frontmatter.

Install: `/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools`

## Repository Structure

```
.claude-plugin/marketplace.json    # Marketplace registry (lists all 23 plugins)
plugins/
  # Command plugins
  git-tools/                       # 5 commands: commit, checkout, status, push, ignore-init
  checkpoint/                      # 3 commands: create, list, restore
  code-quality/                    # 3 commands: code-review, dead-code, validate-and-fix
  dev-utilities/                   # 2 commands: cleanup, bash-timeout
  meta-toolkit/                    # 1 command: generate-toolkit, 2 skills: generate-claude-md, update-readme

  # Research (command + agent)
  research/                        # 1 command: research, 1 agent: research-expert

  # Agent plugins (14 domain-specific plugins)
  ai-agents/                       # 3 agents: ai-sdk-expert, llm-architect, prompt-engineer
  build-tools-agents/              # 2 agents: vite-expert, webpack-expert
  database-agents/                 # 4 agents: database-expert, postgres-expert, mongodb-expert, optimizer
  devops-agents/                   # 4 agents: devops-expert, docker-expert, git-expert, github-actions-expert
  documentation-agents/            # 2 agents: documentation-expert, technical-writer
  framework-agents/                # 2 agents: nestjs-expert, nextjs-expert
  frontend-agents/                 # 3 agents: accessibility-expert, css-styling-expert, flutter-expert
  nodejs-agents/                   # 2 agents: nodejs-expert, cli-expert
  product-agents/                  # 3 agents: product-manager, project-manager, ux-researcher
  quality-agents/                  # 6 agents + 2 skills: code-review-expert, refactoring-expert, linting-expert, triage-expert, code-search, dead-code-analyst | skills: architect-reviewer, file-organizer
  react-agents/                    # 2 agents: react-expert, react-performance-expert
  systems-agents/                  # 2 agents: rust-engineer, performance-engineer
  testing-agents/                  # 2 agents: testing-expert, e2e-playwright-expert
  typescript-agents/               # 3 agents: typescript-expert, build-expert, type-expert
  game-dev-agents/                 # 1 agent: game-developer

  # Documentation generation
  claude-md-generator/             # 1 skill: generate-claude-md (distributed CLAUDE.md hierarchy generation)

  # Authoring & auditing
  artifact-toolkit/                # 6 skills: skill-create, skill-audit, command-create, command-audit, agent-create, agent-audit

  # Composite plugins
  game-design-bible/               # 28 skills + 5 agents: per-phase gather/generate/audit bible pipeline with cross-cutting review + bible-to-HLD pipeline
  architecture-docs/               # 14 skills: ADR/HLD/LLD gather+generate+audit pipeline with orchestrator, research, doc review, and implementation
```

Each plugin has a `.claude-plugin/plugin.json` manifest. Commands live in `commands/` directories, agents in `agents/` directories.

## Sub-CLAUDE.md Index

The following plugins have their own CLAUDE.md with focused guidance. Claude loads these automatically when working in those directories.

| Path | Covers | Consult When |
|------|--------|--------------|
| `plugins/game-design-bible/CLAUDE.md` | 6-phase bible pipeline, nested agents, reference skills, bible-to-HLD | Modifying bible pipeline phases, adding game design agents, or debugging phase ordering |
| `plugins/architecture-docs/CLAUDE.md` | ADR→HLD→LLD pipeline, 1:N:M fan-out, context isolation | Modifying the arch pipeline, adding document types, or debugging fan-out state tracking |
| `plugins/artifact-toolkit/CLAUDE.md` | Create/audit skill pairs, template system, checklist format | Creating or auditing artifacts, updating templates, or modifying checklist IDs |
| `plugins/quality-agents/CLAUDE.md` | 8-agent hub-and-spoke routing cluster | Adding quality agents, modifying cross-plugin routing tables, or understanding delegation flow |

## Authoring Commands

Commands are markdown files in `commands/` directories. The file path becomes the command name: `commands/commit.md` → `/git-tools:commit`.

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

Agent names in YAML frontmatter are stable identifiers. The routing mesh references agents by these names, not by plugin paths. Cross-delegation works regardless of which plugin an agent lives in, and missing agents degrade gracefully.

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

## Composite Plugin Patterns

The complex plugins (game-design-bible, architecture-docs, artifact-toolkit) share a common multi-phase architecture:

- **Gather → Generate → Audit cycle**: Each document phase has three skills. Gather runs interactive Q&A + parallel research. Generate reads the context file and produces a document non-interactively. Audit walks through quality checks with interactive resolution.
- **Context isolation via `context: fork`**: Phase skills run in forked contexts so the orchestrator stays lean. The orchestrator only tracks file paths and verdicts, never document content.
- **Orchestrator coordination**: Pipeline orchestrators (e.g., `arch-pipeline`, `bible-pipeline`) invoke phase skills sequentially, extract output paths, and present checkpoints between phases. They coordinate but don't generate.
- **State tracking**: Orchestrators maintain state variables across phases (e.g., `$ADR_PATH`, `$HLD_PATHS[]`). Fan-out pipelines use indexed arrays to track multiple documents.
- **Skill-to-skill invocation**: Orchestrators chain skills using `skill: "plugin:skill-name", args: "..."` syntax within their procedural instructions.

## Common Gotchas

- **Step 0 is mandatory for agents**: Every agent must include "Step 0: Route or Stay" with explicit delegation targets. Agents without routing tables will handle out-of-scope problems poorly.
- **Missing agents degrade gracefully**: The routing mesh references agents by name. If a target agent's plugin isn't installed, the delegating agent handles the task locally rather than failing.
- **Reference skills aren't user commands**: Skills with `user-invocable: false` auto-activate from conversation context. They inject knowledge, not workflows. They don't need `allowed-tools`.
- **Nested agent directories are discovered recursively**: Agents in subdirectories (e.g., `agents/game-design/systems-designer.md`) are found by the routing mesh. Nesting is organizational, not functional.
- **Templates and checklists live in `references/`**: Phase skills load supporting files via `${CLAUDE_SKILL_DIR}/references/`. When updating authoring patterns, change the template — individual skills inherit the update.
- **Audit resolution is interactive, not batch**: Audit skills walk through issues one at a time with fix/skip/research options per issue. They're designed for iterative improvement, not single-pass reporting.
