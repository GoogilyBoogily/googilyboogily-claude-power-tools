---
name: doc-review
description: PR-Aware Architecture Document Review — pulls open GitHub PR comments on ADR/HLD/LLD documents and walks through each comment interactively with resolution options
disable-model-invocation: true
argument-hint: "[PR number or URL]"
---

# PR-Aware Architecture Document Review

Pull open GitHub PR comments on architecture documents (ADR, HLD, LLD) and walk through each comment interactively, offering resolution options. This skill is **local-only** — it edits document files and drafts reply text, but NEVER posts anything to GitHub. The user handles all GitHub replies manually.

## When to Use

Use when an architecture document is in a PR with reviewer comments that need to be addressed. Works with any ADR, HLD, or LLD document that has open review feedback.

## Process

**Human-in-the-loop: Never proceed past a decision point without user approval.**

### Phase 1: Identify PR and Document

1. Accept PR number or URL from `$ARGUMENTS`. If not provided, detect from current branch:
   ```
   gh pr view --json number,title,url,headRefName
   ```
2. Validate prerequisites:
   - Confirm `gh` CLI is installed and authenticated (`gh auth status`)
   - If not authenticated, stop and tell the user to run `gh auth login`
3. Identify architecture docs changed in the PR:
   ```
   gh pr diff <number> --name-only
   ```
   Scan changed files for ADR/HLD/LLD patterns (files containing `adr`, `hld`, `lld` in path or name, or markdown files in architecture/design directories).

**CHECKPOINT — Confirm PR and Documents:**
Present:
- PR number, title, URL, and branch
- List of identified architecture documents in the PR

Ask: "Are these the right documents? Should I include or exclude any?"

Do NOT proceed until the user confirms.

### Phase 2: Fetch and Organize Comments

Fetch all comment types via `gh` CLI. This skill NEVER posts to GitHub — all API calls are read-only.

1. **Inline review comments:**
   ```
   gh api repos/{owner}/{repo}/pulls/{number}/comments --paginate
   ```
2. **Review-level comments:**
   ```
   gh api repos/{owner}/{repo}/pulls/{number}/reviews --paginate
   ```
3. **General PR comments:**
   ```
   gh api repos/{owner}/{repo}/issues/{number}/comments --paginate
   ```

Extract `{owner}/{repo}` from the PR URL or from `gh repo view --json nameWithOwner`.

**Filter:**
- Skip resolved/outdated threads
- Skip bot comments (author type = "Bot")
- Skip comments authored by the current user (`gh api user`)

**Organize:**
- Group by conversation thread (reply chains together)
- Order by document section (top-to-bottom by line number / diff position)
- Tag each thread with: author, comment count, document section

**CHECKPOINT — Comment Summary:**
Present:
- "Found X open threads from Y reviewers"
- Breakdown by document and section
- List of reviewers with comment counts

Ask: "Which comments would you like to address? Options: all, by reviewer, by section, or pick specific threads."

Do NOT proceed until the user confirms which comments to address.

### Phase 3: Sequential Comment Resolution

For each selected comment thread, present:

1. **Comment text** — full comment with author attribution
2. **Document context** — read the relevant section of the document so both the comment and the current text are visible

Then offer options via `AskUserQuestion`:

1. **Accept** — agree with the feedback
   - Make the edit to the document
   - Show the diff of what changed
   - Draft a reply acknowledging the change (e.g., "Good catch — updated in latest revision")
2. **Reject** — disagree with the feedback
   - Ask the user for their reasoning
   - Draft a reply explaining the rationale the user can copy into GitHub
3. **Research (code)** — need more context from the codebase
   - Invoke the `code-research` skill to investigate
   - Return to this comment with findings
   - Re-present options with research context
4. **Research (web)** — need external information
   - Invoke the `web-research` skill to investigate
   - Return to this comment with findings
   - Re-present options with research context
5. **Discuss** — mark as deferred for offline discussion
   - Record the thread as "deferred" with a note
   - Move to next comment
6. **Skip** — move to next comment without action

After each action: confirm the result before moving to the next comment. Track all actions taken for the summary.

### Phase 4: Summary and Next Steps

Present a resolution summary:

- **Accepted:** X comments — list of document edits made
- **Rejected:** X comments — drafted replies ready for GitHub
- **Researched:** X comments — findings and resulting actions
- **Deferred:** X comments — threads marked for offline discussion
- **Skipped:** X comments

Then ask the user what they'd like to do next via `AskUserQuestion`:

1. **Review all document changes** — show a consolidated diff of every edit made during this session
2. **See drafted replies** — collect all drafted reply text in one place for easy copy-paste into GitHub
3. **Commit changes** — commit the document edits with a descriptive message
4. **Done** — end the session
