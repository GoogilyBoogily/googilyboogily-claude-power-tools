---
name: arch-pipeline
description: "Run the full architecture documentation pipeline: ADR discuss → research → gather → generate → audit → HLD(s) discuss → research → gather → generate → audit → LLD(s) discuss → research → gather → generate → audit. Supports 1:N HLDs per ADR and 1:M LLDs per HLD. Each phase runs with clean context isolation. Persists state for cross-session resume. Prompts for context clearing between major transitions."
version: 3.0.0
argument-hint: "[decision topic] [--resume]"
allowed-tools: Skill, Read, Write, AskUserQuestion, Bash(ls:*), Bash(mkdir:*)
model: opus
---

# Architecture Documentation Pipeline

Run the complete ADR → HLD(s) → LLD(s) pipeline with context isolation, state persistence, quality audits, and context-clearing prompts. Each phase (discuss, research, gather, generate, audit) runs in its own forked context. The orchestrator tracks file paths, decisions, and verdicts — it never reads document content.

One ADR can produce multiple HLDs (one per subsystem), and each HLD can produce multiple LLDs (one per component). Single-document is the default — fan-out is opt-in.

## Input

$ARGUMENTS — the decision topic (e.g., "migrate from REST to GraphQL") or `--resume` to continue from saved state.

## Pipeline Overview

```
Phase 1:   ADR Discuss     → decisions file
Phase 2:   ADR Research    → RESEARCH.md
Phase 3:   ADR Gather      → context file (compiles from 1+2)
Phase 4:   ADR Generate    → ADR document
Phase 5:   ADR Audit       → audit report

CHECKPOINT — HLD Scoping + Context Clear Prompt

FOR EACH HLD [i]:
  Phase 6-i:  HLD Discuss   → decisions file
  Phase 7-i:  HLD Research  → RESEARCH.md
  Phase 8-i:  HLD Gather    → context file
  Phase 9-i:  HLD Generate  → HLD document
  Phase 10-i: HLD Audit     → audit report

  CHECKPOINT — LLD Scoping + Context Clear Prompt

  FOR EACH LLD [j]:
    Phase 11-i-j: LLD Discuss   → decisions file
    Phase 12-i-j: LLD Research  → RESEARCH.md
    Phase 13-i-j: LLD Gather    → context file
    Phase 14-i-j: LLD Generate  → LLD document
    Phase 15-i-j: LLD Audit     → audit report

Pipeline Complete — tree summary + implement option
```

Every phase skill runs with `context: fork` — the orchestrator stays lean, tracking only file paths, decisions, and verdicts.

## Process

### State Tracking

Maintain these variables throughout the pipeline:

**ADR (single):**
- `$ADR_DECISIONS_PATH` — decisions file from discuss
- `$ADR_RESEARCH_PATH` — research file
- `$ADR_CONTEXT_PATH` — compiled context file
- `$ADR_PATH` — generated ADR document
- `$ADR_AUDIT_VERDICT` — PASS / PASS WITH WARNINGS / FAIL

**HLDs (indexed list):**
- `$HLD_SCOPES[]` — list of `{name, description}`
- `$HLD_DECISIONS_PATHS[]` — decisions files
- `$HLD_RESEARCH_PATHS[]` — research files
- `$HLD_CONTEXT_PATHS[]` — context files
- `$HLD_PATHS[]` — generated documents
- `$HLD_AUDIT_VERDICTS[]` — verdicts

**LLDs (nested indexed list, grouped per HLD):**
- `$LLD_SCOPES[i][]` — scopes per HLD
- `$LLD_DECISIONS_PATHS[i][]` — decisions files per HLD
- `$LLD_RESEARCH_PATHS[i][]` — research files per HLD
- `$LLD_CONTEXT_PATHS[i][]` — context files per HLD
- `$LLD_PATHS[i][]` — generated documents per HLD
- `$LLD_AUDIT_VERDICTS[i][]` — verdicts per HLD

**Context Budget Rule:** The orchestrator NEVER reads document content — only file paths and verdicts. All heavy work happens in forked skill contexts.

---

### Resume Check

Before starting, check if `--resume` flag is set OR if `docs/context/PIPELINE-STATE.md` exists.

**If state file exists:**

