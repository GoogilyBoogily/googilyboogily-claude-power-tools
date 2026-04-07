---
name: arch-research
description: "Standalone research phase that investigates the implications of architecture decisions. Reads a decisions file from a discuss phase, dispatches parallel code and web research focused on those decisions, and produces a structured RESEARCH.md with comparison tables, 'don't hand-roll' warnings, and confidence-tiered sources."
version: 3.0.0
context: fork
argument-hint: "[path-to-decisions-file]"
allowed-tools: Read, Glob, Grep, Skill, Task, WebSearch, WebFetch, LSP
model: opus
---

# Architecture Research Phase

Investigate the technical implications of decisions captured during a discuss phase. This skill reads a decisions file, dispatches parallel code and web research focused on those specific decisions, merges findings, and produces a standalone RESEARCH.md.

**Philosophy:** Research should be guided by decisions, not generic. If the user decided "use Redis for caching" (D-03), research should investigate Redis patterns, pitfalls, and alternatives — not generic "caching best practices." The decisions file IS the research brief.

## Input

$ARGUMENTS — path to a decisions file (from adr-discuss, hld-discuss, or lld-discuss).

If no path provided, check for recent decisions files:
1. Glob `docs/context/*/decisions/*-decisions.md`
2. Sort by modification time
3. Present the most recent ones via AskUserQuestion

## Source Integrity Rules

**Every claim must trace to research performed in this session.**

1. Code findings cite `file_path:line_number`
2. Web findings cite URLs with reliability ratings
3. No references to prior Claude sessions or memory
4. Assumptions explicitly labeled

## Process

### Phase 1: Parse Decisions & Plan Research

