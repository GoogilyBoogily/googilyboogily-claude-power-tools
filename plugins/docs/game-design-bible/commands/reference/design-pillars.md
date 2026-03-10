---
description: Design pillars methodology — how to formulate pillars, real-world examples, and anti-patterns
allowed-tools: ""
model: haiku
category: reference
---

# Design Pillars Reference

**Design pillars** are the 3-5 non-negotiable principles that every feature, system, and piece of content must serve. They are the supreme court of design decisions — when two good ideas conflict, pillars break the tie.

## What Makes a Good Pillar

A strong design pillar is:
- **Actionable**: Can be used to make decisions ("Does this feature serve this pillar?")
- **Falsifiable**: Some features clearly violate it (if nothing violates it, it's too vague)
- **Memorable**: Short enough to recite from memory (2-5 words ideal)
- **Unique to your game**: Not generic truths ("fun gameplay" is not a pillar)
- **In tension with alternatives**: Choosing this pillar means NOT choosing its opposite

## Pillar Formulation Process

### Step 1: Identify the Core Fantasy
What emotional experience are you selling? Not mechanics — feelings.
- "The thrill of barely surviving" (not "combat system")
- "Building something beautiful from nothing" (not "crafting mechanics")

### Step 2: Extract 3-5 Principles
From the core fantasy, derive principles that guide all decisions:
- Each pillar should constrain design space (remove bad options)
- Each pillar should inspire design space (suggest good options)
- Together, they should describe a game only YOUR game could be

### Step 3: Stress-Test Against Features
For each proposed pillar, test it:
- Can you name 3 features this pillar would approve?
- Can you name 3 features this pillar would reject?
- If you can't reject anything, the pillar is too vague

### Step 4: Check for Coverage
- Do the pillars together cover the core fantasy?
- Are there aspects of your vision that no pillar addresses? (add one)
- Do any pillars overlap significantly? (merge them)

## Real-World Examples

### The Last of Us (Naughty Dog)
1. **Crafting createsستراتegy** — Scarcity forces meaningful choices
2. **AI partners feel real** — Ellie isn't a game mechanic, she's a person
3. **Violence has weight** — Every encounter should feel desperate, not routine
4. **Story and gameplay are one** — No separation between "cutscene story" and "gameplay story"

*These pillars reject*: Arcade-style scoring, abundant ammo, silent protagonists, gamey UI

### Breath of the Wild (Nintendo)
1. **Multiplicative gameplay** — Systems interact to create emergent solutions
2. **See it, go there** — No invisible walls, every visible point is reachable
3. **Surprise around every corner** — Reward curiosity with unexpected discoveries
4. **Active, not passive** — The player acts on the world, not the other way around

*These pillars reject*: Linear paths, scripted set-pieces, passive fast-travel, hand-holding tutorials

### Hades (Supergiant Games)
1. **Every run tells a story** — Narrative progresses regardless of success or failure
2. **Meaningful choices, not optimal choices** — Builds should feel expressive, not solved
3. **Mastery through repetition** — Getting better feels earned, not given
4. **Characters you want to talk to** — NPCs are rewards, not obstacles

*These pillars reject*: Permadeath with no persistence, silent protagonist, DPS-only builds, throwaway NPCs

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

### Pillar Drift
The most dangerous anti-pattern: pillars that exist in a document but get ignored in practice.
- **Prevention**: Reference pillars in every design review
- **Detection**: If a team member can't name the pillars from memory, they've drifted
- **Recovery**: Audit features against pillars quarterly, cut or redesign violators

## Using Pillars in the Design Bible

Pillars appear in three places:
1. **`DESIGN-PILLARS.md`** — Top-level quick reference, the first document anyone reads
2. **`00-concept/design-pillars.md`** — Full reasoning behind each pillar choice
3. **Every section file** — The `> Pillar Alignment:` header linking each section to its pillars

During the `bible/review` command, the Pillar Consistency audit checks:
- Does every feature serve at least one pillar?
- Is every pillar served by at least one feature?
- Are there features that actively contradict a pillar?
