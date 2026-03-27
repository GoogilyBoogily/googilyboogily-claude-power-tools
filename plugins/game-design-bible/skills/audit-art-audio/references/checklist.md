# Art & Audio Audit Checklist

Severity levels:
- 🔴 **Critical** — Must fix before proceeding
- 🟡 **Important** — Should fix, may cause downstream issues
- 🔵 **Nice-to-have** — Improvement opportunity

---

## Style Consistency

| # | Check | Severity |
|---|-------|----------|
| 1 | Art style matches the game's tone and design pillars | 🔴 |
| 2 | Color palette includes functional colors for gameplay communication | 🟡 |
| 3 | Audio mood matches the visual style (cohesive aesthetic) | 🟡 |
| 4 | UI style matches the overall art direction | 🟡 |

## Accessibility

| # | Check | Severity |
|---|-------|----------|
| 5 | Dedicated accessibility section exists in ui-ux.md | 🔴 |
| 6 | Input accessibility addressed (remapping, alternative inputs, timing forgiveness) | 🔴 |
| 7 | Visual accessibility addressed (colorblind modes, high contrast, scalable UI) | 🟡 |
| 8 | Audio accessibility addressed (subtitles, visual sound indicators) | 🟡 |
| 9 | Motor accessibility addressed (difficulty options, auto-aim, toggle vs. hold) | 🟡 |
| 10 | Cognitive accessibility addressed (tutorials, waypoints, information pacing) | 🔵 |
| 11 | Motion sensitivity addressed (camera shake toggle, FOV, motion blur control) | 🔵 |

## Pillar Alignment

| # | Check | Severity |
|---|-------|----------|
| 12 | Visual style serves at least one design pillar explicitly | 🔴 |
| 13 | Audio direction serves design pillars | 🟡 |
| 14 | UI approach serves design pillars | 🟡 |

## Scope Feasibility

| # | Check | Severity |
|---|-------|----------|
| 15 | Art complexity matches project scope (indie/AA/AAA) | 🟡 |
| 16 | Music and audio budget is realistic for project scope | 🟡 |
| 17 | UI complexity matches team size and scope | 🔵 |

## Controls

| # | Check | Severity |
|---|-------|----------|
| 18 | Per-platform control mappings are defined for all declared target platforms | 🟡 |
| 19 | Input feel parameters are specified (dead zones, acceleration, buffering) | 🔵 |
| 20 | Responsiveness targets noted (input latency, animation cancels) | 🔵 |

## Color Palette

| # | Check | Severity |
|---|-------|----------|
| 21 | Hex values provided for all palette colors | 🟡 |
| 22 | Danger/health/UI functional colors are defined | 🟡 |
| 23 | Colorblind consideration noted with alternative communication methods | 🟡 |

## Source Integrity

| # | Check | Severity |
|---|-------|----------|
| 24 | No references to prior Claude sessions, Claude memory, or "as we discussed" | 🔴 |
| 25 | Assumptions are explicitly labeled as `[ASSUMPTION]` with corresponding Open Questions entries | 🟡 |

## Context Fidelity

| # | Check | Severity |
|---|-------|----------|
| 26 | Visual references from context file are reflected in visual-style.md | 🟡 |
| 27 | Accessibility priorities from context file are addressed in ui-ux.md | 🔴 |

## Open Questions

| # | Check | Severity |
|---|-------|----------|
| 28 | No unresolved TODO or TBD markers outside of Open Questions sections | 🟡 |
| 29 | No placeholder text (e.g., "[INSERT X]", "TBD", "placeholder") in document body | 🟡 |
