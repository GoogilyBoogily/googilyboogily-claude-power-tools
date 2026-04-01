---
name: arch-pipeline
description: "Run the full architecture documentation pipeline: ADR gather → generate → audit → HLD(s) gather → generate → audit → LLD(s) gather → generate → audit. Supports 1:N HLDs per ADR and 1:M LLDs per HLD. All phases run with clean context isolation. Each audit walks through issues interactively."
argument-hint: "[decision topic]"
allowed-tools: Skill, Read, AskUserQuestion, Bash(ls:*), Bash(mkdir:*)
model: opus
---

# Architecture Documentation Pipeline

Run the complete ADR → HLD(s) → LLD(s) pipeline with context isolation and quality audits. Each phase (gather, generate, audit) runs in its own forked context. The orchestrator tracks file paths and provides checkpoints between every phase.

One ADR can produce multiple HLDs (e.g., one per subsystem or concern), and each HLD can produce multiple LLDs (e.g., one per component or implementation phase). The single-document case is the default — fan-out is opt-in at each level.

## Input

$ARGUMENTS — the decision topic (e.g., "migrate from REST to GraphQL").

## Pipeline Overview

```
Phase 1:   ADR Gather       → context file
Phase 2:   ADR Generate     → ADR document
Phase 3:   ADR Audit        → interactive resolution → audit report

CHECKPOINT — HLD Scoping (1 or N HLDs)

FOR EACH HLD [i]:
  Phase 4-i: HLD Gather    → context file
  Phase 5-i: HLD Generate  → HLD document
  Phase 6-i: HLD Audit     → interactive resolution → audit report

  CHECKPOINT — LLD Scoping (1 or M LLDs for this HLD)

  FOR EACH LLD [j]:
    Phase 7-i-j: LLD Gather    → context file
    Phase 8-i-j: LLD Generate  → LLD document
    Phase 9-i-j: LLD Audit     → interactive resolution → audit report

Pipeline Complete — tree summary
```

Every phase runs with `context: fork` — the orchestrator stays lean, tracking only file paths between phases.

## Process

### State Tracking

Maintain these variables throughout the pipeline:

**ADR (single):**
- `$ADR_CONTEXT_PATH` — ADR context file
- `$ADR_PATH` — generated ADR document
- `$ADR_AUDIT_VERDICT` — PASS / PASS WITH WARNINGS / FAIL

**HLDs (indexed list):**
- `$HLD_SCOPES[]` — list of `{name, description}` (length 1 if single HLD)
- `$HLD_CONTEXT_PATHS[]` — one context file per HLD
- `$HLD_PATHS[]` — one generated document per HLD
- `$HLD_AUDIT_VERDICTS[]` — one verdict per HLD

**LLDs (nested indexed list, grouped per HLD):**
- `$LLD_SCOPES[i][]` — list of `{name, description}` per HLD
- `$LLD_CONTEXT_PATHS[i][]` — context files per HLD
- `$LLD_PATHS[i][]` — generated documents per HLD
- `$LLD_AUDIT_VERDICTS[i][]` — verdicts per HLD

---

### Phase 1: ADR Gather

Invoke: `skill: "architecture-docs:adr-gather", args: "$ARGUMENTS"`

The gather skill will:
- Ask clarifying questions interactively
- Dispatch code + web research
- Compile and save a context file

After completion, extract `$ADR_CONTEXT_PATH` from the skill's output.

**CHECKPOINT — Review ADR Context:**

Present: "ADR context gathered at `$ADR_CONTEXT_PATH`."

Ask the user using AskUserQuestion:
- **Review and proceed** — "I've reviewed the context file, proceed to generation" ⭐
- **Re-run gather** — "I want to re-run the gather phase with adjustments"
- **Stop here** — "I'll continue manually later"

If "Re-run gather": re-invoke the gather skill. If "Stop": end pipeline, report what was created.

---

### Phase 2: ADR Generate

Invoke: `skill: "architecture-docs:adr-generate", args: "$ADR_CONTEXT_PATH"`

After completion, extract `$ADR_PATH` from the skill's output.

**CHECKPOINT — ADR Generated:**