Ask the user using AskUserQuestion:
- **Resume from saved state** — "Continue where I left off" ⭐
- **View state first** — "Show me the state before deciding"
- **Restart fresh** — "Start over (archives old state)"

If **View**: Read and display PIPELINE-STATE.md, then ask Resume or Restart.

If **Resume**: Parse the state file, restore all `$` variables, and skip to the phase recorded in "Resume From".

If **Restart**: Rename existing state file to `PIPELINE-STATE-<timestamp>.md` and proceed fresh.

---

### Phase 1: ADR Discuss

Invoke: `skill: "architecture-docs:adr-discuss", args: "$ARGUMENTS"`

After completion, extract `$ADR_DECISIONS_PATH`.

**CHECKPOINT — Review ADR Decisions:**

Present: "ADR decisions captured at `$ADR_DECISIONS_PATH`."

Ask the user:
- **Review and proceed to research** — "I've reviewed the decisions, research the implications" ⭐
- **Re-run discuss** — "I want to revisit the decisions"
- **Skip research, go to gather** — "I already know what I need, skip research"
- **Stop here** — "I'll continue later"

**Update state file** (see State Persistence section below).

---

### Phase 2: ADR Research

Invoke: `skill: "architecture-docs:arch-research", args: "$ADR_DECISIONS_PATH"`

After completion, extract `$ADR_RESEARCH_PATH`.

**CHECKPOINT — Review ADR Research:**

Present: "Research complete at `$ADR_RESEARCH_PATH`."

Ask the user:
- **Proceed to gather** — "Compile the full context" ⭐
- **Re-run research** — "Research different aspects"
- **Stop here** — "I'll continue later"

**Update state file.**

---

### Phase 3: ADR Gather

Invoke: `skill: "architecture-docs:adr-gather", args: "$ADR_DECISIONS_PATH --research $ADR_RESEARCH_PATH"`

After completion, extract `$ADR_CONTEXT_PATH`.

**CHECKPOINT — Review ADR Context:**

Present: "ADR context compiled at `$ADR_CONTEXT_PATH`."

Ask the user:
- **Proceed to generate** ⭐
- **Re-run gather**
- **Stop here**

**Update state file.**

---

### Phase 4: ADR Generate

Invoke: `skill: "architecture-docs:adr-generate", args: "$ADR_CONTEXT_PATH"`

After completion, extract `$ADR_PATH`.

**CHECKPOINT — ADR Generated:**

Present: "ADR generated at `$ADR_PATH`."

Ask the user:
- **Audit the ADR** ⭐
- **Skip audit, continue to HLD**
- **Stop here**

**Update state file.**

---

### Phase 5: ADR Audit

Invoke: `skill: "architecture-docs:audit-adr", args: "$ADR_PATH --context $ADR_CONTEXT_PATH"`

After completion, extract `$ADR_AUDIT_VERDICT`.

**If verdict is FAIL:**

Ask the user:
- **Proceed to HLD anyway** — "Critical issues noted but not blocking"
- **Stop here** — "I need to address these issues first"

**Update state file.**

---

### Context Clear Prompt — ADR → HLD Transition

Present:

> "The ADR phase is complete (5 phases processed). Your context window may be getting heavy."
>
> **Pipeline state is saved** at `docs/context/PIPELINE-STATE.md`. You can safely `/clear` and resume with:
> ```
> /architecture-docs:arch-pipeline --resume
> ```

This is informational — proceed immediately to the HLD Scoping Checkpoint below. The user can `/clear` at any time and resume.

---

### HLD Scoping Checkpoint

After ADR audit completes (or is skipped), present:

> "The ADR covers **[topic]**. You can write a single HLD covering the full scope, or split into multiple focused HLDs."

Ask the user:
- **One HLD covering everything** ⭐
- **Multiple HLDs** — "I want to split into multiple HLDs"

If **single HLD:** Set `$HLD_SCOPES` to one entry. Proceed to HLD loop.

If **multiple HLDs:** Ask for numbered list of scopes (name + description each). Store in `$HLD_SCOPES[]`.

**Update state file.**

---

### HLD Loop — For Each HLD [i]

Process each HLD sequentially (including its LLDs) before the next. Show progress:

> "**HLD [i+1] of [N]: [name]** — [description]"

#### Phase 6-i: HLD Discuss

Invoke: `skill: "architecture-docs:hld-discuss", args: "[description] --adr $ADR_PATH"`

