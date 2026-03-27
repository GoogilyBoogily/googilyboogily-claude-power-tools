---
name: bible-to-hld-gather
description: "Gather context for generating game-development-aware HLD documents from a completed Game Design Bible. Reads bible, presents feature inventory, user selects features, gathers technical context."
disable-model-invocation: true
context: fork
argument-hint: "[bible-dir] [--features f1,f2,...] [--codebase path]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Bible-to-HLD — Context Gathering

Gather all context needed to generate game-development-aware High Level Design documents from a completed Game Design Bible. This skill runs an interactive session to load the bible, present a feature inventory for selection, gather technical context, dispatch research, and compile a structured context file that `bible-to-hld-generate` consumes.

## Input

$ARGUMENTS — bible directory path and optional flags:
- `--features f1,f2,...` — comma-separated feature names to skip interactive selection
- `--codebase <path>` — path to existing game codebase for technical context

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Directory**: First non-flag argument (default: `docs/game-design-bible/`)
- **Features**: `--features f1,f2,...` — comma-separated list (bypasses Phase 2 interactive selection)
- **Codebase Path**: `--codebase <path>` — path to existing game codebase

## Source Integrity Rules

1. **Cite bible sources** — every design claim in the context file must trace back to a specific bible section. If no source exists, flag it in Open Questions.
2. **Never invent game design details** — if the bible doesn't specify something, leave it as an open question. HLDs translate design into architecture; they do not create new design.
3. **Technical context must come from Phase 3** — engine, platform, and codebase details come only from the Technical Landscape gathered in Phase 3, not from assumptions.

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

After reading DESIGN-PILLARS.md, extract and retain all pillar names — these are needed for the pillar coverage matrix during generation.

### Step 3: Read Concept Files

Read these for additional context:
- `<bible-dir>/00-concept/vision.md` — elevator pitch, genre, platform, audience
- `<bible-dir>/00-concept/non-goals.md` — explicit scope exclusions

### Step 4: Validate Phase Completion

If Phase 0 (Concept) or Phase 1 (Core Loop) are not marked `✅ Complete` in INDEX.md, warn the user:

> "The bible's [phase] is incomplete. HLDs generated without this context may lack pillar alignment or core loop integration. Continue anyway?"

Wait for confirmation before proceeding.

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
- If `--features` was provided, match feature names against the inventory and skip interactive selection
- Wait for user selection
- If zero features are selected, require at least one and re-present the inventory

---

## Phase 3: Technical Context

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

### Step 3: Confirmatory Questions

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

Wait for confirmation. Store answers as the **Technical Landscape Summary**.

---

## Phase 4: Parallel Research

Dispatch a web research Task:

```
Task(
  description="Research HLD patterns for game development",
  prompt="Search the web for:
  - High Level Design best practices for game development
  - Architecture patterns for [detected engine] game projects
  - Technical design document examples for [genre] games
  - Common architectural pitfalls for the selected system types: [list selected feature categories]
  Return structured findings with URLs."
)
```

---

## Phase 5: Compile Context File

Assemble all gathered information into the context file:

```markdown
# Bible-to-HLD Context

**Gathered:** [today's date]
**Bible Directory:** [bible-dir]
**Output Directory:** docs/hld/

## Selected Features

| # | Feature | Bible Source Path | Pillar Alignment | Category |
|---|---------|-------------------|------------------|----------|
| 1 | [feature name] | [bible-dir]/[path] | [pillars] | [category] |
| 2 | ... | ... | ... | ... |

## Technical Landscape Summary

- **Engine:** [engine name and version]
- **Target Platforms:** [platforms]
- **Multiplayer:** [scope or "none"]
- **Current Implementation Status:** [summary]
- **Global Constraints:** [user-provided constraints]

## Design Pillars

[List all pillar names with one-line descriptions, extracted from DESIGN-PILLARS.md]

## Core Loop Summary

[Summary of core loop from 01-core-loop/core-loop.md]

## Sibling Features

[Full list of selected features with their output paths, for cross-referencing between HLDs]

## Research Findings

[Structured web research findings with URLs]

## Open Questions

- [Anything unresolved or flagged as assumption]
```

Write the context file to `<bible-dir>/context/bible-to-hld-context.md`. Create the directory if needed.

## Output

Report: "Context file saved to `<path>`. Review and edit it if needed, then run `/game-design-bible:bible-to-hld-generate <path>` to generate the HLD documents."

Return the context file path.
