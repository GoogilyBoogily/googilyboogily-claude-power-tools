# Skill Audit Checklist

## Frontmatter Compliance

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| FM-1 | `name` field present and matches directory name | 🔴 CRITICAL | Frontmatter `name` must exactly match the skill's parent directory name (kebab-case). If skill is at `skills/my-skill/SKILL.md`, name must be `my-skill`. |
| FM-2 | `description` is substantive and actionable | 🔴 CRITICAL | Must be a complete sentence describing when and why to use the skill. Not a placeholder ("TODO", "My skill") or generic phrase ("A useful skill"). Must contain keywords that enable auto-invocation matching. |
| FM-3 | `allowed-tools` present and follows least-privilege | 🟡 WARNING | Tools listed must be only those actually used in the skill's workflow. Scan the SKILL.md body for tool references and compare. Flag tools in the allowlist that are never referenced. |
| FM-4 | `disable-model-invocation` set appropriately for skill type | 🟡 WARNING | Task skills (procedural workflows with phases) should set `disable-model-invocation: true`. Reference skills (knowledge/context) should consider `user-invocable: false` instead. If neither is set, flag for review. |
| FM-5 | `context` field appropriate for workflow complexity | 🔵 INFO | Skills with multi-phase workflows, parallel Tasks, or interactive Q&A benefit from `context: fork` for clean state. Lightweight reference skills typically omit this. |
| FM-6 | `argument-hint` present when `$ARGUMENTS` is used | 🟡 WARNING | If the SKILL.md body references `$ARGUMENTS`, `$ARGUMENTS[N]`, or `$N`, the frontmatter must include `argument-hint` with a descriptive hint (e.g., `"[feature-name] [--flag]"`). |
| FM-7 | `model` override justified | 🔵 INFO | If `model` is set (opus, sonnet, haiku), verify the choice matches the skill's complexity. Opus for complex multi-phase reasoning, sonnet for moderate tasks, haiku for simple/fast operations. |

## Content Quality

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CQ-1 | Instructions written TO the AI in imperative mood | 🔴 CRITICAL | Must use "Run X", "Ask Y", "Read the file", "Present the results". Must NOT use "The AI will...", "I will...", "This skill will...", or passive descriptions. |
| CQ-2 | Clear phased workflow with numbered steps | 🔴 CRITICAL | Task skills must have a structured process section with distinct, numbered phases. Each phase should have a clear name and purpose. Reference skills may use sections instead of phases. |
| CQ-3 | SKILL.md under 500 lines | 🟡 WARNING | Count total lines. If over 500, reference material, templates, or checklists should be moved to `references/` files and loaded via `${CLAUDE_SKILL_DIR}`. |
| CQ-4 | Uses `${CLAUDE_SKILL_DIR}` for reference file paths | 🔴 CRITICAL | Any reference to files in the skill's `references/` directory must use `${CLAUDE_SKILL_DIR}/references/filename` — never hardcoded absolute paths. |
| CQ-5 | No TODO/TBD/FIXME/placeholder text | 🟡 WARNING | Scan for: TODO, TBD, FIXME, XXX, HACK, "placeholder", "{...}", "[fill in]", "lorem ipsum", template markers that were not replaced. |
| CQ-6 | Each phase has a clear exit condition or output | 🟡 WARNING | Every phase should define what triggers moving to the next phase, what output it produces, or what checkpoint is reached. |

## Workflow Design

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| WD-1 | Input parsing section exists | 🔴 CRITICAL | Must document what arguments the skill expects and how they are extracted from `$ARGUMENTS`. Include handling for missing/invalid arguments. |
| WD-2 | Output clearly defined | 🔴 CRITICAL | Must state what files are created/modified, what is displayed to the user, or what is returned. A skill with no defined output is incomplete. |
| WD-3 | Error handling for missing inputs | 🟡 WARNING | Skill should handle gracefully: missing required arguments, files not found at specified paths, invalid input format. At minimum, report a clear error message. |
| WD-4 | Human-in-the-loop checkpoints for interactive skills | 🟡 WARNING | Skills that make decisions or produce artifacts should include explicit user approval points (via AskUserQuestion or "CHECKPOINT" markers). Fully automated skills may skip this. |
| WD-5 | No redundant steps or circular logic | 🔵 INFO | Review the workflow for steps that repeat without progression, phases that loop back without exit conditions, or instructions that contradict each other. |

## Tool Security

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| TS-1 | `allowed-tools` field is present | 🔴 CRITICAL | Every task skill must explicitly declare its tool requirements. Omitting `allowed-tools` grants all tools, which is only appropriate for reference skills with `user-invocable: false`. |
| TS-2 | Bash restrictions use prefix patterns | 🟡 WARNING | If `Bash` is in the allowlist, it should use prefix restrictions like `Bash(git *)`, `Bash(npm *)` unless unrestricted Bash is genuinely needed. Flag unrestricted `Bash` for review. |
| TS-3 | No Write/Edit for read-only skills | 🟡 WARNING | Skills that only analyze or report should not include Write or Edit in their allowlist. |
| TS-4 | Agent tool present if parallel work is dispatched | 🔵 INFO | If the skill launches parallel research or sub-agents, `Agent` must be in the allowlist. |

## Reference Files

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| RF-1 | All referenced files exist | 🔴 CRITICAL | Every `${CLAUDE_SKILL_DIR}/references/<filename>` mentioned in SKILL.md must correspond to an actual file in the `references/` directory. Use Glob to verify. |
| RF-2 | No orphan reference files | 🔵 INFO | Files in `references/` that are never referenced from SKILL.md. These may be dead weight or indicate a missing reference in the skill. |
| RF-3 | Reference files are well-structured | 🟡 WARNING | Checklists should use markdown tables with consistent columns. Templates should have clear placeholder markers. Files should have a title header. |

## Source Integrity

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SI-1 | No prior-session references | 🔴 CRITICAL | Scan for: "as we discussed", "from our previous", "based on prior analysis", "from memory", "you mentioned earlier", "in our last conversation". These indicate content from a prior session that may be stale or hallucinated. |
| SI-2 | No hardcoded user-specific paths | 🟡 WARNING | Scan for: `/home/<username>/`, `/Users/<username>/`, `C:\Users\`, or any absolute paths that assume a specific user's environment. Use `${CLAUDE_SKILL_DIR}` or relative paths instead. |

## Official Docs Compliance

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| OD-1 | Only valid frontmatter fields used | 🟡 WARNING | Valid skill frontmatter fields: `name`, `description`, `allowed-tools`, `disable-model-invocation`, `user-invocable`, `context`, `argument-hint`, `model`, `effort`, `paths`, `shell`, `hooks`, `agent`. Flag any unrecognized fields. |
| OD-2 | `context` values are valid | 🟡 WARNING | If `context` is set, it must be `fork`. Other values are not supported. |
| OD-3 | String substitutions used correctly | 🔵 INFO | Valid substitutions: `$ARGUMENTS`, `$ARGUMENTS[N]`, `$N` (positional), `${CLAUDE_SKILL_DIR}`, `${CLAUDE_SESSION_ID}`. Dynamic injection: `` !`shell-command` ``. Flag any other `${}` patterns that don't match these. |
