---
name: bible-to-hld
description: Generate game-development-aware HLD documents from a completed Game Design Bible — extracts features, runs parallel HLD generation with pillar alignment, and cross-references everything
disable-model-invocation: true
argument-hint: "[bible-dir] [--features f1,f2,...] [--output-dir path] [--codebase path]"
model: opus
allowed-tools: Task, Read, Write, Edit, Bash(mkdir:*), Bash(ls:*), Glob, Grep
---

# Bible-to-HLD Generator

Generate game-development-aware High Level Design documents from a completed Game Design Bible. Each HLD bridges "what to build" (bible) with "how to build it" (architecture) — with game-specific sections for asset pipelines, performance budgets, multiplayer, and platform considerations.

## Source Integrity Rules

1. **Cite bible sources** — every design claim in an HLD must trace back to a specific bible section. If no source exists, flag it in Open Questions.
2. **Never invent game design details** — if the bible doesn't specify something, leave it as an open question. HLDs translate design into architecture; they do not create new design.
3. **Technical context must come from Phase 3** — engine, platform, and codebase details come only from the Technical Landscape gathered in Phase 3, not from assumptions.

## Arguments
$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Directory**: First non-flag argument (default: `docs/game-design-bible/`)
- **Features**: `--features f1,f2,...` — comma-separated list of features to generate HLDs for (skip interactive selection)
- **Output Directory**: `--output-dir <path>` (default: `docs/game-hld/`)
- **Codebase Path**: `--codebase <path>` — path to existing game codebase for technical context

---

## Phase 1: Load Bible Context

### Step 1: Validate Bible Exists

Use Glob to check for `<bible-dir>/INDEX.md`. If it does not exist:
- Inform the user: "No Game Design Bible found at `<bible-dir>`. Create one first with `/game-design-bible:bible:create`."
- STOP

### Step 2: Read Core Bible Files

Read these files — they provide the foundation for every HLD:

1. **`<bible-dir>/INDEX.md`** — check phase completion status
2. **`<bible-dir>/DESIGN-PILLARS.md`** — the supreme court for all design decisions
3. **`<bible-dir>/01-core-loop/core-loop.md`** — the fundamental gameplay loop

After reading DESIGN-PILLARS.md, extract and retain all pillar names — these are needed for the Phase 5 coverage matrix.

If Phase 0 (Concept) or Phase 1 (Core Loop) are not `✅ Complete`, warn the user:
> "The bible's [phase] is incomplete. HLDs generated without this context may lack pillar alignment or core loop integration. Continue anyway?"

Wait for confirmation before proceeding.

### Step 3: Read Concept Files

Read these for additional context:
- `<bible-dir>/00-concept/vision.md` — elevator pitch, genre, platform, audience
- `<bible-dir>/00-concept/non-goals.md` — explicit scope exclusions

---

## Phase 2: Feature Inventory & Selection

### Step 1: Scan Bible Directories

Check INDEX.md for each phase's completion status. Only scan directories whose phase is marked `✅ Complete`:
- `<bible-dir>/01-core-loop/` (Phase 1)
- `<bible-dir>/02-systems/` (Phase 2)
- `<bible-dir>/03-narrative/` (Phase 3)
- `<bible-dir>/04-art-audio/` (Phase 4)
- `<bible-dir>/05-technical-production/` (Phase 5)

Use Glob to find all `.md` files across the complete directories. For incomplete phases, note them in the inventory display as "⚠️ Phase incomplete — skipped".

For each file found, read the first 20 lines to extract:
- **Title**: The `# heading` on line 1
- **Pillar Alignment**: The `> Pillar Alignment:` line

### Step 2: Categorize Features

Group discovered features into categories:

| Category | Source Directory | Examples |
|----------|----------------|----------|
| Core Loop | `01-core-loop/` | Core loop, prototype spec |
| Systems | `02-systems/` | Combat, economy, progression, AI |
| Narrative | `03-narrative/` | Story, characters, dialogue, world |
| Art & Audio | `04-art-audio/` | Visual style, sound design, UI/UX |
| Technical | `05-technical-production/` | Engine, asset pipeline, timeline |

### Step 3: Present Inventory

Display the categorized inventory to the user:

```
## Feature Inventory

### Systems (from bible Phase 2)
1. [x] Combat System — Pillars: [Visceral Action, Player Agency]
2. [x] Economy — Pillars: [Strategic Depth]
3. [ ] Progression — Pillars: [Sense of Growth]

### Core Loop
4. [ ] Core Loop Architecture — Pillars: [all]

### Narrative
5. [ ] Dialogue System — Pillars: [Living World]
...

Select features to generate HLDs for (comma-separated numbers, or "all"):
```

- Pre-check `02-systems/` features by default (these most commonly need HLDs)
- If `--features` was provided, match feature names against the inventory and skip interactive selection (note: `--features` only bypasses Phase 2 selection, not the Phase 3 technical confirmation)
- Wait for user selection
- If zero features are selected, require at least one and re-present the inventory

---

## Phase 3: Technical Context (Optional)

### Step 1: Detect Codebase

If `--codebase` was provided, use that path. Otherwise, auto-detect by checking for common game project indicators in the working directory:
- `src/`, `game/`, `Assets/`, `Source/` (engine source)
- `*.csproj`, `*.uproject`, `project.godot`, `Cargo.toml` (engine projects)
- `package.json` with game-related dependencies

### Step 2: Gather Technical Landscape

