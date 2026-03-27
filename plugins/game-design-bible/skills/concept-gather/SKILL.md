---
name: concept-gather
description: "Gather context for the Concept phase (Phase 0) of a Game Design Bible. Interactive Q&A about core fantasy, genre, platform, design pillars, non-goals, and MDA analysis. Dispatches code + web research."
disable-model-invocation: true
context: fork
argument-hint: "[game concept] [--scope indie|aa|aaa] [--output-dir path]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Concept Phase — Context Gathering

Gather all context needed to write the Concept phase (Phase 0) of a Game Design Bible. This skill runs an interactive Q&A session, dispatches research, and compiles a structured context file that the `concept-generate` skill consumes.

## Input

$ARGUMENTS — a game concept description, and optionally:
- `--scope <indie|aa|aaa>` — project scope tier (defaults to `indie`)
- `--output-dir <path>` — where to write outputs (defaults to `docs/game-design-bible/`)

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Game Concept**: All non-flag text describing the game idea
- **Scope**: `--scope <value>` or default to `indie`
- **Output Dir**: `--output-dir <path>` or default to `docs/game-design-bible/`

## Pre-flight Check

Before starting, check if `<output-dir>/INDEX.md` already exists using Glob. If it does:

1. Warn the user: "An existing Game Design Bible was found at `<output-dir>/INDEX.md`. Running concept-gather will overwrite the Phase 0 context."
2. Suggest: "If you want to continue an existing bible, use `bible-continue` instead."
3. Ask the user to confirm they want to proceed or abort.

If no INDEX.md exists, proceed.

## Source Integrity Rules

**Every factual claim in the context file must be traceable to research performed in this session.**

1. **Cite your work.** Reference specific URLs from web research or file paths from code research.
2. **Never reference prior Claude sessions or Claude memory.**
3. **Assumptions are labeled, not hidden.** Unresearched claims go in Open Questions.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Phase 1: Core Fantasy

Ask the user about the **Core Fantasy** — the emotional experience the player should feel, NOT the mechanics.

Use AskUserQuestion to explore:
- "What emotion or feeling should define the player's experience?"
- "When a player finishes a session, what should they feel?"
- "Is there a real-world or fictional experience this should evoke?"

**Guide the user toward emotional language** (e.g., "the thrill of outsmarting a superior force" rather than "tactical combat"). If they answer with mechanics, gently redirect: "That sounds like a mechanic — what feeling does that mechanic create?"

### Phase 2: Genre & Platform

Ask the user about Genre and Platform:

- **Genre**: Primary genre and any genre blends (e.g., "roguelike deckbuilder", "action RPG with farming sim elements")
- **Platform**: Target platforms (PC, console, mobile, VR, web)
- **Input method**: Controller, keyboard+mouse, touch, motion
- **Session length**: Expected play session duration
- **Target audience**: Who is this for? (age, gamer profile, comparable game audiences)

### Phase 3: Design Pillars

Draft **3–5 design pillars** based on the Core Fantasy, Genre, and Platform answers. Each pillar must:
- Be 2–5 words, memorable and specific to this game
- Include a **"What This Rules Out"** list with 3+ concrete items each
- Be in tension with plausible alternatives (not generic truths like "fun gameplay")

Present the draft pillars to the user for approval:

```
## Proposed Design Pillars

### 1. [Pillar Name]
> [One-sentence explanation]

**What This Rules Out:**
- [Concrete thing this pillar forbids]
- [Another concrete exclusion]
- [A third exclusion]

### 2. [Pillar Name]
...
```

Ask: "Do these pillars capture the soul of your game? I can revise names, add/remove pillars, or adjust the 'What This Rules Out' lists."

**Maximum 2 revision rounds.** After 2 rounds, finalize with whatever the user has approved. If the user is satisfied earlier, move on immediately.

### Phase 4: Non-Goals

Ask the user about **Non-Goals** — what the game explicitly is NOT:

- "What features might players expect from this genre that you're intentionally leaving out?"
- "What scope boundaries are you setting? (e.g., no multiplayer, no microtransactions, no procedural generation)"
- "Are there any design trends you want to actively avoid?"

