---
description: Create a comprehensive Video Game Design Bible through phased, interactive workflows with parallel specialist writers
argument-hint: "<game concept> [--scope indie|aa|aaa] [--output-dir path] [--force]"
allowed-tools: Task, Read, Write, Edit, Bash(mkdir:*), Glob, Grep
model: opus
category: workflow
---

# 🎮 Game Design Bible Creator

Create a comprehensive, modular Video Game Design Bible through 6 phased workflows.

## Arguments
$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Game Concept**: Everything that isn't a flag
- **Scope**: `--scope indie|aa|aaa` (default: `indie`)
- **Output Directory**: `--output-dir <path>` (default: `docs/game-design-bible/`)
- **Force**: `--force` (default: false — if true, overwrite existing bible)

## Pre-flight Check

Before starting any phase, check if the output directory already has a bible:

1. Use Glob to check for `<output-dir>/INDEX.md`
2. If INDEX.md exists and `--force` is NOT set:
   - Read INDEX.md and display the current bible status
   - Inform the user: "An existing bible was found at `<output-dir>`. Use `/game-design-bible:bible:continue` to resume work, or re-run with `--force` to start fresh."
   - STOP — do not proceed
3. If INDEX.md exists and `--force` IS set, proceed (will overwrite)
4. If INDEX.md does not exist, proceed normally

## Phase Execution Order

Phases must execute in this order due to context dependencies:
- **Phase 0** (Concept) → **Phase 1** (Core Loop) → **Phase 2** (Systems) are sequential — each depends on the prior
- **Phase 3** (Narrative) depends on Phase 2 output (needs systems summaries as context)
- **Phase 4** (Art & Audio) depends only on Phase 0 (needs MDA aesthetics, not systems)
- Therefore: **Phase 3 and Phase 4 can run in parallel** after Phase 2 completes
- **Phase 5** (Technical & Production) runs last, after all content phases

## Status Tracking

Before starting each phase, update INDEX.md status to `🔧 In Progress`.
After completing each phase, update INDEX.md status to `✅ Complete`.
If the user skips a phase, mark it as `⏭️ Skipped`.

---

## Phase 0 — Concept (Interactive, Sequential)

This phase establishes the foundation. Do NOT skip or rush any question.

### Step 1: Core Fantasy
Ask the user:
> **What is the core fantasy / emotional experience you want players to feel?**
> (Not mechanics — the feeling. Examples: "the thrill of barely surviving", "the satisfaction of building a thriving settlement", "the wonder of exploring alien worlds")

Wait for response.

### Step 2: Genre & Platform
Ask the user:
> **What genre and target platform(s)?**
> (e.g., "roguelike deckbuilder on PC/Switch", "action RPG on console", "mobile puzzle game")

Wait for response.

### Step 3: Design Pillars
Using the core fantasy and genre, draft 3-5 design pillars following the design pillar methodology:
- Each pillar should be 2-5 words, actionable, and unique to this game
- For each pillar, present a "What This Rules Out" list (3+ items) as the primary explanation — counterexamples communicate the pillar's intent faster than descriptions
- Present the drafted pillars with their counterexamples to the user
- Ask: **"Do these counterexamples capture what your game is NOT? Adjust, add, or remove any."**

Wait for approval or revision. If the user rejects the drafted pillars, ask targeted follow-up questions and redraft (max 2 iterations). After 2 rounds, accept the user's stated pillars directly.

### Step 4: Non-Goals
Ask the user:
> **What is this game explicitly NOT?**
> (What features, genres, or experiences are out of scope? e.g., "not a live service", "no PvP", "not a narrative-heavy game")

Wait for response.

### Step 5: MDA Analysis
Using the approved design pillars:
1. Identify 2-3 target **aesthetics** from the MDA framework (Sensation, Fantasy, Narrative, Challenge, Fellowship, Discovery, Expression, Submission)
2. Reason backward to the **dynamics** those aesthetics require
3. Reason backward to the **mechanics** those dynamics require
4. Present the MDA chain to the user for validation

### Step 6: Write Concept Files
Create the output directory structure and write Phase 0 files:

```bash
mkdir -p <output-dir>/{00-concept,01-core-loop,02-systems,03-narrative,04-art-audio,05-technical-production}
```

Write these files:

