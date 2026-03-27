---
name: narrative-gather
description: "Gather context for the Narrative phase (Phase 3) of a Game Design Bible. Assesses narrative weight, asks story/character/world questions appropriate to weight. Dispatches research."
disable-model-invocation: true
context: fork
argument-hint: "[--bible-dir path]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Narrative Phase — Context Gathering

Gather all context needed to write the Narrative phase (Phase 3) of a Game Design Bible. This skill assesses how much narrative the game needs based on genre and pillars, runs a weight-appropriate interactive Q&A session, dispatches research, and compiles a structured context file that the `narrative-generate` skill consumes.

## Input

$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Directory**: `--bible-dir <path>` (default: `docs/game-design-bible/`)

## Source Integrity Rules

**Every factual claim in the context file must be traceable to research performed in this session.**

1. **Cite your work.** When referencing design pillars, concept documents, systems documents, or genre conventions, cite the specific file path and section that informed the claim.
2. **Never reference prior Claude sessions or Claude memory.** Do not use phrases like "from our previous conversation," "as we discussed before," "based on prior analysis." Each context file stands on its own.
3. **Assumptions are labeled, not hidden.** If you lack evidence for a claim, label it explicitly in the Open Questions section.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Phase 1: Load Existing Context

1. Validate `<bible-dir>/INDEX.md` exists. If not, inform the user: "No Game Design Bible found at `<bible-dir>`. Create one first with `/game-design-bible:concept-gather`." — then STOP.
2. Read `<bible-dir>/DESIGN-PILLARS.md` — extract all pillar names and their definitions.
3. Read `<bible-dir>/01-core-loop/core-loop.md` — extract the core loop structure and primary verbs.
4. Read all files in `<bible-dir>/02-systems/` using Glob — extract system designs, progression mechanics, and any narrative-adjacent systems (e.g., faction reputation, dialogue trees, quest systems).

**CHECKPOINT — Confirm Foundation:**
Present what you found:
- Design pillars (name + one-line summary each)
- Genre and core fantasy from concept docs
- Core loop structure and primary verbs
- Systems that touch narrative (if any)

Ask: "Does this match your understanding? Anything I should know before we assess narrative weight?"

### Phase 2: Assess Narrative Weight

Based on genre, design pillars, and systems context, assess the narrative weight of the game:

- **HEAVY** — Story is a primary driver. The game would fundamentally change without its narrative. Examples: RPGs, adventure games, visual novels, narrative-driven action games.
- **MEDIUM** — Story provides framing and motivation but isn't the core draw. Players engage with narrative but gameplay is the primary hook. Examples: action games with campaigns, strategy games with lore, platformers with story arcs.
- **LIGHT** — Minimal narrative. Story is contextual dressing at most. Examples: puzzle games, sports games, pure sandbox builders, arcade games.

Present the assessment with rationale:

```
## Narrative Weight Assessment

**Recommended Weight:** [HEAVY / MEDIUM / LIGHT]

**Rationale:**
- Genre ([genre]) typically demands [weight] narrative because [reason]
- Design pillars suggest [weight] because [specific pillar references]
- Systems [do/don't] include narrative-adjacent mechanics like [examples]

Does this feel right? I can adjust the weight up or down if your vision differs from genre norms.
```

Wait for user confirmation before proceeding. The user may override the assessment.

### Phase 3: Weight-Appropriate Questions

Ask clarifying questions using AskUserQuestion. The depth and scope of questions depends on the confirmed narrative weight.

#### For HEAVY Narrative Weight

1. **Theme** — What is the central theme or message? What question does the game ask the player? Is there a moral dilemma at the heart of the experience?

2. **Protagonist** — Who is the player character? What is their arc (how do they change)? What is their relationship to the world? Is the protagonist a blank slate, defined character, or customizable?

3. **Main Conflict** — What is the central conflict driving the story? Who or what is the antagonist? What are the stakes? How does the conflict escalate?

4. **Story Structure** — Is the story linear, branching, or emergent? How many acts or chapters? Are there multiple endings? How does player choice affect the narrative?

5. **Character Cast** — Who are the key supporting characters? What role does each serve (mentor, rival, love interest, comic relief)? How do characters relate to gameplay systems (companions, quest givers, merchants)?

6. **World Rules** — What are the rules of this world that differ from reality? What is the history that shapes the present conflict? What factions or power structures exist?

7. **Dialogue Approach** — How does the player interact with dialogue? (Choices, branching trees, real-time, text-only, fully voiced) What tone should dialogue strike? How much dialogue is planned?

#### For MEDIUM Narrative Weight

