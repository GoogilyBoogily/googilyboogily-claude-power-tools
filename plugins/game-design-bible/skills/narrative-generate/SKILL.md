---
name: narrative-generate
description: "Generate Narrative phase (Phase 3) documents by dispatching the narrative-designer agent. Adjusts output depth by narrative weight. Clean context."
disable-model-invocation: true
context: fork
argument-hint: "[context-file] [--output-dir path]"
allowed-tools: Read, Write, Edit, Glob, Grep, Task, Bash(mkdir:*)
model: opus
---

# Narrative Phase — Document Generator

Generate the complete Narrative phase (Phase 3) of a Game Design Bible from a previously gathered context file. This skill runs with clean context and is non-interactive — all questions were answered during the gather phase. Output depth is adjusted based on the narrative weight recorded in the context file.

## Input

$ARGUMENTS — path to the context file (e.g., `docs/game-design-bible/context/narrative-context.md`), and optionally:
- `--output-dir <path>` — override the output directory from the context file

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Context File**: First non-flag argument
- **Output Dir**: `--output-dir <path>`, or extracted from the context file's `Bible Directory` field

## Source Integrity Rules

**Every factual claim in these documents must be traceable to the context file.**

1. **Ground every claim.** Every statement must trace back to the context file — user answers, research findings with URLs, or design pillar deliberations.
2. **Flag ungrounded claims.** If you need to state something not in the context file, mark it explicitly as `[ASSUMPTION]`.
3. **Never invent details.** If the context file doesn't cover something, put it in Open Questions — don't fabricate.

## Process

### Step 1: Read Inputs

1. Read the context file from `$ARGUMENTS`.
2. Extract all gathered information:
   - Narrative weight (HEAVY / MEDIUM / LIGHT)
   - Theme, characters, world, story structure, dialogue approach
   - Systems context (narrative-adjacent gameplay systems)
   - Pillar context (design pillars and how narrative serves them)
   - Scope tier (indie / aa / aaa)
   - Web research findings
   - Open questions
   - Output directory

### Step 2: Create Directory Structure

```bash
mkdir -p <output-dir>/03-narrative
```

### Step 3: Dispatch Narrative Designer Agent

Dispatch the narrative-designer agent via Task with the full context. The agent must NOT ask questions — all context has been gathered.

Include in the Task prompt:
- The complete context file contents
- The narrative weight
- Explicit instructions: "Do not ask questions. All context has been gathered. Generate documents based solely on the provided context."
- The output directory path
- The document template (below)

Every narrative document follows this template structure:

```markdown
# [Title]

> **Pillar Alignment:** [Which design pillars this section serves]

## Overview

[2-3 paragraph summary]

## Detailed Design

[Section-specific content]

## Design Rationale

[Why these choices were made, grounded in context file]

## Open Questions

- [Unresolved items relevant to this section]

## Cross-References

- [Links to related sections within the bible]

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| [today] | Initial creation | Phase 3 — Narrative |
```

### Step 4: Generate Documents by Weight

The agent produces files in `<output-dir>/03-narrative/` appropriate to narrative weight:

---

#### HEAVY Weight Documents

**File 1: 03-narrative/story-overview.md**

Sections:
- **Theme**: Central theme, moral question, what the game says about its subject matter.
- **Central Conflict**: The main conflict, antagonist, stakes, escalation arc.
- **Story Structure**: Linear/branching/emergent, act structure, major plot beats per act.
- **Player Agency**: How player choices affect narrative (if applicable). Branching points, consequence systems, ending conditions.
- **Endings**: How many endings, what determines them, emotional payoff of each.
- **Pacing**: How story beats interleave with gameplay. Story-to-gameplay ratio guidance.
- **Design Rationale**: Why this story structure serves the design pillars.
- **Open Questions**: Unresolved story-level questions.

**File 2: 03-narrative/characters.md**

Sections:
- **Protagonist**: Full character profile — background, personality, arc, relationship to world, voice/tone. If customizable, define the fixed aspects vs. player-defined aspects.
- **Antagonist**: Motivation, methodology, relationship to protagonist, arc (if any).
- **Supporting Cast**: For each character:
  - Role (mentor, rival, companion, quest giver, etc.)
  - Background and personality (2-3 paragraphs)
  - Character arc
  - Gameplay role (companion abilities, shop inventory, quest lines)
  - Key relationships with other characters
- **Character Relationship Map**: Text-based visualization of how characters relate to each other.
- **Design Rationale**: How the character cast serves both narrative and gameplay needs.
- **Open Questions**: Character-specific unresolved items.

**File 3: 03-narrative/world-lore.md**

Sections:
- **World Rules**: What differs from reality — magic systems, technology, physics, social norms.
- **History**: Key historical events that shape the present conflict. Timeline of major events.
- **Geography**: Key locations and their narrative significance.
- **Factions & Power Structures**: Who holds power, what they want, how they conflict.
- **Culture & Society**: Social norms, religions, economies — as relevant to the narrative.
- **Design Rationale**: How world-building serves the design pillars and gameplay.
- **Open Questions**: World-building-specific unresolved items.