**`DESIGN-PILLARS.md`** (top-level quick reference):
```markdown
# Design Pillars — [Game Name]

1. **[Pillar 1]** — [one-sentence explanation]
   *What this rules out:* [thing], [thing], [thing]
2. **[Pillar 2]** — [one-sentence explanation]
   *What this rules out:* [thing], [thing], [thing]
3. **[Pillar 3]** — [one-sentence explanation]
   *What this rules out:* [thing], [thing], [thing]
[4-5 if applicable]

---
*These pillars are the supreme court of design decisions. When two good ideas conflict, pillars break the tie. When in doubt, check what each pillar rules out.*
```

**`00-concept/vision.md`**:
```markdown
# Vision
> Pillar Alignment: [list pillar names that this section serves]

## Elevator Pitch
[2-3 sentences that sell the game]

## Core Fantasy
[The emotional experience from Step 1]

## Genre & Platform
[From Step 2]

## Target Audience
[Inferred from concept, genre, and pillars]

## Comparable Titles
[2-3 games that share DNA, with what's different about this game]

## Design Rationale
[Why these choices? What alternatives were considered and rejected?]

## Open Questions
- [ ] [Unresolved question]?

## Cross-References
- [Design Pillars (detailed)](design-pillars.md)
- [MDA Analysis](mda-analysis.md)
- [Non-Goals](non-goals.md)

## Changelog
- [today's date]: Initial draft
```

**`00-concept/design-pillars.md`**: Full reasoning behind each pillar — lead with "What This Rules Out" (3+ concrete items per pillar), then what it approves, then stress-test rationale.

**`00-concept/mda-analysis.md`**: The MDA chain from Step 5 with validation notes.

**`00-concept/non-goals.md`**: Explicit scope exclusions from Step 4.

**`INDEX.md`** (master TOC — update this after every phase):
```markdown
# [Game Name] — Design Bible Index

<!-- Status: ⬜ Not Started | 🔧 In Progress | ✅ Complete | ⏭️ Skipped -->

## Status
| Phase | Section | Status |
|-------|---------|--------|
| 0 | Concept | ✅ Complete |
| 1 | Core Loop | ⬜ Not Started |
| 2 | Systems | ⬜ Not Started |
| 3 | Narrative | ⬜ Not Started |
| 4 | Art & Audio | ⬜ Not Started |
| 5 | Technical & Production | ⬜ Not Started |

## Table of Contents
- [Design Pillars](DESIGN-PILLARS.md)
- **00 — Concept**
  - [Vision](00-concept/vision.md)
  - [Design Pillars (detailed)](00-concept/design-pillars.md)
  - [MDA Analysis](00-concept/mda-analysis.md)
  - [Non-Goals](00-concept/non-goals.md)
- **01 — Core Loop**
  - [Core Loop](01-core-loop/core-loop.md)
  - [Prototype Spec](01-core-loop/prototype-spec.md)
- **02 — Systems** *(populated in Phase 2)*
- **03 — Narrative** *(populated in Phase 3)*
- **04 — Art & Audio** *(populated in Phase 4)*
- **05 — Technical & Production** *(populated in Phase 5)*
```

Confirm Phase 0 completion to the user before proceeding.

---

## Phase 1 — Core Loop (Interactive, Sequential)

Update INDEX.md: Phase 1 → `🔧 In Progress`.

### Step 1: Moment-to-Moment Action
Ask the user:
> **What does the player DO moment-to-moment?**
> (The core verb. Examples: "play cards to defeat enemies", "place buildings and manage workers", "explore rooms and solve puzzles")

Wait for response.

### Step 2: Feedback & Reward
Ask the user:
> **How does the game respond to the player's actions? What rewards keep them engaged?**
> (Feedback: screen shake, score popups, enemy reactions. Rewards: new cards, currency, story reveals, upgrades)

Wait for response.

### Step 3: Motivation for Repetition
Ask the user:
> **What motivates the player to do the core action again?**
> (Progression: unlocks, mastery. Curiosity: new content. Social: competition/cooperation. Comfort: zen flow)

Wait for response.

### Step 4: Diagram and Validate
1. Create a core loop diagram showing the Action→Feedback→Reward→Motivation cycle
2. Validate: Does this loop serve the design pillars?
3. Identify any pillar that the core loop doesn't touch — flag it

### Step 5: Write Core Loop Files

