---
name: systems-gather
description: "Gather context for the Systems phase (Phase 2) of a Game Design Bible. Interactive selection of which game systems to design, with scope/feel/boundary questions per system. Dispatches research."
disable-model-invocation: true
context: fork
argument-hint: "[--bible-dir path]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Systems Phase — Context Gathering

Gather all context needed to design game systems (Phase 2 of the Game Design Bible). This skill interactively selects which systems to design, asks targeted questions per system, dispatches parallel web research, and compiles a structured context file for the `systems-generate` skill.

## Input

$ARGUMENTS — optionally `--bible-dir <path>` to specify the bible location.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Directory**: `--bible-dir <path>` (default: `docs/game-design-bible/`)

## Source Integrity Rules

**Every factual claim in the context file must be traceable to research performed in this session.**

1. **Cite your work.** Reference specific file paths from Read or Grep results.
2. **Never reference prior Claude sessions or Claude memory.**
3. **Assumptions are labeled, not hidden.** Unresearched claims go in Open Questions.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Phase 1: Load Foundation Context

1. Use Glob to check for `<bible-dir>/INDEX.md`. If it does not exist:
   - Inform the user: "No Game Design Bible found at `<bible-dir>`. Create one first with `/game-design-bible:bible:create`."
   - STOP

2. Read `<bible-dir>/INDEX.md` and check phase statuses:
   - Phase 0 (Concept) must be `✅ Complete`
   - Phase 1 (Core Loop) must be `✅ Complete`
   - If either is incomplete, warn: "Phase 0 and Phase 1 must be complete before designing systems. Current status: [status]. Run `/game-design-bible:bible:continue` to complete them first."
   - STOP unless the user explicitly overrides

3. Read these foundation files:
   - `<bible-dir>/DESIGN-PILLARS.md` — the supreme court for all design decisions
   - `<bible-dir>/01-core-loop/core-loop.md` — the fundamental gameplay loop

4. Extract and retain:
   - All pillar names and their "What This Rules Out" lists
   - The core loop's Action → Feedback → Reward → Motivation cycle
   - Genre, scope, and platform from `<bible-dir>/00-concept/vision.md`

### Phase 2: System Selection

Present the system checklist to the user using AskUserQuestion:

> **Which game systems does your game need? (Select all that apply)**
>
> - [ ] Combat / Action Mechanics
> - [ ] Economy / Currency / Trading
> - [ ] Progression / Leveling / Unlocks
> - [ ] AI / NPC Behavior
> - [ ] Level / Map Structure
> - [ ] Multiplayer / Social
> - [ ] Crafting / Building
> - [ ] Stealth / Infiltration
> - [ ] Vehicles / Mounts
> - [ ] Weather / Time / Seasons
> - [ ] Other: ___
>
> List the systems you want (comma-separated names or numbers), or describe custom systems under "Other".

Wait for response. Parse the selected systems into a list.

If the user selects zero systems, explain that at least one system is needed for Phase 2 and re-present the checklist.

### Phase 3: Per-System Questions

For EACH selected system, ask 2-3 targeted questions about scope, feel, and boundaries. Batch all questions for one system together in a single AskUserQuestion call.

**Question templates per system type:**

**Combat / Action Mechanics:**
1. **Scale**: Real-time or turn-based? How many combatants on screen at once? (1v1, party-based, horde)
2. **Feel**: Should combat feel weighty and deliberate, fast and twitchy, or strategic and positional?
3. **Boundaries**: What combat features are explicitly OUT? (e.g., no friendly fire, no permadeath, no gear-based power)

**Economy / Currency:**
1. **Scale**: Single currency or multiple? Player-to-player trading?
2. **Feel**: Should earning feel like a grind, a puzzle, or a natural byproduct of gameplay?
3. **Boundaries**: Any monetization constraints? (e.g., no pay-to-win, no premium currency)

**Progression / Leveling:**
1. **Scale**: How many hours from start to "endgame"? Soft cap or hard cap?
2. **Feel**: Should progression feel like mastery, accumulation, or unlocking new playstyles?
3. **Boundaries**: Can players over-level content? Is there a reset/prestige mechanic?