Present: "ADR generated at `$ADR_PATH`."

Ask the user:
- **Audit the ADR** — "Run the audit to check quality" ⭐
- **Skip audit, continue to HLD** — "The ADR looks good, move on"
- **Stop here** — "I'll continue manually later"

---

### Phase 3: ADR Audit

Invoke: `skill: "architecture-docs:audit-adr", args: "$ADR_PATH --context $ADR_CONTEXT_PATH"`

The audit skill will walk through each issue interactively with the user. After completion, extract `$ADR_AUDIT_VERDICT`.

**If verdict is FAIL** (critical issues skipped):

Ask the user:
- **Proceed to HLD anyway** — "Critical issues noted but not blocking"
- **Stop here** — "I need to address these issues first"

---

### HLD Scoping Checkpoint

After ADR audit completes (or is skipped), present:

> "The ADR covers **[topic from $ARGUMENTS]**. You can write a single HLD covering the full scope, or split into multiple focused HLDs (e.g., one per subsystem, layer, or architectural concern)."

Ask the user using AskUserQuestion:
- **One HLD covering everything** — "Proceed with a single HLD for the full ADR scope" ⭐
- **Multiple HLDs** — "I want to split into multiple HLDs — let me describe the scopes"

**If single HLD:** Set `$HLD_SCOPES` to one entry using the full ADR topic as the description. Proceed to the HLD loop (which runs once).

**If multiple HLDs:** Ask the user to provide a numbered list of HLD scopes. Each entry should have:
- A short **name** (becomes the kebab-case filename stem)
- A one-line **description** of what this HLD covers

Example:
> 1. **api-layer** — GraphQL schema, resolvers, and client integration
> 2. **data-migration** — Database schema changes and data migration strategy
> 3. **auth-integration** — Authentication and authorization for the new API

Store these in `$HLD_SCOPES[]`.

---

### HLD Loop — For Each HLD [i]

Process each HLD scope sequentially (including its LLDs) before moving to the next. If there are multiple HLDs, present a progress header before each iteration:

> "**HLD [i+1] of [N]: [name]** — [description]"

#### Phase 4-i: HLD Gather

Invoke: `skill: "architecture-docs:hld-gather", args: "[description of this HLD scope] --adr $ADR_PATH"`

When there are multiple HLDs, the description passed to the gather skill must clearly scope this HLD's focus. For example: "Design the API layer for the GraphQL migration (see ADR for full decision context)".

When there is a single HLD, use: `skill: "architecture-docs:hld-gather", args: "based on ADR at $ADR_PATH --adr $ADR_PATH"`

After completion, extract `$HLD_CONTEXT_PATHS[i]`.

**CHECKPOINT — Review HLD Context:**

Present: "HLD context gathered at `$HLD_CONTEXT_PATHS[i]`."

Ask the user:
- **Review and proceed** ⭐
- **Re-run gather**
- **Stop here**

If "Stop": end pipeline, report all documents created so far.

#### Phase 5-i: HLD Generate

Invoke: `skill: "architecture-docs:hld-generate", args: "$HLD_CONTEXT_PATHS[i] --adr $ADR_PATH"`

After completion, extract `$HLD_PATHS[i]`.

**CHECKPOINT — HLD Generated:**

Ask the user:
- **Audit the HLD** ⭐
- **Skip audit, continue to LLD**
- **Stop here**

#### Phase 6-i: HLD Audit

Invoke: `skill: "architecture-docs:audit-hld", args: "$HLD_PATHS[i] --context $HLD_CONTEXT_PATHS[i] --adr $ADR_PATH"`

After completion, extract `$HLD_AUDIT_VERDICTS[i]`.

**If verdict is FAIL:**

Ask the user:
- **Proceed to LLD anyway**
- **Stop here**

---

### LLD Scoping Checkpoint (after each HLD)

After HLD [i] audit completes (or is skipped), present:

> "HLD **[name]** covers [scope]. You can write a single LLD for the full HLD scope, or split into multiple focused LLDs (e.g., one per component, service, or implementation phase)."

