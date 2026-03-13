---
description: Analyze the current project and dynamically generate tailored Skills and Subagents based on what the project actually needs — no fixed artifact list
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
argument-hint: "[optional focus area, e.g. 'testing workflows' or 'prompt engineering']"
---

# Generate Project Development Toolkit

Dynamically derive and generate Claude Code Skills and Subagents tailored to THIS project. Rather than producing a fixed set of artifacts, analyze what the project IS and reason about what tooling it NEEDS.

**Focus area**: $ARGUMENTS
- If provided, narrow analysis and generation to artifacts relevant to this focus (e.g., "testing" generates only test-related artifacts; "prompt engineering" generates only AI/prompt-related artifacts)
- If empty, perform full analysis across all project dimensions

---

## Phase 0: Ecosystem Audit

Before analyzing the project, catalog what ALREADY exists. Use parallel Task subagents:

### Agent A: User-Level Inventory
Scan and catalog:
- `~/.claude/agents/` (and subdirectories) — all user-level subagents
- `~/.claude/skills/` — all user-level skills
- `~/.claude/commands/` — all user-level commands

For each, record: **name**, **purpose** (from description/frontmatter), **tools** (if subagent), **category** (infer from name/description)

### Agent B: Project-Level Inventory
Scan and catalog:
- `.claude/agents/` — any existing project-level subagents
- `.claude/skills/` — any existing project-level skills
- `.claude/commands/` — any existing project-level commands

For each, record: **name**, **purpose**, **tools** (if subagent), **category** (infer from name/description)

### Output: Ecosystem Catalog

Produce a structured catalog grouping existing capabilities by categories **derived from the actual findings**. Do NOT use a predefined category list — let the discovered agents/skills determine what categories exist.

