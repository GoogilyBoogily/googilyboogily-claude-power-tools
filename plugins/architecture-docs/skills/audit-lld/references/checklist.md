# LLD Audit Checklist

## Template Compliance

### Required Sections
| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| TC-1 | Header has HLD Reference, Author, Date, Status | 🟡 WARNING | All metadata fields present; HLD Reference path must be valid |
| TC-2 | Scope section (Section 1) is one paragraph | 🔵 INFO | Should reference HLD and not restate problem/goals |
| TC-3 | Component Breakdown (Section 2) has Public API tables | 🔴 CRITICAL | Every component must have a Public API table with Method, Parameters, Returns, Description |
| TC-4 | Public API methods have concrete types | 🔴 CRITICAL | Parameters and Returns columns must specify types (not just "options" or "result") |
| TC-5 | Components have Dependencies tables | 🟡 WARNING | Each component should list internal and external dependencies |
| TC-6 | Sequence Diagrams (Section 3) exist for major flows | 🔴 CRITICAL | At least one mermaid sequenceDiagram; must cover happy path |
| TC-7 | Error path sequence diagrams exist | 🟡 WARNING | Each flow should have both happy and error path diagrams |
| TC-8 | Error Catalog (Section 6) is populated | 🔴 CRITICAL | Must have real error codes, not placeholders; columns: Error Code, Type, Trigger, Message, Recovery |
| TC-9 | File-Level Implementation Plan (Section 10) is ordered | 🔴 CRITICAL | Must have Step, File(s), Action, Description, Depends On columns; steps must be ordered by dependency |
| TC-10 | Testing Specifications (Section 11) have test cases | 🔴 CRITICAL | Must have actual test cases with inputs and expected outputs, not placeholder descriptions |
| TC-11 | Assumptions table exists (Section 12) | 🟡 WARNING | Must list assumptions with "Impact If Wrong" column |

### Conditional Sections
| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| TC-12 | State Management section present if stateful behavior exists | 🟡 WARNING | If components have state transitions, Section 5 must have state machine diagram + transition table |
| TC-13 | User Flow Diagrams present if user-facing flows exist | 🔵 INFO | If feature has UI interactions, Section 4 should have flowcharts |
| TC-14 | Data Transformations present if data mapping occurs | 🟡 WARNING | If components transform data between formats, Section 7 must specify input/output shapes and logic |
| TC-15 | Interface Contracts present if components cross boundaries | 🟡 WARNING | If ≥2 components communicate, Section 8 must define field-level contracts |

## Source Integrity

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SI-1 | No prior-session references | 🔴 CRITICAL | Scan for: "from our previous conversation," "as we discussed," "based on prior analysis," "from memory" |
| SI-2 | Code references cite file:line | 🟡 WARNING | Claims about existing code, utilities, patterns should include file path references |
| SI-3 | External claims cite sources | 🟡 WARNING | SDK/API details, best practices should reference URLs or documentation |
| SI-4 | Assumptions are labeled | 🟡 WARNING | Ungrounded assertions should appear in Assumptions table (Section 12) |

## HLD Alignment (requires --hld flag)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| HA-1 | LLD components map to HLD architecture | 🔴 CRITICAL | Every component in LLD Section 2 should correspond to a component in HLD's Architecture section |
| HA-2 | No undiscussed components introduced | 🟡 WARNING | LLD should not introduce major new components not mentioned in HLD |
| HA-3 | File plan aligns with HLD codebase impact | 🔴 CRITICAL | LLD's Implementation Plan (Section 10) should be consistent with HLD's Codebase Impact tables |
| HA-4 | API signatures are compatible with HLD API design | 🟡 WARNING | Method signatures in LLD should refine (not contradict) HLD's API Design section |
| HA-5 | LLD references HLD in header | 🟡 WARNING | HLD Reference field should point to the correct HLD path |
| HA-6 | HLD has forward reference to this LLD | 🔵 INFO | HLD's References section should link to this LLD |

