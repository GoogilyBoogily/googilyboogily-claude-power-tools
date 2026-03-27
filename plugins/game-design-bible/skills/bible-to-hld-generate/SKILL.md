---
name: bible-to-hld-generate
description: "Generate game-development-aware HLD documents by dispatching parallel game-hld-writer agents. One agent per selected feature. Creates INDEX.md with pillar coverage matrix."
disable-model-invocation: true
context: fork
argument-hint: "[context-file]"
allowed-tools: Read, Write, Edit, Glob, Grep, Task, Bash(mkdir:*)
model: opus
---

# Bible-to-HLD — Document Generator

Generate game-development-aware High Level Design documents from a previously gathered context file. Dispatches one `game-hld-writer` subagent per selected feature in parallel, then creates an INDEX.md with pillar coverage matrix and cross-reference summary.

## Input

$ARGUMENTS — path to the context file (e.g., `docs/game-design-bible/context/bible-to-hld-context.md`)

## Source Integrity Rules

1. **Cite bible sources** — every design claim in an HLD must trace back to a specific bible section. If no source exists, flag it in Open Questions.
2. **Never invent game design details** — if the bible doesn't specify something, leave it as an open question. HLDs translate design into architecture; they do not create new design.
3. **Technical context must come from the context file** — engine, platform, and codebase details come only from the Technical Landscape Summary, not from assumptions.

## Process

### Step 1: Read Context File

Read the context file from `$ARGUMENTS`. Extract:
- **Selected Features**: Feature names, bible source paths, pillar alignment, categories
- **Technical Landscape Summary**: Engine, platforms, multiplayer, constraints
- **Design Pillars**: All pillar names and descriptions
- **Core Loop Summary**: Fundamental gameplay loop
- **Sibling Features**: Full list with output paths for cross-referencing
- **Output Directory**: Where to write HLD documents (default: `docs/hld/`)
- **Bible Directory**: Source bible path

### Step 2: Create Output Directory

```bash
mkdir -p <output-dir>
```

### Step 3: Confirm Generation Plan

**CHECKPOINT — Confirm Generation Plan**

Present the full generation plan:

```
## Generation Plan

| # | Feature | Bible Source | Output Path |
|---|---------|-------------|-------------|
| 1 | [feature name] | [bible-dir]/[path] | <output-dir>/hld-[slug].md |
| 2 | ... | ... | ... |

**Engine:** [from context]
**Platforms:** [from context]
**Total HLDs to generate:** [count]

Proceed with generation? (y/n)
```

Wait for user confirmation before proceeding.

### Step 4: Dispatch Parallel HLD Writers

**CRITICAL: Create one Task() call per selected feature. Include ALL Task() calls in a SINGLE message for true parallel execution.**

The game HLD template is at `${CLAUDE_SKILL_DIR}/references/game-hld-template.md`.

Per-feature Task template:

```
Task(
  description="Write HLD: [feature name]",
  prompt="Write a game-development-aware High Level Design document for the [feature name] system/feature.

CONTEXT FILES TO READ:
- Bible feature file: [bible-dir]/[path to feature .md]
- Design Pillars: [bible-dir]/DESIGN-PILLARS.md
- Core Loop: [bible-dir]/01-core-loop/core-loop.md
- HLD Template: [path to game-hld-template.md]

TECHNICAL LANDSCAPE:
[paste Technical Landscape Summary from context file]

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

### Step 5: Wait for Completion

Wait for all Tasks to complete. Log any failures for the summary.

### Step 6: Read Generated HLDs

Use Glob to find all `hld-*.md` files in `<output-dir>/`. Read each one to extract:
- Feature name and bible source
- Pillar alignment (which pillars each HLD serves)
- Cross-references to other HLDs
- Open questions
- Any failures or gaps

### Step 7: Create INDEX.md

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

### [Category derived from source directory]
- [Feature HLD](hld-feature.md) — Source: [feature.md](bible-dir/path/feature.md)
- ...

## Cross-Reference Summary
[List any cross-dependencies between HLDs discovered during generation]

## Open Questions Summary
[Aggregate all open questions from all HLDs with back-links to the specific HLD]

## Next Steps
- To audit these HLDs: `/game-design-bible:audit-game-hld <output-dir> --bible-dir <bible-dir> --context <context-path>`
- To create detailed implementation specs: `/architecture-docs:lld <hld-path>`
- To review bible consistency: `/game-design-bible:bible:review`
```

### Step 8: Report

Present a completion summary:

- **Total HLDs generated**: [count]
- **Pillar coverage**: [which pillars are well-covered, which have gaps]
- **Open questions**: [total count across all HLDs]
- **Failed generations**: [any subagents that failed, with reasons]

## Output

Report: "HLD documents generated at `<output-dir>/`. Run `/game-design-bible:audit-game-hld <output-dir> --bible-dir <bible-dir> --context <context-path>` to audit them."

Return the list of generated HLD file paths.
