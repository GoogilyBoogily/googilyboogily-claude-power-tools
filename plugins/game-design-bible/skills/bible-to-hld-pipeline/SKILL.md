---
name: bible-to-hld-pipeline
description: "Run the full Bible-to-HLD pipeline: gather context from bible, dispatch parallel HLD generation, then audit all generated HLDs. Clean context isolation at each phase."
disable-model-invocation: true
argument-hint: "[bible-dir] [--features f1,f2,...] [--codebase path]"
allowed-tools: Skill, Read, AskUserQuestion, Bash(ls:*), Bash(mkdir:*)
model: opus
---

# Bible-to-HLD — Full Pipeline

Run the complete Bible-to-HLD pipeline end-to-end: gather context from a completed Game Design Bible, dispatch parallel HLD generation with one agent per feature, then audit all generated HLDs for quality and consistency. Each phase runs with clean context isolation.

## Input

$ARGUMENTS — bible directory path and optional flags:
- `--features f1,f2,...` — comma-separated feature names to skip interactive selection
- `--codebase <path>` — path to existing game codebase for technical context

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Directory**: First non-flag argument (default: `docs/game-design-bible/`)
- **Features**: `--features f1,f2,...` — comma-separated list (bypasses interactive selection in gather phase)
- **Codebase Path**: `--codebase <path>` — path to existing game codebase

---

## Phase 1: Gather Context

Invoke the gather skill to load the bible, present feature inventory, gather technical context, and compile a context file.

```
Skill(bible-to-hld-gather, "<bible-dir> [--features <features>] [--codebase <codebase>]")
```

Capture the returned context file path as `$CONTEXT_PATH`.

**CHECKPOINT — Review Context & Feature Selection**

Read the context file at `$CONTEXT_PATH` and present a summary:

```
## Pipeline Phase 1 Complete: Context Gathered

**Context file:** [path]
**Selected features:** [count]
**Technical landscape:** [engine, platforms summary]

| # | Feature | Bible Source | Category |
|---|---------|-------------|----------|
| 1 | [name] | [path] | [category] |
| ... | ... | ... | ... |

Proceed to HLD generation? (y/n/edit context)
```

- If "edit context": Inform the user to edit the context file manually, then re-read and re-present.
- If "n": STOP.
- If "y": Proceed to Phase 2.

---

## Phase 2: Generate HLDs

Invoke the generate skill to dispatch parallel HLD writers and create INDEX.md.

```
Skill(bible-to-hld-generate, "$CONTEXT_PATH")
```

Capture the returned HLD directory as `$HLD_DIR`.

**CHECKPOINT — Audit Decision**

```
## Pipeline Phase 2 Complete: HLDs Generated

**HLD directory:** [path]
**HLDs generated:** [count]

Options:
1. ⭐ Run audit (recommended)
2. Skip audit — done
3. Stop here
```

- If "Skip audit" or "Stop": Skip to Final Summary.
- If "Run audit": Proceed to Phase 3.

---

## Phase 3: Audit HLDs

Invoke the audit skill with bible directory and context file for full fidelity checks.

```
Skill(audit-game-hld, "$HLD_DIR --bible-dir <bible-dir> --context $CONTEXT_PATH")
```

Capture the audit verdict.

---

## Final Summary

Present the pipeline completion summary:

```
## Bible-to-HLD Pipeline Complete

### Generated HLDs

| # | Feature | Output Path | Pillars Served |
|---|---------|-------------|----------------|
| 1 | [name] | [path] | [pillar list] |
| ... | ... | ... | ... |

### Pillar Coverage

| Pillar | Covered By |
|--------|------------|
| [Pillar 1] | [HLD list] |
| [Pillar 2] | [HLD list] |
| ... | ... |

### Audit Verdict
[PASS | PASS WITH WARNINGS | FAIL | Skipped]

### Files Created
- [context file path]
- [HLD file paths]
- [INDEX.md path]
- [AUDIT.md path, if audit ran]
```

**Offer next steps:**

> What would you like to do next?
> 1. **Generate LLDs** — create Low Level Design documents for individual HLDs (`/architecture-docs:lld <hld-path>`)
> 2. **Review a specific HLD** — I can walk through any generated HLD in detail
> 3. **Done** — pipeline complete