Ask the user using AskUserQuestion:
- **One LLD covering everything** — "Proceed with a single LLD for this HLD" ⭐
- **Multiple LLDs** — "I want to split into multiple LLDs — let me describe the scopes"

**If single LLD:** Set `$LLD_SCOPES[i]` to one entry with the full HLD scope. Proceed to the LLD loop (which runs once).

**If multiple LLDs:** Ask the user to provide a numbered list of LLD scopes (same format as HLD scoping). Store in `$LLD_SCOPES[i][]`.

---

### LLD Loop — For Each LLD [j] (under HLD [i])

Process each LLD scope sequentially. If there are multiple LLDs, present a progress header:

> "**LLD [j+1] of [M] (under HLD: [HLD name]):** [name] — [description]"

#### Phase 7-i-j: LLD Gather

Invoke: `skill: "architecture-docs:lld-gather", args: "[description of this LLD scope] --hld $HLD_PATHS[i]"`

When there are multiple LLDs, the description must clearly scope this LLD's focus.

When there is a single LLD, use: `skill: "architecture-docs:lld-gather", args: "$HLD_PATHS[i] --hld $HLD_PATHS[i]"`

After completion, extract `$LLD_CONTEXT_PATHS[i][j]`.

**CHECKPOINT — Review LLD Context:**

Present: "LLD context gathered at `$LLD_CONTEXT_PATHS[i][j]`."

Ask the user:
- **Review and proceed** ⭐
- **Re-run gather**
- **Stop here**

If "Stop": end pipeline, report all documents created so far.

#### Phase 8-i-j: LLD Generate

Invoke: `skill: "architecture-docs:lld-generate", args: "$LLD_CONTEXT_PATHS[i][j] --hld $HLD_PATHS[i]"`

After completion, extract `$LLD_PATHS[i][j]`.

**CHECKPOINT — LLD Generated:**

Ask the user:
- **Audit the LLD** ⭐
- **Stop here**

#### Phase 9-i-j: LLD Audit

Invoke: `skill: "architecture-docs:audit-lld", args: "$LLD_PATHS[i][j] --context $LLD_CONTEXT_PATHS[i][j] --hld $HLD_PATHS[i]"`

After completion, extract `$LLD_AUDIT_VERDICTS[i][j]`.

---

### End of LLD Loop

After all LLDs for HLD [i] are complete, present a subtree summary:

> "All LLDs for HLD **[name]** are complete."

Then continue to the next HLD in the outer loop (if any).

---

### Pipeline Complete

Present the final summary as a document tree:

```
## Architecture Pipeline Complete

**ADR:** $ADR_PATH (Audit: $ADR_AUDIT_VERDICT)

### Document Tree

For each HLD, list it and its LLDs:

**HLD 1:** $HLD_PATHS[0] (Audit: $HLD_AUDIT_VERDICTS[0])
  - LLD: $LLD_PATHS[0][0] (Audit: $LLD_AUDIT_VERDICTS[0][0])
  - LLD: $LLD_PATHS[0][1] (Audit: $LLD_AUDIT_VERDICTS[0][1])
  ...

**HLD 2:** $HLD_PATHS[1] (Audit: $HLD_AUDIT_VERDICTS[1])
  - LLD: $LLD_PATHS[1][0] (Audit: $LLD_AUDIT_VERDICTS[1][0])
  ...

### Context Files
- ADR: $ADR_CONTEXT_PATH
- HLD: $HLD_CONTEXT_PATHS[0], $HLD_CONTEXT_PATHS[1], ...
- LLD: $LLD_CONTEXT_PATHS[0][0], $LLD_CONTEXT_PATHS[0][1], ..., $LLD_CONTEXT_PATHS[1][0], ...

### Audit Reports
- ADR: [path]-AUDIT.md
- HLD: [each HLD path]-AUDIT.md
- LLD: [each LLD path]-AUDIT.md
```

### Next Steps

Collect all LLD paths into a numbered list and ask the user:
- **Implement an LLD** — "Pick which LLD to implement" → present the numbered list, then invoke `/architecture-docs:implement $LLD_PATHS[i][j]`
- **Review documents** — "I want to review everything before proceeding"
- **Done** — "Pipeline complete, I'll take it from here"
