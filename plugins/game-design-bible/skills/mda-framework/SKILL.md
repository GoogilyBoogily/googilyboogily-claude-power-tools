---
name: mda-framework
description: "MDA framework cheat-sheet — Mechanics, Dynamics, Aesthetics causal chain, 8 aesthetic types with examples, design validation method, and common pitfalls. Use when discussing MDA analysis or game design aesthetics."
user-invocable: false
allowed-tools: ""
model: haiku
---

# MDA Framework Reference

The **Mechanics-Dynamics-Aesthetics** framework (Hunicke, LeBlanc, Zubek, 2004) is the foundational lens for game design analysis. It describes games as systems where designers create **Mechanics** that produce **Dynamics** that generate **Aesthetics** (emotional experiences).

## The Causal Chain

```
Designer's View (build from left):     Mechanics → Dynamics → Aesthetics
Player's View (experience from right): Aesthetics ← Dynamics ← Mechanics
```

- **Mechanics**: The rules, components, and systems (health points, inventory limits, jump height)
- **Dynamics**: The behaviors that emerge when players interact with mechanics (resource hoarding, speedrunning, griefing)
- **Aesthetics**: The emotional responses the game evokes (challenge, fellowship, discovery)

## The 8 Aesthetic Types

| Aesthetic | Description | Example Games |
|-----------|-------------|---------------|
| **Sensation** | Game as sense-pleasure | Journey, Flower, Tetris Effect |
| **Fantasy** | Game as make-believe | Skyrim, The Sims, Animal Crossing |
| **Narrative** | Game as drama | The Last of Us, Disco Elysium |
| **Challenge** | Game as obstacle course | Dark Souls, Celeste, Super Meat Boy |
| **Fellowship** | Game as social framework | Among Us, Mario Party, MMOs |
| **Discovery** | Game as uncharted territory | Outer Wilds, Breath of the Wild |
| **Expression** | Game as self-discovery | Minecraft, Dreams, Mario Maker |
| **Submission** | Game as pastime/comfort | Stardew Valley, Cookie Clicker |

Most games target 2-3 primary aesthetics. Trying to serve all 8 dilutes the experience.

## Design Validation Method

Use MDA to validate your design bible by reasoning **backward** from desired aesthetics:

### Step 1: Identify Target Aesthetics (Pick 2-3)
"What emotions should players feel?"

### Step 2: Define Required Dynamics
"What player behaviors would produce those emotions?"
- Challenge → Players must face meaningful failure states
- Discovery → Players must encounter surprises they couldn't predict
- Fellowship → Players must depend on each other

### Step 3: Design Mechanics That Produce Those Dynamics
"What rules create those behaviors?"
- Challenge ← Difficulty curves, limited lives, skill-based execution
- Discovery ← Procedural generation, hidden areas, emergent interactions
- Fellowship ← Shared objectives, complementary roles, communication tools

### Step 4: Audit for Misalignment
Check for mechanics that produce dynamics that undermine your target aesthetics:
- Targeting **Fellowship** but including **PvP resource competition**? → Produces rivalry, not fellowship
- Targeting **Discovery** but using **linear level design**? → Nothing to discover
- Targeting **Challenge** but allowing **pay-to-skip**? → Removes the obstacle

## Common MDA Pitfalls

1. **Aesthetic Drift**: Starting with "we want Discovery" but adding mechanics that reward grinding (Submission)
2. **Mechanic Orphans**: Systems that produce dynamics serving no target aesthetic
3. **Dynamic Blindness**: Not playtesting to see what dynamics actually emerge vs. intended
4. **Aesthetic Overload**: Targeting 5+ aesthetics — focus enables excellence

## Using MDA in the Design Bible

When creating a game design bible, the MDA analysis belongs in `00-concept/mda-analysis.md` and serves as a validation tool throughout:

- **Phase 0** (Concept): Identify target aesthetics from core fantasy
- **Phase 1** (Core Loop): Verify loop dynamics serve target aesthetics
- **Phase 2** (Systems): Audit each system's dynamics against aesthetics
- **Phase 5** (Review): Check for aesthetic drift across the full bible

## Further Reading

- Hunicke, R., LeBlanc, M., & Zubek, R. (2004). "MDA: A Formal Approach to Game Design and Game Research"
- Schell, J. "The Art of Game Design: A Book of Lenses" — Lens #1: Essential Experience
- Koster, R. "A Theory of Fun for Game Design" — Fun as learning through pattern recognition
