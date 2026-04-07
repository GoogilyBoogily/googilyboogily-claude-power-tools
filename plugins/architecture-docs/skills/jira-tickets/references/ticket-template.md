# Jira Ticket Templates

Templates for formatting ticket descriptions when creating Jira tickets from
architecture documents. All descriptions use markdown format
(`contentFormat: "markdown"` in the Atlassian API).

Each template includes placeholders in `{BRACKETS}` that the skill replaces
with values extracted from the source document.

---

## Story Template

Used for implementation phases (HLD Section 13), file-level implementation
steps (LLD Section 10), and ADR-driven code changes.

```markdown
## Context

This story is part of: **{EPIC_KEY}: {EPIC_SUMMARY}**
Source document: {DOC_TYPE} — {DOC_TITLE}

## Scope

{SCOPE_DESCRIPTION}

### Files In Scope

| File | Action | Description |
|------|--------|-------------|
| {FILE_ROWS} |

## Acceptance Criteria

- [ ] {DELIVERABLE_FROM_DOC}
- [ ] All existing tests continue to pass
- [ ] {ADDITIONAL_CRITERIA}

## Dependencies

{DEPENDENCY_LIST}

## Design Reference

> {QUOTED_SOURCE_TEXT}

Source: {DOC_PATH}, {SECTION_NAME}
```

### Field Extraction Rules (Story)

| Field | HLD Source | LLD Source | ADR Source |
|-------|-----------|-----------|-----------|
| SCOPE_DESCRIPTION | Phase scope summary (Section 13 table) | Step description (Section 10 table) | Decision driver text |
| FILE_ROWS | Files from Codebase Impact (Section 5) grouped by phase | File(s) column from Section 10 step | Files affected by the decision |
| DELIVERABLE_FROM_DOC | Deliverable column from phase table | Description column from step table | Implied deliverable from consequence |
| DEPENDENCY_LIST | "Depends On" column from phase table | "Depends On" column from step table | Related ADR references |
| QUOTED_SOURCE_TEXT | Full phase row from Implementation Phases table | Full step row from File-Level Implementation Plan | Relevant consequence or driver text |

---

## Investigation Ticket Template

Used for open questions (HLD/LLD Section 12) and assumptions that need
validation.

```markdown
## Question

{QUESTION_TEXT}

## Context

Source document: {DOC_TYPE} — {DOC_TITLE}
Section: {SECTION_NAME}

## Why This Matters

{IMPACT_STATEMENT}

## Suggested Investigation Steps

1. {INVESTIGATION_STEP}

## Expected Output

- A written answer to the question above
- Recommendation on whether the design document needs updating
- If the answer changes the design, file a follow-up ticket

## Deadline

{DEADLINE_OR_DEFAULT}
```

### Field Extraction Rules (Investigation)

| Field | HLD Source | LLD Source |
|-------|-----------|-----------|
| QUESTION_TEXT | Open question text (Section 12) | Open Items question (Section 12) |
| IMPACT_STATEMENT | Context from the question | "Impact If Wrong" column for assumptions, or question context |
| INVESTIGATION_STEP | Derived from question context | Owner/team if specified in the table |
| DEADLINE_OR_DEFAULT | If specified in doc, else "Before implementation begins" | Deadline column if present, else "Before implementation begins" |

---

## Risk Mitigation Ticket Template

Used only for ADR documents — extracts negative consequences that require
active mitigation.

```markdown
## Risk

{CONSEQUENCE_TEXT}

## Decision Context

Chosen option: {ADR_DECISION_OUTCOME}
This risk was accepted as a tradeoff of the chosen approach.

## Mitigation Approach

{MITIGATION_DESCRIPTION}

## Done When

- [ ] Mitigation strategy documented or implemented
- [ ] Risk is tracked in the project risk register (if applicable)
- [ ] Stakeholders are aware of the residual risk

## Design Reference

> {QUOTED_CONSEQUENCE_TEXT}

Source: {ADR_PATH}, Consequences > Bad
```

### Field Extraction Rules (Risk Mitigation)

| Field | ADR Source |
|-------|-----------|
| CONSEQUENCE_TEXT | Individual bad consequence from "Consequences > Bad" section |
| ADR_DECISION_OUTCOME | "Decision Outcome" section — the chosen option |
| MITIGATION_DESCRIPTION | Derived from consequence text — what can be done to reduce the impact |
| QUOTED_CONSEQUENCE_TEXT | Verbatim text from the bad consequence bullet |

---

## Common Rules

- **Title prefixes**: Investigation tickets get `[Investigation]` prefix. Risk mitigation tickets get `[Risk Mitigation]` prefix. Stories have no prefix.
- **Description length**: Keep descriptions focused. Don't reproduce the entire design doc section — extract the actionable parts and link back to the source.
- **Markdown format**: All descriptions are passed with `contentFormat: "markdown"` to the Atlassian API.
- **No assignee**: All tickets are created without an `assignee_account_id` field. Assignment happens during sprint planning.
