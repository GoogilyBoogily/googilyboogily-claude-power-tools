# Agent Audit Checklist

## Frontmatter Compliance

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| FM-1 | `name` field present and matches filename | 🔴 CRITICAL | Frontmatter `name` must exactly match the agent's filename without extension (kebab-case). If file is `my-agent.md`, name must be `my-agent`. This is the stable identifier used in routing mesh references. |
| FM-2 | `description` includes proactive invocation triggers | 🔴 CRITICAL | Must contain "Use PROACTIVELY when..." or equivalent trigger phrases ("MUST BE USED for...", "Automatically handles..."). Without these, the agent cannot be auto-invoked by Claude. |
| FM-3 | `description` is substantive and specific | 🔴 CRITICAL | Must describe the domain, list key problem types handled, and specify trigger conditions. Not generic ("A helpful agent") or vague ("Handles various issues"). |
| FM-4 | `tools` field is intentional | 🟡 WARNING | Three valid states: omitted (inherits all tools), empty string (no tools), or explicit list. Verify the choice matches the agent's needs. Analysis-only agents should not have Write/Edit. |
| FM-5 | `tools` follow least-privilege if listed | 🟡 WARNING | Each tool in the list must be actually used by the agent's workflow. Flag tools granted but never referenced in the body. |
| FM-6 | `model` override justified | 🔵 INFO | If set, verify the choice. Opus for complex multi-step reasoning, sonnet for moderate analysis, haiku for fast triage. Most agents work with the default. |

## Domain Expert Criteria

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| DE-1 | Covers 5-15 related problems | 🔴 CRITICAL | The agent's body (problem analysis or domain coverage section) should enumerate at least 5 distinct but related problem types. Fewer than 5 suggests this should be a skill, not an agent. More than 15 suggests splitting into a broad + specialist pair. |
| DE-2 | Domain passes the "resume test" | 🟡 WARNING | Ask: "Would someone put '[agent domain] Expert' on their resume?" If yes, the domain boundary is appropriate. If no (e.g., "Fix Circular Deps Expert"), the scope is too narrow. |
| DE-3 | Name follows `domain-expert` or `domain-subdomain-expert` pattern | 🟡 WARNING | Valid: `typescript-expert`, `database-performance-expert`, `react-expert`. Invalid: `fix-types`, `enhanced-ts-helper`, `my-agent-v2`. |
| DE-4 | Name avoids anti-patterns | 🟡 WARNING | Flag names matching: `fix-*`, `enhanced-*`, `*-helper`, `*-v2`, `*-new`, `better-*`. These suggest single-task tools, not domain experts. |
| DE-5 | Domain knowledge is non-obvious | 🔵 INFO | The agent should encode specialized knowledge that isn't trivially available from general programming knowledge. "Run eslint" is obvious; "Configure ESLint flat config with TypeScript parser overrides for monorepo" is non-obvious. |

## Routing Mesh

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| RM-1 | Step 0 "Route or Stay" section exists | 🔴 CRITICAL | Must have an explicit section (named "Step 0", "Route or Stay", "Delegation First", or equivalent) that defines when to handle locally vs. delegate to another agent. |
| RM-2 | Delegation targets name specific agents | 🟡 WARNING | Each delegation rule must name a concrete agent (e.g., "→ `postgres-expert`"), not a vague description ("→ a database specialist"). |
| RM-3 | Delegation includes stop language | 🟡 WARNING | Each delegation rule should include "STOP", "Stopping here", or "Output: ... Stopping here." to prevent the agent from continuing after delegating. |
| RM-4 | No circular delegation risk | 🔴 CRITICAL | If agent A delegates to agent B, agent B should not delegate the same problem type back to A. Check the delegation targets' own routing tables if accessible. |
| RM-5 | Broad experts delegate to specialists | 🟡 WARNING | If this agent covers a broad domain (e.g., `database-expert`), it should delegate sub-domain problems to specialists (e.g., `postgres-expert`, `mongodb-expert`). |
| RM-6 | Stop conditions defined | 🟡 WARNING | The agent should define when its work is complete — "Resolved when...", "STOP conditions:", or equivalent. Without this, the agent may run indefinitely. |

## Content Quality

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CQ-1 | Clear role definition | 🔴 CRITICAL | Must open with "You are a [domain] expert..." or equivalent role statement that establishes the agent's identity and expertise scope. |
| CQ-2 | Environment detection step | 🟡 WARNING | Should include a step that detects the project's relevant context (config files, frameworks, tools) before diving into problem solving. Prefer Read/Grep/Glob over Bash for detection. |
| CQ-3 | Problem analysis covers domain breadth | 🟡 WARNING | The problem categories or analysis steps should cover the full range of issues listed in the description's trigger conditions. Missing categories mean blind spots. |
| CQ-4 | Progressive solution pattern | 🔵 INFO | Best agents offer tiered solutions: quick fix → proper solution → best practice. This lets users choose based on their time constraints. |
| CQ-5 | Agent body under 80 lines | 🟡 WARNING | Agents should be concise domain encodings, not lengthy manuals. If over 80 lines, consider whether reference material should be moved to a skill or external file. |
| CQ-6 | No TODO/TBD/FIXME/placeholder text | 🟡 WARNING | Scan for: TODO, TBD, FIXME, XXX, HACK, "placeholder", "{...}", "[fill in]", template markers. |

## Proactive Triggers

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| PT-1 | Description contains actionable trigger conditions | 🔴 CRITICAL | Triggers must be specific enough for Claude to match: "Use PROACTIVELY for ownership/borrow checker issues, async Rust, unsafe code review" is good. "Use when needed" is not. |
| PT-2 | Trigger conditions match body expertise | 🟡 WARNING | Every trigger condition in the description should have corresponding handling in the agent body. Flag triggers that promise handling the body doesn't deliver. |
| PT-3 | Triggers don't overlap excessively with other agents | 🔵 INFO | If the trigger conditions significantly overlap with another agent's triggers, there's a risk of ambiguous auto-invocation. Check for overlap with agents in the same plugin or commonly installed alongside. |

## Source Integrity

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SI-1 | No prior-session references | 🔴 CRITICAL | Scan for: "as we discussed", "from our previous", "based on prior analysis", "from memory". Agents are templates — they must not assume conversation history. |
| SI-2 | No hardcoded user-specific paths | 🟡 WARNING | Scan for: `/home/<username>/`, `/Users/<username>/`, `C:\Users\`. Agent instructions should be environment-agnostic. |

## Official Docs Compliance

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| OD-1 | Only valid frontmatter fields used | 🟡 WARNING | Valid agent frontmatter fields: `name`, `description`, `tools`, `disallowedTools`, `model`, `effort`, `memory`, `isolation`, `background`, `skills`, `maxTurns`, `initialPrompt`, `mcpServers` (non-plugin only). Flag unrecognized fields. |
| OD-2 | Plugin-shipped agents don't use restricted fields | 🔴 CRITICAL | If this agent ships in a plugin (lives under `plugins/`), it must NOT use: `hooks`, `mcpServers`, `permissionMode`. These are blocked for plugin-distributed agents per official docs. |