**`01-core-loop/core-loop.md`**:
```markdown
# Core Loop
> Pillar Alignment: [list pillar names that this section serves]

## Overview
[1 paragraph describing the fundamental gameplay loop]

## The Loop
```
[Action] → [Feedback] → [Reward] → [Motivation] → [Action]
```

## Action (What the player does)
[Detail from Step 1]

## Feedback (How the game responds)
[Detail from Step 2]

## Reward (What the player gains)
[Detail from Step 2]

## Motivation (Why they do it again)
[Detail from Step 3]

## Session Structure
[How does a typical play session start, flow, and end?]

## Pillar Validation
[Which pillars does this loop serve? Any gaps?]

## Design Rationale
[Why this loop? What alternatives were considered?]

## Open Questions
- [ ] [Unresolved question]?

## Cross-References
## Changelog
- [today's date]: Initial draft
```

**`01-core-loop/prototype-spec.md`**:
```markdown
# Prototype Specification
> Pillar Alignment: [list pillar names that this section serves]

## Overview
[What a minimum playable prototype of this core loop looks like]

## Must-Have for Prototype
[The absolute minimum mechanics to test the core loop]

## Nice-to-Have for Prototype
[Secondary features that enhance the loop but aren't essential to test it]

## Success Criteria
[How to know if the prototype "feels right" — tied to design pillars]

## Design Rationale
[Why these prototype boundaries?]

## Open Questions
- [ ] [Unresolved question]?

## Cross-References
## Changelog
- [today's date]: Initial draft
```

Update INDEX.md: Phase 1 → `✅ Complete`.

---

## Phase 2 — Systems (Parallel via Task)

Update INDEX.md: Phase 2 → `🔧 In Progress`.

### Gate Question
Present a checklist to the user:
> **Which game systems does your game have? (Select all that apply)**
> - [ ] Combat / Action mechanics
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

Wait for response.

### Parallel Dispatch

**CRITICAL: For EACH system the user selected, create one Task() call using the template below. Include ALL Task() calls in a SINGLE message for true parallel execution.**

Example: if user selected combat, economy, progression → 3 Task() calls in one message.

Per-system Task template:
```
Task(
  description="Design [system name] system",
  prompt="Design the [system name] system for a [genre] game.

CONTEXT (read these files for full context):
- Design Pillars: <output-dir>/DESIGN-PILLARS.md
- Core Loop: <output-dir>/01-core-loop/core-loop.md

SYSTEM TO DESIGN: [system name]
SCOPE: [indie|aa|aaa]
OUTPUT PATH: <output-dir>/02-systems/[system-name].md

Ask the user 2-3 targeted questions about this system, then write the design document following your system design template. Validate against design pillars. Include a '## Design Rationale' section explaining key choices.",
  subagent_type="systems-designer"
)
```

### Collect Results
After all subagents complete:
1. Read each created file in `02-systems/`
2. Update `INDEX.md` with the systems section TOC and status → `✅ Complete`
3. Summarize what was created for the user

---

## Phase 3 — Narrative & World (Parallel via Task)

Update INDEX.md: Phase 3 → `🔧 In Progress`.

**Note:** Phase 3 depends on Phase 2 output — the narrative-designer needs systems summaries as context. Phase 4 (Art & Audio) only depends on Phase 0, so Phases 3 and 4 CAN be launched in the same message.

Launch `narrative-designer` subagent:

```
Task(
  description="Design narrative and world",
  prompt="Design the narrative, characters, world-building, and dialogue systems for a [genre] game.

CONTEXT (read these files for full context):
- Design Pillars: <output-dir>/DESIGN-PILLARS.md
- Core Loop: <output-dir>/01-core-loop/core-loop.md
- Systems: Read all files in <output-dir>/02-systems/

SCOPE: [indie|aa|aaa]
OUTPUT PATH: <output-dir>/03-narrative/

Assess narrative weight first (heavy/medium/light based on genre and pillars). Ask structured questions appropriate to the weight, then write all narrative documents. Include '## Design Rationale' sections. For narrative-light games, create a minimal story-overview.md.",
  subagent_type="narrative-designer"
)
```

Launch this IN THE SAME MESSAGE as Phase 4 for parallelization.

---

## Phase 4 — Art & Audio (Parallel via Task, runs alongside Phase 3)

Update INDEX.md: Phase 4 → `🔧 In Progress`.

Launch `art-audio-director` subagent:

```
Task(
  description="Design art and audio direction",
  prompt="Define the visual style, color palette, sound design, UI/UX direction, and controls/input mapping for a [genre] game.

CONTEXT (read these files for full context):
- Design Pillars: <output-dir>/DESIGN-PILLARS.md
- MDA Analysis: <output-dir>/00-concept/mda-analysis.md

SCOPE: [indie|aa|aaa]
OUTPUT PATH: <output-dir>/04-art-audio/

Ask about visual references, audio mood, UI philosophy, and input preferences. Write all art/audio direction documents including controls.md with concrete references and hex color values. Include '## Design Rationale' sections.",
  subagent_type="art-audio-director"
)
```

