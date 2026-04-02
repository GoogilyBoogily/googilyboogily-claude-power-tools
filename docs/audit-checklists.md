# Audit Checklists: Quick Reference

Consolidated audit checks from the `artifact-toolkit` plugin. For interactive walk-throughs with per-issue resolution options, use the audit skills: `/artifact-toolkit:skill-audit`, `/artifact-toolkit:agent-audit`, `/artifact-toolkit:command-audit`.

**Severity levels:** 🔴 CRITICAL (must fix) | 🟡 WARNING (should fix) | 🔵 INFO (optional)

---

## Skill Audit Checklist

### Frontmatter Compliance

| # | Check | Severity |
|---|-------|----------|
| FM-1 | `name` present and matches directory name | 🔴 |
| FM-2 | `description` is substantive with auto-invocation keywords | 🔴 |
| FM-3 | `allowed-tools` present and follows least-privilege | 🟡 |
| FM-4 | `disable-model-invocation` set appropriately for skill type | 🟡 |
| FM-5 | `context` field appropriate for workflow complexity | 🔵 |
| FM-6 | `argument-hint` present when `$ARGUMENTS` is used | 🟡 |
| FM-7 | `model` override justified | 🔵 |

### Content Quality

| # | Check | Severity |
|---|-------|----------|
| CQ-1 | Instructions written TO the AI in imperative mood | 🔴 |
| CQ-2 | Clear phased workflow with numbered steps | 🔴 |
| CQ-3 | SKILL.md under 500 lines | 🟡 |
| CQ-4 | Uses `${CLAUDE_SKILL_DIR}` for reference file paths (no hardcoded paths) | 🔴 |
| CQ-5 | No TODO/TBD/FIXME/placeholder text | 🟡 |
| CQ-6 | Each phase has clear exit condition or output | 🟡 |

### Workflow Design

| # | Check | Severity |
|---|-------|----------|
| WD-1 | Input parsing section exists | 🔴 |
| WD-2 | Output clearly defined | 🔴 |
| WD-3 | Error handling for missing inputs | 🟡 |
| WD-4 | Human-in-the-loop checkpoints for interactive skills | 🟡 |
| WD-5 | No redundant steps or circular logic | 🔵 |

### Tool Security

| # | Check | Severity |
|---|-------|----------|
| TS-1 | `allowed-tools` field is present | 🔴 |
| TS-2 | Bash restrictions use prefix patterns (e.g., `Bash(git *)`) | 🟡 |
| TS-3 | No Write/Edit for read-only skills | 🟡 |
| TS-4 | Agent tool present if parallel work is dispatched | 🔵 |

### Reference Files

| # | Check | Severity |
|---|-------|----------|
| RF-1 | All referenced files exist on disk | 🔴 |
| RF-2 | No orphan reference files (unreferenced from SKILL.md) | 🔵 |
| RF-3 | Reference files are well-structured (tables, headers, placeholders) | 🟡 |

### Source Integrity

| # | Check | Severity |
|---|-------|----------|
| SI-1 | No prior-session references ("as we discussed", "from memory") | 🔴 |
| SI-2 | No hardcoded user-specific paths (`/Users/<name>/`) | 🟡 |

### Official Docs Compliance

| # | Check | Severity |
|---|-------|----------|
| OD-1 | Only valid frontmatter fields used | 🟡 |
| OD-2 | `context` values are valid (only `fork` is supported) | 🟡 |
| OD-3 | String substitutions used correctly | 🔵 |

---

## Agent Audit Checklist

### Frontmatter Compliance

| # | Check | Severity |
|---|-------|----------|
| FM-1 | `name` present and matches filename (stable routing mesh identifier) | 🔴 |
| FM-2 | `description` includes "Use PROACTIVELY when..." triggers | 🔴 |
| FM-3 | `description` is substantive — lists domain, problem types, triggers | 🔴 |
| FM-4 | `tools` field is intentional (omitted, empty, or explicit list) | 🟡 |
| FM-5 | `tools` follow least-privilege if listed | 🟡 |
| FM-6 | `model` override justified | 🔵 |

### Domain Expert Criteria

| # | Check | Severity |
|---|-------|----------|
| DE-1 | Covers 5-15 related problems (fewer → skill; more → split) | 🔴 |
| DE-2 | Domain passes the "resume test" | 🟡 |
| DE-3 | Name follows `domain-expert` or `domain-subdomain-expert` pattern | 🟡 |
| DE-4 | Name avoids anti-patterns (`fix-*`, `enhanced-*`, `*-helper`, `*-v2`) | 🟡 |
| DE-5 | Domain knowledge is non-obvious (not trivially available) | 🔵 |

### Routing Mesh

