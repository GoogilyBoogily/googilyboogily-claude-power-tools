---
name: technical-generate
description: "Generate Technical & Production phase (Phase 5) documents from a gathered context file. Creates engine-and-tools, asset-breakdown, timeline, and monetization docs. Clean context, non-interactive."
disable-model-invocation: true
context: fork
argument-hint: "[context-file] [--output-dir path]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(mkdir:*)
model: opus
---

# Technical & Production Generator

Generate the Technical & Production phase (Phase 5) documents from a previously gathered context file. This skill runs with clean context and is non-interactive — all questions were answered during the gather phase.

## Input

$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Context File**: First non-flag argument (e.g., `docs/game-design-bible/context/technical-context.md`)
- **Output Directory**: `--output-dir <path>` (default: derived from context file's Bible Directory, i.e., `<bible-dir>/05-technical-production/`)

## Source Integrity Rules

**Every factual claim in these documents must be traceable to the context file.**

1. **Ground every claim.** Every design statement must trace back to a specific entry in the context file (user answers, pillar definitions, prior phase content, or web research with URLs).
2. **Flag ungrounded claims.** If you need to state something not in the context file, mark it explicitly as `[ASSUMPTION]` in the document.
3. **Never invent details.** If the context file doesn't cover something, put it in Open Questions — don't fabricate.

## Process

### Step 1: Read Context and Pillars

1. Read the context file at the path provided in `$ARGUMENTS`.
2. Read `<bible-dir>/DESIGN-PILLARS.md` (derive bible-dir from the context file's Bible Directory field).
3. Extract:
   - Engine & tools, team structure, timeline, monetization
   - Technical constraints and asset pipeline
   - Prior phase summary with file counts and scope assessment
   - All design pillars with definitions
   - Web research findings
   - Open questions

### Step 2: Create Output Directory

```bash
mkdir -p <output-dir>
```

Use Glob to verify `<output-dir>` exists.

### Step 3: Generate engine-and-tools.md

Write `<output-dir>/engine-and-tools.md` following this structure:

```markdown
# Engine & Tools — [Game Name]

> **Pillar Alignment:** [which design pillars the engine/tools choices serve]

## Overview

[2-3 paragraphs summarizing the engine choice, development stack, and team structure. Explain how these choices align with the game's scope and design pillars.]

## Engine Choice

### [Engine Name]

- **Version:** [version, if specified]
- **Why This Engine:** [Rationale grounded in genre, platform, team experience, and design pillars. Reference web research findings.]
- **Key Strengths for This Project:** [Specific capabilities that serve this game type]
- **Known Limitations:** [Limitations relevant to this project and mitigation strategies]

### Recommended Packages / Plugins

[Based on web research — list relevant extensions, packages, or plugins with brief descriptions]

| Package | Purpose | Source |
|---------|---------|--------|
| [name] | [what it provides] | [URL from research] |

## Development Tools

| Category | Tool | Purpose |
|----------|------|---------|
| IDE | [tool] | [primary development environment] |
| Version Control | [tool] | [source control] |
| Project Management | [tool] | [task tracking, planning] |
| Art Creation | [tool(s)] | [asset creation] |
| Audio | [tool(s)] | [audio creation/middleware] |
| CI/CD | [tool(s)] | [build automation] |

## Team Structure

[Team composition, roles, and responsibilities]

| Role | Count | Responsibilities |
|------|-------|-----------------|
| [role] | [number] | [key responsibilities] |

### Workflow

[How the team collaborates — branching strategy, review process, asset handoff pipeline]

## Technical Constraints

### Platform Requirements

[Platform-specific constraints from the context file — hardware, OS, store requirements]

### Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Frame Rate | [target FPS] | [why this target] |
| Load Times | [target] | [why this target] |
| File Size | [budget] | [platform constraint or distribution reason] |
| Memory | [budget] | [minimum spec target] |

### Minimum Spec

[Minimum hardware/software requirements, if defined]

## Design Rationale

[Why this technical stack was chosen over alternatives. Reference web research for engine comparison data. Explain how the stack serves the design pillars.]

## Open Questions

- [Technical unknowns, unresolved decisions, risks]

## Cross-References

- **Design Pillars:** [path to DESIGN-PILLARS.md]
- **Concept:** [paths to 00-concept/ files]
- **Asset Breakdown:** [path to asset-breakdown.md]
- **Timeline:** [path to timeline.md]
- **Context File:** [path to context file]

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| [today] | Initial creation | Phase 5 — Technical & Production |
```

### Step 4: Generate asset-breakdown.md

Write `<output-dir>/asset-breakdown.md` following this structure. Base all estimates on content actually designed in prior phases — scan the Prior Phase Summary and Scope Assessment sections of the context file.

```markdown
# Asset Breakdown — [Game Name]

> **Pillar Alignment:** [which design pillars asset production serves]

## Overview

[1-2 paragraphs summarizing the total asset scope. Ground in the Prior Phase Summary — reference specific content designed in phases 2-4 that requires assets.]

## Asset Estimates by Category

### Characters

| Asset | Source Phase | Count | Notes |
|-------|-------------|-------|-------|
| [character name/type] | Phase 3: Narrative | [count] | [animations, variants, etc.] |

**Subtotal:** [total character assets]

### Environments

| Asset | Source Phase | Count | Notes |
|-------|-------------|-------|-------|
| [environment name/type] | Phase 2/4 | [count] | [tilesets, props, lighting, etc.] |

**Subtotal:** [total environment assets]

### UI Screens

| Screen | Source Phase | Count | Notes |
|--------|-------------|-------|-------|
| [screen name] | Phase 2 | [count] | [interactive elements, states] |

**Subtotal:** [total UI assets]

### Audio — Sound Effects

| SFX Category | Source Phase | Count | Notes |
|--------------|-------------|-------|-------|
| [category] | Phase 4 | [count] | [variations, layers] |

**Subtotal:** [total SFX]

### Audio — Music

| Track | Source Phase | Duration | Notes |
|-------|-------------|----------|-------|
| [track/theme] | Phase 4 | [estimated length] | [looping, adaptive, etc.] |

**Subtotal:** [total music tracks]

### Animations

| Animation Category | Source Phase | Count | Notes |
|--------------------|-------------|-------|-------|
| [category] | Phase 2/3 | [count] | [per-character, shared, etc.] |

**Subtotal:** [total animations]

## Total Asset Summary

| Category | Count |
|----------|-------|
| Characters | [total] |
| Environments | [total] |
| UI Screens | [total] |
| Sound Effects | [total] |
| Music Tracks | [total] |
| Animations | [total] |
| **Grand Total** | **[total]** |

## Production Notes

[Any notes about asset production efficiency — shared assets, modular approaches, procedural generation that reduces manual asset count]

## Design Rationale

[Why these asset counts are appropriate for the scope. Reference the team size and timeline from the context file. Flag any areas where the asset volume may be a risk.]

## Open Questions

- [Unknown asset needs, unresolved art direction decisions, technical unknowns about asset formats]

## Cross-References

- **Art & Audio:** [paths to 04-art-audio/ files]
- **Systems:** [paths to 02-systems/ files]
- **Narrative:** [paths to 03-narrative/ files]
- **Engine & Tools:** [path to engine-and-tools.md]
- **Timeline:** [path to timeline.md]
- **Context File:** [path to context file]

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| [today] | Initial creation | Phase 5 — Technical & Production |
```

### Step 5: Generate timeline.md

Write `<output-dir>/timeline.md` following this structure:

```markdown
# Timeline — [Game Name]

> **Pillar Alignment:** [which design pillars the timeline prioritizes]

## Overview

[1-2 paragraphs summarizing the development timeline. Reference the team size, scope tier, and asset volume to justify the timeline. Ground in web research about comparable game development timelines.]

## Milestone Roadmap

### 🔧 Pre-Production
- **Duration:** [estimated time]
- **Deliverables:**
  - Game Design Bible complete (all phases)
  - Technical prototype / proof of concept
  - Art style guide finalized
  - Development pipeline established
- **Exit Criteria:** Design bible audited, prototype validates core loop

### 🎮 Vertical Slice
- **Duration:** [estimated time]
- **Deliverables:**
  - One complete, polished gameplay segment
  - Core loop fully functional
  - Art at target quality for one area
  - Audio placeholder or target quality for one area
- **Exit Criteria:** Vertical slice demonstrates all design pillars in action

### 🚧 Alpha
- **Duration:** [estimated time]
- **Deliverables:**
  - All core systems implemented
  - All content rough-in (placeholder-quality assets acceptable)
  - UI/UX flow complete
  - Major bugs identified
- **Exit Criteria:** Game is playable start-to-finish with placeholder content

### 🧪 Beta
- **Duration:** [estimated time]
- **Deliverables:**
  - All content at final quality
  - Bug fixing and polish
  - Performance optimization
  - Playtesting and balance tuning
- **Exit Criteria:** No critical bugs, performance targets met, playtest feedback addressed

### 🚀 Launch
- **Duration:** [estimated time for launch prep]
- **Deliverables:**
  - Store page and marketing materials
  - Platform certification (if applicable)
  - Day-one patch preparation
  - Community and support infrastructure
- **Exit Criteria:** Game passes platform certification, store page live

## Timeline Visualization

| Month | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|-------|---|---|---|---|---|---|---|---|---|----|----|-----|
| Pre-Production | ██ | ██ | | | | | | | | | | |
| Vertical Slice | | ██ | ██ | ██ | | | | | | | | |
| Alpha | | | | ██ | ██ | ██ | ██ | | | | | |
| Beta | | | | | | | ██ | ██ | ██ | | | |
| Launch | | | | | | | | | ██ | ██ | | |

*Adjust month count and milestone spans to match the actual target timeline from the context file.*

## Buffer & Risk Mitigation

[Include buffer time between milestones. Identify the highest-risk areas for schedule slip based on asset volume, team size, and scope.]

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| [risk] | [high/medium/low] | [high/medium/low] | [how to mitigate] |

## Design Rationale

[Why this timeline structure was chosen. Reference web research about similar games' development timelines. Explain how the milestone ordering validates design pillars progressively.]

## Open Questions

- [Timeline uncertainties, external dependencies, unknown scope areas]

## Cross-References

- **Asset Breakdown:** [path to asset-breakdown.md]
- **Engine & Tools:** [path to engine-and-tools.md]
- **Monetization:** [path to monetization.md, if applicable]
- **Core Loop / Prototype Spec:** [paths to 01-core-loop/ files]
- **Context File:** [path to context file]

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| [today] | Initial creation | Phase 5 — Technical & Production |
```

### Step 6: Generate monetization.md (Conditional)

Check the context file's Monetization section. **If the revenue model is "none", "game jam", "free", or similar non-commercial models, SKIP this file entirely.** Do not create an empty or stub monetization document.

If monetization applies, write `<output-dir>/monetization.md`:

```markdown
# Monetization — [Game Name]

> **Pillar Alignment:** [which design pillars monetization must respect]

## Overview

[1-2 paragraphs describing the revenue model and how it aligns with (or at minimum does not contradict) the design pillars.]

## Revenue Model

- **Model:** [premium/F2P/subscription/Early Access/etc.]
- **Price Point:** [price or pricing tier]
- **Platform Distribution:** [Steam, itch.io, mobile stores, etc.]

## Pricing Strategy

[Justification for the price point. Reference comparable titles from web research. Consider scope, content volume, and target audience willingness to pay.]

### Comparable Title Pricing

| Game | Price | Scope Comparison | Source |
|------|-------|-----------------|--------|
| [comparable game] | [price] | [how it compares to this project] | [URL] |

## Monetization Details

[Specifics of the monetization approach — what is sold, when, how]

### If Premium:
- Base game content included
- DLC/expansion strategy (if any)
- Discount strategy (wishlists, launch discount, seasonal sales)

### If F2P:
- What is free vs. paid
- Monetization mechanics (cosmetics, battle pass, etc.)
- Conversion funnel expectations

### If Early Access:
- EA pricing vs. full release pricing
- Content cadence during EA
- EA duration target

## Ethical Guidelines

[Monetization ethics aligned with design pillars. This section is REQUIRED for F2P models.]

- **No pay-to-win:** [How monetization avoids giving paying players gameplay advantages — if applicable]
- **Transparency:** [How pricing and value are communicated to players]
- **Respect for player time:** [How monetization avoids exploitative time-gating or FOMO]
- **Pillar Alignment Check:** [For each design pillar, confirm monetization does not contradict it]

| Pillar | Compatible? | Explanation |
|--------|-------------|-------------|
| [pillar name] | ✅ / ⚠️ | [how monetization respects or risks conflicting with this pillar] |

## Launch & Post-Launch Revenue

[Revenue expectations and post-launch monetization plan, if applicable]

## Design Rationale

[Why this monetization model was chosen. Reference web research about genre monetization trends and player expectations.]

## Open Questions

- [Pricing unknowns, platform fee considerations, regional pricing, revenue projections]

## Cross-References

- **Design Pillars:** [path to DESIGN-PILLARS.md]
- **Timeline:** [path to timeline.md]
- **Vision / Target Audience:** [path to 00-concept/vision.md]
- **Non-Goals:** [path to 00-concept/non-goals.md]
- **Context File:** [path to context file]

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| [today] | Initial creation | Phase 5 — Technical & Production |
```

### Step 7: Update INDEX.md

Read `<bible-dir>/INDEX.md` and update:

1. Change Phase 5 status from `⬜` to `✅`:
   ```
   ### ✅ Phase 5: Technical & Production
   - [Engine & Tools](05-technical-production/engine-and-tools.md) — engine choice, dev tools, team structure
   - [Asset Breakdown](05-technical-production/asset-breakdown.md) — estimated asset counts by type
   - [Timeline](05-technical-production/timeline.md) — milestone roadmap from pre-production to launch
   - [Monetization](05-technical-production/monetization.md) — revenue model and ethical guidelines
   ```
   *Omit the Monetization line if that file was skipped.*

2. Add the context file to the Context Files section:
   ```
   - [Technical Context](context/technical-context.md) — gathered context for Phase 5
   ```

### Step 8: Validate

After writing all files, perform a validation pass:

1. Read DESIGN-PILLARS.md and extract all pillar names.
2. Verify all generated files reference pillar alignment consistently.
3. Cross-check asset breakdown estimates against what was actually designed in prior phases.
4. Verify timeline is reasonable given team size and asset volume.
5. If monetization.md exists, verify it does not contradict any design pillar or non-goal.
6. Flag any `[ASSUMPTION]` tags that lack corresponding Open Questions entries.

### Step 9: Report

Present a completion summary:

```
## Phase 5: Technical & Production — Complete 🎉

### Files Created
1. <output-dir>/engine-and-tools.md — engine choice, dev tools, team structure
2. <output-dir>/asset-breakdown.md — [N] total assets estimated
3. <output-dir>/timeline.md — [N]-month roadmap
4. <output-dir>/monetization.md — [revenue model] (or "Skipped — no monetization")

### Bible Status
All 6 phases complete. Total files: [count across all phases].

### Open Questions
[count] open questions across Phase 5 documents.

### Suggested Next Step
Run `/game-design-bible:audit-technical <bible-dir> --context <context-file>` to audit the technical documents, or run a full bible review across all phases.
```

Return all created file paths.
