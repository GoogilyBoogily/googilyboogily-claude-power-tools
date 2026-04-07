---
name: adr-gather
description: "Compile a structured context file for ADR generation by merging decisions (from adr-discuss) and research (from arch-research) with any remaining gap-fill questions. Can also run standalone with direct Q&A when no decisions file exists."
version: 3.0.0
context: fork
argument-hint: "[decisions-file-path] [--research path-to-research]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# ADR Context Gathering — Compiler Mode

Compile all context needed to write an Architecture Decision Record. In the full pipeline, this skill receives a decisions file (from `adr-discuss`) and a research file (from `arch-research`), merges them, fills any gaps with targeted questions, and produces the final context file that `adr-generate` consumes.

**Can also run standalone** — if no decisions file is provided, falls back to direct Q&A mode (compatible with v2 behavior).

## Input

$ARGUMENTS — path to a decisions file, and optionally `--research <path>` for the research file.

Parse for:
- **Decisions path** — `docs/context/decisions/<name>-decisions.md` (first positional arg or detected from path)
- **Research path** — `--research <path>` pointing to the RESEARCH.md file
- **Topic** — if no files provided, treated as a topic string for standalone mode

## Source Integrity Rules

**Every factual claim in the context file must be traceable to research performed in this session.**

1. **Cite your work.** When referencing code, patterns, conventions, or architectural details, cite the specific tool call that discovered it (file path + line number from Read, Grep result, Explore agent finding).
2. **Never reference prior Claude sessions or Claude memory.** Do not use phrases like "from our previous conversation," "as we discussed before," "based on prior analysis." Each context file stands on its own.
3. **Assumptions are labeled, not hidden.** If you lack evidence for a claim, label it explicitly in the Open Questions section.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Mode Detection

Check if `$ARGUMENTS` points to a decisions file:
- If YES → **Compiler Mode** (Phase 1-4 below)
- If NO → **Standalone Mode** (Phase S1-S5 below)

---

## Compiler Mode (with decisions + optional research)

### Phase 1: Load Inputs

