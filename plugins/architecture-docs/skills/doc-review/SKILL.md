---
name: doc-review
description: "PR-Aware Architecture Document Review — pulls GitHub PR comments, identifies grey areas across reviewer feedback as R-XX review decisions, tracks all comments (resolved + unresolved) with thread status, produces REVIEW.md state file with resume capability"
disable-model-invocation: true
context: fork
argument-hint: "[PR number or URL] [--resume]"
allowed-tools: Bash(gh:*), Read, Edit, Write, Grep, Glob, Agent, AskUserQuestion
model: opus
---

# PR-Aware Architecture Document Review

Pull open GitHub PR comments on architecture documents (ADR, HLD, LLD), identify grey areas across reviewer feedback, capture review decisions as R-XX entries, and walk through each comment interactively. Produces a REVIEW.md state file per document with resume capability.

This skill is **local-only** — it reads from GitHub via `gh` CLI and edits document files locally. It NEVER posts anything to GitHub. The user handles all GitHub replies manually by copy-pasting drafted replies.

## When to Use

Use when an architecture document is in a PR with reviewer comments that need to be addressed. Works with any ADR, HLD, or LLD document that has open review feedback. Also useful for re-reviewing after pushing changes — `--resume` detects new comments since last session.

## Input

$ARGUMENTS — PR number or URL, and optionally `--resume` to continue a previous review session.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **PR identifier**: Number (e.g., `42`) or URL (e.g., `https://github.com/org/repo/pull/42`)
- **Resume flag**: `--resume` (optional, triggers Phase 7 at startup)

If `--resume` is present, jump to Phase 7 before anything else.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Phase 7: Resume Handler (runs first if --resume)

This phase fires ONLY when `--resume` is present in `$ARGUMENTS`. It restores state from a previous review session.

1. **Find existing REVIEW.md files:**
   ```
   Glob for docs/context/review/*-PR-*-REVIEW.md
   ```

2. **If none found:** Inform user "No review state found" and fall through to Phase 1. Strip `--resume` from arguments.

3. **If multiple found:** Distinguish between multiple PRs and same-PR multi-document reviews:
   - **Same PR, multiple documents:** Present all docs together with per-doc completion status. Let the user pick which document to resume. After completing the resumed document, prompt: "Documents B and C from this PR still need review. Continue with the next one?"
   - **Different PRs:** Present the list via AskUserQuestion — show PR number, document name, status, and last activity for each. Ask which to resume.

4. **If one found:** Use it directly.

5. **Parse the Resume Checkpoint section** from the selected REVIEW.md:
   - Extract: phase, next action, document path, completed threads, remaining threads, grey area status
   - Extract PR number from the PR Metadata section

6. **Offer resume options** via AskUserQuestion:
   - **Resume from checkpoint** (recommended) — pick up where you left off
   - **View state first** — display the full REVIEW.md before deciding
   - **Restart fresh** — archive the old state as `<name>-REVIEW-<YYYY-MM-DD>.md` and start over

7. **On resume:** Re-fetch comments from GitHub (Phase 2 logic, read-only). Diff against the stored Comment Inventory:
   - **New comments since last session:** Present count and ask: "N new comments found since last review. Add them to the queue?"
   - **Newly resolved comments:** Update their GitHub Status in the inventory
   - **No changes:** Proceed directly to the recorded phase

8. **Jump to the recorded phase** with restored state. Continue the review.

---

### Phase 1: Identify PR and Documents

1. Accept PR number or URL from `$ARGUMENTS`. If not provided, detect from current branch:
   ```
   gh pr view --json number,title,url,headRefName,baseRefName
   ```
2. Validate prerequisites:
   - Confirm `gh` CLI is installed and authenticated (`gh auth status`)
   - If not authenticated, stop and tell the user to run `gh auth login`
3. Extract `{owner}/{repo}` from the PR URL or:
   ```
   gh repo view --json nameWithOwner --jq '.nameWithOwner'
   ```
4. Identify architecture docs changed in the PR:
   ```
   gh pr diff <number> --name-only
   ```
   Scan changed files for ADR/HLD/LLD patterns:
   - Files in `docs/decisions/`, `docs/hld/`, `docs/lld/` directories
   - Markdown files containing `adr`, `hld`, `lld` in path or name
   - Markdown files in `architecture/` or `design/` directories
