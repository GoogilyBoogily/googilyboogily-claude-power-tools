---
name: art-audio-gather
description: "Gather context for the Art & Audio phase (Phase 4) of a Game Design Bible. Interactive Q&A about visual style, color, sound design, UI/UX, controls, and accessibility. Dispatches research."
disable-model-invocation: true
context: fork
argument-hint: "[--bible-dir path]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Art & Audio Phase — Context Gathering

Gather all context needed to write the Art & Audio phase (Phase 4) of a Game Design Bible. This skill runs an interactive Q&A session about visual style, audio direction, UI/UX philosophy, controls, and accessibility. It dispatches parallel research and compiles a structured context file that the `art-audio-generate` skill consumes.

## Input

$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Directory**: `--bible-dir <path>` (default: `docs/game-design-bible/`)

## Source Integrity Rules

**Every factual claim in the context file must be traceable to research performed in this session.**

1. **Cite your work.** When referencing design pillars, concept documents, or art/audio conventions, cite the specific file path and section that informed the claim.
2. **Never reference prior Claude sessions or Claude memory.** Do not use phrases like "from our previous conversation," "as we discussed before," "based on prior analysis." Each context file stands on its own.
3. **Assumptions are labeled, not hidden.** If you lack evidence for a claim, label it explicitly in the Open Questions section.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Phase 1: Load Existing Context

Phase 4 depends primarily on Phase 0 (Concept) for tone, genre, and pillars.

1. Validate `<bible-dir>/INDEX.md` exists. If not, inform the user: "No Game Design Bible found at `<bible-dir>`. Create one first with `/game-design-bible:concept-gather`." — then STOP.
2. Read `<bible-dir>/DESIGN-PILLARS.md` — extract all pillar names and their definitions.
3. Read `<bible-dir>/00-concept/mda-analysis.md` — extract target aesthetics (these directly inform art and audio direction).
4. Read `<bible-dir>/00-concept/vision.md` — extract genre, platform, audience, and core fantasy.

**CHECKPOINT — Confirm Foundation:**
Present what you found:
- Design pillars (name + one-line summary each)
- Target aesthetics from MDA analysis
- Genre, platform, and target audience
- Core fantasy and emotional tone

Ask: "Does this match your understanding? Anything I should know before we discuss art and audio direction?"

### Phase 2: Visual Style Questions

Ask about visual style using AskUserQuestion:

1. **Visual References** — "Name 2-3 games, films, or art styles that capture the visual feel you want. What specifically do you like about each?" Push for specifics — not just "Hollow Knight" but "Hollow Knight's hand-drawn aesthetic with muted blues and the way environments tell stories through decay."

2. **Art Style** — "What art style are you targeting? (Realistic, stylized, pixel art, cel-shaded, low-poly, hand-drawn, voxel, mixed media, etc.) How does this choice serve your core fantasy?"

3. **Visual Mood** — "What visual mood should dominate? (Dark and oppressive, bright and cheerful, muted and melancholic, vibrant and chaotic, clean and minimal, etc.) Does the mood shift across the game?"

### Phase 3: Audio Questions

Ask about audio direction:

1. **Music Genre & Mood** — "What genre of music fits your game? (Orchestral, electronic, ambient, chiptune, jazz, folk, hybrid, etc.) Should music be prominent or subtle? Name 1-2 game soundtracks that match the vibe."

2. **Adaptive Audio** — "Should music respond to gameplay? (Combat music transitions, exploration ambiance shifts, dynamic layering based on intensity, etc.) Or is a fixed soundtrack sufficient?"

3. **Silence Strategy** — "How do you use silence? Some games use silence as a design tool (tension, isolation, contrast). Others fill every moment with sound. Where does your game fall?"

4. **SFX Philosophy** — "Should sound effects be realistic, exaggerated, stylized? How important is audio feedback for gameplay clarity (e.g., audio cues for off-screen threats, timing windows, resource collection)?"

### Phase 4: UI/UX Questions

Ask about UI and UX philosophy:

1. **HUD Approach** — "What is your HUD philosophy? (Minimal/immersive with diegetic UI, traditional with health bars and minimap, adaptive that appears on demand, or fully clean with no HUD?) How much information should be visible at all times?"

2. **Menu Flow** — "Describe the ideal menu experience. Should menus be fast and functional, or atmospheric and immersive? How many layers deep should the player need to navigate for common actions?"

3. **Information Density** — "How much information does the player need at any given time? Is this a game where knowledge is power (complex UI okay) or where simplicity enables flow (minimal UI)?"

