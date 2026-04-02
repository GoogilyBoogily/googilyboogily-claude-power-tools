# Best Practices: Claude Code Skills, Commands, and Agents

A practical guide for authoring artifacts in this plugin marketplace. For the interactive version, use the `artifact-toolkit` plugin (`/artifact-toolkit:skill-create`, `/artifact-toolkit:agent-create`, `/artifact-toolkit:command-create`).

**Official Anthropic docs:**
- [Skills](https://code.claude.com/docs/en/skills) — Skill authoring and management
- [Plugins](https://code.claude.com/docs/en/plugins) — Plugin structure and publishing
- [Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) — Anthropic's skill authoring guide

**Related files in this repo:**
- `CLAUDE.md` — Quick operational reference (consult first)
- `docs/templates.md` — Copy-paste templates for all artifact types
- `docs/audit-checklists.md` — Full audit checklists at a glance

---

## 1. Decision Guide: Skill vs Command vs Agent

### Primary Decision Tree

```
Does it activate autonomously from conversation context?
  YES → Agent (description-matched auto-invocation)
  NO  → Does it need supporting files or multiple phases?
          YES → Skill (directory-based with references/)
          NO  → Is it under 200 lines and single-file?
                  YES → Command (legacy single-file format)
                  NO  → Skill
```

### When to Use What

| Signal | Use | Example in this repo |
|--------|-----|---------------------|
| Activates from conversation keywords | **Agent** | `typescript-expert` auto-invokes on TS errors |
| Routes to/from other agents | **Agent** | `code-review-expert` delegates to 10+ specialists |
| Domain expert covering 5-15 problem types | **Agent** | `database-expert` covers schema, queries, migrations |
| Multi-phase workflow with user checkpoints | **Task Skill** | `doc-review` has 4 checkpoint gates |
| Needs `references/` directory for templates | **Task Skill** | `hld-generate` loads template from references/ |
| Injects knowledge without a workflow | **Reference Skill** | `design-pillars` auto-injects methodology |
| Simple, single-file, under 200 lines | **Command** | `checkpoint/create` (git stash workflow) |
| Coordinates other skills in a pipeline | **Task Skill** | `arch-pipeline` orchestrates ADR→HLD→LLD |

### Key Distinctions

- **Skills** change what the agent *knows* — they inject knowledge or define procedures
- **Agents** change *who* does the work — they're autonomous experts with their own context
- **Commands** are the legacy format — prefer skills for new work
- **MCP** connects Claude to external *data*; skills teach Claude what to *do* with it

### Start Simple, Promote as Needed

Start with a command. If it grows past 200 lines or needs reference files, promote to a skill. If it needs autonomous activation or cross-agent routing, make it an agent.

---

## 2. Authoring Skills

Skills are the modern, directory-based format. Each skill is a directory with a `SKILL.md` file and optional `references/` subdirectory.

### Two Types of Skills

**Task Skills** — Procedural workflows invoked by users:
- Set `disable-model-invocation: true` (prevents Claude from auto-invoking)
- Use `context: fork` for clean execution state
- Structure content as phases with checkpoints
- Example: `plugins/architecture-docs/skills/doc-review/SKILL.md`

**Reference Skills** — Knowledge injection, auto-triggered:
- Set `user-invocable: false` (hidden from slash menu)
- No `allowed-tools` needed (or set to empty)
- Content is pure reference — no phases or workflows
- Consider `model: haiku` for lightweight injection
- Example: `plugins/game-design-bible/skills/design-pillars/SKILL.md`

### Content Structure (Task Skills)

```markdown
# Skill Title

One-paragraph summary of what and when.

## Input

$ARGUMENTS — description of expected arguments.

## Parse Arguments

- **Arg 1**: how to extract
- **Arg 2**: how to extract (optional)

## Process

### Phase 1: Phase Name

1. Step in imperative mood
2. Step in imperative mood

**CHECKPOINT — Checkpoint Name:**
Present what to show. Ask: "confirmation question?"

### Phase 2: Phase Name
...

### Phase N: Final Phase

1. Final steps
2. Return output description.
```

### Writing Style

- Write **TO** the AI in imperative mood: "Run X", "Read the file", "Present results"
- Never write **AS** the AI: ~~"I will..."~~, ~~"The skill will..."~~, ~~"This analyzes..."~~
- Keep SKILL.md under 500 lines; move reference material to `references/`

### String Substitutions

| Syntax | Description |
|--------|-------------|
| `$ARGUMENTS` | Full user-provided arguments |
| `$ARGUMENTS[N]` / `$N` | Positional argument at index N |
| `${CLAUDE_SKILL_DIR}` | Path to the skill's directory |
| `${CLAUDE_SESSION_ID}` | Current session identifier |
| `` !`shell-command` `` | Dynamic bash (output replaces placeholder) |

### Supporting Files

Store templates, checklists, and reference material in `references/`:

```
skill-name/
├── SKILL.md
└── references/
    ├── template.md
    ├── checklist.md
    └── heuristics.md
```

Always load via `${CLAUDE_SKILL_DIR}/references/filename` — never hardcode absolute paths.

### Tool Security

Every task skill must declare `allowed-tools`. Follow least-privilege:

| Pattern | Grants | Use When |
|---------|--------|----------|
| `Read, Grep, Glob` | Read-only analysis | Reporting, analysis |
| `Bash(git *)` | Git commands only | Git workflows |
| `Bash(git *), Read, Edit` | Git + file editing | Commit prep |
| `Write, Read, Glob` | File creation | Scaffolding, generation |
| `Read, Write, Edit, Bash` | Full access | Only when genuinely needed |

Use scoped Bash restrictions (e.g., `Bash(git *)`, `Bash(npm *)`) unless unrestricted shell access is genuinely needed.

### Checkpoints (Human-in-the-Loop)

Insert checkpoints after major phases to get user confirmation:

```markdown
**CHECKPOINT — Scope Confirmation:**
Present:
- System purpose and domain
- Tech stack detected
- Proposed focus areas

Ask: "Is this scope correct? Any areas to focus on or skip?"

Do NOT proceed until the user confirms.
```

### Parallel Agent Dispatch

Skills can launch parallel agents for heavy work:

```markdown
### Phase 2: Parallel Analysis

Launch up to 5 parallel Explore agents, one per dimension...
Wait for all agents to return before proceeding.
```

Include `Agent` in `allowed-tools` when dispatching parallel work.

### Common Mistakes

- Forgetting `argument-hint` when the body uses `$ARGUMENTS`
- Granting unrestricted `Bash` instead of scoped `Bash(git *)`
- Writing "I will..." or "The skill will..." instead of imperative "Run X"
- Going over 500 lines without extracting to `references/`
- Hardcoding absolute paths instead of using `${CLAUDE_SKILL_DIR}`
- Omitting `allowed-tools` (grants all tools — only appropriate for reference skills)

---

## 3. Authoring Commands

Commands are single markdown files in `commands/` directories. The filename becomes the command name: `commands/commit.md` → `/git-tools:commit`.

### When to Use Commands

- Simple, single-concern workflow
- Under 200 lines
- No supporting reference files needed
- If it grows past 200 lines, convert to a skill

### Content Rules

1. Write TO the AI in imperative mood
2. One concern per command
3. Under 200 lines
4. Use `$ARGUMENTS` for user input
5. Use `` !`command` `` for dynamic bash injection
6. Use `@filename` for file content injection

### Dynamic Content

**Bash injection** — output replaces the placeholder before Claude sees it:
````markdown
Current branch: !`git branch --show-current`
Recent commits:
```
!`git log --oneline -10`
```
````

**File injection** — file contents are inlined:
```markdown
Review the project config:
@package.json
@tsconfig.json
```

### Frontmatter

```yaml
---
description: "What the command does — clear, one sentence"
allowed-tools: Bash(git *), Read, Edit
argument-hint: "[branch-name] [--force]"
category: workflow
---
```

The `description` is how users discover the command. Make it specific and actionable.

---

## 4. Authoring Agents

Agents are autonomous experts that activate from conversation context. Each agent is a markdown file in `agents/` directories.

### The Routing Mesh (Mandatory)

Every agent **must** include a "Step 0: Route or Stay" section. This is the defining feature of agents in this codebase and prevents agents from handling problems outside their specialty.

```markdown
## Step 0: Route or Stay

If the issue is **not** TypeScript-specific, delegate and STOP:
- React hooks/components → **react-expert**, STOP
- Database queries → **database-expert**, STOP
- Build/deploy → **devops-expert**, STOP

**Stay here** when: type errors, tsconfig issues, module resolution, generics
```

**Rules:**
- Every delegation rule must include **STOP** language
- Name specific agents (`postgres-expert`), not vague descriptions ("a database specialist")
- STOP immediately after routing — do not provide additional guidance
- No circular delegation (if A → B, then B must not → A for the same problem type)

### Routing Patterns

**Broad → Specialist (fan-out):**
```
database-expert → postgres-expert (PostgreSQL-specific)
               → mongodb-expert (MongoDB-specific)
               → optimizer (query performance)
```

**Specialist → Broad (escalation):**
```
postgres-expert → database-expert (cross-DB issues)
               → devops-expert (deployment/infra)
```

**Peer delegation:**
```
nextjs-expert → react-expert (React-only, no Next.js)
             → typescript-expert (TS config, no Next.js)
```

Missing agents degrade gracefully — if the target plugin isn't installed, the delegating agent handles locally.

### Description Writing

The `description` field determines when Claude auto-invokes the agent. Make it "pushy" — Claude tends to undertrigger.

**Good:** `"TypeScript expert handling type errors, module resolution, tsconfig issues, generics, and migration strategies. Use PROACTIVELY for any TypeScript compilation error, type inference problem, or TS configuration question."`

**Bad:** `"Handles TypeScript issues"` — too vague for auto-matching.

Include "Use PROACTIVELY when..." or "Use PROACTIVELY for..." with specific trigger conditions.

### Quality Criteria

| Criterion | Test | Threshold |
|-----------|------|-----------|
| **Coverage** | Distinct problems handled | 5-15 (fewer → skill; more → split) |
| **Resume test** | "Would someone list this as expertise?" | Must be yes |
| **Value test** | "Would you pay $5/month for this?" | Must be yes |
| **Specificity** | Non-obvious domain knowledge? | Must encode specialized knowledge |
| **Conciseness** | Line count | Under 80 lines |

### Naming Conventions

| Pattern | Example | Use When |
|---------|---------|----------|
| `domain-expert` | `typescript-expert` | Broad domain expert |
| `domain-subdomain-expert` | `typescript-type-expert` | Sub-domain specialist |
| `domain-function` | `database-optimizer` | Functional specialist |

**Anti-patterns:** `fix-*`, `enhanced-*`, `*-helper`, `*-v2`, `*-new`, `better-*`

### Agent Content Structure

```markdown
# Domain Expert

You are a [domain] expert with deep knowledge of [areas].

## Step 0: Route or Stay
[routing table]

## Core Process

1. **Environment Detection** (prefer Read/Grep/Glob over Bash):
   - Check config files, detect framework versions

2. **Problem Analysis**:
   - Category 1: description and checks
   - Category 2: description and checks

3. **Solution Implementation**:
   - **Quick fix**: fast, safe, minimal change
   - **Proper solution**: correct, follows conventions
   - **Best practice**: ideal, may require refactoring

## Stop Conditions
- Resolved when [success criteria]
- STOP if [out-of-scope indicator]
```

### Plugin Restrictions

Agents shipped in plugins (`plugins/` directory) must **NOT** use: `hooks`, `mcpServers`, `permissionMode`. These are blocked for plugin-distributed agents.

---

## 5. Composite Patterns

For multi-skill pipelines like `architecture-docs` and `game-design-bible`.

### Gather → Generate → Audit Cycle

Every document phase follows a three-skill pattern:

1. **{Phase}-Gather** — Interactive Q&A + parallel research → produces a context file
2. **{Phase}-Generate** — Reads context file, produces document (non-interactive)
3. **Audit-{Phase}** — Walks through quality checklist interactively, per-issue resolution

### Context Isolation

- All phase skills use `context: fork` for clean execution state
- The orchestrator never holds document content — only file paths and verdicts
- This keeps the orchestrator lean and prevents context pollution

### State Tracking

Orchestrators maintain state via file paths, not content:

```
$ADR_PATH — generated ADR document
$HLD_PATHS[] — array of HLD documents (indexed)
$HLD_AUDIT_VERDICTS[] — PASS / PASS WITH WARNINGS / FAIL
$LLD_PATHS[i][] — nested array (LLDs grouped per HLD)
```

### 1:N:M Fan-Out

When one document spawns multiple sub-documents (e.g., 1 ADR → N HLDs → M LLDs per HLD):
- Loop indices thread through gather/generate/audit
- Orchestrator invokes phase skills with scope index
- Each sub-document gets its own gather→generate→audit cycle

### Orchestrator Pattern

Orchestrators coordinate but don't generate:
- Invoke phase skills via `Skill` tool
- Extract output paths from each phase
- Present checkpoints between phases
- Track verdicts and decide whether to proceed or re-run

### Parallel Research in Gather Phases

Gather skills dispatch parallel agents for speed:
- Code research agent (explores the codebase)
- Web research agent (fetches external docs)
- Both run concurrently in a single message
- Results merge into the context file

---

## 6. Plugin Structure

### Directory Layout

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/                # Slash commands (optional)
│   └── command-name.md
├── agents/                  # Subagents (optional)
│   └── agent-name.md
├── skills/                  # Skills (optional)
│   └── skill-name/
│       ├── SKILL.md
│       └── references/
├── CLAUDE.md                # Plugin-level guidance (optional)
└── README.md                # User-facing documentation
```

### Plugin Manifest (`plugin.json`)

```json
{
  "name": "plugin-name",
  "description": "What this plugin provides",
  "version": "1.0.0",
  "author": { "name": "AuthorName" }
}
```

### Marketplace Registry (`marketplace.json`)

```json
{
  "plugins": [
    {
      "name": "plugin-name",
      "description": "What this plugin provides",
      "version": "1.0.0",
      "source": "./plugins/plugin-name",
      "category": "commands|agents|research|documentation|game-design",
      "keywords": ["tag1", "tag2"]
    }
  ]
}
```

### When to Add a CLAUDE.md

Add a plugin-level `CLAUDE.md` when the plugin has:
- Non-obvious conventions or patterns
- Complex multi-skill pipelines
- Cross-plugin routing dependencies
- Gotchas that aren't apparent from reading the code

Standard sections: Purpose, Key Files (table), Local Conventions, Gotchas.

Currently 4 of 23 plugins have CLAUDE.md files — the most complex ones: `architecture-docs`, `game-design-bible`, `artifact-toolkit`, `quality-agents`.

---

## 7. Testing and Iteration

### Use the Audit Skills

After creating any artifact, run the corresponding audit:
- `/artifact-toolkit:skill-audit` — Walks through 24 checks across 7 categories
- `/artifact-toolkit:agent-audit` — Walks through 25 checks across 7 categories
- `/artifact-toolkit:command-audit` — Walks through 22 checks across 6 categories

### Iterative Workflow

Audit → Fix → Re-audit is the intended pattern. A single pass rarely produces a clean result for complex artifacts.

### Token Budget

- Keep core SKILL.md content under ~2,000 tokens for optimal Claude processing
- Progressive disclosure: load information only as needed
- Put the most important information first — Claude processes better when critical content is early

### Description Quality

Descriptions are the primary discovery mechanism. Test by asking: "Would Claude match this description against the user's current conversation?" If the answer is ambiguous, add more specific trigger keywords.

---

## Further Reading

- [Templates](templates.md) — Copy-paste templates for all artifact types
- [Audit Checklists](audit-checklists.md) — Full audit checks at a glance
- [Official Skills Docs](https://code.claude.com/docs/en/skills)
- [Official Plugin Docs](https://code.claude.com/docs/en/plugins)
- [Anthropic Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
