---
name: adr-gather
description: "Gather context and requirements for an Architecture Decision Record. Interactive Q&A session that explores the codebase, researches online, and compiles a structured context file for the ADR generator. Use when starting a new architectural decision."
disable-model-invocation: true
context: fork
argument-hint: "[decision topic]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# ADR Context Gathering

Gather all context needed to write an Architecture Decision Record. This skill asks clarifying questions, explores the codebase, researches online, and compiles everything into a structured context file that the `adr-generate` skill consumes.

## Input

$ARGUMENTS — the decision topic (e.g., "migrate from REST to GraphQL").

If no topic is provided, ask the user what architectural decision needs to be recorded.

## Source Integrity Rules

**Every factual claim in the context file must be traceable to research performed in this session.**

1. **Cite your work.** When referencing code, patterns, conventions, or architectural details, cite the specific tool call that discovered it (file path + line number from Read, Grep result, Explore agent finding).
2. **Never reference prior Claude sessions or Claude memory.** Do not use phrases like "from our previous conversation," "as we discussed before," "based on prior analysis." Each context file stands on its own.
3. **Assumptions are labeled, not hidden.** If you lack evidence for a claim, label it explicitly in the Open Questions section.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Phase 1: Understand the Decision

1. If no topic provided, ask what decision needs to be recorded.
2. Establish the decision's scope: is this a new decision, or does it supersede an existing ADR?
3. Scan `docs/decisions/` for existing ADRs to understand the landscape and detect if this supersedes one.

**CHECKPOINT — Confirm Decision Scope:**
Present what you found:
- Existing ADRs and how they relate to this decision
- Whether this supersedes an existing ADR
- Initial understanding of the decision

Ask: "Does this match your understanding? Anything else I should know about the context before I start asking detailed questions?"

### Phase 2: Clarifying Questions

Ask clarifying questions using AskUserQuestion. Batch related questions together. Focus on areas where the answer materially changes the ADR content.

**Question areas (present which are relevant FIRST, then ask):**

1. **Problem Statement** — What is the specific problem or need driving this decision? (2-3 sentences)
2. **Decision Drivers** — What forces or concerns are influencing this decision? Suggest 3-5 based on context; ask user to confirm, add, or remove.
3. **Considered Options** — What options has the user already considered? Brainstorm additional options: "do nothing"/status quo, buy vs build, hybrid approaches, unconventional solutions. Push for at least 3 options.
4. **Decision Outcome** — Has a decision already been made? If so, which option and why? If not, note this as TBD.
5. **Stakeholders** — Who are the decision-makers, consulted SMEs, and informed stakeholders?
6. **Consequences & Confirmation** — What are the expected positive outcomes, accepted tradeoffs, and risks? How will correct implementation be confirmed?
7. **Additional Context** — Related ADRs/issues/documents, team agreements, revisit timeline.

For each option the user lists, ask for 2-4 pros and 1-3 cons. Ensure each option has at least one Good and one Bad point.

### Phase 3: Research

Dispatch two parallel Tasks in a single message:

**Task 1 — Code Research:**
```
Use the Skill tool to invoke /architecture-docs:code-research with a question derived from the decision topic.
Focus on: existing patterns related to the decision, current implementation state, dependencies, conventions.
```

**Task 2 — Web Research:**
```
Use the Skill tool to invoke /architecture-docs:web-research with a question derived from the decision topic.
Focus on: best practices, common approaches, known pitfalls, relevant standards or RFCs.
```

After both return, review findings for relevance. Discard noise; keep only findings that inform the ADR.

**CHECKPOINT — Present Research Findings:**
Present a summary of both code and web research findings.

Ask: "Here's what I found from researching the codebase and the web. Does this align with what you know? Should I dig deeper into any area?"

### Phase 4: Compile Context File

Assemble all gathered information into a structured context file:

```markdown
# ADR Context: [Decision Topic]

**Gathered:** [today's date]
**Topic:** [decision topic]

## Problem Statement

[User's problem statement from Phase 2]

## Decision Drivers

- [driver 1]
- [driver 2]
- ...

## Considered Options

### Option 1: [title]
[Description if provided]

#### Good
- [pro 1]
- [pro 2]

#### Bad
- [con 1]

### Option 2: [title]
...

### Option 3: [title]
...

## Decision Outcome

[If already decided: which option and why]
[If TBD: "Decision pending — to be determined during ADR generation"]

## Stakeholders

- **Decision-makers:** [names]
- **Consulted:** [names/roles]
- **Informed:** [names/roles]

## Consequences & Confirmation

### Expected Positive Outcomes
- [outcome 1]

### Accepted Tradeoffs
- [tradeoff 1]

### Confirmation Strategy
[How implementation correctness will be verified]

## Existing ADRs

[List of related existing ADRs with paths and brief descriptions]
[If superseding: "Supersedes: ADR-NNNN at [path]"]

## Codebase Findings

[Structured findings from code-research, with file:line citations]

## Web Research Findings

[Structured findings from web-research, with URLs]

## Additional Context

[Related issues, documents, team agreements, revisit timeline]

## Open Questions

- [Anything unresolved or marked as assumptions]

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

### Phase 5: Save and Return

1. Determine the kebab-case name from the decision topic.
2. Create the context directory if needed: `docs/context/decisions/`
3. Write the context file to `docs/context/decisions/<name>-context.md`
4. Return the context file path to the caller.

Tell the user: "Context file saved to `<path>`. Review and edit it if needed, then run `/architecture-docs:adr-generate <path>` to generate the ADR."
