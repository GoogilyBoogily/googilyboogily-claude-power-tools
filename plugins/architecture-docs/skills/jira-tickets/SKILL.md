---
name: jira-tickets
description: "Extract actionable items from an ADR, HLD, or LLD and create Jira tickets under a specified epic. Detects document type, applies section-specific extraction rules, drafts tickets for human review, creates them via Atlassian MCP, and writes a ticket manifest to docs/context/. All tickets created unassigned."
disable-model-invocation: true
context: fork
argument-hint: "[path-to-document] [--epic PROJ-123]"
allowed-tools: Read, Glob, Grep, Write, AskUserQuestion, mcp__plugin_atlassian_atlassian__getAccessibleAtlassianResources, mcp__plugin_atlassian_atlassian__createJiraIssue, mcp__plugin_atlassian_atlassian__searchJiraIssuesUsingJql, mcp__plugin_atlassian_atlassian__createIssueLink, mcp__plugin_atlassian_atlassian__getIssueLinkTypes, mcp__plugin_atlassian_atlassian__getVisibleJiraProjects, mcp__plugin_atlassian_atlassian__getJiraProjectIssueTypesMetadata, mcp__plugin_atlassian_atlassian__getJiraIssue
model: opus
---

# Jira Ticket Extraction from Architecture Documents

Extract actionable items from a finalized ADR, HLD, or LLD document and create Jira tickets under a user-specified epic. All tickets are created **unassigned** — assignment is a sprint planning concern, not a ticket creation concern.

## When to Use

- After an HLD or LLD has been generated and audited — ready for implementation planning
- After an ADR when you want to track consequences and required changes
- When you need to bridge architecture documentation with project management
- As an optional step after the `arch-pipeline` completes

**Prerequisites:** A finalized architecture document (ADR, HLD, or LLD) and an existing Jira epic to create tickets under.

## Source Integrity Rules

**Every factual claim about the document must be verified through tool calls in this session.**

1. **Cite your work.** When extracting items, cite the exact section and line from the document.
2. **Never fabricate tickets.** Only create tickets for items that are explicitly present in the document. Do not infer or add items that aren't in the source sections.
3. **Preserve source language.** Ticket titles and scope descriptions should use language from the document, not paraphrased rewrites.

## Process

**Human-in-the-loop: Never create Jira tickets without explicit user approval.** Every ticket must be reviewed before creation.

---

### Phase 1: Parse Input and Detect Document Type

1. Parse `$ARGUMENTS` to extract:
   - **Document path** — the architecture document to extract from
   - **`--epic PROJ-123`** (optional) — the epic key to create tickets under

2. If no document path is provided, ask the user:
   - "Which architecture document should I extract tickets from? Provide the file path."

3. Read the document in full.

4. Detect document type by structural markers:

   | Marker | Document Type |
   |--------|--------------|
   | MADR frontmatter (`status:`, `date:`, `decision-makers:`), "Considered Options", "Decision Outcome" | **ADR** |
   | "Implementation Phases" table, "Codebase Impact", "Proposed Solution" with Architecture subsection | **HLD** |
   | "File-Level Implementation Plan", "Testing Specifications", method signature tables | **LLD** |

5. Present detected type and document title. Ask user to confirm:
   - "I detected this as a **[type]**: *[document title]*. Is that correct?"

Do NOT proceed until user confirms.

---

### Phase 2: Jira Project Discovery

1. **Get epic key.** If `--epic` was provided in arguments, use it. Otherwise, ask the user:
   - "What is the Jira epic key to create tickets under? (e.g., PROJ-123)"
   - Explain: "All tickets will be created as children of this epic. The epic must already exist."

2. **Extract project key** from the epic key (e.g., `PROJ` from `PROJ-123`).

3. **Resolve cloud ID.** Call `getAccessibleAtlassianResources` to obtain available Atlassian cloud instances.
   - If multiple instances are returned, present them and ask the user to choose.
   - Record the selected `cloudId`.

4. **Verify epic exists.** Call `getJiraIssue` with the epic key and the cloud ID.
   - If the epic doesn't exist, ask the user for a corrected key.
   - Extract the epic summary for display.

5. **Discover issue types.** Call `getJiraProjectIssueTypesMetadata` with the project key.
   - Map available types to the skill's ticket categories:
     - Story → look for "Story" or "User Story"
     - Task → look for "Task"
     - Sub-task → look for "Sub-task" or "Subtask"
   - If a needed type isn't available, fall back to "Task" and note the substitution.

