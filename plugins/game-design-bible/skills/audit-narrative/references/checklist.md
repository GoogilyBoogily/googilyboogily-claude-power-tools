# Narrative Audit Checklist

Severity levels:
- 🔴 **Critical** — Must fix before proceeding
- 🟡 **Important** — Should fix, may cause downstream issues
- 🔵 **Nice-to-have** — Improvement opportunity

---

## Narrative Weight

| # | Check | Severity |
|---|-------|----------|
| 1 | Narrative weight has been assessed and justified | 🟡 |
| 2 | Narrative weight matches genre and design pillars | 🔴 |
| 3 | Documentation depth matches the declared narrative weight (HEAVY has all 4 docs, MEDIUM has 3, LIGHT has 1) | 🟡 |

## Pillar Alignment

| # | Check | Severity |
|---|-------|----------|
| 4 | Narrative serves at least one design pillar explicitly | 🔴 |
| 5 | No narrative element contradicts any design pillar | 🔴 |
| 6 | Pillar alignment headers are present in each narrative document | 🟡 |

## Systems Integration

| # | Check | Severity |
|---|-------|----------|
| 7 | Characters serve gameplay, not just story (for HEAVY weight) — characters have gameplay roles, abilities, or functions | 🔴 |
| 8 | Story does not contradict system designs from Phase 2 — no narrative requirements that conflict with designed mechanics | 🔴 |
| 9 | Narrative mechanics are feasible for the declared project scope (indie/aa/aaa) | 🟡 |

## Dialogue Feasibility

| # | Check | Severity |
|---|-------|----------|
| 10 | Dialogue approach matches project scope and budget constraints | 🟡 |
| 11 | Localization considerations are mentioned (language targets, text expansion) | 🔵 |
| 12 | Voice acting scope is realistic for the project scope (for HEAVY weight) | 🟡 |

## Source Integrity

| # | Check | Severity |
|---|-------|----------|
| 13 | No references to prior Claude sessions, Claude memory, or "as we discussed" | 🔴 |
| 14 | Assumptions are explicitly labeled as `[ASSUMPTION]` with corresponding Open Questions entries | 🟡 |

## Context Fidelity

| # | Check | Severity |
|---|-------|----------|
| 15 | Declared narrative weight matches the weight in the context file | 🟡 |
| 16 | Characters described in the context file are present in the generated documents | 🔴 |
| 17 | Theme from context file is reflected in story-overview.md | 🟡 |

## Open Questions

| # | Check | Severity |
|---|-------|----------|
| 18 | No unresolved TODO or TBD markers outside of Open Questions sections | 🟡 |
| 19 | No placeholder text (e.g., "[INSERT X]", "TBD", "placeholder") in document body | 🟡 |
