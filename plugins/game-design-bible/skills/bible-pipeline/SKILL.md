---
name: bible-pipeline
description: "Run the full Game Design Bible creation pipeline: 6 phases of gather → generate → audit, with cross-cutting review at the end. All phases run with clean context isolation."
disable-model-invocation: true
argument-hint: "[game concept] [--scope indie|aa|aaa] [--output-dir path]"
allowed-tools: Skill, Read, AskUserQuestion, Bash(ls:*), Bash(mkdir:*)
model: opus
---

# Bible Pipeline — Full Creation Pipeline

## Argument Parsing

Parse the following from `$ARGUMENTS`:
- `game concept`: The game idea/concept to build a design bible around (required — prompt if missing)
- `--scope`: Production scope — `indie` (default), `aa`, or `aaa`. Affects depth and section count.
- `--output-dir`: Output directory path (default: current working directory)

## State Tracking

Maintain these across all phases:
- `bible-dir`: Root directory of the bible (set after Phase 0)
- `context-files`: Map of phase → context file path
- `audit-verdicts`: Map of phase → audit result (✅ PASS / ⚠️ CONDITIONAL / ❌ FAIL / ⏭️ SKIPPED)
- `total-files`: Running count of files created
- `total-questions`: Running count of open questions

---

## Phase 0: Concept

### Step 1 — Gather
Invoke `concept-gather` with the game concept from `$ARGUMENTS`.

### Step 2 — Checkpoint
Read the generated context file. Present a summary to the user.

Options:
- ✅ **Proceed** to generation
- 🔄 **Re-run** gather with adjustments
- 🛑 **Stop** pipeline

### Step 3 — Generate
Invoke `concept-generate` with the context file path.

### Step 4 — Audit Checkpoint
Options:
- 🔍 **Audit** — Invoke `audit-concept` with the bible directory
- ⏭️ **Skip** audit, proceed to Phase 1
- 🛑 **Stop** pipeline

Record audit verdict if run.

---

## Phase 1: Core Loop

### Step 1 — Gather
Invoke `core-loop-gather` with `--bible-dir <bible-dir>`.

### Step 2 — Checkpoint
Read the generated context file. Present a summary.

Options: ✅ Proceed | 🔄 Re-run | 🛑 Stop

### Step 3 — Generate
Invoke `core-loop-generate` with the context file path.

### Step 4 — Audit Checkpoint
Options:
- 🔍 **Audit** — Invoke `audit-core-loop`
- ⏭️ **Skip** audit, proceed to Phase 2
- 🛑 **Stop** pipeline

---

## Phase 2: Systems

### Step 1 — Gather
Invoke `systems-gather` with `--bible-dir <bible-dir>`.

### Step 2 — Checkpoint
Read the generated context file. Present a summary.

Options: ✅ Proceed | 🔄 Re-run | 🛑 Stop

### Step 3 — Generate
Invoke `systems-generate` (this dispatches parallel agents for each system domain).

### Step 4 — Audit Checkpoint
Options:
- 🔍 **Audit** — Invoke `audit-systems`
- ⏭️ **Skip** audit, proceed to Phases 3+4
- 🛑 **Stop** pipeline

---

## Phases 3+4: Narrative + Art/Audio

Ask the user:

> "Phases 3 (Narrative) and 4 (Art/Audio) are independent and can run in parallel. Would you like to:
> - 🔀 **Parallel** — Run both simultaneously (faster)
> - 📋 **Sequential** — Run Phase 3 fully, then Phase 4 (more focused)"

### If Parallel:

Dispatch 2 parallel gather invocations:
- `narrative-gather` with `--bible-dir <bible-dir>`
- `art-audio-gather` with `--bible-dir <bible-dir>`

After both complete, checkpoint both context files.

Dispatch 2 parallel generate invocations:
- `narrative-generate`
- `art-audio-generate`

After both complete, offer audit checkpoint for each.

### If Sequential:

**Phase 3 — Narrative:**
1. Invoke `narrative-gather` → Checkpoint → `narrative-generate` → Audit checkpoint

**Phase 4 — Art/Audio:**
1. Invoke `art-audio-gather` → Checkpoint → `art-audio-generate` → Audit checkpoint

---

## Phase 5: Technical

### Step 1 — Gather
Invoke `technical-gather` with `--bible-dir <bible-dir>`.

### Step 2 — Checkpoint
Read the generated context file. Present a summary.

Options: ✅ Proceed | 🔄 Re-run | 🛑 Stop

### Step 3 — Generate
Invoke `technical-generate` with the context file path.

### Step 4 — Audit Checkpoint
Options:
- 🔍 **Audit** — Invoke `audit-technical`
- ⏭️ **Skip** audit
- 🛑 **Stop** pipeline

---

## Cross-Cutting Review

Ask the user:

> "All 6 phases are complete. Would you like to run a full cross-cutting bible review?
> This checks pillar consistency, internal contradictions, and 15 common game design pitfalls."
>
> - 🔍 **Full review** — Interactive with resolution options
> - ⚡ **Quick review** — Automated findings only, no interactive resolution
> - ⏭️ **Skip** — Finish pipeline without review

If review requested: Invoke `bible-review` with `<bible-dir>` and `--quick` if quick mode selected.

---

## Final Summary

Present a completion table:

```
📖 Game Design Bible Pipeline — Complete

| Phase | Files Created | Audit Verdict |
|-------|--------------|---------------|
| 0 — Concept    | N | ✅/⚠️/❌/⏭️ |
| 1 — Core Loop  | N | ✅/⚠️/❌/⏭️ |
| 2 — Systems    | N | ✅/⚠️/❌/⏭️ |
| 3 — Narrative   | N | ✅/⚠️/❌/⏭️ |
| 4 — Art/Audio   | N | ✅/⚠️/❌/⏭️ |
| 5 — Technical   | N | ✅/⚠️/❌/⏭️ |
| Cross-Cutting   | — | ✅/⚠️/❌/⏭️ |

Total files: N
Open questions: N
```

Offer next steps:
- 🏗️ **bible-to-hld** — Convert the bible into a High-Level Design document
- 📖 **bible-review** — Run (or re-run) the cross-cutting audit
- ✏️ **bible-expand** — Deep-dive into a specific section
- ✅ **Done** — Pipeline complete
