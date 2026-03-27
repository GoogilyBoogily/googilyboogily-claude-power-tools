# Core Loop Audit Checklist

## Loop Completeness

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| LC-1 | All 4 loop elements present (Action, Feedback, Reward, Motivation) | 🔴 CRITICAL | Verify core-loop.md has substantive Action, Feedback, Reward, and Motivation sections — each with more than a single sentence |
| LC-2 | Loop diagram exists | 🟡 WARNING | Verify core-loop.md contains an ASCII or visual diagram showing the Action→Feedback→Reward→Motivation→Action cycle |
| LC-3 | Each element has substantive description (not placeholder) | 🟡 WARNING | Each loop element section must contain concrete, game-specific details — not generic descriptions or template text |
| LC-4 | Loop creates a clear cycle (motivation leads back to action) | 🔴 CRITICAL | The Motivation section must explicitly explain why the player returns to the Action phase — the loop must close |
| LC-5 | Session structure defined (start, flow, end) | 🟡 WARNING | Session Structure section must describe how a play session begins, what the flow state looks like, and how/when sessions end |

## Pillar Coverage

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| PC-1 | Every pillar served by at least one loop element | 🔴 CRITICAL | Cross-reference DESIGN-PILLARS.md against the Pillar Validation table in core-loop.md — every pillar must appear |
| PC-2 | Pillar Validation section explicitly maps pillars to loop elements | 🟡 WARNING | The Pillar Validation table must exist and map each pillar to specific loop elements with explanations |
| PC-3 | No loop element contradicts a pillar | 🔴 CRITICAL | Check each loop element against every pillar's "What This Rules Out" list (if present in DESIGN-PILLARS.md) — no contradictions allowed |

## Prototype Spec

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| PS-1 | Prototype spec exists | 🟡 WARNING | Verify prototype-spec.md exists in the 01-core-loop/ directory |
| PS-2 | Must-Have list is minimal and focused | 🟡 WARNING | Must-Have table should contain only features necessary to prove the core loop works — typically 3-7 items. More than 10 suggests scope creep |
| PS-3 | Success criteria tied to design pillars | 🔴 CRITICAL | Every success criterion must reference at least one design pillar by name |
| PS-4 | Success criteria are testable/observable | 🟡 WARNING | Each success criterion must have a concrete "How to Test" method and a "Pass Condition" that an observer could verify |

## Source Integrity

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SI-1 | No prior-session references | 🔴 CRITICAL | Scan for: "from our previous conversation," "as we discussed before," "based on prior analysis," "from memory," "as mentioned earlier" |
| SI-2 | Assumptions labeled | 🟡 WARNING | Scan for unqualified assertions that aren't grounded in context file citations, pillar definitions, or web research URLs. Check if any should be marked as `[ASSUMPTION]` |

## Context Fidelity (requires --context)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CF-1 | Core action matches context | 🟡 WARNING | The Action section in core-loop.md should align with the Core Action section in the context file |
| CF-2 | All loop elements from context present | 🔴 CRITICAL | Every loop element described in the context file (Core Action, Feedback, Rewards, Motivation) must appear in core-loop.md — nothing silently dropped |
| CF-3 | Session structure matches context | 🟡 WARNING | The Session Structure section should align with what was gathered in the context file |

## Open Questions

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| OQ-1 | No TODO/TBD/FIXME markers | 🟡 WARNING | Scan both core-loop.md and prototype-spec.md for TODO, TBD, FIXME, XXX, HACK markers |
| OQ-2 | No placeholder text | 🟡 WARNING | Scan for: "{...}", "[...]", "lorem ipsum", "example", "placeholder", template text that wasn't filled in |