5. Check for existing REVIEW.md files for this PR:
   ```
   Glob for docs/context/review/*-PR-<number>-REVIEW.md
   ```
   If found, inform user: "Previous review state found at `<path>`. Use `--resume` to continue, or proceed to start fresh."

**CHECKPOINT — Confirm PR and Documents:**

Present:
- PR number, title, URL, branch (head -> base)
- List of identified architecture documents in the PR
- Whether previous review state exists

Ask via AskUserQuestion: "Are these the right documents? Should I include or exclude any?"

Do NOT proceed until the user confirms.

---

### Phase 2: Fetch and Categorize Comments

Fetch ALL comment types via `gh` CLI. This skill NEVER posts to GitHub — all API calls are read-only.

1. **Inline review comments** (comments on specific lines/hunks):
   ```
   gh api repos/{owner}/{repo}/pulls/{number}/comments --paginate
   ```
2. **Review-level comments** (review summaries with APPROVE/REQUEST_CHANGES/COMMENT):
   ```
   gh api repos/{owner}/{repo}/pulls/{number}/reviews --paginate
   ```
3. **General PR comments** (conversation-level, not tied to code):
   ```
   gh api repos/{owner}/{repo}/issues/{number}/comments --paginate
   ```

**Categorize each comment/thread:**

For each comment, extract and record:
- **Thread ID**: `id` field (for inline comments, group by `in_reply_to_id` to form threads)
- **Author**: `user.login` (skip if `user.type === "Bot"`)
- **GitHub Status**: For inline review comments, check the parent review thread's `isResolved` field:
  ```
  gh api graphql -f query='query { repository(owner:"{owner}", name:"{repo}") { pullRequest(number:{number}) { reviewThreads(first:100) { nodes { isResolved, isOutdated, comments(first:100) { nodes { id, body, author { login } } } } } } } }'
  ```
  Categorize as: **Resolved** (thread marked resolved), **Unresolved** (thread still open), **Outdated** (code changed since comment)
- **Document**: Which architecture doc the comment applies to (from `path` field)
- **Section**: Document section based on line number / diff position
- **Comment body**: Full text
- **Created at**: Timestamp for ordering

**Filter:**
- Skip bot comments (`user.type === "Bot"`)
- Skip comments authored by the current user (`gh api user --jq '.login'`)
- Do NOT skip resolved or outdated threads — track them with their status

**Organize:**
- Group by conversation thread (reply chains together)
- Within each document, order by section (top-to-bottom by line number / diff position)
- Tag each thread with: author, comment count, document, section, GitHub status

**CHECKPOINT — Comment Summary:**

Present:
```
## Comment Summary for PR #[number]

**Total threads:** [N] ([M] unresolved, [K] resolved, [J] outdated)
**Reviewers:** @reviewer1 ([count]), @reviewer2 ([count])

### By Document
- [doc1.md]: [N] threads ([M] unresolved)
- [doc2.md]: [N] threads ([M] unresolved)

### Resolved Threads (already handled on GitHub)
| # | Author | Section | Summary |
| 1 | @reviewer | [section] | [first line of comment] |

### Unresolved Threads (need attention)
| # | Author | Section | Summary |
| 1 | @reviewer | [section] | [first line of comment] |
```

Ask via AskUserQuestion: "Which comments would you like to address?"
- **All unresolved** (recommended) — skip already-resolved threads
- **Everything** — review resolved threads too to confirm they're handled correctly
- **By reviewer** — ask which reviewer(s) to focus on
- **By document** — ask which document to focus on

Do NOT proceed until the user confirms.

**State update:** Write initial REVIEW.md to `docs/context/review/<doc-name>-PR-<number>-REVIEW.md` with PR Metadata and Comment Inventory sections populated. For multi-document PRs, create one REVIEW.md per document. Set Status to "In Progress".

---

### Phase 3: Grey Area Analysis

Analyze the selected unresolved comment threads for patterns and themes. This phase identifies where reviewer feedback converges on underlying decisions — not just individual fixes.

**Step 1 — Cluster comments by concern type.**

Read all selected unresolved comment bodies. Group them by what they are actually asking about — not by document section, but by the underlying concern:

| Concern Type | Signal Words / Patterns |
|-------------|------------------------|
| **Naming/terminology** | "rename", "confusing term", "inconsistent with", "what does X mean" |
| **Missing justification** | "why not", "have you considered", "what about", "rationale for" |
| **Scope disputes** | "too broad", "too narrow", "out of scope", "should also cover" |
| **Consistency** | "doesn't match", "conflicts with", "different from", "ADR says" |
| **Risk/complexity** | "risky", "complex", "concern about", "what happens when" |
| **Specification gaps** | "unclear", "how will", "what about edge case", "missing" |

