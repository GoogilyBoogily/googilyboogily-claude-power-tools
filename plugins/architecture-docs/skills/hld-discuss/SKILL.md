---
name: hld-discuss
description: "Identify gray areas and capture architecture-level decisions before writing a High Level Design. Scouts the codebase and ADR constraints, surfaces 3-5 concrete decision points about component boundaries, integration patterns, and technology selections. Outputs a numbered decisions file that feeds into hld-gather and hld-generate."
version: 3.0.0
context: fork
argument-hint: "[HLD topic] --adr [path-to-adr]"
allowed-tools: Read, Glob, Grep, AskUserQuestion
model: opus
---

# HLD Discussion — Gray Area Identification

Identify the architecture-level decisions that matter before gathering detailed HLD context. This skill loads ADR constraints, scouts affected code modules, surfaces gray areas about system architecture, and guides the user through each one.

**Philosophy:** An HLD's value comes from the architecture decisions it captures. Generic template-filling produces documents nobody reads. Focus on the decisions that would make two architects disagree — those are the gray areas worth discussing.

## Input

$ARGUMENTS — the HLD topic and optional ADR path.

Parse for:
- **Topic** — what the HLD covers (e.g., "API layer for GraphQL migration")
- **`--adr` flag** — path to the ADR this HLD implements (e.g., `--adr docs/decisions/0012-graphql-migration.md`)

If no topic is provided, ask what aspect of the architecture needs to be designed.

## Process

**Human-in-the-loop: Every decision is captured from user input, never assumed.**

### Phase 1: Scout the Landscape

1. **Load ADR constraints** — if `--adr` provided, read the ADR and extract:
   - Decision outcome and rationale (what's already decided)
   - Decision drivers (what forces apply)
   - Consequences (what tradeoffs were accepted)
   - Confirmation criteria (what must be true)
   - These are NON-NEGOTIABLE constraints — gray areas must work within them

2. **Scan existing HLDs** — Glob for `docs/hld/*.md`, identify related designs and established patterns.

3. **Scout affected code** — lightweight Glob/Grep focused on:
   - Modules/components in the HLD's scope
   - Current architecture patterns (MVC? layered? hexagonal?)
   - External integrations and API boundaries
   - Data models and storage patterns
   - Keep fast — inline tools only, ~2 minutes max.

4. **Check for prior decisions file** — look for `docs/context/hld/<topic>-decisions.md`. If found, offer to update vs start fresh.

### Phase 2: Identify Gray Areas

Analyze the HLD topic against ADR constraints and codebase reality. Identify **3-5 gray areas** specific to architecture decisions:

**HLD-specific gray area categories:**
- **Component boundaries** — how to split responsibilities (e.g., "thin API gateway + fat services vs fat gateway + thin services")
- **Integration patterns** — how components talk (e.g., "synchronous REST calls vs event-driven messaging vs hybrid")
- **Data ownership** — who owns what data (e.g., "shared database vs database-per-service vs CQRS")
- **Technology selections** — choices the ADR left open (e.g., "Redis vs Memcached for caching", "PostgreSQL vs DynamoDB")
- **Scalability approach** — horizontal vs vertical, stateless vs stateful
- **Failure modes** — circuit breakers, retries, fallbacks, graceful degradation

**Gray area quality rules** (same as adr-discuss):
- Concrete, not generic
- Decision-shaped, not question-shaped
- Annotated with code context from scouting
- Skip areas pre-resolved by ADR constraints

### Phase 3: Present Gray Areas

Present via AskUserQuestion with `multiSelect: true`:

> "I've analyzed the architecture space for **[topic]** within the constraints of **[ADR title]**. Here are the key architecture decisions. Which would you like to discuss?"

Each option: short label + tradeoff description + code context annotation.

Standard options:
- **"All of them"**
- **"None — I have clear preferences"**

### Phase 4: Deep-Dive Selected Areas

For each selected gray area:

1. **Present options** — 2-4 concrete architecture approaches with:
   - How each fits within ADR constraints
   - Impact on existing codebase (migration effort, breaking changes)
   - Operational implications (monitoring, deployment, debugging)
   - Mermaid diagram sketch if it clarifies the difference (inline, not generated to file)

2. **Ask for preference** via AskUserQuestion with the concrete approaches as options

3. **Capture as D-XX** with rationale, code context, and affected components

4. **Check cascades** — architecture decisions often cascade (choosing microservices affects data ownership, which affects integration patterns)

### Phase 5: Capture Remaining Decisions

Ask for additional decisions:
- NFRs (non-functional requirements) not covered
- Deployment constraints
- Team/organizational constraints ("team X owns this service")
- Timeline constraints that affect architecture choices

Mark undiscussed areas as Claude's Discretion.

### Phase 6: Compile and Save

```markdown
# HLD Decisions: [Topic]

**Discussed:** [today's date]
**Topic:** [HLD topic]
**ADR:** [path to ADR, if provided]
**Gray areas identified:** [N]
**Gray areas discussed:** [M]

## ADR Constraints (Non-Negotiable)

[Extracted from ADR — these constrain all decisions below]
- [Decision outcome from ADR]
- [Accepted consequences from ADR]

## Architecture Decisions

### [Component Boundary / Integration / Data / etc.]
- **D-01:** [Specific architecture decision] (User Decision)
  - Rationale: [user's reasoning]
  - Code context: [affected modules with file:line]
  - Affects: [downstream components, data flow, deployment]

### [Next category]
- **D-02:** [Specific decision] (User Decision)
  - Rationale: [reasoning]
  - Code context: [file:line]
  - Affects: [what changes]

### Claude's Discretion
- **D-03:** [Area] — Claude's choice during generation
- **D-04:** [Area] — Claude's choice during generation

## Deferred Ideas
[Out-of-scope ideas captured for future consideration]

## Open Questions
[Unresolved items for the research phase to investigate]
```

**Save to:** `docs/context/hld/<kebab-case-topic>-decisions.md`

Tell the user:
> "Architecture decisions captured at `<path>`. Next steps:
> 1. Run `/architecture-docs:arch-research <path>` to research implications
> 2. Or run `/architecture-docs:hld-gather <path> --adr <adr-path>` to compile full context"
