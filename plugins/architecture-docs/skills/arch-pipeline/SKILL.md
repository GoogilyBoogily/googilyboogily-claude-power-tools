---
name: arch-pipeline
description: "Run the full architecture documentation pipeline: ADR gather → generate → audit → HLD gather → generate → audit → LLD gather → generate → audit. All phases run with clean context isolation. Each audit walks through issues interactively."
argument-hint: "[decision topic]"
allowed-tools: Skill, Read, AskUserQuestion, Bash(ls:*), Bash(mkdir:*)
model: opus
---

# Architecture Documentation Pipeline

Run the complete ADR → HLD → LLD pipeline with context isolation and quality audits. Each phase (gather, generate, audit) runs in its own forked context. The orchestrator tracks file paths and provides checkpoints between every phase.

## Input

$ARGUMENTS — the decision topic (e.g., "migrate from REST to GraphQL").

## Pipeline Overview

```
Phase 1: ADR Gather    → context file
Phase 2: ADR Generate  → ADR document
Phase 3: ADR Audit     → interactive resolution → audit report
Phase 4: HLD Gather    → context file
Phase 5: HLD Generate  → HLD document
Phase 6: HLD Audit     → interactive resolution → audit report
Phase 7: LLD Gather    → context file
Phase 8: LLD Generate  → LLD document
Phase 9: LLD Audit     → interactive resolution → audit report
```

Every phase runs with `context: fork` — the orchestrator stays lean, tracking only file paths between phases.

## Process

### State Tracking

Maintain these variables throughout the pipeline:
- `$ADR_CONTEXT_PATH` — ADR context file
- `$ADR_PATH` — generated ADR document
- `$ADR_AUDIT_VERDICT` — PASS / PASS WITH WARNINGS / FAIL
- `$HLD_CONTEXT_PATH` — HLD context file
- `$HLD_PATH` — generated HLD document
- `$HLD_AUDIT_VERDICT` — verdict
- `$LLD_CONTEXT_PATH` — LLD context file
- `$LLD_PATH` — generated LLD document
- `$LLD_AUDIT_VERDICT` — verdict

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

### Phase 4: HLD Gather

Invoke: `skill: "architecture-docs:hld-gather", args: "based on ADR at $ADR_PATH --adr $ADR_PATH"`

After completion, extract `$HLD_CONTEXT_PATH`.

**CHECKPOINT — Review HLD Context:**

Present: "HLD context gathered at `$HLD_CONTEXT_PATH`."

Ask the user:
- **Review and proceed** ⭐
- **Re-run gather**
- **Stop here**

---

### Phase 5: HLD Generate

Invoke: `skill: "architecture-docs:hld-generate", args: "$HLD_CONTEXT_PATH --adr $ADR_PATH"`

After completion, extract `$HLD_PATH`.

**CHECKPOINT — HLD Generated:**

Ask the user:
- **Audit the HLD** ⭐
- **Skip audit, continue to LLD**
- **Stop here**

---

### Phase 6: HLD Audit

Invoke: `skill: "architecture-docs:audit-hld", args: "$HLD_PATH --context $HLD_CONTEXT_PATH --adr $ADR_PATH"`

After completion, extract `$HLD_AUDIT_VERDICT`.

**If verdict is FAIL:**

Ask the user:
- **Proceed to LLD anyway**
- **Stop here**

---

### Phase 7: LLD Gather

Invoke: `skill: "architecture-docs:lld-gather", args: "$HLD_PATH --hld $HLD_PATH"`

After completion, extract `$LLD_CONTEXT_PATH`.

**CHECKPOINT — Review LLD Context:**

Present: "LLD context gathered at `$LLD_CONTEXT_PATH`."

Ask the user:
- **Review and proceed** ⭐
- **Re-run gather**
- **Stop here**

---

### Phase 8: LLD Generate

Invoke: `skill: "architecture-docs:lld-generate", args: "$LLD_CONTEXT_PATH --hld $HLD_PATH"`

After completion, extract `$LLD_PATH`.

**CHECKPOINT — LLD Generated:**

Ask the user:
- **Audit the LLD** ⭐
- **Stop here**

---

### Phase 9: LLD Audit

Invoke: `skill: "architecture-docs:audit-lld", args: "$LLD_PATH --context $LLD_CONTEXT_PATH --hld $HLD_PATH"`

After completion, extract `$LLD_AUDIT_VERDICT`.

---

### Pipeline Complete

Present the final summary:

```
## Architecture Pipeline Complete

| Phase | Document | Audit Verdict |
|-------|----------|---------------|
| ADR | $ADR_PATH | $ADR_AUDIT_VERDICT |
| HLD | $HLD_PATH | $HLD_AUDIT_VERDICT |
| LLD | $LLD_PATH | $LLD_AUDIT_VERDICT |

### Context Files
- ADR: $ADR_CONTEXT_PATH
- HLD: $HLD_CONTEXT_PATH
- LLD: $LLD_CONTEXT_PATH

### Audit Reports
- ADR: [path]-AUDIT.md
- HLD: [path]-AUDIT.md
- LLD: [path]-AUDIT.md
```

Ask the user:
- **Begin implementation** — Invoke `/architecture-docs:implement $LLD_PATH`
- **Review documents** — "I want to review everything before proceeding"
- **Done** — "Pipeline complete, I'll take it from here"
