# HLD Audit Checklist

## Template Compliance

### Required Sections
| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| TC-1 | Header has Author, Date, Status, Reviewers | 🟡 WARNING | All four metadata fields present |
| TC-2 | Problem Statement (Section 1) is substantive | 🔴 CRITICAL | Must be more than one sentence; not placeholder text; explains context and motivation |
| TC-3 | Goals are specific and measurable | 🔴 CRITICAL | Each goal should be independently verifiable, not vague ("improve performance" → "reduce p95 latency to <200ms") |
| TC-4 | Non-Goals section exists | 🟡 WARNING | Must explicitly scope out adjacent concerns |
| TC-5 | Proposed Solution has Overview subsection | 🔴 CRITICAL | 2-3 paragraph summary readable standalone |
| TC-6 | Proposed Solution has Architecture subsection | 🔴 CRITICAL | Component-level description with communication patterns |
| TC-7 | Alternatives Considered has ≥2 alternatives | 🔴 CRITICAL | At least 2 seriously evaluated alternatives with honest tradeoffs |
| TC-8 | Each alternative has a rejection reason | 🟡 WARNING | "Why rejected" must be specific technical/business reasons, not dismissive |
| TC-9 | Each alternative acknowledges what it would be better at | 🟡 WARNING | Honest tradeoff analysis — what was the rejected option's strength? |
| TC-10 | Codebase Impact has actual file paths | 🔴 CRITICAL | Files to Modify/Create/Remove tables must reference real paths, not placeholders |
| TC-11 | Implementation Phases table exists | 🟡 WARNING | Must have Phase, Scope, Depends On, Deliverable columns |
| TC-12 | References section exists | 🔵 INFO | Should link to related ADRs, external docs, tickets |

### Conditional Sections
| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| TC-13 | Data Model section present if new data entities exist | 🟡 WARNING | If Goals or Solution mention new data, Data Model must address storage and access patterns |
| TC-14 | API Design section present if new APIs exist | 🟡 WARNING | If Solution mentions new endpoints/methods, API Design must have signatures and error cases |
| TC-15 | Security section addresses new attack surface | 🟡 WARNING | If Solution introduces user-facing changes or external integrations, Security must address it |

## Source Integrity

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SI-1 | No prior-session references | 🔴 CRITICAL | Scan for: "from our previous conversation," "as we discussed before," "based on prior analysis," "from memory" |
| SI-2 | Code references cite file:line | 🟡 WARNING | Claims about existing code patterns should include file path references |
| SI-3 | External claims cite sources | 🟡 WARNING | Best practices, standards claims should reference URLs or documentation |
| SI-4 | Assumptions are labeled | 🟡 WARNING | Ungrounded assertions should be marked or placed in Open Questions |

## ADR Alignment (requires --adr flag)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| AA-1 | HLD approach aligns with ADR's chosen option | 🔴 CRITICAL | The Proposed Solution should implement the ADR's Decision Outcome, not a rejected option |
| AA-2 | HLD goals map to ADR's decision drivers | 🟡 WARNING | Each ADR decision driver should be addressed by at least one HLD goal |
| AA-3 | HLD doesn't sneak in rejected options | 🔴 CRITICAL | The approach must not incorporate key aspects of options the ADR explicitly rejected |
| AA-4 | HLD References section links to ADR | 🟡 WARNING | ADR path should appear in References section |
| AA-5 | ADR has forward reference to this HLD | 🔵 INFO | ADR's More Information section should link to this HLD |

## Architectural Completeness

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| AC-1 | Architecture diagram exists | 🔴 CRITICAL | At least one mermaid diagram showing component relationships |
| AC-2 | Sequence diagram exists for key flows | 🟡 WARNING | At least one sequence diagram showing primary interaction flow |
| AC-3 | Data model addresses storage and access patterns | 🟡 WARNING | If data entities exist, must specify where data lives and how it's accessed |
| AC-4 | Failure modes section is substantive | 🔴 CRITICAL | "Reliability & Failure Modes" must address specific failure scenarios, not just "handle errors gracefully" |
| AC-5 | Migration strategy is actionable | 🟡 WARNING | "Migration & Rollout" must be more than "deploy it" — needs deployment sequence, rollback plan |
| AC-6 | Implementation phases have dependencies | 🟡 WARNING | Phases must specify what depends on what — a flat list with no dependencies is suspicious |
| AC-7 | Phase dependency diagram exists | 🔵 INFO | Mermaid diagram showing phase ordering |

## Context Fidelity (requires --context flag)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CF-1 | Problem statement matches context | 🟡 WARNING | HLD problem statement aligns with context file |
| CF-2 | Goals match context | 🟡 WARNING | HLD goals reflect user's stated objectives from context |
| CF-3 | Change map matches context | 🔴 CRITICAL | Files in Codebase Impact should match context file's change map |
| CF-4 | User's scope boundaries are respected | 🟡 WARNING | Non-Goals should reflect user's explicit scope exclusions from context |
| CF-5 | Codebase findings are incorporated | 🟡 WARNING | Relevant findings from context's code research appear in HLD |
| CF-6 | No significant context dropped | 🔵 INFO | Check if major user answers or research findings are missing |

## Decision Coverage (requires --context flag with D-XX decisions)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| DC-1 | Every User Decision D-XX is addressed in the HLD | 🔴 CRITICAL | Build coverage matrix: for each D-XX marked "(User Decision)" in context file, identify which HLD section(s) address it. Every User Decision must map to at least one section (Architecture, API Design, Key Design Decisions, etc.). |
| DC-2 | No User Decision is reduced in scope | 🔴 CRITICAL | Scan for weakening language applied to User Decisions: "placeholder", "v1", "simplified", "for now", "basic version", "static for now". Claude's Discretion items may use these. |
| DC-3 | Claude's Discretion items are reasonably addressed | 🔵 INFO | D-XX items marked "Claude's Discretion" should be addressed where relevant, but gaps are acceptable |
| DC-4 | Deferred Ideas are NOT implemented | 🟡 WARNING | Items in the context file's "Deferred Ideas" section should NOT appear as features or architecture in the HLD |

## Open Questions

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| OQ-1 | No TODO/TBD/FIXME markers | 🟡 WARNING | Scan for unresolved markers |
| OQ-2 | No placeholder text | 🟡 WARNING | Scan for template text, "{...}", "[...]", placeholder content |
| OQ-3 | No vague quantifiers without specifics | 🔵 INFO | "Several", "many", "some" should have concrete numbers |
| OQ-4 | [ASSUMPTION] tags have Open Questions entries | 🔵 INFO | Every [ASSUMPTION] should have a matching Open Questions item |
| OQ-5 | Open Questions section has owners | 🔵 INFO | Each open question should ideally have an owner or team assigned |
