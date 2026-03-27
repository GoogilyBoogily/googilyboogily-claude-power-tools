---
name: concept-generate
description: "Generate Concept phase (Phase 0) documents from a gathered context file. Creates DESIGN-PILLARS.md, vision, pillars detail, MDA analysis, and non-goals. Clean context, non-interactive."
disable-model-invocation: true
context: fork
argument-hint: "[context-file] [--output-dir path]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(mkdir:*)
model: opus
---

# Concept Phase — Document Generator

Generate the complete Concept phase (Phase 0) of a Game Design Bible from a previously gathered context file. This skill runs with clean context and is non-interactive — all questions were answered during the gather phase.

## Input

$ARGUMENTS — path to the context file (e.g., `docs/game-design-bible/context/concept-context.md`), and optionally:
- `--output-dir <path>` — override the output directory from the context file

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Context File**: First non-flag argument
- **Output Dir**: `--output-dir <path>`, or extracted from the context file's `Output Dir` field

## Source Integrity Rules

**Every factual claim in these documents must be traceable to the context file.**

1. **Ground every claim.** Every statement must trace back to the context file — user answers, MDA analysis, web research with URLs, or design pillar deliberations.
2. **Flag ungrounded claims.** If you need to state something not in the context file, mark it explicitly as `[ASSUMPTION]`.
3. **Never invent details.** If the context file doesn't cover something, put it in Open Questions — don't fabricate.

## Process

### Step 1: Read Inputs

1. Read the context file from `$ARGUMENTS`.
2. Extract all gathered information:
   - Game concept, scope, core fantasy
   - Genre & platform details
   - Design pillars with "What This Rules Out" lists
   - Non-goals
   - MDA analysis (aesthetics, dynamics, mechanics)
   - Web research findings
   - Open questions
   - Output directory

### Step 2: Create Directory Structure

```bash
mkdir -p <output-dir>/00-concept
mkdir -p <output-dir>/01-core-loop
mkdir -p <output-dir>/02-systems
mkdir -p <output-dir>/03-narrative
mkdir -p <output-dir>/04-art-audio
mkdir -p <output-dir>/05-technical-production
mkdir -p <output-dir>/context
mkdir -p <output-dir>/reviews
```

### Step 3: Generate Documents

Generate these files in order. Every section file follows this template structure:

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
| [today] | Initial creation | Phase 0 — Concept |
```

---

#### File 1: DESIGN-PILLARS.md (top-level)

Write to `<output-dir>/DESIGN-PILLARS.md`. This is the **quick-reference** file that every contributor reads first.

```markdown
# Design Pillars — [Game Title]

> These pillars govern every design decision. If a feature doesn't serve at least one pillar, it doesn't ship.

| # | Pillar | In One Sentence | What This Rules Out |
|---|--------|-----------------|---------------------|
| 1 | [Name] | [One sentence] | [Comma-separated top 3 exclusions] |
| 2 | [Name] | [One sentence] | [Comma-separated top 3 exclusions] |
| ... | ... | ... | ... |

## How to Use This Document

- **Before proposing a feature:** Check it against every pillar. If it contradicts any pillar, it needs exceptional justification.
- **During design review:** Use pillars as the first filter. "Which pillar does this serve?"
- **When cutting scope:** Pillars tell you what to keep and what to cut.

See `00-concept/design-pillars.md` for full reasoning and stress-test rationale.
```

---

#### File 2: 00-concept/vision.md

Write to `<output-dir>/00-concept/vision.md`.

Sections:
- **Elevator Pitch**: 2–3 sentences that sell the game's fantasy and hook. Written for someone who has never heard of the project.
- **Core Fantasy**: The emotional experience, expanded from the context file. What the player feels, not what they do.
- **Genre & Platform**: Genre blend, target platforms, input methods, session length.
- **Target Audience**: Who plays this, what games they already love, what draws them in.
- **Comparable Titles**: 3–5 comparable games with explicit differentiators. Source from web research findings. Format: "[Game] — [what we share], [how we differ]".
- **Design Rationale**: Why this combination of fantasy + genre + platform serves the target audience. Ground in web research.
- **Open Questions**: Unresolved vision-level questions from the context file.
- **Cross-References**: Links to design-pillars.md, mda-analysis.md.
- **Changelog**: Initial entry.

---

#### File 3: 00-concept/design-pillars.md

Write to `<output-dir>/00-concept/design-pillars.md`.

For each pillar, write a full section:

```markdown
## Pillar [N]: [Name]

> [One-sentence explanation]

### What This Rules Out

Present the exclusions **first** — this is the most actionable part of a pillar.

- **[Exclusion 1]** — [Why this is incompatible with the pillar. Be specific.]
- **[Exclusion 2]** — [Concrete example of what this prevents.]
- **[Exclusion 3+]** — [Additional exclusions from context file.]

