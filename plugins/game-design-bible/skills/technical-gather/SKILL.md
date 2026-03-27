---
name: technical-gather
description: "Gather context for the Technical & Production phase (Phase 5) of a Game Design Bible. Interactive Q&A about engine, tools, team, timeline, monetization, and asset estimates. Dispatches research."
disable-model-invocation: true
context: fork
argument-hint: "[--bible-dir path]"
allowed-tools: Read, Glob, Grep, Skill, Task, AskUserQuestion, WebSearch, WebFetch
model: opus
---

# Technical & Production Context Gathering

Gather all context needed to write the Technical & Production phase (Phase 5) of a Game Design Bible. This skill reads all prior phase outputs to understand scope, runs an interactive Q&A session about engine, tools, team, timeline, and monetization, dispatches parallel research, and compiles a structured context file that the `technical-generate` skill consumes.

## Input

$ARGUMENTS

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Bible Directory**: `--bible-dir <path>` (default: `docs/game-design-bible/`)

## Source Integrity Rules

**Every factual claim in the context file must be traceable to research performed in this session.**

1. **Cite your work.** When referencing design pillars, concept documents, or genre conventions, cite the specific file path and section that informed the claim.
2. **Never reference prior Claude sessions or Claude memory.** Do not use phrases like "from our previous conversation," "as we discussed before," "based on prior analysis." Each context file stands on its own.
3. **Assumptions are labeled, not hidden.** If you lack evidence for a claim, label it explicitly in the Open Questions section.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Phase 1: Load Existing Context

1. Validate `<bible-dir>/INDEX.md` exists. If not, inform the user: "No Game Design Bible found at `<bible-dir>`. Create one first with `/game-design-bible:concept-gather`." — then STOP.
2. Read `<bible-dir>/DESIGN-PILLARS.md` — extract all pillar names and their definitions.
3. Scan all prior phase output directories to understand total scope:
   - `<bible-dir>/00-concept/` — vision, genre, platform, audience, non-goals
   - `<bible-dir>/01-core-loop/` — core loop, prototype spec
   - `<bible-dir>/02-systems/` — all system design documents
   - `<bible-dir>/03-narrative/` — narrative, characters, worldbuilding
   - `<bible-dir>/04-art-audio/` — art direction, audio design, UI/UX
4. For each directory, count the number of files and summarize what content was designed (e.g., number of characters, systems, environments, UI screens, music cues).

**CHECKPOINT — Confirm Foundation:**
Present what you found:
- Design pillars (name + one-line summary each)
- Prior phase summary: file count and key content from each phase
- Estimated total scope (number of distinct systems, characters, environments, audio assets, etc.)

Ask: "Here's what I found across all prior phases. Does this match your understanding of the project scope? Anything missing before we discuss technical and production planning?"

### Phase 2: Engine & Tools

Ask the user about Engine and Development Tools using AskUserQuestion:

- **Engine/Framework**: "What engine or framework will you use? (e.g., Unity, Unreal, Godot, custom, web-based)" — if they're unsure, offer recommendations based on the genre and platform from concept docs.
- **Team Structure**: "Describe your team — how many people, what roles? (e.g., 'solo developer', '3-person team: programmer, artist, designer')"
- **Development Tools**: "What tools are you using for version control, project management, and communication? (e.g., Git + GitHub, Trello, Discord)"

### Phase 3: Timeline & Monetization

Ask the user about Timeline and Monetization:

- **Timeline**: "What is your target timeline from now to launch? Any key milestones or deadlines already set? (e.g., '6 months to Early Access, 12 months to 1.0')"
- **Monetization**: "What is your revenue model? (e.g., premium $15, F2P with cosmetics, game jam / no monetization, Early Access)"
- **Technical Constraints**: "Are there any technical constraints I should know about? (e.g., platform-specific requirements, file size budgets, minimum spec targets, performance targets like 60fps)"
- **Asset Pipeline**: "How will assets be created and integrated? (e.g., art tools like Aseprite/Blender, audio middleware like FMOD/Wwise, CI/CD pipeline, automated builds)"

### Phase 4: Parallel Research

Dispatch two parallel Tasks in a single message:

**Task 1 — Engine & Capability Research:**
```
Search the web for:
- [Engine] capabilities and limitations for [genre] games on [platform]
- Common technical challenges building [genre] games in [engine]
- Recommended plugins, packages, or extensions for [engine] relevant to this game type
- Performance best practices for [engine] on [platform]
Use WebSearch and WebFetch. Return structured findings with URLs.
```

**Task 2 — Scope & Timeline Benchmarks:**
```
Search the web for:
- Development timelines for indie/aa [genre] games — how long did comparable titles take?
- Team size and scope benchmarks for games similar to this project
- Post-mortem insights from similar games about scope management and timeline accuracy
- Asset production rates and estimates for [art style] games
Use WebSearch and WebFetch. Return structured findings with URLs.
```

After both return, review findings for relevance. Discard noise; keep only findings that inform technical and production planning.

**CHECKPOINT — Present Research Findings:**
Present a summary of both research tasks.

Ask: "Here's what I found about engine capabilities and scope benchmarks. Does this align with your expectations? Any concerns about timeline or technical feasibility?"

### Phase 5: Compile Context File

Assemble all gathered information into a structured context file:

```markdown
# Technical & Production Context: [Game Name]

**Gathered:** [today's date]
**Bible Directory:** [bible-dir]

## Engine & Tools

- **Engine:** [engine/framework choice]
- **Engine Rationale:** [why this engine for this game]
- **IDE:** [development environment]
- **Version Control:** [VCS tool]
- **Project Management:** [PM tool]
- **Art Tools:** [art creation tools]
- **Audio Tools:** [audio middleware/tools]
- **CI/CD:** [build automation, if any]

## Team Structure

[Number of people, roles, responsibilities]

## Timeline

- **Target Duration:** [total development time]
- **Key Milestones:** [any fixed deadlines or milestones]
- **Current Status:** [where they are now in development]

## Monetization

- **Revenue Model:** [premium/F2P/game jam/etc.]
- **Price Point:** [if applicable]
- **Monetization Details:** [specifics about the model]

## Technical Constraints

- **Platform Requirements:** [platform-specific limitations]
- **Performance Targets:** [FPS, load times, etc.]
- **File Size Budget:** [if applicable]
- **Minimum Spec:** [if applicable]

## Asset Pipeline

[How assets flow from creation to integration — tools, formats, automation]

## Prior Phase Summary

### Phase 0: Concept
- **Files:** [count]
- **Key Content:** [summary of what was defined]

### Phase 1: Core Loop
- **Files:** [count]
- **Key Content:** [summary — core actions, reward structure]

### Phase 2: Systems
- **Files:** [count]
- **Key Content:** [summary — number of systems, complexity]

### Phase 3: Narrative
- **Files:** [count]
- **Key Content:** [summary — characters, story arcs, dialogue volume]

### Phase 4: Art & Audio
- **Files:** [count]
- **Key Content:** [summary — art style, asset types, music/SFX scope]

## Scope Assessment

- **Scope Tier:** [indie/aa/aaa — from INDEX.md]
- **Estimated Characters:** [count from narrative phase]
- **Estimated Environments:** [count from art/systems phases]
- **Estimated UI Screens:** [count from systems/art phases]
- **Estimated SFX:** [count from audio phase]
- **Estimated Music Tracks:** [count from audio phase]
- **Estimated Animations:** [count based on characters and systems]
- **Total Distinct Systems:** [count from systems phase]

## Web Research: Engine Capabilities

[Structured findings from engine research, with URLs]

## Web Research: Scope & Timeline Benchmarks

[Structured findings from scope/timeline research, with URLs]

## Open Questions

- [Anything unresolved, marked as assumptions, or needing further exploration]

## Template

The Technical & Production phase must produce:
- **engine-and-tools.md** — Engine choice justification, development tools, team structure, technical constraints
- **asset-breakdown.md** — Estimated asset counts by type, derived from prior phase content
- **timeline.md** — High-level milestone roadmap from pre-production to launch
- **monetization.md** — Revenue model, pricing, ethical guidelines (skip if monetization is "none" or "game jam")
```

### Phase 6: Save and Return

1. Create the context directory if needed: `<bible-dir>/context/`
2. Write the context file to `<bible-dir>/context/technical-context.md`
3. Return the context file path to the caller.

Tell the user: "Context file saved to `<path>`. Review and edit it if needed, then run `/game-design-bible:technical-generate <path>` to generate the Technical & Production documents."
