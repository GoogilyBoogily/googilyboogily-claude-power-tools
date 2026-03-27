# Game HLD Audit Checklist

## Template Compliance (per HLD)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| TC-1 | All 13 game HLD template sections present | 🔴 CRITICAL | Verify sections 1–13 exist: Problem Statement, Goals and Non-Goals, Proposed Solution, Alternatives Considered, Asset Pipeline Impact, Multiplayer/Networking, Platform Considerations, Performance Budget, Reliability & Edge Cases, Testing Strategy, Open Questions, Implementation Phases, Cross-References. Sections marked "Skip if..." in the template are exempt if the skip condition is met. |
| TC-2 | Problem Statement traces to bible source | 🔴 CRITICAL | The Problem Statement must reference the bible's description of this feature and connect it to the core loop. Check for explicit bible source citations. |
| TC-3 | Goals are specific and measurable | 🟡 WARNING | Each goal must be concrete enough to verify — reject vague goals like "good performance" or "fun gameplay". Goals should include targets where applicable (e.g., "combat resolution in <2ms per frame"). |
| TC-4 | Asset Pipeline section addresses game-specific assets | 🟡 WARNING | The Asset Pipeline Impact section must list actual asset types relevant to this system (textures, audio, animations, data files, shaders, UI assets) with estimated counts and formats — not just repeat the template. |
| TC-5 | Performance Budget section exists with frame-time targets | 🟡 WARNING | The Performance Budget must include specific frame-time-oriented targets (CPU ms per frame, memory MB, draw calls, etc.) — not just placeholder values from the template. |
| TC-6 | Platform Considerations section addresses all target platforms | 🟡 WARNING | If the Technical Landscape specifies multiple platforms, each platform must be addressed in the Platform Considerations table with platform-specific details. |

## Pillar Alignment (per HLD)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| PA-1 | Every key design decision serves at least one pillar | 🔴 CRITICAL | Read the Key Design Decisions subsection. Each decision must explicitly state which pillar(s) it serves and how. Decisions without pillar justification are ungrounded. |
| PA-2 | No decision contradicts a pillar's "What This Rules Out" | 🔴 CRITICAL | Cross-check every design decision and alternative rejection against DESIGN-PILLARS.md. If a decision falls into a pillar's exclusion list, it is a contradiction. |
| PA-3 | Pillar validation pass documented | 🟡 WARNING | The HLD should show evidence of a pillar validation pass — either in the Key Design Decisions section or as a note confirming all decisions were checked against pillars. |

## Bible Fidelity (requires --bible-dir)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| BF-1 | HLD approach traces to bible feature design | 🔴 CRITICAL | The Proposed Solution must be a technical translation of the bible's feature design — not an invention of new gameplay features. Compare the HLD's approach against the bible source file. |
| BF-2 | No game design details invented beyond bible | 🔴 CRITICAL | Scan the HLD for gameplay mechanics, features, or design choices not present in the bible source. Any new design details should be in Open Questions, not presented as decided. |
| BF-3 | Technical context matches bible's engine/tools | 🟡 WARNING | The engine, tools, and platform references in the HLD must match what the bible's technical section specifies. |
| BF-4 | Cross-references to bible sources present | 🟡 WARNING | The Cross-References section must include a link to the bible source file and related bible sections. |

## Cross-HLD Consistency

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CH-1 | No contradicting approaches between HLDs | 🔴 CRITICAL | Compare architectural decisions across all HLDs. Look for: conflicting data models, incompatible communication patterns, contradictory authority models (networking), or mutually exclusive performance assumptions. |
| CH-2 | Shared systems referenced consistently | 🟡 WARNING | When multiple HLDs reference the same shared system (e.g., save system, event bus, UI framework), verify they describe it consistently — same names, same interfaces, same assumptions. |
| CH-3 | Performance budgets don't exceed total frame time | 🟡 WARNING | Sum the CPU time per frame budgets across all HLDs. If the total exceeds the target frame time (e.g., 16.67ms for 60fps), flag the overcommitment. |

## Pillar Coverage Matrix

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| PM-1 | Every pillar covered by at least one HLD | 🟡 WARNING | Check the Pillar Coverage Matrix in INDEX.md (or derive from HLD headers). Every design pillar should have at least one HLD that serves it. Uncovered pillars represent architectural gaps. |
| PM-2 | No HLD serves zero pillars | 🔴 CRITICAL | Every HLD must serve at least one design pillar. An HLD that serves no pillars is architecturally unjustified — it exists without design grounding. |

## Context Fidelity (requires --context)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CF-1 | All selected features have generated HLDs | 🔴 CRITICAL | Compare the Selected Features list in the context file against the generated HLD files. Every selected feature must have a corresponding HLD. |
| CF-2 | Technical landscape matches context | 🟡 WARNING | Verify that engine, platform, and constraint details in HLDs match the Technical Landscape Summary in the context file. |

## Open Questions

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| OQ-1 | No TODO/TBD markers outside Open Questions section | 🟡 WARNING | Scan all HLD files for: TODO, TBD, FIXME, XXX, HACK. These markers should only appear in the Open Questions section (section 11), not scattered throughout the document. |
| OQ-2 | No placeholder text | 🟡 WARNING | Scan for template text that was not filled in: unfilled table cells with only template examples, "[...]" placeholders, "lorem ipsum", or obvious boilerplate from the template. |
