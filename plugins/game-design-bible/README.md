# Game Design Bible Plugin

Game Design Bible creation pipeline with per-phase gather/generate/audit, context isolation, parallel specialist agents, and pillar-first design.

## Installation

```bash
/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools game-design-bible
```

## Skills

### Full Pipeline

| Skill | Command | Description |
|-------|---------|-------------|
| **Bible Pipeline** | `/game-design-bible:bible-pipeline [concept] [--scope indie\|aa\|aaa]` | Full 6-phase pipeline with gather → generate → audit per phase, plus cross-cutting review. |

### Phase 0: Concept

| Skill | Command | Description |
|-------|---------|-------------|
| **Concept Gather** | `/game-design-bible:concept-gather [concept] [--scope]` | Core fantasy, genre, pillars, non-goals, MDA analysis Q&A + research. |
| **Concept Generate** | `/game-design-bible:concept-generate [context-file]` | Generate DESIGN-PILLARS.md, vision, MDA analysis, non-goals. Clean context. |
| **Audit Concept** | `/game-design-bible:audit-concept [bible-dir] [--context path]` | Pillar quality, MDA alignment, non-goals completeness audit. |

### Phase 1: Core Loop

| Skill | Command | Description |
|-------|---------|-------------|
| **Core Loop Gather** | `/game-design-bible:core-loop-gather [--bible-dir path]` | Core action, feedback, rewards, motivation, session structure Q&A. |
| **Core Loop Generate** | `/game-design-bible:core-loop-generate [context-file]` | Generate core-loop.md and prototype-spec.md. Clean context. |
| **Audit Core Loop** | `/game-design-bible:audit-core-loop [bible-dir] [--context path]` | Loop completeness, pillar coverage, prototype spec audit. |

### Phase 2: Systems

| Skill | Command | Description |
|-------|---------|-------------|
| **Systems Gather** | `/game-design-bible:systems-gather [--bible-dir path]` | Select which systems to design, scope/feel/boundaries per system. |
| **Systems Generate** | `/game-design-bible:systems-generate [context-file]` | Dispatch parallel systems-designer agents (one per system). |
| **Audit Systems** | `/game-design-bible:audit-systems [bible-dir] [--context path]` | Cross-system consistency, pillar alignment, balance audit. |

### Phase 3: Narrative

| Skill | Command | Description |
|-------|---------|-------------|
| **Narrative Gather** | `/game-design-bible:narrative-gather [--bible-dir path]` | Assess narrative weight, ask appropriate story/character/world questions. |
| **Narrative Generate** | `/game-design-bible:narrative-generate [context-file]` | Dispatch narrative-designer agent. Output scales by narrative weight. |
| **Audit Narrative** | `/game-design-bible:audit-narrative [bible-dir] [--context path]` | Narrative-systems consistency, character-gameplay integration audit. |

### Phase 4: Art & Audio

| Skill | Command | Description |
|-------|---------|-------------|
| **Art/Audio Gather** | `/game-design-bible:art-audio-gather [--bible-dir path]` | Visual style, audio mood, UI/UX, controls, accessibility Q&A. |
| **Art/Audio Generate** | `/game-design-bible:art-audio-generate [context-file]` | Dispatch art-audio-director agent. Creates 5 docs. |
| **Audit Art/Audio** | `/game-design-bible:audit-art-audio [bible-dir] [--context path]` | Style consistency, accessibility, pillar alignment audit. |

### Phase 5: Technical & Production

| Skill | Command | Description |
|-------|---------|-------------|
| **Technical Gather** | `/game-design-bible:technical-gather [--bible-dir path]` | Engine, tools, team, timeline, monetization Q&A. |
| **Technical Generate** | `/game-design-bible:technical-generate [context-file]` | Generate engine, asset breakdown, timeline, monetization docs. |
| **Audit Technical** | `/game-design-bible:audit-technical [bible-dir] [--context path]` | Scope/resource alignment, timeline realism audit. |

### Cross-Cutting Audit

| Skill | Command | Description |
|-------|---------|-------------|
| **Bible Review** | `/game-design-bible:bible-review [bible-dir] [--focus area]` | Pillar consistency + contradictions + 15 pitfalls. Dispatches reviewer agent, interactive resolution. |

### Bible-to-HLD Pipeline