### What This Approves

- [Types of features, mechanics, or design choices this pillar endorses]
- [Concrete examples where possible]

### Stress-Test Rationale

Why is this pillar non-obvious? What would a reasonable designer argue against it?

- **Counter-argument:** [A plausible argument for the opposite approach]
- **Rebuttal:** [Why this pillar wins for THIS game, grounded in core fantasy and genre]
```

Include a summary section at the end:

```markdown
## Pillar Interactions

| Pillar A | Pillar B | Relationship |
|----------|----------|-------------|
| [Name] | [Name] | [Reinforcing / Tension / Independent] — [brief explanation] |
```

---

#### File 4: 00-concept/mda-analysis.md

Write to `<output-dir>/00-concept/mda-analysis.md`.

Sections:
- **Target Aesthetics**: Each aesthetic with rationale for why it aligns with the core fantasy.
- **Required Dynamics**: For each aesthetic, the player behaviors and emergent patterns needed. Include a **Dynamics → Aesthetics** traceability table.
- **Required Mechanics**: For each dynamic, the game rules and systems needed. Include a **Mechanics → Dynamics** traceability table.
- **Validation Notes**: Cross-check mechanics against design pillars. Flag any mechanic that might contradict a pillar or non-goal.
- **MDA Chain Diagram**: A text-based or markdown visualization showing the full Aesthetics ← Dynamics ← Mechanics chain.
- **Open Questions**: MDA-specific unresolved items.
- **Cross-References**: Links to design-pillars.md, vision.md.
- **Changelog**: Initial entry.

---

#### File 5: 00-concept/non-goals.md

Write to `<output-dir>/00-concept/non-goals.md`.

Sections:
- **Scope Exclusions**: Each non-goal as a subsection with:
  - **What:** The excluded feature or approach
  - **Why:** Rationale grounded in design pillars (reference which pillar it would violate)
  - **Revisit Condition:** Under what circumstances this non-goal might be reconsidered (e.g., "Revisit if player testing shows X" or "Never — fundamental to the core fantasy")
- **Genre Expectations Intentionally Broken**: Features common in the genre that this game intentionally omits, with rationale.
- **Open Questions**: Non-goal-specific unresolved items.
- **Cross-References**: Links to design-pillars.md, vision.md.
- **Changelog**: Initial entry.

---

#### File 6: INDEX.md (master TOC)

Write to `<output-dir>/INDEX.md`.

```markdown
# Game Design Bible — [Game Title]

> [Elevator pitch from vision.md]

**Scope:** [indie|aa|aaa]
**Created:** [today's date]
**Last Updated:** [today's date]

## Quick Reference

- 📋 [Design Pillars](DESIGN-PILLARS.md) — the rules that govern every decision

## Phases

### ✅ Phase 0: Concept
- [Vision](00-concept/vision.md) — elevator pitch, core fantasy, genre, audience
- [Design Pillars](00-concept/design-pillars.md) — full pillar reasoning and stress tests
- [MDA Analysis](00-concept/mda-analysis.md) — aesthetics, dynamics, mechanics chain
- [Non-Goals](00-concept/non-goals.md) — explicit scope exclusions

### ⬜ Phase 1: Core Loop
> *Not started*

### ⬜ Phase 2: Systems
> *Not started*

### ⬜ Phase 3: Narrative
> *Not started*

### ⬜ Phase 4: Art & Audio
> *Not started*

### ⬜ Phase 5: Technical & Production
> *Not started*

## Reviews

| Phase | Audit | Verdict | Date |
|-------|-------|---------|------|
| Phase 0: Concept | *pending* | — | — |

## Context Files

- [Concept Context](context/concept-context.md) — gathered context for Phase 0
```

### Step 4: Verify

Re-read each generated file to verify:
1. All pillar names are consistent across all documents.
2. MDA mechanics don't contradict any design pillar or non-goal.
3. No `[ASSUMPTION]` tags are present without corresponding Open Questions entries.
4. Cross-references use correct relative paths.

### Step 5: Report

List all created files with their paths:

```
## Files Created

1. <output-dir>/DESIGN-PILLARS.md — quick reference
2. <output-dir>/00-concept/vision.md — vision document
3. <output-dir>/00-concept/design-pillars.md — full pillar reasoning
4. <output-dir>/00-concept/mda-analysis.md — MDA analysis
5. <output-dir>/00-concept/non-goals.md — scope exclusions
6. <output-dir>/INDEX.md — master table of contents
```

## Output

Report: "Phase 0 (Concept) documents generated. Run `/game-design-bible:audit-concept <output-dir> --context <context-file-path>` to audit them."

Return the list of created file paths.