6. **Discover link types.** Call `getIssueLinkTypes`.
   - Find the "Blocks" link type (or equivalent like "is blocked by").
   - Record the link type name for Phase 5 dependency creation.

**CHECKPOINT — Confirm Project Setup:**

Present a summary:
```
Project: [PROJECT_KEY]
Cloud:   [cloudId or site name]
Epic:    [EPIC_KEY] — [Epic Summary]
Issue Types: Story=[available], Task=[available], Sub-task=[available]
Link Type:   [Blocks type name]
```

Ask: "Project setup looks correct? Ready to extract tickets from the document?"

Do NOT proceed until user confirms.

---

### Phase 3: Extract Actionable Items

Read the ticket template at `${CLAUDE_SKILL_DIR}/references/ticket-template.md`.

Apply extraction rules based on the detected document type. For each extracted item, build a structured record with: type, title, description (formatted per template), parent (epic key), dependencies (titles of related tickets), source section, and source quote.

#### HLD Extraction

| Source Section | Ticket Type | Extraction Logic |
|---|---|---|
| **Section 13: Implementation Phases** | Story | One story per phase row. Title = phase name. Description includes scope summary, deliverable, and files from Codebase Impact (Section 5) grouped under the phase they belong to. |
| **Section 12: Open Questions** | Task (Investigation) | One ticket per open question. Title prefixed with `[Investigation]`. Include owner and deadline if present in the doc. |

**File grouping rule:** For each phase story, scan Section 5 (Codebase Impact) for files that logically belong to that phase's scope. Include them as a "Files In Scope" table in the story description rather than as separate sub-tasks.

**Dependency rule:** Use the "Depends On" column from the Implementation Phases table to set up dependency links between stories.

#### LLD Extraction

| Source Section | Ticket Type | Extraction Logic |
|---|---|---|
| **Section 10: File-Level Implementation Plan** | Story | One story per step row. Title = step description. Include file paths and action (Create/Modify/Delete). |
| **Section 11: Testing Specifications** | Task | One task per test category (Unit Tests, Integration Tests). Include the test case table in the description. |
| **Section 12: Assumptions and Open Items** | Task (Investigation) | One ticket per open item. Include "Impact If Wrong" for assumptions. Title prefixed with `[Investigation]`. |

**Dependency rule:** Use the "Depends On" column from the File-Level Implementation Plan to set up dependency links between stories.

#### ADR Extraction

| Source Section | Ticket Type | Extraction Logic |
|---|---|---|
| **Consequences > Bad** | Task (Risk Mitigation) | One ticket per negative consequence. Title prefixed with `[Risk Mitigation]`. Include the chosen decision outcome as context. |
| **Decision Drivers** | Story | **Only** when a driver implies a required code change (e.g., "must support X", "need to migrate Y"). Skip purely analytical drivers. Present ambiguous cases to user for confirmation. |

**Ambiguity rule for ADR drivers:** If it's unclear whether a driver implies implementation work, present it to the user with `AskUserQuestion` and let them decide include/skip.

---

### Phase 4: Draft Review

Present all extracted tickets in a categorized, numbered table:

```
## Ticket Drafts: [N] tickets from [Document Title]

### Stories ([count])
| # | Title | Source Section | Dependencies |
|---|-------|---------------|--------------|
| 1 | Phase 1: Foundation | Section 13 | — |
| 2 | Phase 2: Core Logic | Section 13 | #1 |

### Investigation Tickets ([count])
| # | Title | Source Section |
|---|-------|---------------|
| 5 | [Investigation] Confirm rate limit | Section 12 |

### Risk Mitigation Tickets ([count]) — ADR only
| # | Title | Source Section |
|---|-------|---------------|
| 7 | [Risk Mitigation] Performance regression | Consequences > Bad |
```

**CHECKPOINT — Review Drafts:**

Ask the user via `AskUserQuestion` with these options:
- **Create all tickets** — proceed to Phase 5
- **Review details** — show full formatted description for specific tickets (ask which numbers)
- **Edit tickets** — modify specific tickets before creating (ask which numbers, collect changes)
- **Remove tickets** — remove specific tickets from the batch (ask which numbers)
- **Abort** — cancel ticket creation entirely