| # | Check | Severity |
|---|-------|----------|
| RM-1 | Step 0 "Route or Stay" section exists | 🔴 |
| RM-2 | Delegation targets name specific agents (not vague descriptions) | 🟡 |
| RM-3 | Delegation includes STOP language | 🟡 |
| RM-4 | No circular delegation risk (A → B and B → A for same problem) | 🔴 |
| RM-5 | Broad experts delegate to specialists | 🟡 |
| RM-6 | Stop conditions defined ("Resolved when...", "STOP if...") | 🟡 |

### Content Quality

| # | Check | Severity |
|---|-------|----------|
| CQ-1 | Clear role definition ("You are a [domain] expert...") | 🔴 |
| CQ-2 | Environment detection step (check configs before solving) | 🟡 |
| CQ-3 | Problem analysis covers domain breadth from description | 🟡 |
| CQ-4 | Progressive solution pattern (quick fix → proper → best practice) | 🔵 |
| CQ-5 | Agent body under 80 lines | 🟡 |
| CQ-6 | No TODO/TBD/FIXME/placeholder text | 🟡 |

### Proactive Triggers

| # | Check | Severity |
|---|-------|----------|
| PT-1 | Description contains actionable, specific trigger conditions | 🔴 |
| PT-2 | Trigger conditions match body expertise | 🟡 |
| PT-3 | Triggers don't overlap excessively with other agents | 🔵 |

### Source Integrity

| # | Check | Severity |
|---|-------|----------|
| SI-1 | No prior-session references (agents are templates, not conversations) | 🔴 |
| SI-2 | No hardcoded user-specific paths | 🟡 |

### Official Docs Compliance

| # | Check | Severity |
|---|-------|----------|
| OD-1 | Only valid frontmatter fields used | 🟡 |
| OD-2 | Plugin-shipped agents don't use restricted fields (`hooks`, `mcpServers`, `permissionMode`) | 🔴 |

---

## Command Audit Checklist

### Frontmatter Compliance

| # | Check | Severity |
|---|-------|----------|
| FM-1 | `description` present and substantive | 🔴 |
| FM-2 | `allowed-tools` field present | 🔴 |
| FM-3 | `allowed-tools` follows least-privilege | 🟡 |
| FM-4 | `argument-hint` present when `$ARGUMENTS` is used | 🟡 |
| FM-5 | `model` override justified | 🔵 |
| FM-6 | `category` field present | 🔵 |

### Content Quality

| # | Check | Severity |
|---|-------|----------|
| CQ-1 | Instructions written TO the AI in imperative mood | 🔴 |
| CQ-2 | `$ARGUMENTS` usage consistent with `argument-hint` | 🟡 |
| CQ-3 | `` !`command` `` syntax used correctly for inline bash | 🟡 |
| CQ-4 | `@filename` syntax used correctly for file inclusion | 🟡 |
| CQ-5 | No TODO/TBD/FIXME/placeholder text | 🟡 |
| CQ-6 | Command length under 200 lines (promote to skill if longer) | 🔵 |

### Security

| # | Check | Severity |
|---|-------|----------|
| SC-1 | No unrestricted `Bash` when scoped `Bash(git *)` would suffice | 🔴 |
| SC-2 | Bash prefix restrictions match actual usage | 🟡 |
| SC-3 | No Write/Edit grants for read-only commands | 🟡 |
| SC-4 | No sensitive data exposure (hardcoded keys, tokens, secrets) | 🔴 |

### Namespace & Location

| # | Check | Severity |
|---|-------|----------|
| NL-1 | Filename matches command intent | 🟡 |
| NL-2 | Namespace subdirectories follow colon convention | 🟡 |
| NL-3 | No name collision with existing commands | 🟡 |

### Feature Correctness

| # | Check | Severity |
|---|-------|----------|
| FC-1 | `$ARGUMENTS` positional indexing matches `argument-hint` order | 🟡 |
| FC-2 | `` !`command` `` outputs are meaningful (not empty/error) | 🟡 |
| FC-3 | `@file` paths are resolvable | 🟡 |
| FC-4 | Conditional logic handles edge cases (both branches complete) | 🔵 |

### Source Integrity

| # | Check | Severity |
|---|-------|----------|
| SI-1 | No prior-session references (commands are templates) | 🔴 |
| SI-2 | No hardcoded user-specific paths | 🟡 |

---

## Summary by Severity

### 🔴 CRITICAL Checks (Must Fix)

**Skills (8):** FM-1, FM-2, CQ-1, CQ-2, CQ-4, WD-1, WD-2, TS-1, RF-1, SI-1
**Agents (8):** FM-1, FM-2, FM-3, DE-1, RM-1, RM-4, CQ-1, PT-1, SI-1, OD-2
**Commands (5):** FM-1, FM-2, CQ-1, SC-1, SC-4, SI-1

### Common Across All Types

These checks apply universally:
- **Imperative mood** — Write TO the AI, not AS the AI
- **Source integrity** — No prior-session references, no hardcoded user paths
- **Least-privilege tools** — Only grant what's actually used
- **No placeholders** — No TODO/TBD/FIXME in shipped artifacts