A single comment can match multiple concern types. Cluster by the dominant concern.

**Step 2 — Filter for genuine grey areas.**

A cluster qualifies as a grey area if:
- **2+ comments** touch the same underlying concern (even if worded differently), OR
- **1 comment** raises a concern where reasonable people would genuinely disagree
- AND the concern is **not purely editorial** (typo, formatting, grammar)
- AND the concern **requires a decision**, not just a mechanical fix

**Step 3 — Synthesize into 3-5 grey areas.**

For each qualifying cluster:
1. Extract the core decision — what's actually being decided
2. Annotate with thread references (which comment threads feed into this)
3. Read the relevant document section(s) for current state
4. Identify 2-4 concrete approaches/options
5. Frame neutrally — synthesize the reviewer concerns into a decision-oriented framing, not an adversarial "reviewer says X, you said Y" framing

**Step 4 — Present grey areas for selection.**

Present via AskUserQuestion with `multiSelect: true`:

> "I've analyzed [N] comment threads from [M] reviewers. Several comments converge on these underlying decisions. Which would you like to discuss before addressing individual comments?"

Each option should include:
- A short label (the decision point)
- A description with the synthesized concern, which reviewers raised it, and how many threads it touches

Include these standard options:
- **"All of them"** — discuss every grey area
- **"None — address comments individually"** — skip grey area analysis, go straight to Phase 4

If zero grey areas were identified, inform the user and skip to Phase 4:
> "No cross-cutting themes found — all comments appear to be independent. Proceeding to individual comment resolution."

**Step 5 — Deep-dive selected grey areas.**

For each selected grey area, in order:

1. **Present the synthesized concern** — describe the core tension neutrally, referencing:
   - What the document currently says
   - What reviewers are concerned about (synthesized, not quoted verbatim)
   - How many threads this addresses
   - Relevant code context (file:line) if applicable

2. **Present 2-4 concrete approaches** via AskUserQuestion (single-select — one approach per grey area):
   - Each approach describes what would change in the document
   - Include a brief rationale hint for each
   - One approach should be starred (⭐) as recommended based on available evidence
   - Always include "Other" implicitly (AskUserQuestion provides this)

3. **Capture as R-XX** — record the decision:
   ```markdown
   - **R-XX:** [Specific decision] (User Decision)
     - Reviewer concern: "[synthesized concern]"
     - Rationale: [user's reasoning — ask "Why this approach?" if not obvious]
     - Code context: [file:line if applicable]
     - Affects: [what changes in the document]
     - Threads addressed: #[thread_id_1], #[thread_id_2]
   ```

4. **Check for cascade effects** — does this decision resolve or complicate other grey areas? Adjust the remaining list if so.

**Step 6 — Apply R-XX to comment queue.**

After all grey area deep-dives:
1. For each R-XX decision, mark the addressed threads as "Resolved (R-XX)" in the Comment Inventory
2. Draft a reply for each addressed thread referencing the R-XX decision
3. Remove these threads from the Phase 4 sequential resolution queue
4. Present summary: "R-XX decisions resolve [N] of [M] threads. [remaining] threads still need individual attention."

For grey areas NOT discussed (skipped), mark them as **Claude's Discretion** — the resolution phase may apply reasonable defaults.

**State update:** Update REVIEW.md with Grey Area Decisions section populated. Update Comment Inventory with R-XX resolutions.

---

### Phase 4: Sequential Comment Resolution

Process the remaining comment threads that were NOT resolved by R-XX grey area decisions. For GitHub-resolved threads that the user chose to review, use a softer confirmation prompt.

For each thread in the queue, present:

1. **Thread header** — progress indicator and metadata:
   ```
   ### Thread [N]/[remaining] — @[author] on [document]:[section]
   **GitHub status:** [Unresolved/Resolved/Outdated]
   **Comment count:** [N] messages in thread
   ```

2. **Comment text** — full comment thread with author attribution for each message

3. **Document context** — read the relevant section of the document so both the comment and the current text are visible

**Then offer options via AskUserQuestion:**

For **unresolved** threads:

