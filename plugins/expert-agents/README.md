# expert-agents

41 specialized domain expert subagents with intelligent cross-delegation.

## Install

```
/plugin install expert-agents@googilyboogily-claude-power-tools
```

## Agents by Domain

### AI (`ai/`)
- **ai-sdk-expert** -- Vercel AI SDK v5: streaming, model integration, tool calling, hooks
- **llm-architect** -- LLM system architecture: RAG pipelines, prompt engineering, model serving
- **prompt-engineer** -- Prompt design and optimization: few-shot examples, evaluation frameworks

### Build Tools (`build-tools/`)
- **vite-expert** -- Vite: dev server, HMR, build optimization, plugin development, SSR
- **webpack-expert** -- Webpack: configuration, code splitting, module federation, plugins/loaders

### Database (`database/`)
- **database-expert** -- Cross-database generalist: schema design, migrations, connection management
- **optimizer** -- Query optimization and performance tuning across PostgreSQL, MySQL, MongoDB, SQLite
- **postgres-expert** -- PostgreSQL: JSONB, advanced indexing, partitioning, replication, autovacuum
- **mongodb-expert** -- MongoDB: document modeling, aggregation pipelines, sharding, replica sets

### DevOps (`devops/`)
- **devops-expert** -- DevOps router: CI/CD, infrastructure as code, monitoring, deployment strategies
- **docker-expert** -- Docker: Dockerfile optimization, security hardening, Compose, multi-stage builds
- **github-actions-expert** -- GitHub Actions: workflows, CI/CD pipelines, security, custom actions
- **git-expert** -- Git: merge conflicts, rebase, history rewriting, branching strategies

### Documentation (`documentation/`)
- **documentation-expert** -- Documentation architecture and information design
- **technical-writer** -- Technical content: API docs, user guides, tutorials

### Framework (`framework/`)
- **nextjs-expert** -- Next.js App Router: Server Components, server actions, caching, ISR/SSG/SSR
- **nestjs-expert** -- NestJS: module architecture, DI, guards/interceptors, TypeORM/Mongoose

### Frontend (`frontend/`)
- **accessibility-expert** -- WCAG 2.1/2.2, WAI-ARIA, screen reader testing, keyboard navigation
- **css-styling-expert** -- CSS architecture: layout bugs, responsive design, themes, CSS-in-JS
- **flutter-expert** -- Flutter 3+: widget composition, state management, platform channels

### Node.js (`nodejs/`)
- **nodejs-expert** -- Node.js runtime: event loop, memory leaks, streams, HTTP servers
- **cli-expert** -- CLI development: argument parsing, cross-platform compatibility, distribution

### Product (`product/`)
- **product-manager** -- Product strategy, feature prioritization, roadmap planning
- **project-manager** -- Task breakdown, timeline estimation, risk management
- **ux-researcher** -- User research, usability analysis, heuristic evaluation

### Quality (`quality/`)
- **code-review-expert** -- 9-layer code review: root cause analysis, cross-file intelligence
- **architect-reviewer** -- Architecture review: design validation, scalability, technical debt
- **refactoring-expert** -- Code smell detection and safe refactoring techniques
- **linting-expert** -- ESLint/Prettier/Stylelint configuration and custom rules
- **triage-expert** -- Initial problem diagnosis and context gathering
- **code-search** -- Specialized codebase search agent

### React (`react/`)
- **react-expert** -- React 18/19: hooks, state management, Server Components, hydration
- **react-performance-expert** -- React performance: render optimization, bundle analysis, Core Web Vitals

### Research (`research/`)
- **research-expert** -- Web research, fact-finding, multi-source information gathering

### Systems (`systems/`)
- **rust-engineer** -- Rust: ownership/borrowing, async, unsafe code, Cargo workspaces
- **game-developer** -- Game engine programming: ECS, render pipelines, physics, multiplayer
- **performance-engineer** -- System performance: profiling, bottlenecks, load testing, latency

### Testing (`testing/`)
- **testing-expert** -- Test strategy: Jest, Vitest, Playwright, Testing Library, coverage
- **e2e-playwright-expert** -- Playwright E2E: cross-browser automation, visual regression, CI/CD

### TypeScript (`typescript/`)
- **typescript-expert** -- TypeScript: type errors, migration, monorepo config, modern tooling
- **build-expert** -- TypeScript builds: tsconfig, module resolution, build tool integration
- **type-expert** -- Advanced types: generics, conditional/mapped/recursive types, type performance

## How Cross-Delegation Works

Each agent has a "Step 0: Route or Stay" section. When an agent receives a question outside its specialty, it identifies the right expert and delegates. For example:

- Ask the **database-expert** about PostgreSQL partitioning and it routes to **postgres-expert**
- Ask the **typescript-expert** about complex generics and it routes to **type-expert**
- Ask the **devops-expert** about Docker optimization and it routes to **docker-expert**

This means you can start with any related agent and the system will find the right specialist.