**If codebase exists:**
Use Glob and Grep to explore:
- Project structure and engine framework
- Existing implementations related to selected features
- Networking/multiplayer setup if present
- Build configuration and platform targets

**If no codebase:**
Read `<bible-dir>/05-technical-production/engine-and-tools.md` for:
- Engine choice and version
- Target platforms
- Team structure and constraints

### Step 3: Common Questions

Ask the user these questions ONCE — answers apply to all HLDs:

> **Technical Landscape Confirmation:**
>
> Based on what I've found:
> - **Engine**: [detected or from bible]
> - **Target Platforms**: [detected or from bible]
> - **Multiplayer**: [detected scope or "none detected"]
> - **Current Implementation Status**: [codebase summary or "no codebase yet"]
>
> 1. Is this accurate? Any corrections?
> 2. Are there any global technical constraints all HLDs should respect? (e.g., "must run at 60fps on Switch", "no middleware licenses", "WebGL target")

Wait for confirmation. Store answers as the **Technical Landscape Summary** — this gets passed to every subagent.

---

## Phase 4: Parallel HLD Generation

### Step 1: Prepare Output Directory

```bash
mkdir -p <output-dir>
```

### Step 2: Confirm Generation Plan

**CHECKPOINT — Confirm Generation Plan**

Before dispatching subagents, present the full generation plan to the user:

```
## Generation Plan

| # | Feature | Bible Source | Output Path |
|---|---------|-------------|-------------|
| 1 | [feature name] | [bible-dir]/[path] | <output-dir>/hld-[slug].md |
| 2 | ... | ... | ... |

**Engine:** [from Phase 3]
**Platforms:** [from Phase 3]

Proceed with generation? (y/n)
```

Wait for user confirmation before proceeding.

### Step 3: Dispatch Subagents

**CRITICAL: Create one Task() call per selected feature. Include ALL Task() calls in a SINGLE message for true parallel execution.**

The game HLD template is at `${CLAUDE_SKILL_DIR}/references/game-hld-template.md`.

Per-feature Task template:

```
Task(
  description="Write HLD: [feature name]",
  prompt="Write a game-development-aware High Level Design document for the [feature name] system/feature.

CONTEXT FILES TO READ:
- Bible feature file: <bible-dir>/[path to feature .md]
- Design Pillars: <bible-dir>/DESIGN-PILLARS.md
- Core Loop: <bible-dir>/01-core-loop/core-loop.md
- HLD Template: [path to game-hld-template.md]

TECHNICAL LANDSCAPE:
[paste Technical Landscape Summary from Phase 3]

SIBLING FEATURES (for cross-references — other HLDs being generated in parallel):
[list of other selected features with their output paths]

OUTPUT PATH: <output-dir>/hld-[feature-name-slugified].md

INSTRUCTIONS:
1. Read all context files listed above
2. Read the HLD template — follow its section structure exactly
3. If information is missing or ambiguous, note it in the HLD's Open Questions section rather than asking
4. Write the HLD section by section, validating each against design pillars
5. Run a pillar validation pass — verify every key decision serves at least one pillar and no decision contradicts a pillar's 'What This Rules Out' list
6. Include cross-references to bible source and sibling HLDs
7. Write the completed HLD to the output path",
  subagent_type="game-hld-writer"
)
```

### Step 4: Wait for Completion

Wait for all Tasks to complete. Report any failures in the Phase 5 summary.

---

## Phase 5: Cross-Reference & Finalize

### Step 1: Read All Generated HLDs

Use Glob to find all `hld-*.md` files in `<output-dir>/`. Read each one.

### Step 2: Create INDEX.md

Write `<output-dir>/INDEX.md` with:

```markdown
# Game HLD Index — [Game Name]

**Source Bible:** [bible-dir path]
**Generated:** [today's date]
**Total HLDs:** [count]

## Pillar Coverage Matrix

| HLD | [Pillar 1] | [Pillar 2] | [Pillar 3] | ... |
|-----|------------|------------|------------|-----|
| [Feature 1] | ✅ | ✅ | — | ... |
| [Feature 2] | — | ✅ | ✅ | ... |

## HLD Documents

[Group HLDs by their source bible directory. Derive section names from the actual directories of the generated HLDs — do not hardcode categories.]

- [Feature HLD](hld-feature.md) — Source: [feature.md](bible-dir/path/feature.md)
- ...

## Cross-Reference Summary
[List any cross-dependencies between HLDs discovered during generation]

## Open Questions Summary
[Aggregate all open questions from all HLDs with back-links]

## Next Steps
- To create detailed implementation specs: `/architecture-docs:lld <hld-path>`
- To review bible consistency: `/game-design-bible:bible:review`
```

### Step 3: Report to User

Present a completion summary:

- **Total HLDs generated**: [count]
- **Pillar coverage**: [which pillars are well-covered, which have gaps]
- **Open questions**: [total count across all HLDs]
- **Failed generations**: [any subagents that failed, with reasons]

Then offer:
> "Would you like to generate a Low Level Design for any of these HLDs? I can invoke `/architecture-docs:lld` with the HLD path."

---

## Error Handling

- If a bible section is missing or marked incomplete, note it as a gap in the HLD's Open Questions rather than inventing content
- If a subagent fails, report the failure and offer to retry that specific feature
- If the user provides very few feature selections, suggest additional features that commonly need HLDs (especially systems from `02-systems/`)
- If pillar alignment cannot be determined for a feature, flag it as "Pillar alignment unclear — verify against DESIGN-PILLARS.md"