1. Read the decisions file. Extract:
   - All D-XX decisions (User Decisions + Claude's Discretion)
   - Prior Constraints
   - Deferred Ideas
   - Open Questions

2. If `--research` provided, read the research file. Extract:
   - Decision Impact Analysis
   - Approach Comparison tables
   - Don't Hand-Roll warnings
   - Common Pitfalls
   - Gap Analysis

3. If no research file provided, check for one at the same location with `-RESEARCH.md` suffix. If found, ask whether to include it.

4. Scan `docs/decisions/` for existing ADRs — needed for numbering and cross-referencing.

### Phase 2: Gap-Fill Questions

Compare the decisions + research against what an ADR context file needs:

| Required Section | Source | Gap-Fill Needed? |
|-----------------|--------|-----------------|
| Problem Statement | Decisions file (topic + D-XX context) | Only if not clear from decisions |
| Decision Drivers | Decisions file (rationale fields) | Only if rationale is thin |
| Considered Options | Decisions file (D-XX alternatives) + Research (Approach Comparison) | Usually covered — check for at least 3 options |
| Decision Outcome | Decisions file (D-XX User Decisions) | Should be present — flag if missing |
| Stakeholders | Not typically in decisions file | Ask if not mentioned |
| Consequences & Confirmation | Decisions file (affects fields) + Research (pitfalls, don't hand-roll) | Compile from both; ask only about gaps |
| Additional Context | Decisions file (Prior Constraints, Deferred Ideas) | Usually covered |

**Only ask about genuine gaps.** If the decisions + research cover a section, don't re-ask. Present what you plan to compile and ask:

> "I have enough to compile the context file. Here are the sections I'll pull from your decisions and research. Any gaps I should fill?"

List the sections with their source. If gaps exist, ask targeted questions using AskUserQuestion.

### Phase 3: Compile Context File

Assemble into the final context file, preserving D-XX numbering and research tables:

```markdown
# ADR Context: [Decision Topic]

**Gathered:** [today's date]
**Topic:** [decision topic]
**Decisions file:** [path]
**Research file:** [path, if used]

## Problem Statement

[Compiled from decisions topic + user context]

## Decision Drivers

- [driver 1 — from decisions rationale]
- [driver 2 — from research findings]
- ...

## Implementation Decisions

[Preserved exactly from decisions file — D-XX numbering intact]

### [Category]
- **D-01:** [decision] (User Decision)
  - Rationale: [rationale]
  - Code context: [file:line]

### Claude's Discretion
- **D-03:** [area]

## Considered Options

### Option 1: [title]
[Description — enriched by research Approach Comparison table]

#### Good
- [pro — from decisions + research]

#### Bad
- [con — from decisions + research pitfalls]

### Option 2: [title]
...

### Option 3: [title]
...

## Decision Outcome

[From D-XX User Decisions — the chosen approach and why]

## Stakeholders

- **Decision-makers:** [names]
- **Consulted:** [names/roles]
- **Informed:** [names/roles]

## Consequences & Confirmation

### Expected Positive Outcomes
- [from decisions affects fields + research confirmations]

### Accepted Tradeoffs
- [from decisions + research cautions]

### Don't Hand-Roll Warnings
[From research — preserved as table]

| Problem | Don't Build | Use Instead | Why |
|---------|------------|-------------|-----|

### Common Pitfalls
[From research — preserved as table]

| Pitfall | What Goes Wrong | How to Avoid |
|---------|----------------|--------------|

### Confirmation Strategy
[How implementation correctness will be verified]

## Research Summary

### Decision Impact Analysis
[From RESEARCH.md — how research informed each decision]

### Codebase Findings
[From RESEARCH.md Existing Codebase Patterns — with file:line citations]

### Web Research Findings
[From RESEARCH.md sources — with URLs and confidence tiers]

### Gap Analysis
[From RESEARCH.md — preserved as table]

| Expected | Actual | Severity | Impact |
|----------|--------|----------|--------|

## Existing ADRs

[List of related existing ADRs with paths — from Phase 1 scan]

## Deferred Ideas

[From decisions file — captured but NOT in scope]

## Open Questions

[Merged from decisions file + research Remaining Unknowns + any gap-fill gaps]

## Template

The ADR must follow the MADR 4.0.0 template exactly. The template structure is:
- YAML frontmatter (status, date, decision-makers, consulted, informed)
- Title
- Context and Problem Statement
- Decision Drivers (optional, include by default)
- Considered Options
- Decision Outcome with Consequences and Confirmation (optional sections, include by default)
- Pros and Cons of the Options (optional, include by default)
- More Information (optional, include by default)

Optional sections marked with `<!-- This is an optional element. Feel free to remove. -->` should be INCLUDED by default unless the user explicitly says to skip them.
```

### Phase 4: Save and Return

1. Determine the kebab-case name from the decision topic.
2. Create the context directory if needed: `docs/context/decisions/`
3. Write the context file to `docs/context/decisions/<name>-context.md`
4. Return the context file path to the caller.

Tell the user: "Context file saved to `<path>`. Review and edit it if needed, then run `/architecture-docs:adr-generate <path>` to generate the ADR."

---

## Standalone Mode (no decisions file — backward-compatible)

When no decisions file is provided, fall back to interactive gathering.

### Phase S1: Understand the Decision

1. If no topic provided, ask what decision needs to be recorded.
2. Establish scope: new decision or superseding an existing ADR?
3. Scan `docs/decisions/` for existing ADRs.

**CHECKPOINT — Confirm Decision Scope:**
Present existing ADRs and initial understanding. Ask: "Does this match your understanding?"

### Phase S2: Clarifying Questions

Ask clarifying questions using AskUserQuestion. Focus on areas where the answer materially changes the ADR content.

**Question areas:**
1. **Problem Statement** — What is the specific problem or need?
2. **Decision Drivers** — What forces influence this decision?
3. **Considered Options** — What options exist? Push for at least 3.
4. **Decision Outcome** — Has a decision been made?
5. **Stakeholders** — Who are the decision-makers, consulted, and informed?
6. **Consequences & Confirmation** — Expected outcomes, tradeoffs, verification?
7. **Additional Context** — Related ADRs, team agreements, revisit timeline?

### Phase S3: Research

Dispatch two parallel Tasks:

**Task 1 — Code Research:** Invoke `/architecture-docs:code-research` focused on existing patterns and current state.

**Task 2 — Web Research:** Invoke `/architecture-docs:web-research` focused on best practices and known pitfalls.

**CHECKPOINT — Present Research Findings:**
Ask: "Does this align with what you know? Should I dig deeper?"

### Phase S4: Compile Context File

Assemble using the same template as Compiler Mode Phase 3, but without the D-XX numbering (decisions weren't formally captured).

### Phase S5: Save and Return

Same as Compiler Mode Phase 4.
