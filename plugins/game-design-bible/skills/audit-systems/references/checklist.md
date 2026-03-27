# Systems Phase Audit Checklist

## Per-System Completeness

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SC-1 | Each system has Overview section | 🟡 WARNING | Look for `## Overview` with at least one substantive paragraph explaining what the system does and why it exists |
| SC-2 | Each system has Core Mechanics section | 🔴 CRITICAL | Look for `## Core Mechanics` with concrete rules and interactions — not just a vague description |
| SC-3 | Each system has Feedback Loops defined | 🔴 CRITICAL | Look for `## Feedback Loops` with both positive loops (what accelerates) and negative loops (what provides balance/catch-up) |
| SC-4 | Each system has Balance Levers identified | 🟡 WARNING | Look for `## Balance Levers` with tunable parameters and suggested ranges — designers need knobs to turn |
| SC-5 | Each system has Edge Cases documented | 🟡 WARNING | Look for `## Edge Cases` or `## Edge Cases & Failure States` with specific scenarios for when the system breaks or players exploit it |
| SC-6 | Each system has Design Rationale | 🟡 WARNING | Look for `## Design Rationale` explaining why these choices were made and what alternatives were considered |

## Pillar Alignment

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| PA-1 | Every system serves at least one pillar | 🔴 CRITICAL | Check `> Pillar Alignment:` line — must list at least one pillar name from DESIGN-PILLARS.md |
| PA-2 | No orphaned systems (systems serving no pillar) | 🔴 CRITICAL | Cross-reference every system's pillar alignment with the master pillar list — any system not aligned to a pillar has no design justification |
| PA-3 | Every pillar served by at least one system | 🟡 WARNING | Reverse check — for each pillar in DESIGN-PILLARS.md, at least one system should list it in Pillar Alignment |
| PA-4 | No system contradicts a pillar | 🔴 CRITICAL | For each system's mechanics, check against every pillar's "What This Rules Out" list — if a mechanic resembles a ruled-out item, flag it as a contradiction |

## Cross-System Consistency

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CS-1 | No conflicting terminology between systems | 🟡 WARNING | Scan for the same concept described with different terms across systems (e.g., "gold" in one, "coins" in another for the same currency) |
| CS-2 | Shared resources/currencies consistent across systems | 🔴 CRITICAL | If multiple systems reference the same resource (currency, health, energy), verify they agree on how it works, its limits, and its flow |
| CS-3 | Progression systems don't invalidate other systems | 🟡 WARNING | Check if progression/leveling makes other systems trivial or irrelevant at high levels (e.g., economy becomes meaningless, combat has no challenge) |
| CS-4 | Cross-references between related systems exist | 🔵 INFO | Systems that share resources or interact should have `## Cross-References` linking to each other |

## Core Loop Integration

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CL-1 | Each system connects to the core loop | 🔴 CRITICAL | Every system must clearly participate in at least one stage of the Action → Feedback → Reward → Motivation cycle documented in core-loop.md |
| CL-2 | Systems don't bypass or shortcut the core loop | 🟡 WARNING | Check for systems that let players skip the core action entirely (e.g., auto-play, passive income that exceeds active play rewards) |

## Source Integrity

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SI-1 | No prior-session references | 🔴 CRITICAL | Scan for: "from our previous conversation," "as we discussed before," "based on prior analysis," "from memory," "as mentioned earlier" |
| SI-2 | Assumptions labeled | 🟡 WARNING | Ungrounded assertions should be marked `[ASSUMPTION]` or placed in Open Questions — not stated as facts |

## Context Fidelity (requires --context)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CF-1 | All selected systems from context have documents | 🔴 CRITICAL | Compare the "Selected Systems" list in the context file against actual files in 02-systems/ — every selected system should have a corresponding document |
| CF-2 | Per-system scope matches context | 🟡 WARNING | Compare each system's Scale/Feel/Boundaries answers in the context file against what the system document actually describes — the document should respect the user's stated scope |

## Open Questions

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| OQ-1 | No TODO/TBD/FIXME markers | 🟡 WARNING | Scan all system documents for unresolved markers: TODO, TBD, FIXME, XXX, HACK |
| OQ-2 | No placeholder text | 🟡 WARNING | Scan for template text, `{...}`, `[...]` used as placeholders, "lorem ipsum", or clearly incomplete sentences |
