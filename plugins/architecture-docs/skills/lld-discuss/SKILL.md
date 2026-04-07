---
name: lld-discuss
description: "Identify gray areas and capture implementation-level decisions before writing a Low Level Design. Scouts existing code patterns and HLD constraints, surfaces 3-5 concrete decision points about interfaces, state management, error handling, and testing strategy. Outputs a numbered decisions file that feeds into lld-gather and lld-generate."
version: 3.0.0
context: fork
argument-hint: "[LLD topic] --hld [path-to-hld]"
allowed-tools: Read, Glob, Grep, AskUserQuestion
model: opus
---

# LLD Discussion — Gray Area Identification

Identify the implementation-level decisions that matter before gathering detailed LLD context. This skill loads HLD constraints, scouts existing code patterns in affected files, and guides the user through decisions about interfaces, state management, error handling, and testing.

**Philosophy:** An LLD should let an engineer code directly from it. The decisions that matter at this level are about HOW things work internally — method signatures, error catalogs, state transitions, data transformations. Two competent engineers would make different choices here, and the LLD should capture which choices THIS project makes.

## Input

$ARGUMENTS — the LLD topic and optional HLD path.

Parse for:
- **Topic** — what the LLD covers (e.g., "GraphQL resolver layer")
- **`--hld` flag** — path to the HLD this LLD implements (e.g., `--hld docs/hld/api-layer.md`)

If no topic is provided, ask what component or module needs a detailed design.

## Process

**Human-in-the-loop: Every decision is captured from user input, never assumed.**

### Phase 1: Scout the Landscape

1. **Load HLD constraints** — if `--hld` provided, read the HLD and extract:
   - Component responsibilities and boundaries
   - API contracts and data models defined at HLD level
   - Key design decisions and their rationale
   - Implementation phases and dependencies
   - These are NON-NEGOTIABLE — LLD decisions must be consistent with HLD

2. **Scan existing LLDs** — Glob for `docs/lld/*.md`, identify related designs and patterns.

3. **Deep-scout affected code** — more thorough than ADR/HLD scouting because LLD decisions are about code-level patterns:
   - Read key files in the affected scope (not just Glob/Grep — actually Read the code)
   - Identify existing patterns: error handling conventions, state management approach, testing patterns, naming conventions
   - Find reusable utilities and base classes
   - Map the dependency graph for affected modules
   - Budget: up to 15 tool calls — LLD scouting needs more depth than ADR/HLD

4. **Check for prior decisions file** — look for `docs/context/lld/<topic>-decisions.md`.

### Phase 2: Identify Gray Areas

Analyze the LLD topic against HLD constraints and existing code patterns. Identify **3-5 gray areas** specific to implementation decisions:

**LLD-specific gray area categories:**
- **Interface contracts** — method signatures, parameter types, return types (e.g., "return Result<T, Error> vs throw exceptions vs error codes")
- **State management** — how state is stored and mutated (e.g., "Redux slice vs React context vs URL state vs server state with React Query")
- **Error handling strategy** — how errors propagate and are presented (e.g., "domain error hierarchy vs error codes with catalog vs Result monad")
- **Data transformation** — how data moves between layers (e.g., "DTO mappers vs inline transformation vs ORM-level shaping")
- **Testing approach** — what to test and how (e.g., "unit test each method vs integration test per flow vs contract tests at boundaries")
- **Concurrency/async patterns** — how async operations are managed (e.g., "Promise.all vs sequential await vs streaming vs worker threads")
- **Caching/memoization** — what to cache and where (e.g., "HTTP cache headers vs application-level cache vs computed property memoization")

**Gray area quality rules:**
- Must reference specific types, methods, or patterns from the codebase scouting
- Must be implementation-specific, not architecture-level (that's HLD's job)
- Annotate with existing patterns found: "You currently use `AppError` class (src/errors/base.ts:8) with code/message/statusCode"

### Phase 3: Present Gray Areas

Present via AskUserQuestion with `multiSelect: true`:

> "I've analyzed the implementation space for **[topic]** within **[HLD name]**'s architecture. Here are the key implementation decisions. Which would you like to discuss?"

Each option: short label + tradeoff + existing code pattern annotation.

Standard options:
- **"All of them"**
- **"None — I have clear preferences"**

### Phase 4: Deep-Dive Selected Areas

For each selected gray area:

1. **Present options** — 2-4 concrete implementation approaches with:
   - Code sketches (pseudocode, not full implementation) showing each approach
   - How each aligns with existing codebase patterns
   - Testing implications (what's easier/harder to test)
   - Maintenance implications (what's easier/harder to change later)

2. **Ask for preference** via AskUserQuestion

3. **Capture as D-XX** with:
   - The specific implementation choice
   - Rationale
   - Code context (existing patterns it follows or diverges from)
   - Testing strategy for this choice

4. **Check cascades** — implementation decisions cascade tightly (error handling affects interfaces, which affects testing)

### Phase 5: Capture Remaining Decisions

Ask for additional implementation decisions:
- Performance constraints ("must respond in <200ms")
- Compatibility requirements ("must work with Node 18+")
- Specific library preferences ("use zod for validation, not joi")
- Testing requirements ("100% branch coverage on payment paths")

Mark undiscussed areas as Claude's Discretion.

### Phase 6: Compile and Save

```markdown
# LLD Decisions: [Topic]

**Discussed:** [today's date]
**Topic:** [LLD topic]
**HLD:** [path to HLD, if provided]
**Gray areas identified:** [N]
**Gray areas discussed:** [M]

## HLD Constraints (Non-Negotiable)

[Extracted from HLD — these constrain all decisions below]
- [Component responsibilities]
- [API contracts]
- [Architecture patterns]

## Existing Code Patterns

[Key patterns discovered during scouting — implementation decisions should be consistent with these unless explicitly diverging]
- Error handling: [pattern] (file:line)
- State management: [pattern] (file:line)
- Testing: [pattern] (file:line)

## Implementation Decisions

### [Interface Contracts / Error Handling / State / etc.]
- **D-01:** [Specific implementation decision] (User Decision)
  - Rationale: [user's reasoning]
  - Code context: [existing code patterns with file:line]
  - Follows/diverges: [whether this follows or intentionally diverges from existing patterns]
  - Testing: [how this choice will be tested]

### [Next category]
- **D-02:** [Specific decision] (User Decision)
  - Rationale: [reasoning]
  - Code context: [file:line]
  - Follows/diverges: [consistency note]
  - Testing: [test approach]

### Claude's Discretion
- **D-03:** [Area] — Claude's choice, following existing patterns
- **D-04:** [Area] — Claude's choice, following existing patterns

## Deferred Ideas
[Out-of-scope implementation ideas]

## Open Questions
[Unresolved items for research — specific technical questions, not vague areas]
```

**Save to:** `docs/context/lld/<kebab-case-topic>-decisions.md`

Tell the user:
> "Implementation decisions captured at `<path>`. Next steps:
> 1. Run `/architecture-docs:arch-research <path>` to research implications
> 2. Or run `/architecture-docs:lld-gather <path> --hld <hld-path>` to compile full context"
