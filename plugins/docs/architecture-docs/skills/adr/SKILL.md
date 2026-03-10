---
name: adr
description: Architecture Decision Record (ADR) Generator
disable-model-invocation: true
argument-hint: "[decision topic]"
---

# Architecture Decision Record (ADR) Generator

Generate Architecture Decision Records following the MADR 4.0.0 template exactly. Walk through each section interactively, asking clarifying questions and surfacing gaps before writing each part.

## Input

The user provides a topic or decision to document (e.g., `/adr migrate from REST to GraphQL`). If no topic is provided, ask what architectural decision needs to be recorded.

## Output

Save the completed ADR to `docs/decisions/NNNN-kebab-case-title.md` where `NNNN` is auto-incremented by scanning existing files in that directory. Create the directory if it doesn't exist.

## MADR 4.0.0 Template

The output file MUST match this structure precisely, including HTML comments and frontmatter. Optional sections marked with `<!-- This is an optional element. Feel free to remove. -->` should be INCLUDED by default unless the user explicitly says to skip them.

```markdown
---
# These are optional metadata elements. Feel free to remove any of them.
status: "{proposed | rejected | accepted | deprecated | ... | superseded by ADR-NNNN}"
date: {YYYY-MM-DD when the decision was last updated}
decision-makers: {list everyone involved in the decision}
consulted: {list everyone whose opinions are sought (typically subject-matter experts); and with whom there is a two-way communication}
informed: {list everyone who is kept up-to-date on progress; and with whom there is a one-way communication}
---

# {short title, representative of solved problem and found solution}

## Context and Problem Statement

{Describe the context and problem statement, e.g., in free form using two to three sentences or in the form of an illustrative story. You may want to articulate the problem in form of a question and add links to collaboration boards or issue management systems.}

<!-- This is an optional element. Feel free to remove. -->
## Decision Drivers

* {decision driver 1, e.g., a force, facing concern, ...}
* {decision driver 2, e.g., a force, facing concern, ...}
* ... <!-- numbers of drivers can vary -->

## Considered Options

* {title of option 1}
* {title of option 2}
* {title of option 3}
* ... <!-- numbers of options can vary -->

## Decision Outcome

Chosen option: "{title of option 1}", because {justification. e.g., only option, which meets k.o. criterion decision driver | which resolves force {force} | ... | comes out best (see below)}.

<!-- This is an optional element. Feel free to remove. -->
### Consequences

#### Good

* Good, because {positive consequence, e.g., improvement of one or more desired qualities, ...}

#### Bad

* Bad, because {negative consequence, e.g., compromising one or more desired qualities, ...}
* ... <!-- numbers of consequences can vary -->

<!-- This is an optional element. Feel free to remove. -->
### Confirmation

{Describe how the implementation of/compliance with the ADR can/will be confirmed. Are the design that was decided for and its implementation in line with the decision made? E.g., a design/code review or a test with a library such as ArchUnit can help validate this. Not that although we classify this element as optional, it is included in many ADRs.}

<!-- This is an optional element. Feel free to remove. -->
## Pros and Cons of the Options

### {title of option 1}

<!-- This is an optional element. Feel free to remove. -->
{example | description | pointer to more information | ...}

#### Good

* {argument a}
* {argument b}

<!-- use "neutral" if the given argument weights neither for good nor bad -->
#### Neutral

* {argument c}

#### Bad

* {argument d}

### {title of other option}

{example | description | pointer to more information | ...}

#### Good

* {argument a}
* {argument b}

#### Neutral

* {argument c}

#### Bad

* {argument d}

<!-- This is an optional element. Feel free to remove. -->
## More Information

{You might want to provide additional evidence/confidence for the decision outcome here and/or document the team agreement on the decision and/or define when/how this decision the decision should be realized and if/when it should be re-visited. Links to other decisions and resources might appear here as well.}
```

## Source Integrity Rules

**Every factual claim in this document must be traceable to research performed in this session.**

1. **Cite your work.** When referencing code, patterns, conventions, or architectural details, cite the specific tool call that discovered it (file path + line number from Read, Grep result, Explore agent finding). If you cannot point to a tool call that surfaced the information, you have not done the research — do it now or mark it as an assumption.
2. **Never reference prior Claude sessions or Claude memory.** Do not use phrases like "from our previous conversation," "as we discussed before," "based on prior analysis," or similar. Do not source document content from auto-memory, MCP memory tools, or any cross-session context. Each document stands entirely on its own research performed in the current session.
3. **Assumptions are labeled, not hidden.** If you lack evidence for a claim and cannot research it, explicitly label it as an assumption in the document (e.g., in the Open Questions or Assumptions section).

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.** If you need to make a judgment call — what to explore, what to include, what to omit, how to name something — present your recommendation and wait for confirmation. The user drives; you assist.

