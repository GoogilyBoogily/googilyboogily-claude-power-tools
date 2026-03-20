# Claude Code Power Tools

A plugin marketplace for [Claude Code](https://claude.ai/claude-code) — 24 granular plugins with 23 commands, 49 agents, and 6 skills. Install only what you need.

## Quick Start

Add this marketplace to your Claude Code installation:

```
/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools
```

Then install individual plugins:

```
/plugin install git-tools@googilyboogily-claude-power-tools
/plugin install ai-agents@googilyboogily-claude-power-tools
/plugin install game-design-bible@googilyboogily-claude-power-tools
```

## Plugins

### Developer Commands (6 plugins, 17 commands)

| Plugin | Commands | Description |
|--------|----------|-------------|
| `git-tools` | `commit`, `checkout`, `status`, `push`, `ignore-init` | Git workflow automation |
| `checkpoint` | `create`, `list`, `restore` | Lightweight code checkpoints via git stash |
| `code-quality` | `code-review`, `dead-code`, `validate-and-fix` | Code review and quality enforcement |
| `dev-utilities` | `cleanup`, `bash-timeout` | Cleanup artifacts and configure timeouts |
| `meta-toolkit` | `create-command`, `create-subagent`, `generate-toolkit` | Scaffold commands, agents, and project toolkits |
| `deep-research` | `research` | Deep research with parallel subagents and citations |

### Expert Agents (15 plugins, 44 agents)

| Plugin | Agents | Domain |
|--------|--------|--------|
| `ai-agents` | ai-sdk-expert, llm-architect, prompt-engineer | AI/ML, LLMs, prompt engineering |
| `build-tools-agents` | vite-expert, webpack-expert | Bundler configuration |
| `database-agents` | database-expert, postgres-expert, mongodb-expert, optimizer | Database architecture and optimization |
| `devops-agents` | devops-expert, docker-expert, git-expert, github-actions-expert | Infrastructure and CI/CD |
| `documentation-agents` | documentation-expert, technical-writer | Technical writing |
| `framework-agents` | nestjs-expert, nextjs-expert | Server and fullstack frameworks |
| `frontend-agents` | accessibility-expert, css-styling-expert, flutter-expert | Accessibility, styling, cross-platform |
| `nodejs-agents` | nodejs-expert, cli-expert | Node.js runtime and CLI tools |
| `product-agents` | product-manager, project-manager, ux-researcher | Product strategy and UX |
| `quality-agents` | code-review-expert, architect-reviewer, refactoring-expert, linting-expert, triage-expert, code-search, dead-code-analyst | Code quality and review |
| `react-agents` | react-expert, react-performance-expert | React components and performance |
| `research-agents` | research-expert | Web research and fact-finding |
| `systems-agents` | rust-engineer, game-developer, performance-engineer | Systems programming and games |
| `testing-agents` | testing-expert, e2e-playwright-expert | Test frameworks and E2E automation |
| `typescript-agents` | typescript-expert, build-expert, type-expert | TypeScript type system and builds |

### Documentation Generators (3 plugins, 6 commands + 5 agents + 6 skills)

| Plugin | Contents | Description |
|--------|----------|-------------|
| `game-design-bible` | 6 commands, 4 agents | Create comprehensive Video Game Design Bibles through phased, interactive workflows with parallel specialist writers |
| `architecture-docs` | 5 skills (adr, hld, lld, code-research, web-research) | Interactive ADR, HLD, and LLD pipeline with research |
| `game-hld` | 1 skill, 1 agent | Generate game-development-aware HLD documents from a Game Design Bible |

## How It Works

Each plugin adds slash commands or subagents to your Claude Code environment:

- **Commands** appear as `/plugin-name:command` (e.g., `/git-tools:commit`, `/code-quality:code-review`)
- **Skills** appear as `/plugin-name:skill` (e.g., `/architecture-docs:hld`)
- **Agents** are automatically available for Claude to delegate to when their domain expertise is needed

The expert agents form a routing mesh — each agent knows when to handle a problem directly and when to delegate to a more specialized colleague.

## License

MIT