If **Review details:** Show the full formatted description for each requested ticket, then re-present options.
If **Edit:** Collect changes, update the draft, re-present the table.
If **Remove:** Remove specified tickets, update dependency references that pointed to removed tickets, re-present the table.

**This checkpoint loops** until the user chooses "Create all tickets" or "Abort".

If **Abort:** Report "Ticket creation cancelled. No tickets were created." and stop.

---

### Phase 5: Create Tickets in Jira

#### Step 1: Duplicate Check

For each drafted ticket, check for potential duplicates:

```
searchJiraIssuesUsingJql:
  jql: project = {PROJECT_KEY} AND "Epic Link" = {EPIC_KEY} AND summary ~ "{TITLE_KEYWORDS}"
```

If potential duplicates are found, present them and ask the user to confirm creation or skip for each duplicate match.

#### Step 2: Create in Dependency Order

Create tickets in order — tickets with no dependencies first, then tickets that depend on already-created ones.

For each ticket, call `createJiraIssue` with:
- `cloudId`: from Phase 2
- `projectKey`: from Phase 2
- `issueTypeName`: mapped type from Phase 2 (Story, Task, etc.)
- `summary`: ticket title
- `description`: formatted per template from `ticket-template.md`
- `contentFormat`: `"markdown"`
- `parent`: epic key
- **No `assignee_account_id`** — all tickets are created unassigned

Record the created issue key for each ticket.

**Important:** Sub-tasks that have a parent story (not just the epic) must be created after their parent story. Use the parent story's created issue key as the `parent` field instead of the epic key.

#### Step 3: Create Dependency Links

For each dependency pair identified in Phase 3:
- Call `createIssueLink` with:
  - `type`: the "Blocks" link type name from Phase 2
  - `inwardIssue`: the blocking ticket's created key
  - `outwardIssue`: the blocked ticket's created key

#### Step 4: Creation Summary

Present a summary of all created tickets:

```
## Created [N] tickets under [EPIC_KEY]

| # | Key | Type | Title | Dependencies |
|---|-----|------|-------|--------------|
| 1 | PROJ-124 | Story | Phase 1: Foundation | — |
| 2 | PROJ-125 | Story | Phase 2: Core Logic | PROJ-124 |
```

---

### Phase 6: Write Ticket Manifest

Write a summary file to `docs/context/TICKET-MANIFEST-{DOC_KEBAB_TITLE}.md`:

```markdown
# Ticket Manifest: {Document Title}

**Source Document:** {document path}
**Document Type:** {ADR | HLD | LLD}
**Epic:** {EPIC_KEY} — {Epic Summary}
**Created:** {YYYY-MM-DD HH:MM}
**Total Tickets:** {N}

## Tickets Created

| # | Key | Type | Title | Parent | Dependencies |
|---|-----|------|-------|--------|--------------|
| 1 | PROJ-124 | Story | Phase 1: Foundation | PROJ-123 | — |
| 2 | PROJ-125 | Story | Phase 2: Core Logic | PROJ-123 | PROJ-124 |

## Extraction Coverage

| Document Section | Tickets Extracted | Coverage |
|-----------------|-------------------|----------|
| Section 13: Implementation Phases | {N} stories | Full |
| Section 5: Codebase Impact | Grouped into stories | Full |
| Section 12: Open Questions | {N} investigations | Full |

## Skipped Items

{Any items the user chose to remove during Phase 4, with the section they came from}
```

Report: "Ticket manifest saved to `{manifest_path}`. {N} tickets created under epic {EPIC_KEY}."

---

## Output

- **Jira tickets** created in the specified project under the epic, all unassigned
- **Dependency links** between tickets reflecting document-defined ordering
- **Ticket manifest** at `docs/context/TICKET-MANIFEST-{doc-title}.md`

## Error Handling

| Error | Recovery |
|-------|----------|
| Epic doesn't exist | Ask user for corrected epic key |
| Cloud ID ambiguous | Present options and ask user to choose |
| Issue type not available | Fall back to "Task", inform user |
| Duplicate detected | Present duplicate, ask user to skip or create anyway |
| API failure during creation | Report which tickets were created, which failed, suggest retry |
| Link creation fails | Report which links were created, which failed. Tickets still exist — links can be added manually in Jira |
| No extractable sections found | Report which sections were checked and that none contained actionable items |
