---
name: core-loop-gather
description: "Gather context for the Core Loop phase (Phase 1) of a Game Design Bible. Interactive Q&A about moment-to-moment action, feedback, rewards, motivation, and session structure. Dispatches research."
disable-model-invocation: true
context: fork
argument-hint: "[--bible-dir path]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Core Loop Context Gathering

Gather all context needed to write the Core Loop phase (Phase 1) of a Game Design Bible. This skill asks clarifying questions about the fundamental gameplay loop, explores prior concept work, dispatches parallel web research, and compiles everything into a structured context file that the `core-loop-generate` skill consumes.

## Input

$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Directory**: `--bible-dir <path>` (default: `docs/game-design-bible/`)

## Source Integrity Rules

**Every factual claim in the context file must be traceable to research performed in this session.**

1. **Cite your work.** When referencing design pillars, concept documents, or genre conventions, cite the specific file path and section that informed the claim.
2. **Never reference prior Claude sessions or Claude memory.** Do not use phrases like "from our previous conversation," "as we discussed before," "based on prior analysis." Each context file stands on its own.
3. **Assumptions are labeled, not hidden.** If you lack evidence for a claim, label it explicitly in the Open Questions section.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Phase 1: Load Existing Context

1. Validate `<bible-dir>/INDEX.md` exists. If not, inform the user: "No Game Design Bible found at `<bible-dir>`. Create one first with `/game-design-bible:bible:create`." — then STOP.
2. Read `<bible-dir>/DESIGN-PILLARS.md` — extract all pillar names and their definitions. These constrain the entire core loop.
3. Read all files in `<bible-dir>/00-concept/` — extract genre, platform, audience, vision, and non-goals.

**CHECKPOINT — Confirm Foundation:**
Present what you found:
- Design pillars (name + one-line summary each)
- Genre, platform, and target audience from concept docs
- Any concept-level hints about gameplay (from vision or elevator pitch)

Ask: "Does this match your understanding? Anything I should know before we dig into the core loop?"

### Phase 2: Clarifying Questions

Ask clarifying questions using AskUserQuestion. Batch related questions where possible. Focus on areas where the answer materially shapes the core loop design.

**Question areas (present which are relevant FIRST, then ask):**

1. **Core Action** — What does the player DO moment-to-moment? What is the primary verb (e.g., shoot, build, explore, solve, negotiate)? If the game has multiple modes, what is the dominant one? Push for specificity — "fight" is too vague; "aim, dodge, and chain combos" is better.

2. **Feedback** — How does the game respond to the player's actions? What tells the player they did something well (or poorly)? Consider: visual feedback, audio cues, haptic feedback, screen effects, AI reactions, environmental changes. Ask for at least 2-3 concrete examples.

3. **Rewards** — What tangible or intangible rewards keep the player engaged? Consider: currency, loot, progression unlocks, story reveals, new abilities, cosmetic rewards, social recognition. Which rewards are immediate vs. delayed? Which are the "hook" that creates one-more-turn syndrome?

4. **Motivation** — What motivates the player to repeat the loop? Identify the primary driver: progression/mastery, curiosity/exploration, social connection, comfort/relaxation, competition, self-expression. How does the loop stay fresh over time — does it evolve, layer complexity, or change context?

5. **Session Structure** — What does a typical play session look like? How does the player start a session? What is the flow state — the "middle" of a session? How does a session end — natural stopping points or "just one more"? Estimated session length (5 min mobile bursts vs. 2-hour deep sessions)?

For each answer, probe for specifics. If the user gives a vague answer, ask a follow-up that grounds it in a concrete example or scenario.

### Phase 3: Research

Dispatch two parallel Tasks in a single message:

**Task 1 — Genre Core Loop Research:**
```
Search the web for core loop design patterns in the [genre] genre.
Focus on: what makes the best games in this genre compelling moment-to-moment, common loop structures, known pitfalls and anti-patterns, how successful games in this genre handle feedback and rewards.
Use WebSearch and WebFetch. Return structured findings with URLs.
```

**Task 2 — Session Structure Research:**
```
Search the web for session structure and pacing best practices for [genre] games on [platform].
Focus on: optimal session length research, how games create natural stopping points vs. engagement hooks, pacing curves, how mobile vs. PC vs. console affects session design.
Use WebSearch and WebFetch. Return structured findings with URLs.
```

After both return, review findings for relevance. Discard noise; keep only findings that inform the core loop design.

**CHECKPOINT — Present Research Findings:**
Present a summary of both research tasks.

Ask: "Here's what I found from researching core loops and session design in this genre. Does this align with what you know? Should I dig deeper into any area?"

### Phase 4: Compile Context File

Assemble all gathered information into a structured context file:

```markdown
# Core Loop Context: [Game Name]

**Gathered:** [today's date]
**Bible Directory:** [bible-dir]

## Core Action

[What the player does moment-to-moment — the primary verb(s) and how they manifest]

## Feedback

[How the game responds to player actions — visual, audio, haptic, systemic examples]

## Rewards

[What keeps the player engaged — immediate and delayed, tangible and intangible]

## Motivation

[Why the player repeats the loop — primary driver and how freshness is maintained]

## Session Structure

[How a session starts, flows, and ends — pacing, length, stopping points]

## Pillar Context

[All design pillars from DESIGN-PILLARS.md with their definitions, and initial notes on how the core loop might serve each one]

## Concept Context

[Genre, platform, audience, vision, non-goals — extracted from 00-concept/]

## Web Research: Core Loop Patterns

[Structured findings from genre core loop research, with URLs]

## Web Research: Session Structure

[Structured findings from session structure research, with URLs]

## Open Questions

- [Anything unresolved, marked as assumptions, or needing further exploration]

## Template

The core loop phase must produce two documents:
- **core-loop.md** — Full core loop definition with pillar alignment, loop diagram, and design rationale
- **prototype-spec.md** — Minimum viable prototype specification with pillar-tied success criteria
```

### Phase 5: Save and Return

1. Create the context directory if needed: `<bible-dir>/context/`
2. Write the context file to `<bible-dir>/context/core-loop-context.md`
3. Return the context file path to the caller.

Tell the user: "Context file saved to `<path>`. Review and edit it if needed, then run `/game-design-bible:core-loop-generate <path>` to generate the core loop documents."
