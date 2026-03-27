# Bible Review — Meta-Checklist

This checklist describes what the bible-review skill verifies from the game-design-reviewer agent's output. The actual detailed checks are performed by the agent — this is the acceptance criteria for the review skill.

## Pillar Consistency (from agent output)

- **PC-1**: Every feature serves at least one pillar (🔴)
- **PC-2**: Every pillar served by at least one feature (🔴)
- **PC-3**: No feature contradicts a pillar's "What This Rules Out" (🔴)
- **PC-4**: DESIGN-PILLARS.md matches 00-concept/design-pillars.md (🟡)
- **PC-5**: MDA aesthetics align with pillar set (🟡)

## Internal Contradictions (from agent output)

- **IC-1**: No systems vs systems conflicts (🔴)
- **IC-2**: No systems vs narrative conflicts (🔴)
- **IC-3**: No art/audio vs tone conflicts (🟡)
- **IC-4**: Terminology consistent across all files (🟡)
- **IC-5**: Numeric values consistent (no conflicting stats/numbers) (🟡)

## Pitfall Detection (from agent output)

- **PD-1**: No Non-Goals — Bible includes explicit "what this game is NOT" (🔴)
- **PD-2**: Ambiguous Failure Conditions — Clear definition of losing/failing (🔴)
- **PD-3**: Undocumented Economy — Resource flows mapped (🔴)
- **PD-4**: Magic Numbers — Numeric values have rationale (🟡)
- **PD-5**: Missing Onboarding — Onboarding plan exists (🔴)
- **PD-6**: Feature Creep — All features trace to a pillar (🟡)
- **PD-7**: Unaddressed Accessibility — Accessibility documented (🟡)
- **PD-8**: No Session Structure — Session length defined (🟡)
- **PD-9**: Missing Feedback Loops — Feedback loops described (🔴)
- **PD-10**: Orphaned Systems — All referenced systems fully designed (🟡)
- **PD-11**: Unfalsifiable Pillars — Pillars are specific enough to violate (🔴)
- **PD-12**: Missing Difficulty Strategy — Difficulty plan exists (🟡)
- **PD-13**: Scope vs Resources Mismatch — Scope management plan exists (🔴)
- **PD-14**: No Prototype Criteria — Prototype completion criteria defined (🟡)
- **PD-15**: Missing Monetization Ethics — If F2P/MTX, ethical guidelines exist (🔵)

## Report Quality

- **RQ-1**: All 3 sub-reports generated (🔴)
- **RQ-2**: Executive summary present (🟡)
- **RQ-3**: Strengths section present (positive reinforcement) (🔵)
