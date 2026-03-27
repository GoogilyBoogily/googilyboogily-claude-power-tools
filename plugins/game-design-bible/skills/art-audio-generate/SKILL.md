---
name: art-audio-generate
description: "Generate Art & Audio phase (Phase 4) documents by dispatching the art-audio-director agent. Creates visual style, color palette, sound design, UI/UX, and controls docs. Clean context."
disable-model-invocation: true
context: fork
argument-hint: "[context-file] [--output-dir path]"
allowed-tools: Read, Write, Edit, Glob, Grep, Task, Bash(mkdir:*)
model: opus
---

# Art & Audio Phase — Document Generator

Generate the complete Art & Audio phase (Phase 4) of a Game Design Bible from a previously gathered context file. This skill runs with clean context and is non-interactive — all questions were answered during the gather phase. Dispatches the art-audio-director agent to produce all five documents.

## Input

$ARGUMENTS — path to the context file (e.g., `docs/game-design-bible/context/art-audio-context.md`), and optionally:
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
   - Visual references, art style, visual mood
   - Audio mood, adaptive audio, silence strategy, SFX philosophy
   - UI philosophy (HUD, menus, information density)
   - Controls preferences (input feel, platform needs)
   - Accessibility priorities (which of 6 categories, depth)
   - MDA context (target aesthetics)
   - Pillar context (design pillars and how art/audio serves them)
   - Scope tier (indie / aa / aaa)
   - Web research findings
   - Open questions
   - Output directory

### Step 2: Create Directory Structure

```bash
mkdir -p <output-dir>/04-art-audio
```

### Step 3: Dispatch Art-Audio Director Agent

Dispatch the art-audio-director agent via Task with the full context. The agent must NOT ask questions — all context has been gathered.

Include in the Task prompt:
- The complete context file contents
- Explicit instructions: "Do not ask questions. All context has been gathered. Generate documents based solely on the provided context."
- The output directory path
- The document specifications (below)