Extract `$HLD_DECISIONS_PATHS[i]`.

**CHECKPOINT:**
- **Proceed to research** ⭐
- **Re-run discuss**
- **Skip research**
- **Stop here**

**Update state file.**

#### Phase 7-i: HLD Research

Invoke: `skill: "architecture-docs:arch-research", args: "$HLD_DECISIONS_PATHS[i]"`

Extract `$HLD_RESEARCH_PATHS[i]`.

**CHECKPOINT:**
- **Proceed to gather** ⭐
- **Re-run research**
- **Stop here**

**Update state file.**

#### Phase 8-i: HLD Gather

Invoke: `skill: "architecture-docs:hld-gather", args: "$HLD_DECISIONS_PATHS[i] --adr $ADR_PATH --research $HLD_RESEARCH_PATHS[i]"`

Extract `$HLD_CONTEXT_PATHS[i]`.

**CHECKPOINT:**
- **Proceed to generate** ⭐
- **Re-run gather**
- **Stop here**

**Update state file.**

#### Phase 9-i: HLD Generate

Invoke: `skill: "architecture-docs:hld-generate", args: "$HLD_CONTEXT_PATHS[i] --adr $ADR_PATH"`

Extract `$HLD_PATHS[i]`.

**CHECKPOINT:**
- **Audit the HLD** ⭐
- **Skip audit, continue to LLD**
- **Stop here**

**Update state file.**

#### Phase 10-i: HLD Audit

Invoke: `skill: "architecture-docs:audit-hld", args: "$HLD_PATHS[i] --context $HLD_CONTEXT_PATHS[i] --adr $ADR_PATH"`

Extract `$HLD_AUDIT_VERDICTS[i]`.

**If FAIL:** Ask proceed or stop.

**Update state file.**

---

### Context Clear Prompt — HLD → LLD Transition

> "HLD **[name]** is complete (10 phases processed since pipeline start). Context may be heavy."
>
> **Pipeline state is saved.** You can `/clear` and resume with `/architecture-docs:arch-pipeline --resume`.

---

### LLD Scoping Checkpoint (per HLD)

> "HLD **[name]** covers [scope]. Single LLD or multiple?"

Ask:
- **One LLD** ⭐
- **Multiple LLDs**

Store in `$LLD_SCOPES[i][]`.

**Update state file.**

---

### LLD Loop — For Each LLD [j] (under HLD [i])

Show progress:

> "**LLD [j+1] of [M] (under HLD: [name]):** [LLD name] — [description]"

#### Phase 11-i-j: LLD Discuss

Invoke: `skill: "architecture-docs:lld-discuss", args: "[description] --hld $HLD_PATHS[i]"`

Extract `$LLD_DECISIONS_PATHS[i][j]`.

**CHECKPOINT:** Proceed to research / Re-run / Skip research / Stop.

**Update state file.**

#### Phase 12-i-j: LLD Research

Invoke: `skill: "architecture-docs:arch-research", args: "$LLD_DECISIONS_PATHS[i][j]"`

Extract `$LLD_RESEARCH_PATHS[i][j]`.

**CHECKPOINT:** Proceed / Re-run / Stop.

**Update state file.**

#### Phase 13-i-j: LLD Gather

Invoke: `skill: "architecture-docs:lld-gather", args: "$LLD_DECISIONS_PATHS[i][j] --hld $HLD_PATHS[i] --research $LLD_RESEARCH_PATHS[i][j]"`

Extract `$LLD_CONTEXT_PATHS[i][j]`.

**CHECKPOINT:** Proceed / Re-run / Stop.

**Update state file.**

#### Phase 14-i-j: LLD Generate

Invoke: `skill: "architecture-docs:lld-generate", args: "$LLD_CONTEXT_PATHS[i][j] --hld $HLD_PATHS[i]"`

Extract `$LLD_PATHS[i][j]`.

**CHECKPOINT:** Audit / Skip / Stop.

**Update state file.**

#### Phase 15-i-j: LLD Audit

Invoke: `skill: "architecture-docs:audit-lld", args: "$LLD_PATHS[i][j] --context $LLD_CONTEXT_PATHS[i][j] --hld $HLD_PATHS[i]"`

Extract `$LLD_AUDIT_VERDICTS[i][j]`.

**Update state file.**

---

### End of LLD Loop

