---
description: Resume work on an existing Game Design Bible — picks up where you left off or expands incomplete sections
argument-hint: "[output-dir] [section path or phase number]"
allowed-tools: Task, Read, Write, Edit, Glob, Grep
model: opus
category: workflow
---

# 🔄 Continue Design Bible

Resume work on an existing Game Design Bible.

## Arguments
$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Output Directory**: First argument or default `docs/game-design-bible/`
- **Target**: Optional section path (e.g., `02-systems/combat`) or phase number (e.g., `2`)

## Step 1: Read Current State

Read the bible's current state:
1. Read `<output-dir>/INDEX.md` to find completion status of all phases/sections
2. Read `<output-dir>/DESIGN-PILLARS.md` to re-establish pillar context (ALWAYS do this before any writing)

If `INDEX.md` doesn't exist, inform the user: "No existing bible found at `<output-dir>`. Use `/game-design-bible:bible:create` to start a new one."

## Step 2: Identify Work Target

If a specific target was provided:
- Navigate directly to that section/phase
- Read the existing content (if any)

If no target was provided:
- Scan INDEX.md for the first section marked as ⬜ Not Started or 🔧 In Progress
- Present a summary of bible status:
  ```
  Bible Status for [Game Name]:
  ✅ Phase 0 — Concept (complete)
  ✅ Phase 1 — Core Loop (complete)
  🔧 Phase 2 — Systems (3/5 complete)
     ⬜ economy.md
     ⬜ progression.md
  ⬜ Phase 3 — Narrative (not started)
  ⬜ Phase 4 — Art & Audio (not started)
  ⬜ Phase 5 — Technical & Production (not started)
  ```
- Ask: **"Which section would you like to continue? Or press enter to resume from [first incomplete]."**

## Step 3: Surface Open Questions

For the target section:
1. Read the existing file (if it exists)
2. Collect all items under `## Open Questions`
3. Present them to the user as questions to resolve
4. If there are no open questions but the section is incomplete, ask targeted questions based on what's missing

## Step 4: Write/Update the Section

After gathering answers:
1. Update the section file with resolved open questions (move answers into Detailed Design, remove from Open Questions)
2. Add any new open questions that emerged
3. Validate against design pillars (re-read `DESIGN-PILLARS.md` if needed)
4. Update the `## Changelog` with today's date and what changed
5. Update `INDEX.md` status

## Step 5: Suggest Next Steps

After completing the target section:
- Show updated bible status
- Suggest the next incomplete section
- If all sections are complete, suggest running `bible/review` for a full audit

## Re-Entry Rules

- ALWAYS re-read `DESIGN-PILLARS.md` before writing anything — pillar drift is the #1 risk in ongoing work
- ALWAYS check the existing content before overwriting — preserve prior work
- If the user's new answers contradict existing content, flag the contradiction and ask: "Should we (a) revise the pillar to accommodate this direction, or (b) redesign this section to align with the existing pillar?"
- If new content contradicts a design pillar, present the specific contradiction before proceeding — never silently override a pillar
- Use `Edit` to update existing files, not `Write` (preserves content structure)