For each category:
- List the agents/skills that cover it
- Note their scope: **generic** (works on any project) vs **project-specific** (references this project's paths/commands)

This catalog is the foundation for ALL subsequent phases. Nothing gets generated that duplicates a cataloged capability.

---

## Phase 1: Project Intelligence

Gather project signals using parallel Task subagents:

### Agent 1: Stack & Toolchain
Identify:
- Primary language(s) and version(s)
- Package manager (npm/yarn/pnpm/pip/cargo/go mod/etc.)
- Framework(s) (React, Next.js, Django, FastAPI, Actix, etc.)
- Build system (webpack, vite, esbuild, tsc, cargo, make, etc.)
- Dependency manifest files and their locations
- Test runner and framework (jest, vitest, pytest, cargo test, go test)
- Test file patterns and locations
- Linter/formatter (eslint, prettier, ruff, clippy, golangci-lint)
- Type checker (tsc, mypy, pyright)
- CI/CD config files

### Agent 2: Project Nature & Domain Detection
Classify and characterize the project by reading source code, config files, and directory structure:

**Project type** (one or more):
- Library, application, CLI, API, data pipeline, content repository, infrastructure-as-code, mobile app, monorepo, documentation site, personal knowledge base, or other

**Domain patterns** — scan for signals of:
- **AI/ML**: prompt templates, model API calls, embeddings, vector stores, fine-tuning configs, evaluation harnesses
- **Web frontend**: components, routing, state management, styling systems, SSR/SSG
- **API/backend**: route definitions, middleware, auth patterns, database migrations, queue consumers
- **CLI**: argument parsers, subcommands, interactive prompts, output formatting
- **Data pipeline**: ETL scripts, schedulers, schema definitions, transformations, data validation
- **Content/notes**: markdown collections, static site generators, frontmatter conventions, taxonomies, plugins
- **Infrastructure**: terraform modules, Kubernetes manifests, Dockerfiles, cloud provider configs, CI/CD pipelines
- **Mobile**: platform configs, navigation, native bridges, build schemes

**Lifecycle signals**: development stage (greenfield, active, mature, maintenance), team indicators (contributing guides, PR templates, code owners)

### Agent 3: Architecture & Structure
Identify:
- Project structure pattern (monorepo, single-package, workspace)
- Key directories and their purposes
- Database/ORM presence (prisma, drizzle, sqlalchemy, diesel)
- API style (REST, GraphQL, gRPC, tRPC)
- State management patterns (Redux, Zustand, Context, Vuex, etc.)
- Auth patterns (JWT, sessions, OAuth providers, etc.)
- Config management (env files, config modules, feature flags)
- Any existing .claude/ configuration (CLAUDE.md, agents, skills)

### Agent 4: Integration & SDK Detection
Scan dependency manifests AND source imports for external service integrations:

- **Cloud providers**: AWS, GCP, Azure SDKs — which services used
- **AI/ML providers**: OpenAI, Anthropic, Cohere, HuggingFace, Replicate — models, endpoints
- **Payment**: Stripe, PayPal, Square — billing vs one-time
- **Communication**: SendGrid, Twilio, Slack, Discord — which APIs
- **Monitoring**: Sentry, DataDog, New Relic, Prometheus — what's instrumented
- **Auth**: Auth0, Clerk, Firebase Auth, Supabase Auth — flow patterns
- **Storage**: S3, Cloudflare R2, Supabase Storage — upload patterns
- **Queues/events**: SQS, RabbitMQ, Kafka, Redis pub/sub — producer vs consumer
- **Search**: Elasticsearch, Algolia, Meilisearch, Typesense — index patterns
- **CMS**: Contentful, Sanity, Strapi — content model patterns

For each found, record: **SDK name**, **config location**, **usage pattern** (e.g., "Stripe used for subscription billing in src/payments/")

---

## Phase 1.5: Activity & Coverage Mapping

Cross-reference Phase 0 ecosystem catalog with Phase 1 project signals. **Replace static lookup tables with activity-based reasoning.**

### Step 1: Enumerate Project Activities

Derive 8-15 concrete developer activities as verb-phrases from the project profile. These must be **specific to this project**, not generic.

**Bad** (too generic): "write tests", "debug code", "review PRs"
**Good** (project-specific): "write integration tests against the Prisma PostgreSQL layer", "debug SSR hydration mismatches in Next.js App Router", "validate Stripe webhook signature handling"

Activities should span the project's actual development lifecycle: building features, testing, debugging, deploying, maintaining integrations, managing content, etc.

### Step 2: Map Activities to Coverage

For each activity, check the Phase 0 catalog:

| Coverage | Meaning | Implication |
|----------|---------|-------------|
| **COVERED** | An existing agent handles it fully | No artifact needed — user can invoke that agent directly |
| **PARTIAL** | An existing agent handles the domain but lacks project context | Potential orchestrator that adds project context and delegates |
| **GAP** | No existing agent addresses this activity | Potential gap-filler agent that encodes domain knowledge directly |

### Step 3: Identify High-Value Candidates

Filter to activities that score high on BOTH dimensions:
- **Frequency**: How often does a developer do this? (daily=3, weekly=2, occasional=1)
- **Knowledge gap**: How much project-specific knowledge is needed? (high=3, medium=2, low=1)

Score = frequency × knowledge-gap. Activities scoring ≥ 6 are strong candidates. Activities scoring 4-5 are moderate candidates. Below 4, skip unless $ARGUMENTS focus matches.

These candidates feed directly into Phase 2.

---

## Phase 2: Derive & Generate Artifacts

This phase replaces all hardcoded artifact lists with a **reasoning-driven derivation process**. No fixed artifact names, no predetermined categories — everything flows from what the project actually needs.

### Step 2.1: Sequential-Thinking Derivation

Use the `sequential-thinking` MCP tool to walk through a structured 7-thought reasoning chain. Each thought MUST build on the previous:

**Thought 1 — Project Identity Synthesis**
Summarize what this project IS in 2-3 sentences. Combine Agent 2's nature/domain findings with Agent 3's architecture. This is the lens through which all artifact decisions are made.

**Thought 2 — Core Activity Enumeration**
Select 5-8 of the highest-scoring activities from Phase 1.5 Step 3. If $ARGUMENTS specifies a focus, filter to activities matching that focus.

**Thought 3 — Activity Scoring**
For each selected activity, assign:
- Frequency: daily (3), weekly (2), occasional (1)
- Knowledge gap: high (3), medium (2), low (1)
- Score = frequency × knowledge-gap
- Rank by score descending

**Thought 4 — Ecosystem Coverage Check**
For each scored activity, determine:
- **SKIP**: existing agent covers it fully AND no project context would help
- **ORCHESTRATOR**: existing agent covers the domain, but adding project context (paths, commands, conventions) would meaningfully improve the experience
- **GAP-FILLER**: no existing agent covers this — a new agent must encode domain knowledge directly

**Thought 5 — Artifact Type Determination**
For each non-SKIP activity, decide: **skill** or **subagent**?

Heuristics:
- **Skill** if: it's a repeatable workflow with fixed steps (health-check, scaffold, diagnose), it can be expressed as a procedure, it's invoked explicitly by the user via `/command`
- **Subagent** if: it requires autonomous reasoning, it needs to be invoked proactively by description matching, it involves delegation to other agents, it needs specific tool grants

**Thought 6 — Artifact Design**
For each artifact, specify:
- Name (project-appropriate, not generic)
- Type (skill or subagent; orchestrator or gap-filler if subagent)
- Activity it serves
- Project-specific grounding (real paths, real commands, real conventions — NOT placeholders)
- For orchestrators: which existing agents it delegates to
- For gap-fillers: what domain knowledge it encodes
- For skills: the step-by-step workflow

**Thought 7 — Final Artifact List**
Produce the final list of 3-7 artifacts with:
- Rationale for each (why this project needs this)
- Rejected candidates with reasons (e.g., "Considered a linting orchestrator, but `linting-expert` fully covers this with no project-specific context needed")
- If 0 artifacts are warranted (everything is already covered), state that explicitly

### Step 2.2: Quality Guardrails

Before generating any artifact, validate against ALL of these:

1. **Specificity**: Must reference at least one real project path, command, or convention. If you can't ground it in something concrete, it's too generic.
2. **Differentiation**: Must NOT work unchanged on a different project. If the same artifact would be useful as-is on any codebase, it belongs as a user-level agent, not a project-level one.
3. **Value**: Must save ≥5 minutes per use. If it's just a thin wrapper around an existing agent with no real project context, skip it.
4. **Non-duplication**: Must not replicate a capability already cataloged in Phase 0.
5. **Target count**: 3-7 artifacts total. Fewer is better. 0 is valid if everything is already covered.

### Step 2.3: Generate Artifacts

```bash
mkdir -p .claude/agents .claude/skills
```

**Pre-generation checks** for each artifact:
1. **Name conflict**: If `.claude/agents/{name}.md` or `.claude/skills/{name}/` already exists at the project level, SKIP and log: "Skipped `{name}` — already exists at project level"
2. **Redundancy**: If the artifact would do nothing but pass-through to a single existing expert with no added project context, SKIP it
3. **Focus filter**: If $ARGUMENTS is set and this artifact doesn't relate to the focus area, SKIP it

Generate each artifact using the templates from the Templates section below.

### Generation Philosophy

**Generate project-specific ORCHESTRATORS, not domain experts.**

The ecosystem already has 50+ domain experts. Generated subagents should be thin coordination layers that:
1. **Know project context** — specific paths, commands, config, conventions
2. **Route to existing experts** — delegate domain-specific work to the right expert
3. **Fill genuine gaps** — only handle domains where no existing expert applies

Generated SKILLS should fill workflow gaps (health-check, diagnose, scaffold) that domain experts can't provide — they encode project-specific multi-step procedures.

### Rules for ALL Generated Artifacts
1. **Concise**: Subagent prompts <30 lines. Skill SKILL.md <50 lines.
2. **Specific**: Reference detected tools, frameworks, file paths — never generic
3. **Focused**: Each artifact handles ONE clear domain
4. **Minimal tools**: Grant only the tools each agent actually needs
5. **Proactive descriptions**: Include "Use PROACTIVELY when..." triggers
6. **No overlap**: Don't duplicate capabilities already cataloged in Phase 0
7. **Delegation-first**: Orchestrator subagents must include delegation mappings
8. **Skip if covered**: If an existing agent fully covers a category AND no project-specific context would add value, skip generation entirely

Log all skip decisions for the summary.

---

## Phase 3: Verification & Summary

After generating all files, produce a comprehensive summary:

### 1. Files Created
List every file created with its full path.

### 2. Per-Artifact Summary
For each generated artifact, show on 1-2 lines:
- **Name** and type (skill/subagent, orchestrator/gap-filler)
- **Activity served**: which project activity from Phase 1.5 this addresses
- **Coverage gap**: was this PARTIAL or GAP coverage?
- **Project grounding**: what project-specific detail makes this non-generic
- **Delegation targets** (if orchestrator): which existing agents it routes to
- **Trigger conditions**: when Claude should invoke this proactively

### 3. Derivation Reasoning
For each artifact, include a 1-sentence derivation chain:
> "Generated `{name}` because {activity} scores {score} (freq={f}, gap={g}), existing coverage is {PARTIAL|GAP}, and {project-specific justification}."

### 4. Considered But Not Generated
List every candidate that was evaluated but rejected, with the reason:
- "Skipped `{name}` — `{existing-agent}` already covers this domain"
- "Skipped `{name}` — too generic, would work unchanged on any project"
- "Skipped `{name}` — low activity score ({score}), not worth the artifact"

### 5. Ecosystem Integration Map
Show how generated artifacts interact with existing agents:
- "`{generated}` → delegates to `{existing-agent-1}`, `{existing-agent-2}`"
- "`{generated}` → fills gap, no existing agent covers this"

### 6. How to Test
Suggest specific prompts to trigger each generated artifact:
- "Try asking Claude to {scenario} to see `{artifact}` activate"
- "Try `/{skill-name}` to run the {description} workflow"

---

## Subagent Template: Orchestrator Variant

Use this format for subagents that **delegate to existing experts** (PARTIAL coverage):

```markdown
---
name: {name}
description: {1-2 sentence description}. Use PROACTIVELY when {triggers}.
tools: {comma-separated tools}
model: {model}
memory: project
---

# {Title}

You are a project-aware {role} orchestrator for this project. You combine deep project knowledge with the ability to delegate to specialized experts.

## Project Context
- **Stack**: {detected language/framework/runtime}
- {Other relevant project-specific context: test runner, linter, key paths, etc.}

## Delegation
Route domain-specific work to existing experts — you provide project context, they provide domain expertise.
- {Issue type/domain} → delegate to `{existing-agent-name}` — {what they handle}
- {Issue type/domain} → delegate to `{existing-agent-name}` — {what they handle}
- Handle locally: {project-specific things only you know — paths, commands, conventions, config}

When delegating, always provide the expert with relevant project context (file paths, config details, conventions) so they can work effectively without re-discovering project structure.

## When Invoked
1. {Step 1 — typically: assess the problem and identify which domain it falls in}
2. {Step 2 — typically: gather project-specific context needed for delegation}
3. {Step 3 — typically: delegate to appropriate expert OR handle locally if project-specific}

## Project-Specific Expertise
- {Specific area 1}: {how to handle in THIS project}
- {Specific area 2}: {how to handle in THIS project}
```

## Subagent Template: Gap-Filler Variant

Use this format for subagents that **encode domain knowledge directly** (GAP coverage — no existing expert):

```markdown
---
name: {name}
description: {1-2 sentence description}. Use PROACTIVELY when {triggers}.
tools: {comma-separated tools}
model: {model}
memory: project
---

# {Title}

You are a specialized {role} for this project. You handle {domain} directly because no existing generic expert covers this area.

## Project Context
- **Stack**: {detected language/framework/runtime}
- {Other relevant project-specific context}

## Expertise
{Domain knowledge encoded directly — patterns, best practices, common pitfalls specific to this project's domain.}

- {Area 1}: {knowledge and approach}
- {Area 2}: {knowledge and approach}
- {Area 3}: {knowledge and approach}

## When Invoked
1. {Step 1}
2. {Step 2}
3. {Step 3}

## Project-Specific Patterns
- {Pattern 1}: {how it works in THIS project}
- {Pattern 2}: {how it works in THIS project}
```

## Skill Template

Use this exact format for skills:

```markdown
---
name: {name}
description: {When to use this skill}
{optional: disable-model-invocation: true}
---

{Concise workflow instructions referencing project-specific commands and paths}
```
