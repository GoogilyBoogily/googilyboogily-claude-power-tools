# Claude Code Power Tools

A plugin marketplace for [Claude Code](https://claude.ai/claude-code) — 22 granular plugins with 23 commands, 50 agents, and 7 skills. Install only what you need.

## Quick Start

Add this marketplace to your Claude Code installation:

```shell
/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools
```

Then install individual plugins:

```shell
/plugin install git-tools@googilyboogily-claude-power-tools
/plugin install ai-agents@googilyboogily-claude-power-tools
/plugin install game-design-bible@googilyboogily-claude-power-tools
```

## Plugins

### Developer Commands (5 plugins, 16 commands)

| Plugin | Commands | Description |
|--------|----------|-------------|
| `git-tools` | `commit`, `checkout`, `status`, `push`, `ignore-init` | Git workflow automation |
| `checkpoint` | `create`, `list`, `restore` | Lightweight code checkpoints via git stash |
| `code-quality` | `code-review`, `dead-code`, `validate-and-fix` | Code review and quality enforcement |
| `dev-utilities` | `cleanup`, `bash-timeout` | Cleanup artifacts and configure timeouts |
| `meta-toolkit` | `create-command`, `create-subagent`, `generate-toolkit` | Scaffold commands, agents, and project toolkits |

### Research (1 plugin, 1 command + 1 agent)

| Plugin | Contents | Description |
|--------|----------|-------------|
| `research` | `research` command, research-expert agent | Deep research with parallel subagents, citations, and web fact-finding |

### Expert Agents (14 plugins, 44 agents)

| Plugin | Agents | Domain | Enhanced by |
|--------|--------|--------|-------------|
| `ai-agents` | ai-sdk-expert, llm-architect, prompt-engineer | AI/ML, LLMs, prompt engineering | |
| `build-tools-agents` | vite-expert, webpack-expert | Bundler configuration | |
| `database-agents` | database-expert, postgres-expert, mongodb-expert, optimizer | Database architecture and optimization | framework-agents, quality-agents, systems-agents |
| `devops-agents` | devops-expert, docker-expert, git-expert, github-actions-expert | Infrastructure and CI/CD | quality-agents, build-tools-agents, framework-agents, database-agents, testing-agents |
| `documentation-agents` | documentation-expert, technical-writer | Technical writing | |
| `framework-agents` | nestjs-expert, nextjs-expert | Server and fullstack frameworks | database-agents, react-agents, typescript-agents, testing-agents, devops-agents, frontend-agents, nodejs-agents |
| `frontend-agents` | accessibility-expert, css-styling-expert, flutter-expert | Accessibility, styling, cross-platform | |
| `nodejs-agents` | nodejs-expert, cli-expert | Node.js runtime and CLI tools | |
| `product-agents` | product-manager, project-manager, ux-researcher | Product strategy and UX | |
| `quality-agents` | code-review-expert, architect-reviewer, refactoring-expert, linting-expert, triage-expert, code-search, dead-code-analyst, file-organizer | Code quality, review, and file organization | database-agents, react-agents, typescript-agents, testing-agents, systems-agents, build-tools-agents, devops-agents, frontend-agents, framework-agents |
| `react-agents` | react-expert, react-performance-expert | React components and performance | framework-agents, frontend-agents, testing-agents, typescript-agents |
| `systems-agents` | rust-engineer, performance-engineer | Systems programming | |
| `testing-agents` | testing-expert, e2e-playwright-expert | Test frameworks and E2E automation | react-agents, devops-agents, database-agents, typescript-agents |
| `typescript-agents` | typescript-expert, build-expert, type-expert | TypeScript type system and builds | react-agents, testing-agents, devops-agents, quality-agents, build-tools-agents |

### Game Development (1 plugin, 1 agent)

| Plugin | Agents | Domain |
|--------|--------|--------|
| `game-dev-agents` | game-developer | Game engine architecture, ECS, graphics, physics, multiplayer |

### Documentation Generators (2 plugins, 6 commands + 5 agents + 7 skills)

| Plugin | Contents | Description |
|--------|----------|-------------|
| `game-design-bible` | 6 commands, 5 agents, 1 skill | Create Video Game Design Bibles and generate game-development-aware HLD documents |
| `architecture-docs` | 5 skills | Interactive ADR, HLD, and LLD pipeline with research |

## Recommended Bundles

### Full-Stack Web Dev
`framework-agents`, `react-agents`, `database-agents`, `typescript-agents`, `testing-agents`, `devops-agents`, `build-tools-agents`, `nodejs-agents`, `frontend-agents`, `quality-agents`, `code-quality`

### Code Quality & Review
`quality-agents`, `testing-agents`, `code-quality`

### Game Design
`game-design-bible`, `game-dev-agents`

### Research & Documentation
`research`, `documentation-agents`, `architecture-docs`

### DevOps & Git
`devops-agents`, `git-tools`, `checkpoint`

### Meta / Plugin Creation
`meta-toolkit`, `dev-utilities`

## How It Works

Each plugin adds slash commands or subagents to your Claude Code environment:

- **Commands** appear as `/plugin-name:command` (e.g., `/git-tools:commit`, `/code-quality:code-review`)
- **Skills** appear as `/plugin-name:skill` (e.g., `/architecture-docs:hld`)
- **Agents** are automatically available for Claude to delegate to when their domain expertise is needed

The expert agents form a routing mesh — each agent knows when to handle a problem directly and when to delegate to a more specialized colleague. The "Enhanced by" column shows which other plugins provide agents that a given plugin's agents can delegate to for deeper expertise.

## License

MIT