Compile into a concrete list. Each non-goal should be specific enough to be actionable (not "don't make it bad" but "no crafting system" or "no competitive PvP").

### Phase 5: MDA Analysis

Perform an MDA (Mechanics–Dynamics–Aesthetics) analysis:

1. **Identify 2–3 target Aesthetics** from the MDA framework (Sensation, Fantasy, Narrative, Challenge, Fellowship, Discovery, Expression, Submission) that align with the Core Fantasy.

2. **Reason backward to Dynamics**: For each target aesthetic, identify what player behaviors and emergent patterns are needed to produce that aesthetic.

3. **Reason backward to Mechanics**: For each dynamic, identify what game rules and systems are needed to produce that dynamic.

Present the MDA chain to the user:

```
## MDA Analysis

### Target Aesthetics
1. [Aesthetic] — [why this aligns with the core fantasy]

### Required Dynamics
- [Dynamic] → supports [Aesthetic]

### Required Mechanics
- [Mechanic] → produces [Dynamic]
```

Ask: "Does this MDA breakdown feel right? Are there aesthetics I'm missing or mechanics that feel off?"

### Phase 6: Parallel Research

Dispatch two parallel Tasks in a single message:

**Task 1 — Genre & Comparable Games Research:**
```
Search the web for:
- Top games in the [genre] genre released in the last 5 years
- Common design patterns and player expectations for [genre]
- How comparable titles handle the design pillars: [list pillar names]
- Critical reception patterns — what do players praise/criticize in this genre?
Return structured findings with URLs.
```

**Task 2 — MDA & Design Pattern Research:**
```
Search the web for:
- Design patterns that produce the target aesthetics: [list aesthetics]
- Games known for excelling at [aesthetics] and how they achieve it
- Common pitfalls when designing for [aesthetics]
- Academic or GDC resources on [aesthetics] in game design
Return structured findings with URLs.
```

After both return, review and filter findings for relevance.

### Phase 7: Compile Context File

Assemble all gathered information into the context file:

```markdown
# Concept Context: [Game Concept Title]

**Gathered:** [today's date]
**Game Concept:** [user's original concept description]
**Scope:** [indie|aa|aaa]
**Output Dir:** [output-dir]

## Core Fantasy

[The emotional experience, in the user's own words plus any refinements]

## Genre & Platform

- **Genre:** [primary genre + blends]
- **Platform:** [target platforms]
- **Input Method:** [controller, kb+m, touch, etc.]
- **Session Length:** [expected duration]
- **Target Audience:** [audience description]

## Design Pillars

### 1. [Pillar Name]
> [One-sentence explanation]

**What This Rules Out:**
- [Item 1]
- [Item 2]
- [Item 3+]

### 2. [Pillar Name]
...

## Non-Goals

- [Specific non-goal 1]
- [Specific non-goal 2]
- ...

## MDA Analysis

### Target Aesthetics
1. [Aesthetic] — [alignment rationale]

### Required Dynamics
- [Dynamic] → supports [Aesthetic]

### Required Mechanics
- [Mechanic] → produces [Dynamic]

## Web Research Findings

### Genre & Comparable Games
[Structured findings with URLs]

### MDA & Design Patterns
[Structured findings with URLs]

## Open Questions

- [Anything unresolved or flagged as assumption]

## Template

The Concept phase outputs the following files:
- `DESIGN-PILLARS.md` — top-level quick reference
- `00-concept/vision.md` — elevator pitch, core fantasy, genre, platform, audience
- `00-concept/design-pillars.md` — full pillar reasoning with "What This Rules Out"
- `00-concept/mda-analysis.md` — MDA chain with validation notes
- `00-concept/non-goals.md` — explicit scope exclusions
- `INDEX.md` — master table of contents
```

Write the context file to `<output-dir>/context/concept-context.md`. Create the directory if needed.

## Output

Report: "Context file saved to `<path>`. Review and edit it if needed, then run `/game-design-bible:concept-generate <path>` to generate the Phase 0 documents."

Return the context file path.