**AI / NPC Behavior:**
1. **Scale**: How many distinct AI archetypes? Do NPCs have schedules/routines?
2. **Feel**: Should AI feel predictable-but-fair, surprising, or lifelike?
3. **Boundaries**: How "smart" should enemies be? Any forbidden AI behaviors?

**Level / Map Structure:**
1. **Scale**: Hand-crafted, procedural, or hybrid? How many distinct environments?
2. **Feel**: Linear corridors, open world, or interconnected hubs?
3. **Boundaries**: What level design patterns are off-limits? (e.g., no invisible walls, no backtracking)

**Multiplayer / Social:**
1. **Scale**: How many concurrent players? Sync or async? Persistent or session-based?
2. **Feel**: Cooperative, competitive, or both? How central is social interaction?
3. **Boundaries**: What social features are out? (e.g., no voice chat, no PvP griefing)

**Crafting / Building:**
1. **Scale**: How many recipes/blueprints? Is crafting core or supplementary?
2. **Feel**: Discovery-based, recipe-based, or freeform?
3. **Boundaries**: Can players craft best-in-slot items? Any placement restrictions?

**Stealth / Infiltration:**
1. **Scale**: Full stealth game or stealth-as-option? Detection states?
2. **Feel**: Tense and punishing, forgiving and experimental, or social/disguise-based?
3. **Boundaries**: Can every encounter be stealthed? Forced combat sections?

**Vehicles / Mounts:**
1. **Scale**: How many vehicle types? Customizable? Combat-capable?
2. **Feel**: Arcade, simulation, or somewhere between?
3. **Boundaries**: Are vehicles mandatory or optional? Any off-limits areas?

**Weather / Time / Seasons:**
1. **Scale**: Cosmetic or gameplay-affecting? Day/night cycle duration?
2. **Feel**: Atmospheric backdrop or strategic consideration?
3. **Boundaries**: Can weather/time block progress? Seasonal content?

**Other (custom systems):**
1. **What does this system do?** Core mechanics in 2-3 sentences.
2. **Feel**: What emotional response should interacting with this system produce?
3. **Boundaries**: What should this system explicitly NOT do?

### Phase 4: Parallel Web Research

**CRITICAL: Dispatch one Task per selected system. Include ALL Tasks in a SINGLE message for true parallel execution.**

Per-system research Task template:

```
Task(
  description="Research [system name] design patterns",
  prompt="Search the web for game design patterns and best practices for [system name] systems in [genre] games.

FOCUS AREAS:
- Common design patterns for [system name] in [genre] games
- Known pitfalls and anti-patterns
- Examples from comparable titles
- Balance considerations and feedback loop design
- Accessibility considerations

SCOPE: [indie|aa|aaa] — scale recommendations accordingly.

Return structured findings with URLs. Organize by: Patterns, Pitfalls, Examples, Balance Tips."
)
```

After all research Tasks return, review and filter findings for relevance to this specific game.

### Phase 5: Compile Context File

Assemble all gathered information into a structured context file:

```markdown
# Systems Phase Context: [Game Name]

**Gathered:** [today's date]
**Bible Directory:** [bible-dir path]
**Scope:** [indie|aa|aaa]

## Selected Systems

[Numbered list of all selected systems]

## Foundation Context

### Design Pillars
[Extracted pillar names and "What This Rules Out" lists from DESIGN-PILLARS.md]

### Core Loop
[The Action → Feedback → Reward → Motivation cycle from core-loop.md]

### Genre & Platform
[From vision.md]

## Per-System Details

### [System Name 1]
**Questions & Answers:**
- Scale: [user's answer]
- Feel: [user's answer]
- Boundaries: [user's answer]

**Web Research Findings:**
[Filtered research results with URLs]

### [System Name 2]
[Same structure...]

[Repeat for each selected system]

## Cross-System Considerations

[Any interactions, shared resources, or dependencies between selected systems identified during Q&A]

## Open Questions

- [Anything unresolved or flagged during gathering]
```

### Phase 6: Save and Return

1. Create the context directory if needed: `<bible-dir>/context/`
2. Write the context file to `<bible-dir>/context/systems-context.md`
3. Return the context file path.

Tell the user: "Context file saved to `<path>`. Review and edit it if needed, then run `/game-design-bible:systems-generate <path>` to dispatch parallel system designers."
