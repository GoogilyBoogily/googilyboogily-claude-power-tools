---
name: design-pillars
description: "Design pillars methodology reference — how to formulate pillars, real-world examples (The Last of Us, Breath of the Wild, Hades), anti-patterns, and the 'What This Rules Out' approach. Use when discussing or creating design pillars for games."
user-invocable: false
allowed-tools: ""
model: haiku
---

# Design Pillars Reference

**Design pillars** are the 3-5 non-negotiable principles that every feature, system, and piece of content must serve. They are the supreme court of design decisions — when two good ideas conflict, pillars break the tie.

## The Power of Counterexamples

A pillar that says "Crafting creates strategy" is abstract. A pillar that says "This rules out: abundant ammo, auto-crafting, single optimal builds" is *instantly* understood. People grasp boundaries faster than descriptions — your brain builds a sharper mental model from "here's what we're NOT doing" than from "here's what we're doing."

When communicating pillars to a team, lead with what each pillar rules out. If someone reads only the counterexamples, they should already understand the design intent.

## What Makes a Good Pillar

A strong design pillar is:
- **Defined by exclusion**: You can name 3+ plausible features it rules out. If you can't, the pillar is too vague.
- **Actionable**: Can be used to make decisions ("Does this feature serve this pillar?")
- **Memorable**: Short enough to recite from memory (2-5 words ideal)
- **Unique to your game**: Not generic truths ("fun gameplay" is not a pillar)
- **In tension with alternatives**: Choosing this pillar means NOT choosing its opposite — and you can point to the excluded alternatives

## Pillar Formulation Process

### Step 1: Identify the Core Fantasy
What emotional experience are you selling? Not mechanics — feelings.
- "The thrill of barely surviving" (not "combat system")
- "Building something beautiful from nothing" (not "crafting mechanics")

### Step 2: Define by Exclusion First
For each candidate pillar, write its "What This Rules Out" list BEFORE writing what it approves:
- List 3+ concrete, plausible features or approaches this pillar rejects
- If you can't list 3 things it rejects, the pillar isn't sharp enough yet
- Then list what it approves — but the rejections come first
- Together, the pillars' exclusion lists should describe a game only YOUR game could be

### Step 3: Check for Coverage
- Do the pillars together cover the core fantasy?
- Are there aspects of your vision that no pillar addresses? (add one)
- Do any pillars overlap significantly? (merge them)

## Real-World Examples

### The Last of Us (Naughty Dog)
1. **Crafting creates strategy** — Scarcity forces meaningful choices
   *Rules out:* abundant ammo, auto-crafting, single optimal builds
2. **AI partners feel real** — Ellie isn't a game mechanic, she's a person
   *Rules out:* invincible companions, companion command menus, partner-as-pack-mule
3. **Violence has weight** — Every encounter should feel desperate, not routine
   *Rules out:* arcade-style scoring, respawning enemies, kill combo counters
4. **Story and gameplay are one** — No separation between "cutscene story" and "gameplay story"
   *Rules out:* silent protagonist during gameplay, gamey UI overlays, non-diegetic tutorials

### Breath of the Wild (Nintendo)
1. **Multiplicative gameplay** — Systems interact to create emergent solutions
   *Rules out:* single-solution puzzles, hard-coded interactions, ability-gated progression
2. **See it, go there** — No invisible walls, every visible point is reachable
   *Rules out:* invisible walls, locked camera angles, linear corridors
3. **Surprise around every corner** — Reward curiosity with unexpected discoveries
   *Rules out:* empty open world, predictable loot tables, copy-pasted content
4. **Active, not passive** — The player acts on the world, not the other way around
   *Rules out:* passive fast-travel, hand-holding tutorials, scripted set-pieces

### Hades (Supergiant Games)
1. **Every run tells a story** — Narrative progresses regardless of success or failure
   *Rules out:* permadeath with no persistence, story locked behind skill gates, death as pure punishment
2. **Meaningful choices, not optimal choices** — Builds should feel expressive, not solved
   *Rules out:* DPS-only meta, cookie-cutter builds, mathematically dominant strategies
3. **Mastery through repetition** — Getting better feels earned, not given
   *Rules out:* difficulty selectors that skip content, auto-leveling, pay-to-win progression
4. **Characters you want to talk to** — NPCs are rewards, not obstacles
   *Rules out:* throwaway NPCs, text-dump lore, characters as vending machines

## Anti-Patterns

### Too Vague
- "Fun gameplay" — Every game wants this. Not actionable.
- "Great art" — Doesn't guide decisions about WHAT art style.
- "Immersive" — Immersive how? Through systems? Story? Visuals?

### Too Specific
- "16-color pixel art palette" — This is an art spec, not a pillar.
- "Exactly 3 weapon types" — This is a design detail, not a principle.
- "Unity engine" — This is a technical decision, not a design value.

### Contradictory Pillars
- "Hardcore challenge" + "Accessible to everyone" — These fight each other unless carefully scoped (e.g., Celeste's assist mode approach)
- "Realistic simulation" + "Fast-paced arcade feel" — Pick a side or define the blend precisely

### Missing Counterexamples
Pillar exists with a positive description but no "What This Rules Out." Team members nod along but each imagines different boundaries. This is the #1 cause of pillar drift — everyone agrees on what the pillar means in the abstract, but disagrees on what it rejects in practice.
- **Prevention**: Never finalize a pillar without 3+ concrete counterexamples
- **Detection**: Ask two team members what a pillar rules out — if they give different answers, the pillar is under-specified
- **Recovery**: Workshop the "rules out" list as a team until consensus is reached

### Pillar Drift
The most dangerous anti-pattern: pillars that exist in a document but get ignored in practice.
- **Prevention**: Reference pillars in every design review
- **Detection**: If a team member can't name the pillars from memory, they've drifted
- **Recovery**: Audit features against pillars quarterly, cut or redesign violators

## Using Pillars in the Design Bible

Pillars appear in three places:
1. **`DESIGN-PILLARS.md`** — Top-level quick reference with per-pillar "What This Rules Out" lists, the first document anyone reads
2. **`00-concept/design-pillars.md`** — Full reasoning behind each pillar, leading with "What This Rules Out" (3+ concrete items per pillar), then what it approves, then stress-test rationale
3. **Every section file** — The `> Pillar Alignment:` header linking each section to its pillars

During the `bible/review` command, the Pillar Consistency audit checks:
- Does every feature serve at least one pillar?
- Is every pillar served by at least one feature?
- Are there features that actively contradict a pillar?