Every art & audio document follows this template structure:

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
| [today] | Initial creation | Phase 4 — Art & Audio |
```

### Step 4: Generate Documents

The agent produces five files in `<output-dir>/04-art-audio/`:

---

#### File 1: 04-art-audio/visual-style.md

Sections:
- **Art Direction Statement**: 2-3 paragraph manifesto for the game's visual identity. What makes this game visually distinctive.
- **Visual References**: The 2-3 reference works with detailed analysis of what to borrow and what to avoid from each. Include specific elements: lighting, silhouette language, texture approach, animation style.
- **Character Art Direction**: Character design principles — proportions, silhouette readability, color coding, costume philosophy. How characters communicate personality through visual design.
- **Environment Art Direction**: Environment design principles — scale, density, landmark philosophy, environmental storytelling approach. How environments communicate gameplay information.
- **Visual Feedback Language**: How the game communicates state through visuals — damage indicators, health states, interactive object highlighting, enemy telegraphing, collectible/reward visual language.
- **Technical Constraints**: Art style considerations based on platform and scope — polygon budgets, texture resolution targets, shader complexity, performance considerations.
- **Design Rationale**: How the visual style serves the design pillars and core fantasy.
- **Open Questions**: Visual-specific unresolved items.

---

#### File 2: 04-art-audio/color-palette.md

Sections:
- **Primary Palette**: 3-5 core colors with hex values that define the game's visual identity. Each color with usage guidelines and emotional associations.
- **Secondary Palette**: 3-5 supporting colors with hex values for variety and depth. When and where each is used.
- **Accent Colors**: 1-3 high-impact colors with hex values reserved for emphasis, rewards, or special moments.
- **Functional Colors**: Colors assigned to gameplay functions:
  - Health / vitality
  - Danger / damage / enemy
  - Interactive / selectable
  - Reward / positive feedback
  - UI text / background / borders
  - Status effects (if applicable)
- **Area Palettes**: How the color palette shifts across different game areas, levels, or biomes. Each area with its dominant colors and mood.
- **Accessibility**: Colorblind-safe alternatives for all functional colors. Patterns, shapes, or labels that supplement color-based communication. Notes on contrast ratios for UI elements.
- **Design Rationale**: How the color palette serves the emotional tone, design pillars, and gameplay clarity.
- **Open Questions**: Color-specific unresolved items.

---

#### File 3: 04-art-audio/sound-design.md

Sections:
- **Music Direction**: Genre, instrumentation, mood arc across the game. How music supports the emotional journey. Reference soundtracks and what to learn from each.
- **Adaptive Audio**: How music responds to gameplay state — combat transitions, exploration layering, intensity curves, boss encounter escalation. Technical approach (horizontal re-sequencing, vertical layering, stinger-based, etc.).
- **SFX Philosophy**: Sound effect design principles — realistic vs. stylized, feedback priority hierarchy, audio cue design for gameplay clarity. Key sound categories: UI sounds, player actions, enemy actions, environmental ambience, collectibles/rewards.
- **Audio Feedback Map**: A mapping of gameplay events to audio responses:
  - Player actions → sounds
  - Enemy actions → sounds
  - Environmental events → sounds
  - UI interactions → sounds
  - Rewards/progression → sounds
- **Silence Strategy**: How and when the game uses silence or reduced audio as a design tool. Quiet moments, tension building, contrast between loud and quiet areas.
- **Audio Budget**: Estimated scope for music tracks, SFX count, voice lines (if any). Realistic targets based on project scope tier.
- **Design Rationale**: How sound design serves the design pillars and target MDA aesthetics.
- **Open Questions**: Audio-specific unresolved items.

---

#### File 4: 04-art-audio/ui-ux.md

Sections:
- **HUD Philosophy**: What information is always visible, what appears on demand, what requires a menu. Diegetic vs. non-diegetic UI elements. HUD density philosophy.
- **Menu Flow**: Menu hierarchy — main menu, pause menu, settings, inventory (if applicable). Navigation principles: maximum clicks/button presses to reach common actions. Menu transition animations and feel.
- **UI Visual Language**: How UI elements match the game's art direction. Typography direction. Icon design principles. Button/panel styling. UI color usage (referencing functional colors from color-palette.md).
- **UI Animation**: How UI elements animate — entrance/exit transitions, feedback animations (button press, selection change, error shake), loading/progress indicators.
- **Accessibility**: Dedicated section covering all 6 accessibility categories:
  - **Input Accessibility**: Remappable controls, alternative input support, input timing forgiveness, one-handed mode considerations.
  - **Visual Accessibility**: Colorblind modes (protanopia, deuteranopia, tritanopia), high contrast mode, scalable UI/text size, screen reader compatibility.
  - **Audio Accessibility**: Subtitle system (size, background, speaker identification), visual sound indicators for gameplay-critical audio, deaf-friendly alternatives for audio cues.
  - **Motor Accessibility**: Difficulty options, auto-aim/assist features, toggle vs. hold options, reduced precision requirements, adjustable timing windows.
  - **Cognitive Accessibility**: Tutorial system, waypoint/objective markers, quest/task log, information pacing, complexity scaling.
  - **Motion Sensitivity**: Camera shake toggle, FOV slider, motion blur control, screen effect intensity options, reduced camera movement modes.
- **Design Rationale**: How UI/UX approach serves the design pillars and player experience.
- **Open Questions**: UI/UX-specific unresolved items.

---

#### File 5: 04-art-audio/controls.md

Sections:
- **Input Philosophy**: How controls should feel — the relationship between player input and on-screen response. Response curves, input buffering, animation priority vs. input priority.
- **Per-Platform Mappings**: Control schemes for each target platform:
  - **Gamepad**: Button mapping diagram with action assignments. Stick sensitivity defaults. Trigger thresholds.
  - **Keyboard + Mouse**: Key bindings with primary and alternative keys. Mouse sensitivity defaults. Scroll wheel usage.
  - **Touch** (if applicable): Touch zone layout, gesture mapping, virtual button placement.
  - **Other** (if applicable): Motion controls, VR controllers, etc.
- **Input Feel Parameters**: Dead zones, acceleration curves, input buffering window, coyote time (if platformer), aim assist parameters (if applicable). Default values with adjustment ranges.
- **Responsiveness**: Target input latency, animation cancel windows, input queue depth. How responsive should the game feel on a spectrum from "instant and snappy" to "weighty and committed."
- **Accessibility Input Options**: Remapping support, one-handed alternatives, switch/adaptive controller compatibility, hold vs. toggle for sustained inputs, adjustable timing windows for QTEs or precision inputs.
- **Design Rationale**: How the control scheme serves the design pillars and core gameplay feel.
- **Open Questions**: Controls-specific unresolved items.

---

### Step 5: Update INDEX.md

Read `<output-dir>/INDEX.md` and update Phase 4:

Replace:
```markdown
### ⬜ Phase 4: Art & Audio
> *Not started*
```

With:
```markdown
### ✅ Phase 4: Art & Audio
- [Visual Style](04-art-audio/visual-style.md) — art direction, references, visual feedback language
- [Color Palette](04-art-audio/color-palette.md) — primary/secondary/accent/functional colors with hex values
- [Sound Design](04-art-audio/sound-design.md) — music, adaptive audio, SFX, silence strategy
- [UI/UX](04-art-audio/ui-ux.md) — HUD philosophy, menu flow, accessibility
- [Controls](04-art-audio/controls.md) — input philosophy, per-platform mappings, input feel
```

Also add to the Context Files section:
```markdown
- [Art & Audio Context](context/art-audio-context.md) — gathered context for Phase 4
```

### Step 6: Verify

Re-read each generated file to verify:
1. All pillar names are consistent with DESIGN-PILLARS.md.
2. Color palette hex values are valid.
3. Functional colors cover all gameplay-critical uses.
4. Accessibility section in ui-ux.md covers all 6 categories.
5. Per-platform control mappings exist for all declared target platforms.
6. No `[ASSUMPTION]` tags are present without corresponding Open Questions entries.
7. Cross-references use correct relative paths.

### Step 7: Report

List all created files with their paths:

```
## Files Created

1. <output-dir>/04-art-audio/visual-style.md — art direction and visual feedback language
2. <output-dir>/04-art-audio/color-palette.md — color system with hex values and accessibility
3. <output-dir>/04-art-audio/sound-design.md — music, SFX, adaptive audio, silence
4. <output-dir>/04-art-audio/ui-ux.md — HUD, menus, full accessibility coverage
5. <output-dir>/04-art-audio/controls.md — input feel and per-platform mappings
6. <output-dir>/INDEX.md — updated Phase 4 status
```

## Output

Report: "Phase 4 (Art & Audio) documents generated. Run `/game-design-bible:audit-art-audio <output-dir> --context <context-file-path>` to audit them."

Return the list of created file paths.