| Skill | Command | Description |
|-------|---------|-------------|
| **HLD Pipeline** | `/game-design-bible:bible-to-hld-pipeline [bible-dir] [--features]` | Full gather → generate → audit pipeline for HLD generation. |
| **HLD Gather** | `/game-design-bible:bible-to-hld-gather [bible-dir] [--features]` | Read bible, select features, gather technical context. |
| **HLD Generate** | `/game-design-bible:bible-to-hld-generate [context-file]` | Dispatch parallel game-hld-writer agents per feature. |
| **Audit Game HLD** | `/game-design-bible:audit-game-hld [hld-dir] [--bible-dir]` | Pillar alignment, bible fidelity, template compliance audit. |

### Utility Skills

| Skill | Command | Description |
|-------|---------|-------------|
| **Continue** | `/game-design-bible:bible-continue [bible-dir] [phase]` | Resume incomplete bible. Reads INDEX.md, invokes appropriate gather skill. |
| **Expand** | `/game-design-bible:bible-expand [section-path] [aspect]` | Deep-dive a section: add detail, split into sub-files, or explore aspects. |

### Reference Skills (auto-invoked)

| Skill | Description |
|-------|-------------|
| **Design Pillars** | Pillar methodology, examples (TLoU, BotW, Hades), anti-patterns. Auto-invoked when pillars discussed. |
| **MDA Framework** | Mechanics → Dynamics → Aesthetics chain, 8 aesthetic types, validation method. Auto-invoked when MDA discussed. |

## Subagents

| Agent | Domain | Dispatched By |
|-------|--------|---------------|
| `systems-designer` | Combat, economy, progression, AI, level structure | systems-generate |
| `narrative-designer` | Story, characters, world-building, dialogue | narrative-generate |
| `art-audio-director` | Visual style, color, sound, UI/UX, controls | art-audio-generate |
| `game-design-reviewer` | Pillar consistency, contradictions, 15 pitfalls | bible-review |
| `game-hld-writer` | Game-development-aware HLD documents | bible-to-hld-generate |

## Pipeline Architecture

```
/game-design-bible:bible-pipeline "roguelike deckbuilder" --scope indie
  │
  ├─ Phase 0: concept-gather → concept-generate → audit-concept
  ├─ Phase 1: core-loop-gather → core-loop-generate → audit-core-loop
  ├─ Phase 2: systems-gather → systems-generate → audit-systems
  ├─ Phase 3+4 (parallel):
  │   ├─ narrative-gather → narrative-generate → audit-narrative
  │   └─ art-audio-gather → art-audio-generate → audit-art-audio
  ├─ Phase 5: technical-gather → technical-generate → audit-technical
  └─ Cross-cutting: bible-review (pillar consistency + contradictions + pitfalls)
```

Every phase runs with `context: fork` — clean context, no accumulated history. Only file paths pass between phases.

## Output Structure

```
docs/game-design-bible/
  context/                        # Gathered context files (persist as artifacts)
    concept-context.md
    core-loop-context.md
    systems-context.md
    narrative-context.md
    art-audio-context.md
    technical-context.md
  reviews/                        # Audit reports
    concept-AUDIT.md
    core-loop-AUDIT.md
    systems-AUDIT.md
    narrative-AUDIT.md
    art-audio-AUDIT.md
    technical-AUDIT.md
    bible-review-AUDIT.md
  INDEX.md                        # Master TOC + completion status
  DESIGN-PILLARS.md               # Quick reference
  00-concept/                     # Vision, pillars, MDA, non-goals
  01-core-loop/                   # Core loop + prototype spec
  02-systems/                     # One file per system
  03-narrative/                   # Story, characters, world, dialogue
  04-art-audio/                   # Visual style, color, sound, UI, controls
  05-technical-production/        # Engine, assets, timeline, monetization
```

## Audit Resolution

Each audit skill walks through issues one at a time:
1. **⭐ Recommended fix** — most likely correct
2. **Alternative fix(es)** — different approaches
3. **🔍 Research code & web** — forks parallel agents for deeper investigation
4. **Skip** — leave as-is, logged in report

Verdicts: **PASS** / **PASS WITH WARNINGS** / **FAIL**

## Design Methodology

Built on professional game design frameworks:
- **Design Pillars** — 3-5 non-negotiable principles with "What This Rules Out" lists
- **MDA Framework** (Hunicke, LeBlanc, Zubek) — Mechanics → Dynamics → Aesthetics
- **Core Loop Analysis** — Action → Feedback → Reward → Motivation cycle
- **Pillar-First Validation** — every design decision checked against pillars
