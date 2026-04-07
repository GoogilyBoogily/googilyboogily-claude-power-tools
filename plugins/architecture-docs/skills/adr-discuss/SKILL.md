---
name: adr-discuss
description: "Identify gray areas and capture key decisions before writing an Architecture Decision Record. Scouts the codebase, surfaces 3-5 concrete decision points that would change the outcome, and guides the user through each. Outputs a numbered decisions file that feeds into adr-gather and adr-generate."
version: 3.0.0
context: fork
argument-hint: "[decision topic]"
allowed-tools: Read, Glob, Grep, AskUserQuestion
model: opus
---

# ADR Discussion — Gray Area Identification

Identify the decisions that actually matter before gathering detailed context. This skill scouts the codebase, finds existing constraints, surfaces concrete gray areas, and guides the user through each one. The output is a structured decisions file with D-XX numbered entries that downstream skills (adr-gather, adr-generate) treat as a contract.

**Philosophy:** Don't ask everything — ask what matters. Generic Q&A ("what's the problem?") wastes the user's time. Instead, analyze the decision space, identify where the outcome hinges on a choice, and focus the conversation there.

## Input

$ARGUMENTS — the decision topic (e.g., "migrate from REST to GraphQL").

If no topic is provided, ask the user what architectural decision needs to be recorded.

## Process

**Human-in-the-loop: Every decision is captured from user input, never assumed.**

### Phase 1: Scout the Landscape

1. **Scan existing ADRs** — Glob for `docs/decisions/*.md`, read titles and status fields. Extract:
   - Active constraints (accepted ADRs that narrow this decision space)
   - Related decisions (same domain, overlapping scope)
   - Superseded decisions (deprecated approaches)
2. **Scout the codebase** — lightweight Glob/Grep for patterns related to the decision topic:
   - Existing implementations in the affected area
   - Current conventions and patterns
   - Integration points that constrain options
   - Keep this fast — inline tools only, ~2 minutes max. This is NOT a full code research phase.
3. **Check for prior decisions file** — look for `docs/context/decisions/<topic>-decisions.md`. If found, offer to update vs start fresh.

**Budget:** Use at most 10 tool calls in this phase. The goal is orientation, not exhaustive research.

### Phase 2: Identify Gray Areas

Analyze the decision topic in context of what you found in Phase 1. Identify **3-5 gray areas** — concrete decision points where:
- Multiple valid approaches exist
- The choice materially changes the architecture
- The user's preference can't be inferred from existing constraints

**Gray area quality rules:**
- **Concrete, not generic.** BAD: "Performance considerations". GOOD: "Connection pooling — pgBouncer vs application-level pooling vs Prisma's built-in pool"
- **Decision-shaped, not question-shaped.** BAD: "What about security?" GOOD: "Auth token storage — httpOnly cookies vs localStorage with refresh rotation vs server-side sessions"
- **Annotated with context.** Include what you found during scouting: existing patterns, constraints from other ADRs, relevant code. Example: "You currently use express-session (src/middleware/session.ts:12) — switching to JWT would require replacing this"
- **Skip pre-resolved areas.** If an existing ADR already decides something, don't resurface it. Reference the constraint instead.

### Phase 3: Present Gray Areas

Present the identified gray areas to the user via AskUserQuestion with `multiSelect: true`:

> "I've analyzed the decision space for **[topic]**. Here are the key areas where your choice shapes the architecture. Which would you like to discuss?"

Each option should include:
- A short label (the decision)
- A description with the tradeoff and code context

Include these standard options:
- **"All of them"** — discuss every gray area
- **"None — I have clear preferences"** — skip to direct decision capture

### Phase 4: Deep-Dive Selected Areas

For each selected gray area, in order:

1. **Present the tradeoff** — describe 2-4 concrete options with honest pros/cons. Use what you learned from scouting:
   - What exists today (code context)
   - What each option requires (migration effort, new dependencies, breaking changes)
   - What constraints apply (from existing ADRs, team conventions, technical limitations)

2. **Ask for the user's preference** via AskUserQuestion:
   - Options are the concrete approaches (not "tell me more")
   - Include a brief rationale hint for each
   - Always include "Other" implicitly (AskUserQuestion provides this)

3. **Capture the decision** — record as a numbered D-XX entry with:
   - The specific decision made
   - Whether it's a User Decision or Claude's Discretion
   - The user's rationale (ask "Why this approach?" if not obvious)
   - Code context (what existing code is affected)

4. **Check for cascade effects** — does this decision resolve or create other gray areas? Adjust the remaining list.

### Phase 5: Capture Remaining Decisions

After deep-dives, ask if there are additional decisions the user wants to lock in that weren't covered by the gray areas:

> "Are there any other decisions you want to lock in for this ADR? Things like team agreements, timeline constraints, or specific non-goals?"

Capture any additional decisions as D-XX entries.

For areas NOT discussed (skipped gray areas or areas of low ambiguity), mark as **Claude's Discretion** — these are areas where the generate phase can make reasonable choices without user input.

### Phase 6: Compile and Save Decisions File

Assemble all decisions into a structured file:

```markdown
# ADR Decisions: [Decision Topic]

**Discussed:** [today's date]
**Topic:** [decision topic]
**Gray areas identified:** [N]
**Gray areas discussed:** [M]

## Prior Constraints

[List of existing ADR constraints that apply, with file paths]
- ADR-NNNN: [constraint] (path: `docs/decisions/NNNN-title.md`)

## Implementation Decisions

### [Category from gray area 1]
- **D-01:** [Specific decision] (User Decision)
  - Rationale: [user's reasoning]
  - Code context: [relevant existing code with file:line]
  - Affects: [what changes because of this decision]

### [Category from gray area 2]
- **D-02:** [Specific decision] (User Decision)
  - Rationale: [user's reasoning]
  - Code context: [relevant existing code with file:line]
  - Affects: [what changes]

### [Additional user decisions]
- **D-03:** [Specific decision] (User Decision)
  - Rationale: [user's reasoning]

### Claude's Discretion
- **D-04:** [Area] — Claude's choice during generation
- **D-05:** [Area] — Claude's choice during generation

## Deferred Ideas

[Anything the user mentioned but explicitly deferred — captured so it's not lost, but NOT to be implemented in this ADR's scope]

## Open Questions

[Anything unresolved that the research phase should investigate]
```

**Save to:** `docs/context/decisions/<kebab-case-topic>-decisions.md`

Tell the user:
> "Decisions captured at `<path>`. Next steps:
> 1. Run `/architecture-docs:arch-research <path>` to research the implications of these decisions
> 2. Or run `/architecture-docs:adr-gather <path>` to compile the full context for ADR generation"