## Implementation Readiness

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| IR-1 | Every public method has parameter types | 🔴 CRITICAL | No "options" or "config" without type definitions; must specify the shape |
| IR-2 | Every public method has return types | 🔴 CRITICAL | No "result" or "response" without specifying the shape |
| IR-3 | Error handling specified per component | 🔴 CRITICAL | Each component must define what errors it throws/returns; "handle errors" is not sufficient |
| IR-4 | Data transformation logic is specified | 🟡 WARNING | Section 7 must have pseudocode or clear rules, not just input/output shapes |
| IR-5 | Dependencies listed with locations | 🟡 WARNING | Internal dependencies should have file paths; external should have package names/versions |
| IR-6 | Test cases have concrete inputs and outputs | 🔴 CRITICAL | "Test that it works" is not a test case; must specify input values and expected output values |
| IR-7 | Implementation steps have correct dependency ordering | 🟡 WARNING | No step should depend on a step that comes after it |
| IR-8 | Retry/timeout values are specified for external calls | 🟡 WARNING | If external dependencies exist, Retry Strategy table should have concrete values |

## Context Fidelity (requires --context flag)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CF-1 | Components match context's validated assumptions | 🟡 WARNING | LLD components should align with what the context file confirmed exists in the codebase |
| CF-2 | Reusable utilities from context are used | 🟡 WARNING | If context identified reusable utilities, LLD should reference them rather than proposing new ones |
| CF-3 | Error handling matches user's answers | 🟡 WARNING | Error catalog should reflect user's stated error handling preferences from context |
| CF-4 | Test patterns match context's findings | 🔵 INFO | Testing approach should follow existing patterns identified in context |
| CF-5 | User's gap analysis answers are reflected | 🔴 CRITICAL | Implementation decisions the user explicitly made during gather should appear in the LLD |
| CF-6 | No significant context dropped | 🔵 INFO | Check if major user answers or research findings are missing |

## Decision Coverage (requires --context flag with D-XX decisions)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| DC-1 | Every User Decision D-XX is addressed in the LLD | 🔴 CRITICAL | Build coverage matrix: for each D-XX marked "(User Decision)" in context file, identify which LLD section(s) address it. Every User Decision must map to at least one section (Component Breakdown, Error Handling, Implementation Plan, etc.). |
| DC-2 | No User Decision is reduced in scope | 🔴 CRITICAL | Scan for weakening language applied to User Decisions: "placeholder", "v1", "simplified", "for now", "basic version", "hardcoded", "static for now". Claude's Discretion items may use these. |
| DC-3 | User Decision implementation details are concrete | 🔴 CRITICAL | D-XX User Decisions about interfaces, error handling, or patterns must appear with concrete types, method signatures, and test specifications — not as prose descriptions |
| DC-4 | Claude's Discretion items follow existing patterns | 🟡 WARNING | D-XX items marked "Claude's Discretion" should follow existing codebase patterns noted in the context file's "Existing Code Patterns" section |
| DC-5 | Deferred Ideas are NOT implemented | 🟡 WARNING | Items in the context file's "Deferred Ideas" section should NOT appear in the LLD |

## Open Questions

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| OQ-1 | No TODO/TBD/FIXME markers | 🟡 WARNING | Scan for unresolved markers |
| OQ-2 | No placeholder text | 🟡 WARNING | Scan for template text, "{...}", "[...]", "example" content |
| OQ-3 | No vague quantifiers without specifics | 🔵 INFO | "Several", "many" should have concrete numbers |
| OQ-4 | [ASSUMPTION] tags have Assumptions table entries | 🔵 INFO | Every [ASSUMPTION] should have a matching entry in Section 12 |
| OQ-5 | Open Items have owners and deadlines | 🔵 INFO | Each open item should have an owner and deadline assigned |
| OQ-6 | No "TBD" values in method signatures | 🔴 CRITICAL | All parameter and return types must be concrete, not "TBD" or "any" |
