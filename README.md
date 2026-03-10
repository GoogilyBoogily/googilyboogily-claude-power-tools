# Claude Code Power Tools

A plugin marketplace for [Claude Code](https://claude.ai/claude-code) with developer commands, expert subagents, and specialized documentation generators.

## Quick Start

Add this marketplace to your Claude Code installation:

```
/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools
```

Then install the plugins you want:

```
/plugin install dev-essentials@googilyboogily-claude-power-tools
/plugin install architecture-toolkit@googilyboogily-claude-power-tools
/plugin install expert-agents@googilyboogily-claude-power-tools
/plugin install game-design-bible@googilyboogily-claude-power-tools
```

## Plugins

### dev-essentials

Daily developer commands for git workflows, checkpoints, code quality, and configuration.

**12 commands** across 5 categories: git, checkpoint, quality, dev, config.

### architecture-toolkit

Meta-tools for creating commands, subagents, generating project toolkits, and deep research.

**4 commands** for scaffolding and research workflows.

### expert-agents

41 specialized domain expert subagents covering TypeScript, React, databases, DevOps, testing, and more -- with intelligent cross-delegation between agents.

**41 agents** across 15 domains: ai, build-tools, database, devops, documentation, framework, frontend, nodejs, product, quality, react, research, systems, testing, typescript.

### game-design-bible

Procedurally create comprehensive Video Game Design Bibles through phased, interactive workflows with parallel specialist writers.

**6 commands** (4 workflow + 2 reference) and **4 subagents** (systems-designer, narrative-designer, art-audio-director, game-design-reviewer).

## How It Works

Each plugin adds slash commands or subagents to your Claude Code environment:

- **Commands** appear as `/plugin-name:command` (e.g., `/dev-essentials:git:commit`)
- **Agents** are automatically available for Claude to delegate to when their domain expertise is needed

The expert agents form a routing mesh -- each agent knows when to handle a problem directly and when to delegate to a more specialized colleague.

## License

MIT