1. **⭐ Accept** — agree with the feedback
   - Make the edit to the document
   - Show the diff of what changed
   - Draft a reply acknowledging the change (e.g., "Good catch — updated in latest revision")
2. **Reject** — disagree with the feedback
   - Ask the user for their reasoning
   - Draft a reply explaining the rationale the user can copy into GitHub
3. **Partial accept** — agree with part of the feedback
   - Ask which parts to accept
   - Make the partial edit, draft a reply explaining what was and wasn't changed
4. **🔍 Research code & web** — need more context before deciding
   - Dispatch two parallel Agents in a single message:

     **Agent 1 — Code Research:**
     > "Search the codebase to answer: [specific question derived from the comment].
     > Use Glob, Grep, and Read. Return structured findings with file:line citations."

     **Agent 2 — Web Research:**
     > "Search online to answer: [specific question derived from the comment].
     > Use WebSearch, WebFetch, Context7. Return findings with URLs."

   - Wait for both Agents to return
   - Synthesize findings and present to user
   - **Re-present the same thread** with refined resolution options informed by research
   - The research option is NOT shown again for this thread
5. **Discuss** — mark as deferred for offline discussion
   - Record the thread as "Deferred" with a note
   - Move to next thread
6. **Skip** — move to next thread without action

For **already-resolved** threads (softer prompt):

1. **⭐ Confirmed** — the resolution looks correct, no action needed
2. **Needs revision** — the fix was incomplete or incorrect, make additional edits
3. **Skip** — move on

After each action:
- Confirm the result before moving to the next thread
- Track the action in the Resolution Log
- Draft reply text for any thread that needs a GitHub response

**State update:** After EACH thread resolution, update the REVIEW.md:
- Update Comment Inventory row with action taken
- Append to Resolution Log
- Append to Drafted Replies (if applicable)
- Update Resume Checkpoint with next thread

---

### State Tracking (Integrated)

This is NOT a standalone phase — REVIEW.md is written and updated throughout the process:

| Trigger | What's Updated |
|---------|---------------|
| End of Phase 2 | PR Metadata, Comment Inventory, Comment Statistics. Status: "Comments Fetched" |
| End of Phase 3 | Grey Area Decisions (R-XX), Comment Inventory (R-XX resolutions). Status: "Grey Areas Resolved" |
| After each Phase 4 resolution | Comment Inventory row, Resolution Log entry, Drafted Reply (if any). Resume Checkpoint updated |
| End of Phase 6 | Final statistics, Status: "Complete" |

**File location:** `docs/context/review/<doc-name>-PR-<number>-REVIEW.md`

Where `<doc-name>` is the kebab-case name of the architecture document (e.g., `0005-auth-redesign` or `api-gateway-hld`).

For multi-document PRs: one REVIEW.md per document. Grey area analysis (Phase 3) runs once across all documents, but R-XX decisions are filed into the relevant document's REVIEW.md based on which document's threads they address.

**Read the template at:** `${CLAUDE_SKILL_DIR}/references/review-template.md`

Use the template structure when creating the initial REVIEW.md. Replace placeholders with actual values.

---

### Phase 6: Summary and Next Steps

Present a comprehensive resolution summary:

```
## Review Summary: PR #[number] — [title]

### Grey Area Decisions (R-XX)
- **R-01:** [decision summary] — resolved [N] threads
- **R-02:** [decision summary] — resolved [N] threads

### Comment Resolution
- **Accepted:** [N] threads — document edits made
- **Rejected:** [N] threads — drafted replies ready
- **Partially accepted:** [N] threads — partial edits + replies
- **Resolved by R-XX:** [N] threads — addressed by grey area decisions
- **Deferred:** [N] threads — for offline discussion
- **Skipped:** [N] threads
- **Confirmed (pre-resolved):** [N] threads — already handled on GitHub

### Review State
Saved to: [REVIEW.md path(s)]
```

Then ask the user what they'd like to do next via AskUserQuestion:

1. **Review all document changes** — show a consolidated diff of every edit made during this session
2. **See drafted replies** — collect all drafted reply text in one place for easy copy-paste into GitHub, including R-XX-based replies
3. **See R-XX decisions** — display all grey area decisions with their full context
4. **Commit changes** — commit the document edits with a descriptive message (e.g., "Address PR #42 review feedback: R-01 through R-03, 8 comment resolutions")
5. **Done** — end the session

**State update:** Final REVIEW.md update — set Status to "Complete", clear Resume Checkpoint.
