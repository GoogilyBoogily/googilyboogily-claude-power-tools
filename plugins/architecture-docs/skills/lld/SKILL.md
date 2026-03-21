---
name: lld
description: Low Level Design (LLD) Document Creator
disable-model-invocation: true
argument-hint: "[path-to-hld]"
---

# Low Level Design (LLD) Document Creator

Translate a High Level Design into an implementation blueprint. An LLD communicates the "how, exactly" — method signatures, sequence diagrams per flow, state machines, error catalogs, and an ordered file-level implementation plan. Engineers should be able to code directly from this document.

## When to Use

Use after an HLD exists and is stable enough to build against. If the HLD already specifies everything an engineer needs, skip the LLD.

When invoked from the HLD pipeline, the HLD's existence and stability are confirmed — proceed directly to Phase 1.

## Input

The user provides a path to an existing HLD document (e.g., `/lld docs/hld-feature-name.md`). If no path is provided, ask which HLD to drill into.

## Source Integrity Rules

**Every factual claim in this document must be traceable to research performed in this session.**

1. **Cite your work.** When referencing code, patterns, conventions, or architectural details, cite the specific tool call that discovered it (file path + line number from Read, Grep result, Explore agent finding). If you cannot point to a tool call that surfaced the information, you have not done the research — do it now or mark it as an assumption.
2. **Never reference prior Claude sessions or Claude memory.** Do not use phrases like "from our previous conversation," "as we discussed before," "based on prior analysis," or similar. Do not source document content from auto-memory, MCP memory tools, or any cross-session context. Each document stands entirely on its own research performed in the current session.
3. **Assumptions are labeled, not hidden.** If you lack evidence for a claim and cannot research it, explicitly label it as an assumption in the document (e.g., in the Open Questions or Assumptions section).

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.** If you need to make a judgment call — what to explore, what to include, what to omit, how to name something — present your recommendation and wait for confirmation. The user drives; you assist.

### Phase 1: Absorb the HLD

Read the HLD document. Internalize the problem, approach, component boundaries, design decisions, codebase impact, and open questions.

**CHECKPOINT — Confirm HLD Understanding:**
After reading the HLD, present a brief summary to the user covering:
- The approach and architecture being taken
- Component boundaries and responsibilities
- Key design decisions and their rationale
- Open questions or assumptions carried forward

Ask the user: "Is my understanding of the HLD correct? Anything I'm misreading or missing before I proceed?"

Do NOT proceed to Phase 2 until the user confirms.

### Phase 2: Gap Analysis

Identify implementation-level ambiguities the HLD intentionally left unresolved. Batch all questions using AskUserQuestion. Focus only on gaps where the answer materially changes implementation.

Key areas: error handling and edge cases, state and concurrency concerns, exact data contracts (types, nullability, defaults, validation), integration details (timeouts, retries, circuit breakers), and performance constraints (hot paths, size limits, batching).

If the user says "use your judgment," make a reasonable decision but present it to the user for confirmation before proceeding. Document confirmed decisions in the **Assumptions and Open Items** section of the LLD.

### Phase 3: Codebase Exploration

Use the Explore agent, Glob, Grep, and Read tools to validate the HLD's codebase impact against reality. Validate interfaces exist as assumed, find reusable utilities, trace a similar flow end-to-end as a reference implementation, check for conflicts with in-progress work, and identify existing test patterns.

**CHECKPOINT — Present Exploration Findings:**
After exploring, present findings to the user covering:
- Validated assumptions from the HLD (what matched reality)
- Discrepancies between HLD assumptions and codebase reality
- Reusable utilities and patterns discovered
- Reference implementations traced
- Any conflicts with in-progress work

Ask the user: "Here's what I found. Any discrepancies concern you? Any areas you'd like me to investigate more deeply?"

Do NOT proceed to Phase 4 until the user confirms.

### Phase 4: Write the LLD

Find the template by running Glob for `**/skills/lld/references/template.md` and read it and generate the document incrementally, section by section. Write incrementally — use Write for the first sections, then Edit to append subsequent sections.

**CHECKPOINT — Approve Section List:**
Before writing, present the full list of template sections and propose which to include and which to skip. For each skipped section, explain why it doesn't apply. Ask the user to approve the section list before writing begins.

Do NOT start writing until the user approves which sections to include.

**CHECKPOINT — Approve Component Breakdown:**
After writing the component breakdown section (Section 2 — the structural foundation of the LLD), present it to the user before writing the detailed sections (sequence diagrams, state machines, error catalogs, etc.).

Ask the user: "Here's the component breakdown. This is the structural foundation — getting it wrong means reworking everything after. Does this decomposition look right? Any components missing, misplaced, or over/under-scoped?"

Do NOT write the detailed implementation sections until the user approves the component breakdown.

### Writing Principles

- **Tables over prose.** LLD is a reference document, not a narrative. Use tables for method signatures, error catalogs, state transitions, test specs, and implementation steps.
- **No repeated HLD sections.** Don't restate the problem, goals, or architecture overview. Reference the HLD. Security and performance details appear inline where they affect implementation.

## Output

**CHECKPOINT — Confirm Save Location:**
Before saving, propose the file path and ask for confirmation:
- If the HLD is at `docs/hld-feature-name.md`, propose `docs/lld-feature-name.md`
- Match the HLD's naming convention

Ask: "I'll save the LLD to `<path>`. Does that work, or would you prefer a different location?"

Save only after the user confirms. Tell the user where the file was saved and highlight key assumptions needing validation, the recommended PR decomposition, and any conflicts discovered during exploration.

**Back-reference:** If this LLD was created from an HLD, update the HLD's **References** section (the last section) to add a forward reference:

> See [LLD: {title}]({relative-path-to-lld}) for implementation details.

If the HLD was itself created from an ADR, also update the ADR's "More Information" section to add: `See [LLD: {title}]({relative-path-to-lld}) for implementation details.` Then mention the full pipeline chain: "This completes the ADR → HLD → LLD pipeline for this decision."

**Pipeline continuation:** Ask the user if they'd like to begin implementation now by invoking `/architecture-docs:implement` with the path to this LLD. This extends the ADR → HLD → LLD → implement pipeline, translating the design directly into phased, verified code.
