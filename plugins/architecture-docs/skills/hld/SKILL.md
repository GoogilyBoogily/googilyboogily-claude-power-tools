---
name: hld
description: High Level Design (HLD) Document Creator
disable-model-invocation: true
---

# High Level Design (HLD) Document Creator

Create High Level Design documents that bridge a feature idea and implementation. An HLD communicates the "what" and "why" at an architectural level — enough for stakeholders to evaluate the approach, not so much it becomes an implementation spec.

## When to Use

Use for significant changes: new features, architectural refactors, system integrations, or work affecting multiple components. Skip for single-file changes or straightforward bug fixes.

When invoked from the ADR pipeline, skip this evaluation — the ADR's existence confirms this warrants an HLD.

## Input

The user provides a description of what they want to build or change — from a one-liner to a detailed requirements doc. The skill handles the gap through targeted questions.

## Source Integrity Rules

**Every factual claim in this document must be traceable to research performed in this session.**

1. **Cite your work.** When referencing code, patterns, conventions, or architectural details, cite the specific tool call that discovered it (file path + line number from Read, Grep result, Explore agent finding). If you cannot point to a tool call that surfaced the information, you have not done the research — do it now or mark it as an assumption.
2. **Never reference prior Claude sessions or Claude memory.** Do not use phrases like "from our previous conversation," "as we discussed before," "based on prior analysis," or similar. Do not source document content from auto-memory, MCP memory tools, or any cross-session context. Each document stands entirely on its own research performed in the current session.
3. **Assumptions are labeled, not hidden.** If you lack evidence for a claim and cannot research it, explicitly label it as an assumption in the document (e.g., in the Open Questions or Assumptions section).

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.** If you need to make a judgment call — what to explore, what to include, what to omit, how to name something — present your recommendation and wait for confirmation. The user drives; you assist.

### Phase 1: Understand the Goal

Read the user's description. Make sure you understand the problem being solved, the envisioned end state, and any stated constraints (tech choices, timelines, compatibility). If the description is vague, proceed to Phase 2 before exploring code.

If the user's input references an ADR (directly or via pipeline from `/adr`):
1. Read the ADR document. **The ADR serves as the user's description** — no separate description is needed.
2. Extract the decision, context, decision drivers, and chosen option to seed the HLD's problem statement and goals.
3. Add the ADR path to the HLD's **References** section (the last section in the template).

### Phase 2: Remove Ambiguity

Ask clarifying questions using AskUserQuestion. Focus on questions where the answer materially changes the architecture — don't ask questions you can answer by reading the codebase. Ask in a single batch where possible. If the user says "I don't know" or "doesn't matter," note it as an open question in the HLD rather than pressing further.

Key question areas:
- Scope boundaries
- Consumers and their expectations
- New data entities and where they live
- External system interactions and failure modes
- Non-functional requirements (performance, scale, security, backward compat)
- Deployment/rollback strategy

**Before asking clarifying questions**, present which of these question areas you believe are relevant and why. Ask the user to confirm, add, or remove topics before you draft the actual questions.

### Phase 3: Explore the Codebase

Use the Explore agent or Glob/Grep tools to map the affected area, understand existing patterns, identify integration points, find dependencies, and check for precedent. The HLD should build on existing patterns rather than inventing new ones without justification.

**CHECKPOINT — Present Exploration Findings:**
After exploring, present a structured summary to the user covering:
- Affected modules and files
- Existing patterns and conventions discovered
- Integration points and dependencies
- Any precedent found (similar features, prior approaches)

Ask the user: "Does this match your understanding? Are there areas I should explore more deeply before proceeding?"

Do NOT proceed to Phase 4 until the user confirms.

### Phase 4: Analyze Codebase Impact

Produce a concrete change map: files/modules to modify, create, delete, or deprecate; configuration changes; database/schema changes; and test changes. This makes the abstract concrete and lets reviewers catch scope creep early.

**CHECKPOINT — Present Change Map:**
After producing the change map, present it to the user for review. Highlight:
- What will be modified, created, deleted, or deprecated
- Any scope that may be larger or smaller than expected
- Risks or surprises discovered

Ask the user: "Does this scope look right? Anything missing, unexpected, or that should be scoped differently?"

Do NOT proceed to Phase 5 until the user approves the change map.

**After change map approval — Organize into Implementation Phases:**

Using the approved change map, group related changes into ordered implementation phases:
1. Identify what must come first (foundational changes, schema migrations, shared infrastructure)
2. Group changes that should ship together (same PR or PR group)
3. Note what can be parallelized and what is strictly sequential
4. Define a clear deliverable for each phase (what's verifiable when it's done)

Present the proposed phases to the user. This becomes the raw material for the Implementation Phases section of the HLD.

### Phase 5: Write the HLD

Find the template by running Glob for `**/skills/hld/references/template.md` and read it. Generate the document section by section, presenting each group to the user for review as described below. After all sections are reviewed and approved, assemble the complete document and save it using the Write tool in a single call with the full document as the `content` parameter.

**Important:** Never call the Write tool without providing the complete document content as the `content` parameter. Build the full document content in your response before making the Write tool call.

**CHECKPOINT — Approve Section List:**
Before writing, present the full list of template sections and propose which to include and which to skip. For each skipped section, explain why it doesn't apply. Ask the user to approve the section list before writing begins.

Do NOT start writing until the user approves which sections to include.

**CHECKPOINT — Section-by-Section Review:**
Write the document in major section groups, pausing after each group for user review:
1. Write the header, context, and goals sections. Present to the user for review.
2. After approval, write the approach and architecture sections. Present to the user for review.
   Pay special attention to the Alternatives Considered section — present at least 2 alternatives with honest tradeoff analysis. A design claiming no downsides is hiding something.
3. After approval, write the impact, risks, and remaining sections. The **Implementation Phases** section should use the phased grouping from Phase 4 — translate the approved phase breakdown into the template's table and dependency diagram format. Present to the user for review.

At each pause, ask: "How does this look? Any changes before I continue to the next sections?"

Do NOT write the entire document in one pass.

### Writing Guidelines

- **Be concrete about the codebase.** Reference actual file paths and function names from exploration, not vague descriptions.
- **Acknowledge tradeoffs honestly.** Every design has tradeoffs. A design claiming no downsides is hiding something.
- **Keep it scannable.** Aim for 3-10 pages. If exceeding 10 pages, the scope may be too broad — consider splitting into multiple HLDs.
- **Only include sections the user approved.** Section selection happens in the Phase 5 checkpoint — follow that approved list.

## Output

**CHECKPOINT — Confirm Save Location:**
Before saving, tell the user the proposed file path and ask for confirmation:
- If `docs/` exists, propose `docs/hld-feature-name.md`
- If `rfcs/` or `designs/` exists, propose using that directory
- Otherwise, propose the project root as `HLD-feature-name.md`

Ask: "I'll save the HLD to `<path>`. Does that work, or would you prefer a different location?"

Save only after the user confirms. Tell the user where the file was saved.

**Back-reference:** If this HLD was created from an ADR, update the ADR's "More Information" section to add a forward reference (create the section if it doesn't exist):

> See [HLD: {title}]({relative-path-to-hld}) for implementation design.

**Pipeline — Continue to LLD:**

Ask: "The HLD is saved. Would you like to create a Low Level Design (LLD) for the implementation details? I'll reference this HLD automatically."

If the user accepts:
1. Note the HLD file path for back-referencing.
2. Invoke the LLD skill using the Skill tool with the HLD path as argument (e.g., `skill: "architecture-docs:lld", args: "<hld-path>"`).

If the user declines, suggest next steps.
