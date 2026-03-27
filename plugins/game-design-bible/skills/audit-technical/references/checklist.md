# Technical & Production Audit Checklist

## Engine & Tools

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| ET-1 | Engine choice stated | 🔴 CRITICAL | `engine-and-tools.md` names a specific engine or framework |
| ET-2 | Engine choice justified for this game type | 🟡 WARNING | `engine-and-tools.md` explains why this engine suits the genre, platform, and scope |
| ET-3 | Development tools specified (IDE, VCS, PM) | 🔵 INFO | `engine-and-tools.md` lists IDE, version control, and project management tools |
| ET-4 | Art/audio tools pipeline described | 🟡 WARNING | `engine-and-tools.md` describes how assets are created and integrated (art tools, audio middleware, CI/CD) |

## Scope/Resource Alignment

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SR-1 | Timeline realistic for scope and team size | 🔴 CRITICAL | Compare total asset count from `asset-breakdown.md` against duration in `timeline.md` and team size in `engine-and-tools.md` — flag if production rate exceeds benchmarks |
| SR-2 | Team structure has roles for all required work | 🟡 WARNING | Every asset category in `asset-breakdown.md` has a responsible role in `engine-and-tools.md` team structure |
| SR-3 | Asset breakdown accounts for all content designed in phases 2-4 | 🔴 CRITICAL | Cross-reference characters, environments, systems, and audio from phases 2-4 against `asset-breakdown.md` — no designed content should be missing |
| SR-4 | No phase designed content that exceeds technical constraints | 🟡 WARNING | Check that designed content (asset counts, system complexity) does not violate performance targets or file size budgets in `engine-and-tools.md` |

## Timeline

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| TL-1 | Milestones defined (pre-production through launch) | 🟡 WARNING | `timeline.md` includes at least: pre-production, alpha, beta, launch milestones with durations |
| TL-2 | Vertical slice milestone exists | 🟡 WARNING | `timeline.md` includes a vertical slice milestone between pre-production and alpha |
| TL-3 | Buffer time included | 🔵 INFO | `timeline.md` includes buffer or contingency time between milestones or as a risk mitigation strategy |

## Monetization Ethics

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| ME-1 | Monetization model stated (or explicitly "none") | 🟡 WARNING | Either `monetization.md` exists with a revenue model, or INDEX.md/context indicates monetization was intentionally skipped |
| ME-2 | If F2P: ethical guidelines defined | 🔴 CRITICAL | If the model is F2P/freemium, `monetization.md` must include ethical guidelines section addressing pay-to-win, FOMO, and player respect |
| ME-3 | Monetization doesn't contradict design pillars | 🔴 CRITICAL | `monetization.md` pillar alignment table shows no conflicts, or monetization is "none" |
| ME-4 | Prototype/launch criteria defined | 🟡 WARNING | `timeline.md` includes exit criteria for key milestones (especially vertical slice and launch) |

## Source Integrity

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SI-1 | No prior-session references | 🔴 CRITICAL | Search all Phase 5 files for phrases like "as we discussed", "from our previous", "as mentioned before", "in our last session" — none should exist |
| SI-2 | Assumptions labeled | 🟡 WARNING | Any ungrounded claims are marked with `[ASSUMPTION]` and have corresponding entries in Open Questions |

## Context Fidelity (requires --context)

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CF-1 | Engine from context matches output | 🟡 WARNING | Engine name in context file matches engine name in `engine-and-tools.md` |
| CF-2 | Timeline from context matches output | 🟡 WARNING | Target duration in context file matches timeline span in `timeline.md` |
| CF-3 | Team structure matches context | 🟡 WARNING | Team composition in context file matches team structure in `engine-and-tools.md` |

## Open Questions

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| OQ-1 | No TODO/TBD/FIXME | 🟡 WARNING | Search all Phase 5 files for TODO, TBD, FIXME, XXX — none should exist outside Open Questions sections |
| OQ-2 | No placeholder text | 🟡 WARNING | Search all Phase 5 files for `[placeholder]`, `[TBD]`, `[insert`, `lorem ipsum` — none should exist |
