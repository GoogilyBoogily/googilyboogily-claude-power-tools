---
name: core-loop-generate
description: "Generate Core Loop phase (Phase 1) documents from a gathered context file. Creates core-loop.md and prototype-spec.md. Clean context, non-interactive."
disable-model-invocation: true
context: fork
argument-hint: "[context-file] [--output-dir path]"
allowed-tools: Read, Write, Edit, Glob, Grep
model: opus
---

# Core Loop Generator

Generate the Core Loop phase (Phase 1) documents from a previously gathered context file. This skill runs with clean context and is non-interactive — all questions were answered during the gather phase.

## Input

$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Context File**: First non-flag argument (e.g., `docs/game-design-bible/context/core-loop-context.md`)
- **Output Directory**: `--output-dir <path>` (default: derived from context file's Bible Directory, i.e., `<bible-dir>/01-core-loop/`)

## Source Integrity Rules

**Every factual claim in these documents must be traceable to the context file.**

1. **Ground every claim.** Every design statement must trace back to a specific entry in the context file (user answers, pillar definitions, concept context, or web research with URLs).
2. **Flag ungrounded claims.** If you need to state something not in the context file, mark it explicitly as `[ASSUMPTION]` in the document.
3. **Never invent details.** If the context file doesn't cover something, put it in Open Questions — don't fabricate.

## Process

### Step 1: Read Context and Pillars

1. Read the context file at the path provided in `$ARGUMENTS`.
2. Read `<bible-dir>/DESIGN-PILLARS.md` (derive bible-dir from the context file's Bible Directory field).
3. Extract:
   - Core Action, Feedback, Rewards, Motivation, Session Structure
   - All design pillars with definitions
   - Concept context (genre, platform, audience)
   - Web research findings
   - Open questions

### Step 2: Create Output Directory

```bash
mkdir -p <output-dir>
```

Use Glob to verify `<output-dir>` exists.

### Step 3: Generate core-loop.md

Write `<output-dir>/core-loop.md` following this structure:

```markdown
# Core Loop — [Game Name]

> Pillar Alignment: [list which pillars this document serves]

## Overview

[1 paragraph summarizing the core gameplay loop — what the player does, why it's compelling, and how it serves the design pillars]

## The Loop

```
┌─────────────┐
│   ACTION     │ ← [core verb(s)]
└──────┬──────┘
       ▼
┌─────────────┐
│  FEEDBACK    │ ← [how game responds]
└──────┬──────┘
       ▼
┌─────────────┐
│   REWARD     │ ← [what player gets]
└──────┬──────┘
       ▼
┌─────────────┐
│ MOTIVATION   │ ← [why player repeats]
└──────┬──────┘
       │
       └──────→ back to ACTION
```

## Action

[Detailed description of the core player action(s). What does the player physically do — inputs, decisions, moment-to-moment choices. Ground in context file's Core Action section.]

### Input Vocabulary

[What buttons/gestures/commands does the player use? How does the action space evolve over time?]

## Feedback

[How the game communicates results back to the player. Visual, audio, haptic, systemic responses. Include 2-3 concrete examples from the context file.]

### Feedback Channels

| Channel | Example | Timing |
|---------|---------|--------|
| Visual | [example] | [immediate/delayed] |
| Audio | [example] | [immediate/delayed] |
| Systemic | [example] | [immediate/delayed] |

## Reward

[What the player earns or unlocks. Distinguish immediate from delayed rewards. Explain how rewards create the "one more turn" hook.]

### Reward Schedule

| Reward | Type | Frequency | Purpose |
|--------|------|-----------|---------|
| [reward] | [immediate/delayed] | [per action/per session/milestone] | [engagement hook/progression/mastery] |

## Motivation

[Why the player returns to the loop. Primary motivational driver and how the loop stays fresh over time. How does complexity layer? Does the context change?]

### Freshness Mechanisms

[How the loop avoids becoming stale — new challenges, evolving systems, social dynamics, content variety]

## Session Structure

[How a play session flows from start to finish]

### Session Start
[How the player enters the loop — menu flow, world entry, resumption of progress]

### Session Flow
[The middle — what the flow state looks like, how long the player stays engaged]

### Session End
[Natural stopping points vs. "just one more" hooks. How the game handles save/quit]

### Estimated Session Length
[Target session duration based on platform and genre context]

## Pillar Validation

[For EACH design pillar, explicitly state how the core loop serves it. Flag any pillar that is NOT served by the loop.]

| Pillar | Served By | How |
|--------|-----------|-----|
| [pillar name] | [which loop element(s)] | [specific explanation] |

**Gaps:** [List any pillars not served by the core loop. These MUST be addressed by later phases or flagged as design risks.]

## Design Rationale

[Why this loop was chosen over alternatives. Reference web research findings for genre conventions and known pitfalls. Cite URLs from context file.]

## Open Questions

- [Anything unresolved from the context file, plus new questions that emerged during generation]

## Cross-References

- **Design Pillars:** [path to DESIGN-PILLARS.md]
- **Concept:** [paths to 00-concept/ files]
- **Prototype Spec:** [path to prototype-spec.md]
- **Context File:** [path to context file]

## Changelog

| Date | Change | Author |
|------|--------|--------|
| [today] | Initial creation from context gathering | Claude |
```

### Step 4: Generate prototype-spec.md

Write `<output-dir>/prototype-spec.md` following this structure:

```markdown
# Prototype Spec — [Game Name]

> Pillar Alignment: [list which pillars the prototype must validate]

## Overview

[1 paragraph describing what this prototype proves — the minimum slice of the core loop needed to validate the design pillars]

## Must-Have for Prototype

[Minimal feature set that captures the core loop. Each item must map to a loop element (Action, Feedback, Reward, or Motivation). Keep this list ruthlessly short — if it's not needed to prove the loop works, it goes in Nice-to-Have.]

| # | Feature | Loop Element | Pillar(s) Served | Description |
|---|---------|-------------|------------------|-------------|
| 1 | [feature] | [Action/Feedback/Reward/Motivation] | [pillar names] | [brief description] |

## Nice-to-Have

[Features that enhance the prototype but aren't required to validate the core loop. Prioritized by pillar impact.]

| # | Feature | Loop Element | Pillar(s) Served | Why Deferred |
|---|---------|-------------|------------------|--------------|
| 1 | [feature] | [element] | [pillars] | [reason it can wait] |

## Out of Scope

[Features explicitly excluded from the prototype. Reference non-goals from concept docs where applicable.]

## Success Criteria

[Observable, testable criteria tied directly to design pillars. Each criterion answers: "How do we know the loop works?"]

| # | Criterion | Pillar | How to Test | Pass Condition |
|---|-----------|--------|-------------|----------------|
| 1 | [criterion] | [pillar name] | [test method — playtest observation, metric, user feedback] | [what "passing" looks like] |

**Pillar Coverage:** [Verify every pillar has at least one success criterion. Flag any gaps.]

## Design Rationale

[Why these features were chosen as the minimum set. Why the cut line was drawn here. Reference core-loop.md for the full loop design.]

## Open Questions

- [Anything unresolved — technical unknowns, design risks, playtesting concerns]

## Cross-References

- **Core Loop:** [path to core-loop.md]
- **Design Pillars:** [path to DESIGN-PILLARS.md]
- **Concept:** [paths to 00-concept/ files]
- **Context File:** [path to context file]

## Changelog

| Date | Change | Author |
|------|--------|--------|
| [today] | Initial creation from context gathering | Claude |
```

### Step 5: Validate Pillar Coverage

After writing both files, perform a validation pass:

1. Read DESIGN-PILLARS.md and extract all pillar names.
2. Read the generated core-loop.md and check the Pillar Validation table.
3. Read the generated prototype-spec.md and check the Success Criteria pillar column.
4. **Flag any pillar that is NOT served by at least one loop element AND does not have a success criterion.**
5. If gaps exist, add a warning comment at the top of core-loop.md:
   ```
   <!-- ⚠️ PILLAR GAP: [pillar name] is not served by the core loop. Address in later phases or revisit loop design. -->
   ```

### Step 6: Update INDEX.md

Read `<bible-dir>/INDEX.md` and update the Phase 1 entry from its current status to `✅ Complete`.

### Step 7: Return

Report all generated file paths:
- `<output-dir>/core-loop.md`
- `<output-dir>/prototype-spec.md`

Tell the user: "Core loop documents saved. Run `/game-design-bible:audit-core-loop <bible-dir> --context <context-file>` to audit them."
