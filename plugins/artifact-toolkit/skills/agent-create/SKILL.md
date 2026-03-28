---
name: agent-create
description: "Author a new Claude Code agent/subagent with domain expert principles, routing mesh integration, proactive trigger design, and quality-checked output. Researches existing agents for routing mesh neighbors and domain best practices."
disable-model-invocation: true
context: fork
argument-hint: "[agent-name or domain description] [--project|--user|--plugin plugin-name]"
allowed-tools: Read, Write, Glob, Grep, Bash, Agent, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Agent Creation

Author a new Claude Code agent/subagent through domain expert principles, routing mesh analysis, and official documentation consultation. Produces a complete agent `.md` file with proper frontmatter, routing mesh, and domain expertise encoding.

## Input

$ARGUMENTS — an agent name or domain description, and optionally a location flag:
- `--project` — create in `.claude/agents/` (shared with team)
- `--user` — create in `~/.claude/agents/` (personal, all projects)
- `--plugin <name>` — create in a plugin's `agents/` directory

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Name/Description**: The non-flag text
- **Location Flag**: `--project`, `--user`, or `--plugin <name>`

If no location flag is provided, ask the user in Phase 1.

## Source Integrity Rules

**Every design decision must be traceable to user answers, codebase research, or official documentation.**

## Process

### Phase 1: Domain Identification

1. If only a name was provided, ask what domain this agent covers.
2. Identify the domain:
   - **Domain name**: The expertise area (e.g., "typescript", "testing", "database-performance")
   - **Sub-domain (optional)**: Specific area within a broader domain (e.g., "typescript-type" under "typescript")
   - **Hierarchical placement**: Is this a broad domain expert or a sub-domain specialist?

3. Apply the **Domain Expert Validation**:
   - **Coverage test**: Can the user identify 5-15 related problems this agent handles? If fewer than 5, suggest a skill instead. If more than 15, suggest splitting into broad + specialist pair.
   - **Resume test**: Would someone put "[domain] Expert" on their resume? If no, the scope is too narrow.
   - **Value test**: Would a developer pay $5/month for this expertise? If no, the knowledge may be too trivial to warrant an agent.

4. If no location flag provided, ask using AskUserQuestion:
   - Project level (`.claude/agents/`) — shared with team
   - User level (`~/.claude/agents/`) — personal
   - Plugin (`plugins/<name>/agents/`) — distributable

**CHECKPOINT — Confirm Domain:**
Present:
- Domain name and scope
- Broad expert or specialist
- Problems it handles (initial list)
- Target location

Ask: "Is this the right domain boundary? Should it be broader or narrower?"

### Phase 2: Gather Requirements

Ask clarifying questions using AskUserQuestion. Batch related questions.

**Question areas:**

1. **Problem Coverage** — List the 5-15 specific problems this agent handles. For each, one sentence on what the agent should do. Example: "Generic constraint errors → analyze the constraint chain, suggest minimal fixes, explain the type theory."
2. **Tool Requirements** — Which tools does the agent need?
   - Analysis-only: `Read, Grep, Glob, Bash`
   - Fix-capable: `Read, Edit, MultiEdit, Bash, Grep`
   - Architecture: `Read, Write, Edit, Bash, Grep`
   - Or leave blank to inherit all tools (recommended for broad experts).
3. **Routing Mesh** — Who does this agent delegate to? Who delegates to this agent?
   - List agents this one should hand off to (and for what problems)
   - List agents that should hand off to this one
   - Identify any parent or child agents in the hierarchy
4. **Proactive Triggers** — What conditions should cause Claude to auto-invoke this agent? Be specific:
   - File patterns (e.g., "when editing `.prisma` files")
   - Error patterns (e.g., "when encountering `TS2322` type errors")
   - Topic patterns (e.g., "when discussing query optimization")
5. **Environment Detection** — What should the agent check first?
   - Config files (e.g., `tsconfig.json`, `prisma/schema.prisma`)
   - Framework detection
   - Tool version checks
6. **Solution Approach** — Does the agent use progressive solutions (quick/proper/best)? Does it prioritize safety, performance, or correctness?

### Phase 3: Research

Launch two parallel agents:

**Agent 1 — Codebase Research:**
```
Search for existing agents in the same or adjacent domains.
Look in:
- ~/.claude/agents/
- .claude/agents/
- Any plugins/*/agents/ directories

For each relevant agent found, note:
- Name and domain
- Routing mesh: who it delegates to and who delegates to it
- Description and proactive triggers
- Tool grants
- Content structure and length

Specifically identify:
- Potential routing mesh NEIGHBORS (agents this new one should delegate to or receive from)
- Naming conflicts
- Domain overlap that might cause ambiguous auto-invocation

Return findings with file:line citations.
```

**Agent 2 — Domain Best Practices Research:**
```
Research two topics:

1. Official Claude Code documentation on sub-agent authoring:
   - Valid frontmatter fields
   - Tool grants and restrictions
   - Proactive invocation patterns
   - Plugin agent restrictions (no hooks, mcpServers, permissionMode)

2. Domain-specific best practices for the agent's expertise area:
   - Common problems and solutions
   - Key concepts the agent should know
   - Frequently referenced tools, libraries, or patterns
   - Error patterns the agent should recognize

Return findings with URLs.
```

**CHECKPOINT — Present Research Findings:**
Present:
- Routing mesh neighbors found (agents to delegate to/from)
- Naming conflicts or domain overlap
- Domain best practices that should be encoded
- Recommended tool grants from documentation

Ask: "Any of these routing mesh connections or domain patterns you want to include or exclude?"

### Phase 4: Draft & Review

Assemble the complete agent file.

**Follow this structure:**

1. **Frontmatter:**
   ```yaml
   ---
   name: {{kebab-case-name}}
   description: "{{Domain}} expert handling {{problem-list}}. Use PROACTIVELY for {{trigger-conditions}}."
   tools: {{comma-separated list, or omit for all tools}}
   model: {{only if justified}}
   ---
   ```

2. **Role Definition:**
   ```markdown
   # {{Domain}} Expert

   You are a {{domain}} expert with deep knowledge of {{specific areas}}.
   ```

3. **Step 0 — Route or Stay (REQUIRED):**
   ```markdown
   ## Step 0: Route or Stay

   If the issue is **not** {{domain}}-specific, delegate and STOP:
   - {{Problem type}} → **{{agent-name}}**, STOP
   - {{Problem type}} → **{{agent-name}}**, STOP

   **Stay here** when: {{conditions for handling locally}}
   ```

4. **Core Process:**
   ```markdown
   ## Core Process

   1. **Environment Detection** (prefer Read/Grep/Glob over Bash):
      - Check {{relevant config files}}
      - Detect {{frameworks/tools}}

   2. **Problem Analysis** (4-6 categories):
      - {{Category}}: {{what to look for}}

   3. **Solution Implementation**:
      - Apply domain best practices
      - Use progressive solutions (quick → proper → best)
      - Validate with {{established workflows}}
   ```

5. **Stop Conditions:**
   ```markdown
   ## Stop Conditions
   - Resolved when {{success criteria}}
   - STOP if {{out-of-scope conditions}}
   ```

**Quality checks before presenting:**
- Agent body under 80 lines (concise domain encoding)
- Name follows `domain-expert` or `domain-subdomain-expert` pattern
- Description includes "Use PROACTIVELY when..." triggers
- Step 0 routing table references specific agent names
- No TODO/TBD/FIXME placeholders

**Present the draft to the user.** Show:
- Complete agent `.md` content
- Routing mesh diagram (which agents connect to this one)
- Proactive trigger analysis

Ask: "Does this look right? I can revise. (Up to 2 revision rounds)"

Allow up to 2 revision rounds.

### Phase 5: Generate

1. Determine the full target path:
   - Project: `.claude/agents/<agent-name>.md`
   - User: `~/.claude/agents/<agent-name>.md`
   - Plugin: `plugins/<plugin-name>/agents/<agent-name>.md`

2. Check if file already exists. If so, warn and ask to confirm overwrite or choose a different name.

3. Create parent directory if needed.

4. Write the agent file.

### Phase 6: Post-Generation

1. Confirm what was created:
   ```
   Created agent at: [full path]
   Domain: [domain name]
   Problems covered: [count]
   Routing mesh: delegates to [list], receives from [list]
   Lines: [count]
   Tools granted: [list or "all (inherited)"]
   ```

2. Suggest auditing: "Run `/artifact-toolkit:agent-audit [path]` to validate quality and routing mesh compliance."

3. If routing mesh neighbors were identified, suggest reviewing them:
   "Consider updating these agents to include delegation rules for `[new-agent-name]`:"
   - `[neighbor-path]` — add delegation for {{problem type}}
