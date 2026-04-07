# ADR Audit Checklist

## Template Compliance (MADR 4.0.0)

### Required Elements
| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| TC-1 | YAML frontmatter exists with `status` field | 🔴 CRITICAL | Parse frontmatter; `status` must be one of: proposed, rejected, accepted, deprecated, superseded by ADR-NNNN |
| TC-2 | YAML frontmatter has `date` field | 🟡 WARNING | `date` must be valid YYYY-MM-DD format |
| TC-3 | YAML frontmatter has `decision-makers` field | 🟡 WARNING | Must list at least one person |
| TC-4 | Title exists as H1 heading | 🔴 CRITICAL | Must be short, representative of problem and solution |
| TC-5 | "Context and Problem Statement" section exists | 🔴 CRITICAL | Must contain 2-3 substantive sentences (not placeholder text) |
| TC-6 | "Considered Options" section exists with ≥2 options | 🔴 CRITICAL | Must list at least 2 distinct options |
| TC-7 | "Decision Outcome" section exists | 🔴 CRITICAL | Must name a chosen option and provide justification |
| TC-8 | Chosen option references a listed Considered Option | 🔴 CRITICAL | The exact title in "Chosen option:" must match one of the Considered Options |
| TC-9 | Each option in Pros/Cons has ≥1 Good and ≥1 Bad point | 🟡 WARNING | Every option must acknowledge at least one downside |

### Optional Elements (included by default)
| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| TC-10 | "Decision Drivers" section present | 🔵 INFO | Should exist unless user explicitly skipped |
| TC-11 | "Consequences" subsection present | 🔵 INFO | Should have Good and Bad subsections |
| TC-12 | "Confirmation" subsection present | 🔵 INFO | Should describe how implementation compliance is verified |
| TC-13 | "Pros and Cons of the Options" section present | 🔵 INFO | Should exist with subsections per option |
| TC-14 | "More Information" section present | 🔵 INFO | Should exist for references, links, revisit timelines |

## Source Integrity

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SI-1 | No prior-session references | 🔴 CRITICAL | Scan for: "from our previous conversation," "as we discussed before," "based on prior analysis," "from memory," "as mentioned earlier" |
| SI-2 | Factual claims about code cite file:line | 🟡 WARNING | Any claim about existing code patterns, files, or conventions should include a file path reference |
| SI-3 | External claims cite URLs or sources | 🟡 WARNING | Claims about best practices, standards, or external tools should reference a source |
| SI-4 | Assumptions are explicitly labeled | 🟡 WARNING | Scan for unqualified assertions that aren't grounded in citations. Check if any should be marked as assumptions |

## Internal Consistency

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| IC-1 | Decision drivers appear in option evaluation | 🟡 WARNING | Each decision driver should be referenced or addressed in at least one option's pros/cons |
| IC-2 | Chosen option justification addresses drivers | 🔴 CRITICAL | The "because" clause in Decision Outcome should reference or align with the stated decision drivers |
| IC-3 | Consequences align with chosen option's pros/cons | 🟡 WARNING | Good consequences should map to the chosen option's pros; bad consequences should map to its cons |
| IC-4 | No contradictions between sections | 🔴 CRITICAL | Problem statement, drivers, options, and outcome should tell a coherent story |
| IC-5 | Superseding ADR references are correct | 🟡 WARNING | If status is "superseded by ADR-NNNN", verify ADR-NNNN exists and references this ADR |

## Context Fidelity (requires --context flag)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CF-1 | All considered options from context appear in ADR | 🔴 CRITICAL | Compare context file's options list with ADR's Considered Options |
| CF-2 | Problem statement matches context | 🟡 WARNING | ADR's problem statement should align with context file's problem statement |
| CF-3 | Decision drivers match context | 🟡 WARNING | ADR's drivers should match context file's drivers |
| CF-4 | Codebase findings are incorporated | 🟡 WARNING | Relevant codebase findings from context should appear as evidence in the ADR |
| CF-5 | No context file content was dropped without reason | 🔵 INFO | Check if significant user answers or research findings are missing from the ADR |

## Decision Coverage (requires --context flag with D-XX decisions)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| DC-1 | Every User Decision D-XX is addressed in the ADR | 🔴 CRITICAL | Build coverage matrix: for each D-XX marked "(User Decision)" in context file, identify which ADR section(s) address it. Every User Decision must map to at least one section. |
| DC-2 | No User Decision is reduced in scope | 🔴 CRITICAL | Scan for weakening language applied to User Decisions: "placeholder", "v1", "simplified", "for now", "basic version", "static for now". Claude's Discretion items may use these. |
| DC-3 | Claude's Discretion items are reasonably addressed | 🔵 INFO | D-XX items marked "Claude's Discretion" should be addressed where relevant, but gaps are acceptable |
| DC-4 | Deferred Ideas are NOT implemented | 🟡 WARNING | Items in the context file's "Deferred Ideas" section should NOT appear as features or decisions in the ADR |

## Open Questions

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| OQ-1 | No TODO/TBD/FIXME markers | 🟡 WARNING | Scan for TODO, TBD, FIXME, XXX, HACK markers |
| OQ-2 | No placeholder text | 🟡 WARNING | Scan for: "{...}", "[...]", "lorem ipsum", "example", "placeholder", template text that wasn't filled in |
| OQ-3 | No vague quantifiers | 🔵 INFO | Scan for: "several", "many", "some", "a few", "various" without specifics — these often hide missing research |
| OQ-4 | [ASSUMPTION] tags have corresponding Open Questions entry | 🔵 INFO | Every [ASSUMPTION] in the body should have a matching entry in More Information or a dedicated assumptions section |
