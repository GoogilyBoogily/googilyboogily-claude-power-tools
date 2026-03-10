---
description: Deep-dive and expand a specific section of the Game Design Bible with additional detail or sub-sections
argument-hint: "<section-path> [aspect to expand]"
allowed-tools: Task, Read, Write, Edit, Glob, Grep
model: opus
category: workflow
---

# 🔍 Expand Design Bible Section

Deep-dive into a specific section, adding detail, splitting into sub-files, or exploring a particular aspect.

## Arguments
$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Section Path**: Required. Path relative to bible root (e.g., `02-systems/combat`, `03-narrative/characters`, `04-art-audio/visual-style`)
- **Aspect**: Optional. Specific aspect to expand (e.g., "melee combat", "boss encounters", "color accessibility")

If no section path is provided, list available sections:
1. Read `INDEX.md` to find all existing sections
2. Present the list and ask which section to expand

## Step 0.5: Resolve Section Path

The user may provide an ambiguous path like `02-systems/combat` (could be a file or directory). Resolve it:

1. Use Glob to check if `<output-dir>/<section-path>.md` exists → it's a **file** target
2. Use Glob to check if `<output-dir>/<section-path>/` exists with files inside → it's a **directory** target
3. If NEITHER exists, read `INDEX.md` and search for the closest match. Suggest corrections: "Did you mean `02-systems/combat.md`? Available sections: [list]"
4. If BOTH exist (shouldn't happen, but handle it), prefer the directory

## Step 1: Read Context

1. Read `DESIGN-PILLARS.md` — always re-establish pillar context
2. Read the resolved target (file or directory contents)
3. Read any cross-referenced files mentioned in the section's `## Cross-References`

## Step 2: Assess Expansion Type

Determine what kind of expansion is needed:

### A. **Depth Expansion** (default)
The existing section needs more detail within its current file.
- Add more specific mechanics, examples, or edge cases
- Resolve Open Questions through targeted questioning
- Add concrete numbers, ranges, or formulas where vague language exists

### B. **Split Expansion**
The section has grown too large or covers multiple distinct topics.
- Create a subdirectory: `02-systems/combat/` (rename `combat.md` to `combat/overview.md`)
- Add sub-files: `combat/melee.md`, `combat/ranged.md`, `combat/boss-encounters.md`
- Each sub-file follows the standard section template

### C. **Aspect Expansion**
The user wants to explore one specific aspect in detail.
- Create a new sub-file focused on that aspect
- Link it from the parent section's Cross-References

## Step 3: Ask Expansion Questions

Based on the expansion type, ask 2-4 targeted questions:
- What specific aspects feel underdeveloped?
- Are there edge cases or player scenarios not covered?
- What design decisions are you uncertain about?

For aspect-specific expansions, ask questions focused on that aspect.

## Step 4: Write Expanded Content

1. For depth expansion: Use `Edit` to update the existing file
2. For split expansion:
   - Create the subdirectory with `mkdir`
   - Move the original file to `overview.md` within the subdirectory
   - Create new sub-files following the section template
3. For aspect expansion: Create the new sub-file

All new content must:
- Include `> Pillar Alignment:` header
- Validate against design pillars
- Include `## Open Questions` for unresolved items
- Cross-reference the parent section and any related sections

## Step 5: Update INDEX.md

1. Add new files/subdirectories to the Table of Contents
2. Note the expansion in the section's status (e.g., "✅ Complete (expanded)")

## Expansion Depth by Scope

| Scope | Expansion Style |
|-------|-----------------|
| Indie | Add 1-2 paragraphs of detail, resolve open questions |
| AA | Add sub-sections with examples, consider splitting |
| AAA | Full sub-directory splits with dedicated sub-files |
