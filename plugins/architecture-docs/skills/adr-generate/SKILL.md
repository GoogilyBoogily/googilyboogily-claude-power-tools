---
name: adr-generate
description: "Generate an Architecture Decision Record from a gathered context file. Runs with clean context — reads the context file and produces a complete MADR 4.0.0 document. Non-interactive."
context: fork
argument-hint: "[context-file]"
allowed-tools: Read, Write, Edit, Glob, Grep
model: opus
---

# ADR Generator

Generate a complete Architecture Decision Record from a previously gathered context file. This skill runs with clean context and is non-interactive — all questions were answered during the gather phase.

## Input

$ARGUMENTS — path to the context file (e.g., `docs/context/decisions/migrate-to-graphql-context.md`).

## Source Integrity Rules

**Every factual claim in this document must be traceable to the context file.**

1. **Ground every claim.** Every factual statement must trace back to a specific entry in the context file (user answers, codebase findings with file:line, or web research with URLs).
2. **Flag ungrounded claims.** If you need to state something not in the context file, mark it explicitly as `[ASSUMPTION]` in the document.
3. **Never invent details.** If the context file doesn't cover something, put it in Open Questions or More Information — don't fabricate.

## MADR 4.0.0 Template

The output file MUST match this structure precisely, including HTML comments and frontmatter. Optional sections should be INCLUDED by default unless the context file explicitly says to skip them.

```markdown
---
status: "{proposed | rejected | accepted | deprecated | ... | superseded by ADR-NNNN}"
date: {YYYY-MM-DD when the decision was last updated}
decision-makers: {list everyone involved in the decision}
consulted: {list everyone whose opinions are sought; two-way communication}
informed: {list everyone kept up-to-date; one-way communication}
---

# {short title, representative of solved problem and found solution}

## Context and Problem Statement

{Describe the context and problem statement in 2-3 sentences.}

<!-- This is an optional element. Feel free to remove. -->
## Decision Drivers

* {decision driver 1}
* {decision driver 2}

## Considered Options

* {title of option 1}
* {title of option 2}
* {title of option 3}

## Decision Outcome

Chosen option: "{title of option}", because {justification}.

<!-- This is an optional element. Feel free to remove. -->
### Consequences

#### Good

* Good, because {positive consequence}

#### Bad

* Bad, because {negative consequence}

<!-- This is an optional element. Feel free to remove. -->
### Confirmation

{How implementation correctness will be verified.}

<!-- This is an optional element. Feel free to remove. -->
## Pros and Cons of the Options

### {title of option 1}

{description}

#### Good

* {argument}

#### Neutral

* {argument}

#### Bad

* {argument}

### {title of option 2}
...

<!-- This is an optional element. Feel free to remove. -->
## More Information

{Additional context, links, team agreements, revisit timeline.}
```

## Process

### Step 1: Read Context File

Read the context file at the path provided in `$ARGUMENTS`. Extract:
- Problem statement
- Decision drivers
- Considered options with pros/cons
- Decision outcome (if decided)
- Stakeholders
- Consequences and confirmation strategy
- Existing ADRs (for numbering and superseding)
- Codebase and web research findings (for grounding claims)
- Open questions
- Any template instructions

### Step 2: Determine ADR Number and Filename

1. Scan `docs/decisions/` for existing ADRs to determine the next number.
2. Generate a kebab-case filename from the title: `docs/decisions/NNNN-kebab-case-title.md`
3. Create the directory if it doesn't exist.

### Step 3: Generate the ADR

Write the complete ADR document, section by section:

1. **Frontmatter** — Use stakeholders from context file. Default status to "proposed" unless specified.
2. **Title** — Short, representative of the problem and solution.
3. **Context and Problem Statement** — From the context file's problem statement. Ground in codebase findings where applicable.
4. **Decision Drivers** — From the context file. Cross-reference with codebase/web findings for additional evidence.
5. **Considered Options** — List all options from the context file.
6. **Decision Outcome** — From the context file. If TBD, use status "proposed" and note the decision is pending.
7. **Consequences** — From the context file's consequences section.
8. **Confirmation** — From the context file's confirmation strategy.
9. **Pros and Cons of the Options** — Full evaluation from the context file. Each option must have at least one Good and one Bad point.
10. **More Information** — Additional context, related ADRs, revisit timeline, web research references.

### Step 4: Handle Superseding

If the context file indicates this ADR supersedes an existing one:
1. Read the old ADR.
2. Update its frontmatter: `status: "superseded by ADR-NNNN"`
3. Add a forward reference in its More Information section.
4. Reference the old ADR in the new ADR's More Information section.

### Step 5: Save

1. Write the complete ADR to `docs/decisions/NNNN-kebab-case-title.md` using the Write tool in a single call with the full document.
2. Re-read the saved file to verify it follows MADR 4.0.0 exactly.
3. Report the saved file path.

## Output

Report: "ADR saved to `<path>`. Run `/architecture-docs:audit-adr <path> --context <context-file-path>` to audit it."
