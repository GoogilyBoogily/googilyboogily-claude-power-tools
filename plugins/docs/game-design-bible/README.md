# Game Design Bible Plugin

Procedurally create comprehensive Video Game Design Bibles through phased, interactive workflows with gap detection and parallel specialist writers.

## Commands

### Workflow Commands

| Command | Description |
|---------|-------------|
| `/game-design-bible:bible:create` | Create a full design bible through 6 phased workflows |
| `/game-design-bible:bible:continue` | Resume work on an existing bible |
| `/game-design-bible:bible:expand` | Deep-dive a specific section |
| `/game-design-bible:bible:review` | Audit for contradictions, pillar drift, and pitfalls |

### Reference Commands

| Command | Description |
|---------|-------------|
| `/game-design-bible:reference:mda-framework` | MDA framework cheat-sheet |
| `/game-design-bible:reference:design-pillars` | Design pillars methodology and examples |

## Subagents

| Agent | Domain |
|-------|--------|
| `systems-designer` | Combat, economy, progression, AI, level structure |
| `narrative-designer` | Story, characters, world-building, dialogue systems |
| `art-audio-director` | Visual style, color palettes, sound design, UI/UX, controls |
| `game-design-reviewer` | Pillar consistency, contradictions, pitfall detection |

## Quick Start

```
/game-design-bible:bible:create "A roguelike deckbuilder set in space --scope indie"
```

The creator walks through 6 phases:

0. **Concept** — Core fantasy, genre, design pillars, non-goals, MDA analysis
1. **Core Loop** — Moment-to-moment action, feedback, reward, motivation
2. **Systems** — Parallel design of applicable game systems
3. **Narrative** — Story, characters, world (scaled to narrative weight)
4. **Art & Audio** — Visual style, color, sound, UI/UX, controls
5. **Technical & Production** — Engine, timeline, monetization

## Output Structure

```
docs/game-design-bible/
  INDEX.md                     # Master TOC + completion status
  DESIGN-PILLARS.md            # Quick reference
  00-concept/                  # Vision, pillars, MDA, non-goals
  01-core-loop/                # Core loop + prototype spec
  02-systems/                  # One file per system
  03-narrative/                # Story, characters, world, dialogue
  04-art-audio/                # Visual style, color, sound, UI, controls
  05-technical-production/     # Engine, assets, timeline, monetization
```

Every section file follows a consistent template with Pillar Alignment headers, Design Rationale, Open Questions, Cross-References, and Changelog sections.

## Design Methodology

Built on professional game design frameworks:
- **MDA Framework** (Hunicke, LeBlanc, Zubek) — Mechanics → Dynamics → Aesthetics
- **Schell's Elemental Tetrad** — Mechanics, Story, Aesthetics, Technology
- **Design Pillars** — 3-5 non-negotiable principles that guide all decisions
- **Core Loop Analysis** — Action → Feedback → Reward → Motivation cycle
