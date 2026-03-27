---
name: bible-continue
description: "Resume work on an existing Game Design Bible. Reads INDEX.md, identifies incomplete phases, surfaces open questions, and invokes the appropriate phase-gather skill."
disable-model-invocation: true
context: fork
argument-hint: "[bible-dir] [phase]"
allowed-tools: Read, Glob, Grep, Skill, AskUserQuestion
model: opus
---

# Bible Continue — Resume Existing Bible

## Argument Parsing

Parse the following from `$ARGUMENTS`:
- `bible-dir`: Path to the existing Game Design Bible root directory (required — prompt if missing)
- `phase`: Optional phase number (0-5) or name (`concept`, `core-loop`, `systems`, `narrative`, `art-audio`, `technical`)

## Step 1: Read Bible State

Read `<bible-dir>/INDEX.md`.

If INDEX.md is not found:
> "No INDEX.md found at `<bible-dir>`. This doesn't appear to be an initialized Game Design Bible. Would you like to start a new one with `bible-pipeline`?"

Exit if the user declines.

## Step 2: Re-establish Pillar Context

Read `<bible-dir>/DESIGN-PILLARS.md`.

**ALWAYS** re-read pillars on every continue — this prevents pillar drift where the AI operates on stale pillar assumptions from a previous session.

If DESIGN-PILLARS.md is not found but INDEX.md exists, note this as a critical gap: "⚠️ DESIGN-PILLARS.md is missing. Pillar context cannot be established. Phase 0 (Concept) may need to be re-run."

## Step 3: Assess Bible Status

Scan INDEX.md for phase status markers:
- ✅ Complete
- 🔧 In Progress
- ⬜ Not Started

Build a status summary:

```
📖 Bible Status — [Game Title]

| Phase | Status | Files |
|-------|--------|-------|
| 0 — Concept    | ✅/🔧/⬜ | N |
| 1 — Core Loop  | ✅/🔧/⬜ | N |
| 2 — Systems    | ✅/🔧/⬜ | N |
| 3 — Narrative   | ✅/🔧/⬜ | N |
| 4 — Art/Audio   | ✅/🔧/⬜ | N |
| 5 — Technical   | ✅/🔧/⬜ | N |

Pillars: [list pillar names]
Open Questions: N total
```

## Step 4: Select Target Phase

**If a specific phase was provided**: Navigate directly to that phase.

**If no phase was provided**: Identify the first incomplete phase (⬜ or 🔧). Present the status summary and ask:

> "The next incomplete phase is **Phase N — [Name]**. Would you like to:
> - ▶️ **Continue Phase N** — Pick up where you left off
> - 🔢 **Choose a different phase** — [list incomplete phases]
> - 🔍 **Review a completed phase** — Re-audit or expand
> - 📋 **View open questions** — See all unresolved questions across the bible"

## Step 5: Surface Open Questions

For the target phase, search existing files for open questions:
- Grep for `> **Open Question` patterns
- Grep for `❓` markers
- Grep for `TODO` and `TBD` markers

If questions found, present them:

> "📋 **Open Questions for Phase N:**
> 1. [question from file X]
> 2. [question from file Y]
>
> Would you like to address any of these before proceeding, or continue with gather?"

## Step 6: Invoke Phase Skills

Map the target phase to its skills:

| Phase | Gather Skill | Generate Skill |
|-------|-------------|----------------|
| 0 — Concept | `concept-gather` | `concept-generate` |
| 1 — Core Loop | `core-loop-gather` | `core-loop-generate` |
| 2 — Systems | `systems-gather` | `systems-generate` |
| 3 — Narrative | `narrative-gather` | `narrative-generate` |
| 4 — Art/Audio | `art-audio-gather` | `art-audio-generate` |
| 5 — Technical | `technical-gather` | `technical-generate` |

### For ⬜ (Not Started) phases:
Invoke `<phase>-gather` with `--bible-dir <bible-dir>`.

### For 🔧 (In Progress) phases:
Read existing phase files to understand what's already been created. Inform the gather skill of existing content so it can fill gaps rather than duplicate.

Invoke `<phase>-gather` with `--bible-dir <bible-dir>`.

## Step 7: Post-Gather Flow

After gather completes:
1. Invoke `<phase>-generate` with the context file
2. Present the generated content summary
3. Suggest running the phase's audit:
   > "Phase N generation complete. Would you like to:
   > - 🔍 **Audit** — Run `audit-<phase>` to verify quality
   > - ▶️ **Continue** — Move to the next phase
   > - ✏️ **Expand** — Deep-dive into a specific section with `bible-expand`
   > - ✅ **Done** — Stop here for now"