1. Read the decisions file at `$ARGUMENTS`
2. Extract:
   - All D-XX decisions (both User Decisions and Claude's Discretion)
   - Open Questions (these become primary research targets)
   - Prior Constraints (context for research scope)
   - Deferred Ideas (DO NOT research these — they're out of scope)
3. Determine document type from file path:
   - `docs/context/decisions/` → ADR research
   - `docs/context/hld/` → HLD research
   - `docs/context/lld/` → LLD research
4. Plan research queries — for each D-XX decision and open question:
   - What needs code-level investigation? (existing patterns, gap analysis, reusable assets)
   - What needs web-level investigation? (best practices, library docs, known pitfalls)

### Phase 2: Dispatch Parallel Research

Dispatch two Tasks in a **single message** (parallel execution):

**Task 1 — Code Research:**
```
Use the Skill tool to invoke /architecture-docs:code-research with a composite question.

Focus the question on:
- For each User Decision: What existing code supports or conflicts with this choice?
- For each Open Question: What does the codebase reveal?
- Gap analysis: What's implemented vs what each decision requires?
- Reusable assets: What existing utilities, patterns, or base classes can be leveraged?

Frame the question as: "Investigate the codebase for [topic]. Specifically:
1. [D-01 related question]
2. [D-02 related question]
3. [Open question 1]
..."
```

**Task 2 — Web Research:**
```
Use the Skill tool to invoke /architecture-docs:web-research with a composite question.

Focus the question on:
- For each User Decision: What are best practices, common pitfalls, and alternatives?
- For each Open Question: What does the ecosystem recommend?
- Library/framework documentation for specific technologies mentioned in decisions
- Known anti-patterns and "don't hand-roll" situations

Frame the question as: "Research best practices and pitfalls for [topic]. Specifically:
1. [D-01: approach chosen — what to watch out for?]
2. [D-02: technology selected — current state, known issues?]
3. [Open question 1]
..."
```

Wait for both to complete before proceeding.

### Phase 3: Merge and Analyze

1. **Read both research reports** — extract key findings
2. **Cross-reference** — where do code reality and web best practices:
   - Align? (Good — existing patterns follow best practices)
   - Conflict? (Important — flag for the user's attention)
   - Have gaps? (Missing — neither source covers this area)
3. **Map findings to decisions** — for each D-XX, what did research reveal?
   - Confirmation: research supports the decision
   - Caution: research suggests potential issues
   - Alternative: research found a better approach (but user already decided — note it, don't override)
4. **Identify "don't hand-roll" situations** — things that LOOK simple enough to build but have subtle complexity (crypto, date handling, pagination cursors, rate limiting, etc.)

### Phase 4: Compile RESEARCH.md

Produce a structured research file:

```markdown
# Research: [Topic]

**Researched:** [today's date]
**Decisions file:** [path]
**Code research scope:** [summary of what was investigated in codebase]
**Web research scope:** [summary of what was investigated online]

## Summary

[2-3 sentences: what research confirms, what it warns about, what remains uncertain]

## Decision Impact Analysis

For each D-XX decision, what research found:

### D-01: [Decision summary]
- **Research says:** [confirmation, caution, or alternative]
- **Key finding:** [most important insight]
- **Source:** [file:line or URL]

### D-02: [Decision summary]
- **Research says:** [confirmation, caution, or alternative]
- **Key finding:** [most important insight]
- **Source:** [file:line or URL]

## Approach Comparison

[For decisions where multiple approaches were considered]

| Approach | Pros | Cons | Adoption Level | Risk Level |
|----------|------|------|---------------|------------|
| [Option A] | [pros] | [cons] | [widespread/growing/niche] | [low/medium/high] |
| [Option B] | [pros] | [cons] | [level] | [level] |

## Existing Codebase Patterns

| Pattern | Location (file:line) | Reusable? | Adaptation Needed |
|---------|---------------------|-----------|-------------------|
| [pattern] | `[path:line]` | [yes/no/partial] | [what needs to change] |

## Don't Hand-Roll

[Things that look buildable but have hidden complexity]

| Problem | Don't Build | Use Instead | Why |
|---------|------------|-------------|-----|
| [problem] | [naive approach] | [proven solution] | [hidden complexity] |

## Common Pitfalls

| Pitfall | What Goes Wrong | How to Avoid | Source |
|---------|----------------|--------------|--------|
| [pitfall] | [failure mode] | [prevention] | [URL or file:line] |

## Gap Analysis

| Expected (from decisions) | Actual (codebase) | Severity | Impact on Design |
|--------------------------|-------------------|----------|------------------|
| [what decision assumes] | [what exists] | [🔴/🟡/🔵] | [design implication] |

## Code-Web Conflicts

[Where codebase reality differs from web best practices]

| Area | Codebase Does | Web Recommends | Resolution |
|------|--------------|----------------|------------|
| [area] | [current approach] | [recommended] | [keep current/migrate/hybrid] |

## Open Questions Resolved

[Answers to Open Questions from the decisions file]

| Question | Answer | Confidence | Source |
|----------|--------|------------|--------|
| [question] | [answer] | [high/medium/low] | [source] |

## Remaining Unknowns

[Questions that research couldn't answer — these should be flagged during gather]

## Sources

### Primary (official docs, high confidence)
1. [title] — [URL] — [what it informed]

### Secondary (maintained repos, GitHub, medium confidence)
1. [title] — [URL] — [what it informed]

### Tertiary (blogs, forums, lower confidence)
1. [title] — [URL] — [what it informed — note date]
```

### Phase 5: Save and Present

1. Determine save path based on decisions file location:
   - `docs/context/decisions/*` → `docs/context/decisions/<name>-RESEARCH.md`
   - `docs/context/hld/*` → `docs/context/hld/<name>-RESEARCH.md`
   - `docs/context/lld/*` → `docs/context/lld/<name>-RESEARCH.md`
2. Write the file
3. Present a summary to the user highlighting:
   - Confirmations (research supports decisions)
   - Cautions (potential issues found)
   - Don't-hand-roll warnings
   - Remaining unknowns

Tell the user:
> "Research complete at `<path>`. Key findings:
> - [N] decisions confirmed by research
> - [M] cautions flagged
> - [K] don't-hand-roll warnings
>
> Next: Run `/architecture-docs:{type}-gather <decisions-path>` to compile the full context file. The gather skill will incorporate these research findings."
