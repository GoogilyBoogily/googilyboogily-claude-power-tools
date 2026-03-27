---
name: systems-generate
description: "Generate Systems phase (Phase 2) documents by dispatching parallel systems-designer agents. Each agent designs one system. Clean context, dispatches agents."
disable-model-invocation: true
context: fork
argument-hint: "[context-file] [--output-dir path]"
allowed-tools: Read, Write, Edit, Glob, Grep, Task, Bash(mkdir:*)
model: opus
---

# Systems Phase — Document Generation

Generate all Phase 2 (Systems) documents by dispatching parallel `systems-designer` subagents. Each agent receives focused context for one system and writes a complete design document. This skill runs with clean context — all questions were answered during the gather phase.

## Input

$ARGUMENTS — path to the context file (e.g., `docs/game-design-bible/context/systems-context.md`), and optionally `--output-dir <path>`.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Context File**: First non-flag argument
- **Output Directory**: `--output-dir <path>` (default: derived from context file's `Bible Directory` field)

## Source Integrity Rules

**Every design decision must trace back to the context file.**

1. **Ground every claim.** Every factual statement must trace back to a specific entry in the context file (user answers, pillar context, core loop context, or web research with URLs).
2. **Flag ungrounded claims.** If a subagent needs to state something not in the context file, it must mark it as `[ASSUMPTION]`.
3. **Never invent game design details.** If the context file doesn't cover something, put it in Open Questions — don't fabricate.

## Process

### Step 1: Read and Validate Context

1. Read the context file from `$ARGUMENTS`.
2. Extract:
   - **Selected Systems** — the numbered list of systems to design
   - **Per-System Details** — questions, answers, and research findings for each system
   - **Bible Directory** — path to the bible root
   - **Scope** — indie/aa/aaa
   - **Design Pillars** — pillar names and "What This Rules Out" lists
   - **Core Loop** — the Action → Feedback → Reward → Motivation cycle
   - **Genre & Platform** — from vision context
   - **Cross-System Considerations** — shared resources, dependencies

3. Validate:
   - At least one system is selected
   - Per-system details exist for every selected system
   - Bible directory path is valid

4. Derive paths:
   - **Pillars Path**: `<bible-dir>/DESIGN-PILLARS.md`
   - **Core Loop Path**: `<bible-dir>/01-core-loop/core-loop.md`
   - **Output Directory**: `<output-dir>` or `<bible-dir>/02-systems/`

### Step 2: Prepare Output Directory

```bash
mkdir -p <output-dir>
```

### Step 3: Dispatch Parallel System Designers

**CRITICAL: For EACH selected system, create one Task() call dispatching the `systems-designer` subagent. Include ALL Task() calls in a SINGLE message for true parallel execution.**

Example: if context lists Combat, Economy, Progression → 3 Task() calls in one message.

Per-system Task template:

```
Task(
  description="Design [system name] system",
  prompt="Design the [system name] system for a [genre] game.

CONTEXT (per-system details from the gather phase):
- Scale: [scale answer from context]
- Feel: [feel answer from context]
- Boundaries: [boundaries answer from context]

WEB RESEARCH FINDINGS:
[Paste filtered research results for this system from the context file]

CROSS-SYSTEM CONSIDERATIONS:
[Any shared resources, dependencies, or interactions with other systems being designed]

SIBLING SYSTEMS (being designed in parallel — for cross-references):
[List of other selected systems with their output paths]

Read these files for foundation context:
- Design Pillars: [pillars path]
- Core Loop: [core loop path]

SCOPE: [indie|aa|aaa]
OUTPUT PATH: <output-dir>/[system-name-kebab-case].md

INSTRUCTIONS:
1. Read the Design Pillars and Core Loop files
2. Do NOT ask questions — all context has been gathered. Use the per-system details above.
3. Design the system following your system design template
4. Validate every mechanic against design pillars — flag contradictions
5. Include cross-references to sibling systems where interactions exist
6. Include a '## Design Rationale' section explaining key choices
7. Write the completed design document to the output path",
  subagent_type="systems-designer"
)
```

### Step 4: Collect and Verify Results

After all subagents complete:

1. Use Glob to find all `.md` files in `<output-dir>/`
2. Read each created file and verify:
   - File is non-empty
   - Contains required sections: Overview, Core Mechanics, Feedback Loops, Balance Levers, Edge Cases, Design Rationale
   - Has a `> Pillar Alignment:` line
   - Has a Changelog entry

3. Report any subagent failures — note which system failed and why.

### Step 5: Update INDEX.md

1. Read `<bible-dir>/INDEX.md`
2. Update Phase 2 status: `✅ Complete`
3. Add system files to the Table of Contents under **02 — Systems**:

```markdown
- **02 — Systems**
  - [System Name 1](02-systems/system-name-1.md)
  - [System Name 2](02-systems/system-name-2.md)
  ...
```

Replace the placeholder `*(populated in Phase 2)*` with the actual file links.

### Step 6: Report to User

Present a completion summary:

- **Total systems designed**: [count]
- **Files created**: [list of paths]
- **Pillar coverage**: Which pillars are served by the designed systems, and which have gaps
- **Cross-system dependencies**: Any shared resources or interactions identified
- **Open questions**: Total count across all system documents
- **Failed generations**: Any subagents that failed, with reasons

Then offer next steps:
> "Phase 2 (Systems) is complete. Next steps:
> - Run `/game-design-bible:audit-systems <bible-dir>` to audit systems for consistency and completeness
> - Run `/game-design-bible:bible:continue` to proceed to Phase 3 (Narrative) and Phase 4 (Art & Audio)
> - Use `/game-design-bible:bible:expand` to deep-dive any specific system"

## Error Handling

- If the context file is missing or malformed, report what's wrong and suggest re-running `/game-design-bible:systems-gather`
- If a subagent fails, mark Phase 2 as `🔧 In Progress` (not Complete) in INDEX.md, report the failure, and offer to retry the specific system
- If a system document is empty or clearly incomplete, flag it and offer to re-dispatch that single subagent