### Phase 5: Controls & Input Questions

Ask about controls and input:

1. **Input Feel** — "How should controls feel? (Tight and responsive, weighty and deliberate, floaty and forgiving, snappy with animation cancels?) What is the relationship between input and character response?"

2. **Platform-Specific Needs** — "Which platforms are primary? Are there platform-specific control considerations? (Controller vs. keyboard+mouse parity, touch adaptation, gyro support, etc.)"

### Phase 6: Accessibility Questions

Ask about accessibility priorities:

"Game accessibility covers 6 main categories. Which are your priorities, and how deep do you want to go?

1. **Input accessibility** — Remappable controls, one-handed modes, switch access, input timing forgiveness
2. **Visual accessibility** — Colorblind modes, high contrast, scalable UI, screen reader support
3. **Audio accessibility** — Subtitles, visual sound indicators, deaf-friendly design
4. **Motor accessibility** — Difficulty options, auto-aim, reduced precision requirements, toggle vs. hold
5. **Cognitive accessibility** — Tutorials, waypoints, quest logs, reduced information overload
6. **Motion sensitivity** — Camera shake toggles, FOV options, motion blur control, reduced screen effects

Which categories are highest priority for your game and audience?"

### Phase 7: Parallel Research

Dispatch two parallel Tasks in a single message:

**Task 1 — Art Style Research:**
```
Search the web for visual style and art direction in [genre] games, with focus on the references the user mentioned: [visual references].
Focus on: how these references achieve their visual identity, color theory in game art direction, technical considerations for [art style] on [platform], art direction trends in [genre].
Use WebSearch and WebFetch. Return structured findings with URLs.
```

**Task 2 — Audio Design Research:**
```
Search the web for audio design and sound direction in [genre] games.
Focus on: adaptive audio implementation patterns, sound design philosophy for [genre], how [music genre] is used effectively in games, accessibility audio design best practices.
Use WebSearch and WebFetch. Return structured findings with URLs.
```

After both return, review findings for relevance. Discard noise; keep only findings that inform art and audio design.

**CHECKPOINT — Present Research Findings:**
Present a summary of both research tasks.

Ask: "Here's what I found from researching art styles and audio design. Does this align with your vision? Should I dig deeper into any area?"

### Phase 8: Compile Context File

Assemble all gathered information into a structured context file:

```markdown
# Art & Audio Context: [Game Name]

**Gathered:** [today's date]
**Bible Directory:** [bible-dir]

## Visual References
[2-3 referenced games/films/art with what specifically the user likes about each]

## Art Style
[Target art style, visual mood, mood shifts across the game]

## Audio Mood
[Music genre, prominent vs. subtle, reference soundtracks, SFX philosophy]

## Adaptive Audio
[Whether music responds to gameplay, layering approach, silence strategy]

## UI Philosophy
[HUD approach, menu flow, information density]

## Controls Preferences
[Input feel, platform-specific needs, primary input methods]

## Accessibility Priorities
[Which of the 6 categories are prioritized, depth of implementation for each]

## MDA Context
[Target aesthetics from MDA analysis and how they inform art/audio direction]

## Pillar Context
[All design pillars from DESIGN-PILLARS.md with notes on how art/audio serves each one]

## Scope
[Project scope tier: indie/aa/aaa — affects art complexity, music budget, UI polish level]

## Web Research: Art Style
[Structured findings from art style research, with URLs]

## Web Research: Audio Design
[Structured findings from audio design research, with URLs]

## Open Questions
- [Anything unresolved, marked as assumptions, or needing further exploration]

## Template

The Art & Audio phase produces:
- `04-art-audio/visual-style.md` — art direction, references, character/environment direction, visual feedback
- `04-art-audio/color-palette.md` — primary/secondary/accent colors, functional colors, area palettes
- `04-art-audio/sound-design.md` — music direction, adaptive audio, SFX, silence strategy
- `04-art-audio/ui-ux.md` — HUD philosophy, menu flow, accessibility, UI animation
- `04-art-audio/controls.md` — input philosophy, per-platform mappings, input feel, accessibility
```

### Phase 9: Save and Return

1. Create the context directory if needed: `<bible-dir>/context/`
2. Write the context file to `<bible-dir>/context/art-audio-context.md`
3. Return the context file path to the caller.

Tell the user: "Context file saved to `<path>`. Review and edit it if needed, then run `/game-design-bible:art-audio-generate <path>` to generate the Phase 4 documents."