**File 4: 03-narrative/dialogue-systems.md**

Sections:
- **Dialogue Mechanics**: How dialogue is presented (UI, branching trees, real-time, choice wheels). How player input works.
- **Tone Guide**: Voice and tone for dialogue writing. Examples of target tone. Words/phrases to use and avoid.
- **Branching Logic**: How dialogue branches, what triggers different paths, how branches reconnect.
- **Voice Acting Scope**: Number of voiced characters, estimated line count, casting direction. Budget considerations for scope tier.
- **Localization**: Language targets, text expansion considerations, cultural adaptation notes.
- **Design Rationale**: How dialogue approach serves design pillars and budget.
- **Open Questions**: Dialogue-specific unresolved items.

---

#### MEDIUM Weight Documents

**File 1: 03-narrative/story-overview.md**

Sections:
- **Framing Narrative**: The story that motivates the gameplay. Why the player is doing what they're doing.
- **Campaign Structure**: How narrative segments connect to gameplay chapters/missions/levels.
- **Story Beats**: Key narrative moments and how they reward or redirect the player.
- **Tone & Themes**: Lighter treatment of theme — mood and emotional throughline rather than deep thematic exploration.
- **Design Rationale**: How the framing narrative enhances the core loop.
- **Open Questions**: Story-level unresolved items.

**File 2: 03-narrative/characters.md (light)**

Sections:
- **Key Characters**: For each of the 2-5 most important characters:
  - Role and personality (1 paragraph)
  - Gameplay function (quest giver, merchant, companion, etc.)
  - Key dialogue moments
- **Character Interactions**: How characters relate to each other and the player.
- **Design Rationale**: Why these characters exist and what they add to gameplay.
- **Open Questions**: Character-specific unresolved items.

**File 3: 03-narrative/world-lore.md (light)**

Sections:
- **World Identity**: What makes this world feel unique in 2-3 paragraphs.
- **Key Lore Elements**: The 5-10 most important lore facts a player should absorb.
- **Environmental Storytelling**: How the world communicates lore without dialogue.
- **Design Rationale**: How world flavor enhances gameplay engagement.
- **Open Questions**: World-specific unresolved items.

---

#### LIGHT Weight Documents

**File 1: 03-narrative/story-overview.md (minimal)**

Sections:
- **Premise**: The 1-2 sentence setup. Why the player is here.
- **Tone**: The emotional tone and how it's communicated through gameplay, visuals, and audio rather than dialogue.
- **Environmental Storytelling**: How the world suggests story without telling it — visual cues, environmental changes, discoverable fragments.
- **Narrative Escalation**: If applicable, how the implicit story builds as the player progresses.
- **Design Rationale**: Why this level of narrative is right for this game.
- **Open Questions**: Narrative-specific unresolved items.

---

### Step 5: Update INDEX.md

Read `<output-dir>/INDEX.md` and update Phase 3:

Replace:
```markdown
### ⬜ Phase 3: Narrative
> *Not started*
```

With (adjusted by weight):

**HEAVY:**
```markdown
### ✅ Phase 3: Narrative
- [Story Overview](03-narrative/story-overview.md) — theme, conflict, structure, endings
- [Characters](03-narrative/characters.md) — character bible with arcs and gameplay roles
- [World Lore](03-narrative/world-lore.md) — world rules, history, factions
- [Dialogue Systems](03-narrative/dialogue-systems.md) — dialogue mechanics, tone, voice scope
```

**MEDIUM:**
```markdown
### ✅ Phase 3: Narrative
- [Story Overview](03-narrative/story-overview.md) — framing narrative, campaign structure
- [Characters](03-narrative/characters.md) — key characters and gameplay roles
- [World Lore](03-narrative/world-lore.md) — world identity and key lore
```

**LIGHT:**
```markdown
### ✅ Phase 3: Narrative
- [Story Overview](03-narrative/story-overview.md) — premise, tone, environmental storytelling
```

Also add to the Context Files section:
```markdown
- [Narrative Context](context/narrative-context.md) — gathered context for Phase 3
```

### Step 6: Verify

Re-read each generated file to verify:
1. All pillar names are consistent with DESIGN-PILLARS.md.
2. Narrative elements don't contradict system designs from Phase 2.
3. No `[ASSUMPTION]` tags are present without corresponding Open Questions entries.
4. Cross-references use correct relative paths.
5. Document depth matches the narrative weight.

### Step 7: Report

List all created files with their paths:

```
## Files Created

1. <output-dir>/03-narrative/story-overview.md — [description based on weight]
2. <output-dir>/03-narrative/characters.md — [if HEAVY or MEDIUM]
3. <output-dir>/03-narrative/world-lore.md — [if HEAVY or MEDIUM]
4. <output-dir>/03-narrative/dialogue-systems.md — [if HEAVY only]
5. <output-dir>/INDEX.md — updated Phase 3 status
```

## Output

Report: "Phase 3 (Narrative) documents generated at [weight] depth. Run `/game-design-bible:audit-narrative <output-dir> --context <context-file-path>` to audit them."

Return the list of created file paths.