Launch this IN THE SAME MESSAGE as Phase 3 for parallelization.

### Collect Results from Phases 3 & 4
After both subagents complete:
1. Read created files in `03-narrative/` and `04-art-audio/`
2. Update `INDEX.md` with both sections → `✅ Complete`
3. Summarize what was created

---

## Phase 5 — Technical & Production (Sequential, after Phases 2-4)

Update INDEX.md: Phase 5 → `🔧 In Progress`.

### Step 1: Engine & Tools
Ask the user:
> **What engine/tools will you use, and what's your team structure?**
> (e.g., "Unity, solo developer", "Godot, 2 full-time + 1 part-time artist", "Unreal, 5-person distributed team")

Wait for response.

### Step 2: Timeline & Monetization
Ask the user:
> **What's your target timeline, and what's the monetization model (if any)?**
> (e.g., "6 months to vertical slice, premium $15", "1 year, free-to-play with cosmetics", "no monetization, game jam project")

Wait for response.

### Step 3: Write Technical & Production Files

**`05-technical-production/engine-and-tools.md`**:
```markdown
# Engine & Tools
> Pillar Alignment: [list pillar names that this section serves]

## Overview
[Engine choice and reasoning]

## Development Tools
[IDE, version control, project management, art tools]

## Team Structure
[Roles, responsibilities, communication]

## Technical Constraints
[Platform limitations, performance targets, file size budgets]

## Design Rationale
[Why this engine and toolchain?]

## Open Questions
- [ ] [Unresolved question]?

## Cross-References
## Changelog
- [today's date]: Initial draft
```

**`05-technical-production/asset-breakdown.md`**: Estimated asset counts by type (characters, environments, UI screens, sound effects, music tracks).

**`05-technical-production/timeline.md`**: High-level milestone roadmap (pre-production, vertical slice, alpha, beta, launch).

**`05-technical-production/monetization.md`** (only if applicable): Revenue model, pricing strategy, ethical guidelines for monetization aligned with design pillars.

### Step 4: Finalize
1. Update `INDEX.md` with final status — all phases `✅ Complete`
2. Present a completion summary to the user:
   - Total files created
   - Open Questions count across all sections
   - Suggest running `bible/review` to audit for gaps and contradictions
   - Suggest using `bible/expand` to deep-dive specific sections

---

## Scope Scaling

Adjust documentation depth based on the `--scope` flag. Note: narrative depth also depends on narrative weight (determined by narrative-designer in Phase 3), not just project scope.

| Aspect | Indie | AA | AAA |
|--------|-------|----|-----|
| Design Pillars | 3 | 3-4 | 4-5 |
| Systems depth | 1-2 paragraphs each | 2-4 paragraphs each | Full sub-documents |
| Narrative docs | 1-2 files (adjust by narrative weight) | 3-4 files | All files + sub-files |
| Art/Audio detail | Reference list + palette | Style guide + audio map | Full art bible sections |
| Technical docs | Basic specs | Full pipeline | Detailed breakdowns |
| Questions per phase | Minimum (2-3) | Standard (3-4) | Thorough (4-5) |

## Section File Template

Every section file MUST follow this structure:

```markdown
# [Section Title]
> Pillar Alignment: [list pillar names that this section serves]

## Overview
[1-2 paragraph summary]

## Detailed Design
[Main content — specific to each section]

## Design Rationale
[Why these design choices? What alternatives were considered and rejected?]

## Open Questions
- [ ] [Unresolved question]?
- [ ] [Another unresolved question]?

## Cross-References
- [Related section](relative/path.md)

## Changelog
- YYYY-MM-DD: Initial draft
```

## Error Handling

- If the user provides very brief answers, infer reasonable defaults and flag them as "Inferred — please confirm" in Open Questions
- If a phase produces output that contradicts a design pillar, flag it immediately and ask the user to resolve
- If the user wants to skip a phase, mark it as `⏭️ Skipped` in INDEX.md and proceed
- If a subagent fails during a parallel phase, note the failure in INDEX.md (phase stays `🔧 In Progress`) and inform the user which system failed — they can use `bible/continue` to retry

Now begin the Pre-flight Check, then Phase 0 by asking the first question about core fantasy.