> "All LLDs for HLD **[name]** are complete."

### Context Clear Prompt (between HLDs)

If more HLDs remain:

> "Moving to next HLD. Pipeline state saved — `/clear` and resume anytime."

Continue to next HLD.

---

### Pipeline Complete

Present the final summary as a document tree:

```
## Architecture Pipeline Complete

**ADR:** $ADR_PATH (Audit: $ADR_AUDIT_VERDICT)

### Document Tree

**HLD 1:** $HLD_PATHS[0] (Audit: $HLD_AUDIT_VERDICTS[0])
  - LLD: $LLD_PATHS[0][0] (Audit: $LLD_AUDIT_VERDICTS[0][0])
  - LLD: $LLD_PATHS[0][1] (Audit: $LLD_AUDIT_VERDICTS[0][1])

**HLD 2:** $HLD_PATHS[1] (Audit: $HLD_AUDIT_VERDICTS[1])
  - LLD: $LLD_PATHS[1][0] (Audit: $LLD_AUDIT_VERDICTS[1][0])

### Decisions Files
- ADR: $ADR_DECISIONS_PATH
- HLD: $HLD_DECISIONS_PATHS[0], ...
- LLD: $LLD_DECISIONS_PATHS[0][0], ...

### Research Files
- ADR: $ADR_RESEARCH_PATH
- HLD: $HLD_RESEARCH_PATHS[0], ...
- LLD: $LLD_RESEARCH_PATHS[0][0], ...

### Context Files
- ADR: $ADR_CONTEXT_PATH
- HLD: $HLD_CONTEXT_PATHS[0], ...
- LLD: $LLD_CONTEXT_PATHS[0][0], ...

### Audit Reports
- ADR: [path]-AUDIT.md
- HLD: [each HLD path]-AUDIT.md
- LLD: [each LLD path]-AUDIT.md
```

**Update state file** with Status: Complete.

### Next Steps

Ask the user:
- **Implement an LLD** — present numbered list of LLDs → invoke `/architecture-docs:implement $LLD_PATH`
- **Create Jira tickets** — present numbered list of all documents (ADR + HLDs + LLDs) → ask which document to extract tickets from → invoke `/architecture-docs:jira-tickets $SELECTED_DOC_PATH`
- **Review documents** — "I want to review everything before proceeding"
- **Done** — "Pipeline complete"

---

## State Persistence

### PIPELINE-STATE.md Format

After every checkpoint, write (or update) `docs/context/PIPELINE-STATE.md`:

```markdown
# Architecture Pipeline State

## Current Position
Pipeline: [topic from $ARGUMENTS]
Phase: [current phase name, e.g., "HLD 1 Research"]
Status: [In Progress | Paused | Complete]
Last activity: [YYYY-MM-DD HH:MM] — [what just completed]

## Documents

| Type | Phase | Path | Status |
|------|-------|------|--------|
| ADR Decisions | Discuss | [path or —] | [Complete/Pending/—] |
| ADR Research | Research | [path or —] | [Complete/Pending/—] |
| ADR Context | Gather | [path or —] | [Complete/Pending/—] |
| ADR | Generate | [path or —] | [Complete/Pending/—] |
| ADR Audit | Audit | [path or —] | [verdict or Pending/—] |
| HLD 1 Decisions | Discuss | [path or —] | [status] |
| HLD 1 Research | Research | [path or —] | [status] |
| HLD 1 Context | Gather | [path or —] | [status] |
| HLD 1 | Generate | [path or —] | [status] |
| HLD 1 Audit | Audit | [path or —] | [verdict or status] |
| LLD 1.1 Decisions | Discuss | [path or —] | [status] |
| ... | ... | ... | ... |

## Accumulated Decisions

[All D-XX entries from all discuss phases, aggregated]

### ADR Decisions
- D-01: [decision summary]
- D-02: [decision summary]

### HLD 1 Decisions
- D-01: [decision summary]

## Resume From

[Exact next action, e.g., "Phase 7-1: HLD 1 Research — invoke arch-research with $HLD_DECISIONS_PATHS[0]"]
```

### State Update Rules

- Write state ONLY at checkpoints (after user interaction), not after every tool call
- Include ALL file paths discovered so far
- "Resume From" must be specific enough to skip directly to the right phase
- Keep the file under 150 lines — it's an index, not an archive