1. **Framing Narrative** — What story frames the gameplay? What motivates the player to engage with the core loop? Is there a campaign structure or mission-based narrative?

2. **Key Characters** — Who are the 2-5 most important characters? What role does each play in motivating gameplay? Are characters primarily functional (quest givers, shopkeepers) or developed?

3. **World Flavor** — What gives this world its identity? What lore elements make the setting memorable? How much world-building is needed vs. implied?

4. **Dialogue Scope** — How much dialogue exists? Is it skippable? Text-only or voiced? How does dialogue connect to gameplay systems?

#### For LIGHT Narrative Weight

1. **Minimal Framing** — Is there any story at all? What is the 1-2 sentence premise? Why is the player doing what they're doing?

2. **Tone** — What is the emotional tone? (Whimsical, serious, absurd, mysterious) How is tone communicated without heavy narrative?

3. **Environmental Storytelling** — Does the world tell stories through its design? Are there discoverable lore fragments? Does the environment evolve to suggest narrative?

For each answer, probe for specifics. If the user gives a vague answer, ask a follow-up that grounds it in concrete examples.

### Phase 4: Parallel Research

Dispatch two parallel Tasks in a single message:

**Task 1 — Narrative Pattern Research:**
```
Search the web for narrative design patterns in the [genre] genre with [weight] narrative weight.
Focus on: how successful [genre] games handle storytelling, narrative structures that work for [weight] narrative games, player engagement with story in this genre, common narrative pitfalls.
Use WebSearch and WebFetch. Return structured findings with URLs.
```

**Task 2 — Dialogue System Research:**
```
Search the web for dialogue system design in [genre] games.
Focus on: dialogue UI patterns, branching vs. linear approaches, how dialogue integrates with gameplay, voice acting scope considerations for [scope] projects, localization considerations.
Use WebSearch and WebFetch. Return structured findings with URLs.
```

After both return, review findings for relevance. Discard noise; keep only findings that inform narrative design.

**CHECKPOINT — Present Research Findings:**
Present a summary of both research tasks.

Ask: "Here's what I found from researching narrative patterns and dialogue systems. Does this align with your vision? Should I dig deeper into any area?"

### Phase 5: Compile Context File

Assemble all gathered information into a structured context file:

```markdown
# Narrative Context: [Game Name]

**Gathered:** [today's date]
**Bible Directory:** [bible-dir]
**Narrative Weight:** [HEAVY / MEDIUM / LIGHT]

## Theme
[Central theme, message, or moral question — depth varies by weight]

## Characters
[Character descriptions — full cast for HEAVY, key characters for MEDIUM, minimal/none for LIGHT]

## World
[World rules, lore, factions — depth varies by weight]

## Story Structure
[Linear/branching/emergent, acts, endings — depth varies by weight]

## Dialogue Approach
[Dialogue system, tone, scope, voice acting considerations]

## Systems Context
[Narrative-adjacent systems extracted from 02-systems/ — quest systems, faction reputation, dialogue mechanics, etc.]

## Pillar Context
[All design pillars from DESIGN-PILLARS.md with their definitions, and notes on how narrative serves each one]

## Scope
[Project scope tier: indie/aa/aaa — affects dialogue budget, voice acting, branching complexity]

## Web Research: Narrative Patterns
[Structured findings from narrative pattern research, with URLs]

## Web Research: Dialogue Systems
[Structured findings from dialogue system research, with URLs]

## Open Questions
- [Anything unresolved, marked as assumptions, or needing further exploration]

## Template

The narrative phase produces the following files (adjusted by weight):

**HEAVY:**
- `03-narrative/story-overview.md` — theme, conflict, structure, acts, endings
- `03-narrative/characters.md` — full character bible with arcs, relationships, gameplay roles
- `03-narrative/world-lore.md` — world rules, history, factions, power structures
- `03-narrative/dialogue-systems.md` — dialogue mechanics, tone guide, branching logic, voice scope

**MEDIUM:**
- `03-narrative/story-overview.md` — framing narrative, campaign structure, motivation
- `03-narrative/characters.md` — key characters with gameplay roles (lighter detail)
- `03-narrative/world-lore.md` — world flavor, key lore elements (lighter detail)

**LIGHT:**
- `03-narrative/story-overview.md` — minimal framing, tone, environmental storytelling
```

### Phase 6: Save and Return

1. Create the context directory if needed: `<bible-dir>/context/`
2. Write the context file to `<bible-dir>/context/narrative-context.md`
3. Return the context file path to the caller.

Tell the user: "Context file saved to `<path>`. Review and edit it if needed, then run `/game-design-bible:narrative-generate <path>` to generate the Phase 3 documents."