Walk through each phase in order. Use `AskUserQuestion` with multiple-choice options wherever possible. Use sequential thinking between phases to identify gaps and ensure thoroughness.

### Phase 1: Title and Context

1. If no topic provided, ask what decision needs to be recorded.
2. Read codebase context (relevant files, recent commits, existing ADRs in `docs/decisions/`).
3. If this decision **supersedes** an existing ADR, note the old ADR's number. In Phase 6, update the old ADR's status frontmatter to `superseded by ADR-NNNN` and add a forward reference in its More Information section. ADRs are append-only — never edit the substance of an accepted ADR; create a new superseding ADR instead.

**CHECKPOINT — Share Codebase Context:**
After exploring, present what was found to the user:
- Existing ADRs and how they relate to this decision
- Relevant code patterns or conventions discovered
- Any context from recent commits

Ask: "Here's the codebase context I found. Does this align with what you know? Anything else I should look at before we draft the problem statement?"

Do NOT draft the problem statement until the user confirms the context is sufficient.

4. Ask for the problem statement in 2-3 sentences.
5. Analyze for ambiguities, implicit assumptions, and missing context. Ask follow-ups until clear.

### Phase 2: Metadata

Ask about status (default "proposed"), date (default today), decision-makers, consulted SMEs, and informed stakeholders. Combine into a single AskUserQuestion call where practical.

### Phase 3: Decision Drivers

Based on context from Phase 1, suggest 3-5 potential decision drivers. Present as a multi-select list and ask the user to select which apply and add any missing ones.

### Phase 4: Options and Evaluation

This is the most important phase. There MUST be at least 2 options; push for 3-5.

1. Ask what options the user has already considered.
2. Brainstorm additional options: "do nothing"/status quo, alternative paradigms (buy vs build), hybrid approaches, unconventional solutions.
3. If fewer than 3 options, push back explicitly.

**CHECKPOINT — Approve Option List:**
After compiling the full list of options, present the finalized option list to the user for explicit approval before starting pros/cons evaluation.

Ask: "Here are the options I have. Is this the complete list, or should we add/remove any before I evaluate pros and cons?"

Do NOT proceed to pros/cons evaluation until the user approves the option list.

4. For each option, suggest 2-4 pros and 1-3 cons. Ask the user to confirm, adjust, or add missing ones. Ensure each option has at least one Good and one Bad point. Cross-reference against decision drivers.

### Phase 5: Decision Outcome

1. Present a summary comparison of all options against decision drivers.
2. Ask which option was chosen and why.
3. Ask about consequences (positive outcomes, accepted tradeoffs, risks to monitor).
4. Ask how the team will confirm correct implementation (code review, automated test, performance benchmark, metric monitoring, etc.).
5. Ask for any additional context: related ADRs/issues/documents, team agreements, and revisit timeline (e.g., "re-evaluate next quarter" or "revisit when traffic doubles 10x").

### Phase 6: Generate and Save

1. Scan `docs/decisions/` for existing ADRs to determine the next number.
2. Generate a kebab-case filename from the title.

**CHECKPOINT — Confirm Filename and Number:**
Present the proposed ADR number and filename (e.g., `docs/decisions/0005-migrate-to-graphql.md`) to the user for confirmation before writing.

Ask: "I'll use ADR number `NNNN` with filename `NNNN-kebab-case-title.md`. Does that look right?"

Do NOT start writing until the user confirms.

3. Write the document incrementally, section by section. Use Write for the first sections, then Edit to append.
4. Re-read the complete ADR to verify it follows the MADR 4.0.0 template exactly.

**Important:** If this ADR supersedes an older one, update the old ADR's frontmatter: set `status: "superseded by ADR-NNNN"` and add a forward reference in its More Information section. Do not alter the old ADR's substance.

**CHECKPOINT — Review Draft Before Saving:**
Present the complete ADR draft to the user for review before saving to disk.

Ask: "Here's the complete ADR. Please review it — any changes needed before I save it?"

Make any requested edits. Only save after the user approves.

5. Confirm the file location with the user and suggest next steps.

### Phase 7: Pipeline — Continue to HLD

After saving the ADR, offer to continue the pipeline:

Ask: "This ADR is saved. Would you like to create a High Level Design (HLD) to plan the implementation of this decision? I'll reference this ADR automatically."

If the user accepts:
1. Note the ADR file path for back-referencing.
2. Invoke the HLD skill using the Skill tool with the ADR path as context (e.g., `skill: "architecture-docs:hld", args: "based on ADR at <adr-path>"`).

If the user declines, end the workflow. Mention that they can create an HLD later by running `/hld` and referencing this ADR path.
