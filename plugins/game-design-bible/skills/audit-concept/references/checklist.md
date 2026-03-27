# Concept Phase Audit Checklist

## Pillar Quality

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| PQ-1 | 3–5 pillars exist | 🔴 CRITICAL | Count the pillars in DESIGN-PILLARS.md and 00-concept/design-pillars.md; must be between 3 and 5 inclusive |
| PQ-2 | Each pillar is 2–5 words, memorable | 🟡 WARNING | Check pillar names are concise and distinctive; reject single-word or sentence-length names |
| PQ-3 | Each pillar has "What This Rules Out" with 3+ items | 🔴 CRITICAL | Every pillar must have a "What This Rules Out" section with at least 3 concrete exclusions |
| PQ-4 | Counterexamples are concrete and plausible, not vague | 🟡 WARNING | Each exclusion must name a specific feature, mechanic, or approach — not vague statements like "bad design" or "things that don't fit" |
| PQ-5 | Pillars are unique to this game, not generic truths | 🟡 WARNING | Reject pillars that any game would claim (e.g., "Fun Gameplay", "Good Controls"); a valid pillar must be something a reasonable designer could argue against |
| PQ-6 | Pillars are in tension with alternatives | 🔵 INFO | Each pillar should represent a choice — verify that the opposite approach is plausible for a different game |
| PQ-7 | No contradictory pillars | 🔴 CRITICAL | Check the Pillar Interactions table for contradictions; no two pillars should make it impossible to satisfy both simultaneously |
| PQ-8 | Pillars together cover the core fantasy | 🟡 WARNING | Read the core fantasy in vision.md, then verify that the pillars collectively support delivering that emotional experience |

## MDA Alignment

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| MA-1 | 2–3 target aesthetics identified | 🔴 CRITICAL | Count aesthetics in mda-analysis.md; must be between 2 and 3 from the MDA framework |
| MA-2 | Each aesthetic has required dynamics specified | 🟡 WARNING | Every listed aesthetic must have at least one corresponding dynamic in the Dynamics → Aesthetics traceability |
| MA-3 | Each dynamic has required mechanics specified | 🟡 WARNING | Every listed dynamic must have at least one corresponding mechanic in the Mechanics → Dynamics traceability |
| MA-4 | No mechanics that contradict target aesthetics | 🔴 CRITICAL | Cross-check every mechanic against each target aesthetic; a mechanic that undermines an aesthetic is a design conflict |
| MA-5 | MDA chain aligns with design pillars | 🟡 WARNING | Verify that the mechanics and dynamics support (or at minimum don't contradict) the design pillars |

## Non-Goals

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| NG-1 | Non-goals section exists and is non-empty | 🔴 CRITICAL | 00-concept/non-goals.md must exist and contain at least one concrete non-goal |
| NG-2 | Non-goals are specific, not vague | 🟡 WARNING | Each non-goal must name a concrete feature, mechanic, or scope item — reject vague entries like "nothing bad" or "avoid complexity" |
| NG-3 | Non-goals don't contradict design pillars | 🔴 CRITICAL | No non-goal should exclude something that a design pillar requires; cross-check each non-goal against the pillar "What This Approves" lists |

## Vision Clarity

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| VC-1 | Elevator pitch exists (2–3 sentences) | 🟡 WARNING | vision.md must have an Elevator Pitch section with 2–3 sentences that convey the game's hook without jargon |
| VC-2 | Core fantasy is emotional, not mechanical | 🟡 WARNING | The Core Fantasy section must describe feelings and experiences, not game mechanics or systems |
| VC-3 | Comparable titles listed with differentiators | 🔵 INFO | vision.md should list 3–5 comparable games, each with what is shared and how this game differs |
| VC-4 | Target audience defined | 🔵 INFO | vision.md should specify who the game is for — gamer profile, comparable game audiences, or demographic indicators |

## Source Integrity

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SI-1 | No prior-session references | 🔴 CRITICAL | Scan all Phase 0 files for: "from our previous conversation," "as we discussed before," "based on prior analysis," "from memory," "as mentioned earlier" |
| SI-2 | Assumptions are labeled | 🟡 WARNING | Any ungrounded assertion must be marked with `[ASSUMPTION]` and have a corresponding Open Questions entry |

## Context Fidelity (requires --context)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CF-1 | All pillars from context appear in output | 🔴 CRITICAL | Every design pillar in the context file must appear in both DESIGN-PILLARS.md and 00-concept/design-pillars.md with matching names |
| CF-2 | MDA analysis matches context | 🟡 WARNING | Target aesthetics, dynamics, and mechanics in mda-analysis.md should match the context file's MDA analysis |
| CF-3 | Non-goals match context | 🟡 WARNING | Every non-goal in the context file should appear in 00-concept/non-goals.md |
| CF-4 | No significant context dropped | 🔵 INFO | Check that major context file sections (core fantasy, genre, audience, web research) are reflected in the output documents |

## Open Questions

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| OQ-1 | No TODO/TBD/FIXME markers | 🟡 WARNING | Scan all Phase 0 files for unresolved markers: TODO, TBD, FIXME, XXX, HACK |
| OQ-2 | No placeholder text | 🟡 WARNING | Scan for template text, "{...}", "[...]", "lorem ipsum", or obvious placeholder content that was not filled in |
