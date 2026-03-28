# Command Audit Checklist

## Frontmatter Compliance

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| FM-1 | `description` field present and substantive | 🔴 CRITICAL | Must be a complete sentence describing what the command does. Not a placeholder or single word. This is the primary way users discover the command. |
| FM-2 | `allowed-tools` field present | 🔴 CRITICAL | Commands must explicitly declare tool requirements. This is a security boundary — omitting it grants all tools, which is almost never appropriate for a command. |
| FM-3 | `allowed-tools` follows least-privilege principle | 🟡 WARNING | Each tool in the allowlist must be actually used in the command body. Scan the body for tool references and flag any grants that have no corresponding usage. |
| FM-4 | `argument-hint` present when `$ARGUMENTS` is used | 🟡 WARNING | If the command body references `$ARGUMENTS`, `$ARGUMENTS[N]`, or `$N`, the frontmatter must include `argument-hint` with descriptive help text. |
| FM-5 | `model` override justified | 🔵 INFO | If `model` is set, verify the choice matches the command's complexity. Most commands work fine with the default model. |
| FM-6 | `category` field present | 🔵 INFO | Optional but recommended for UI organization. Common values: `workflow`, `ai-assistant`, `validation`, `setup`. |

## Content Quality

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| CQ-1 | Instructions written TO the AI in imperative mood | 🔴 CRITICAL | Must use "Run X", "Create Y", "Check Z". Must NOT use "The command will...", "I will...", or passive descriptions. The AI reads these as instructions — write them that way. |
| CQ-2 | `$ARGUMENTS` usage is consistent with `argument-hint` | 🟡 WARNING | If `argument-hint` says `[branch-name]`, the body should treat `$ARGUMENTS` as a branch name. Mismatches confuse the AI. |
| CQ-3 | `!command` syntax used correctly for inline bash | 🟡 WARNING | Dynamic bash execution uses `` !`command` `` (backtick-wrapped with `!` prefix). Verify syntax is correct and commands are safe. The output replaces the placeholder before the AI sees it. |
| CQ-4 | `@filename` syntax used correctly for file inclusion | 🟡 WARNING | File references use `@path/to/file` to inject file contents. Verify referenced files exist and paths are correct. |
| CQ-5 | No TODO/TBD/FIXME/placeholder text | 🟡 WARNING | Scan for: TODO, TBD, FIXME, XXX, HACK, "placeholder", "{...}", "[fill in]", template markers. |
| CQ-6 | Command length under 200 lines | 🔵 INFO | Commands are single-file — if over 200 lines, consider converting to a skill (directory-based) with supporting reference files. |

## Security

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SC-1 | No unrestricted `Bash` for commands that don't need it | 🔴 CRITICAL | If `Bash` is in allowed-tools without prefix restrictions (e.g., `Bash(git *)`), verify the command genuinely needs arbitrary shell access. Most commands should use prefix restrictions. |
| SC-2 | Bash prefix restrictions match actual usage | 🟡 WARNING | If `Bash(git *)` is granted, the command body should actually run git commands. If `Bash(npm *)` is granted, npm commands should appear. Flag mismatches. |
| SC-3 | No Write/Edit grants for read-only commands | 🟡 WARNING | Commands that only analyze, report, or display information should not have Write or Edit in their allowlist. |
| SC-4 | No sensitive data exposure patterns | 🔴 CRITICAL | Scan for: hardcoded API keys, tokens, passwords, secret paths. Also check for commands that might echo secrets to output (e.g., `!env | grep SECRET`). |

## Namespace & Location

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| NL-1 | Filename matches command intent | 🟡 WARNING | The filename becomes the command name. `commit.md` → `/plugin:commit`. Verify the name clearly communicates what the command does. |
| NL-2 | Namespace subdirectories follow colon convention | 🟡 WARNING | If the command uses namespacing via subdirectories (e.g., `commands/api/create.md` → `/plugin:api:create`), verify the directory structure is intentional and consistent with sibling commands. |
| NL-3 | No name collision with existing commands | 🟡 WARNING | Search for other commands with the same filename across `~/.claude/commands/`, `.claude/commands/`, and installed plugins. Flag collisions. |

## Feature Correctness

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| FC-1 | `$ARGUMENTS` positional indexing is correct | 🟡 WARNING | If using `$ARGUMENTS[0]`, `$ARGUMENTS[1]`, `$1`, `$2`, verify the indices match the expected argument order described in `argument-hint`. |
| FC-2 | `!command` outputs are meaningful | 🟡 WARNING | Dynamic bash commands (`` !`git status` ``) should produce output that's useful to the AI. Commands that produce no output or error should be wrapped in error handling. |
| FC-3 | `@file` paths are resolvable | 🟡 WARNING | File references (`@CLAUDE.md`, `@package.json`) must point to files that exist in the expected location. Relative paths resolve from the project root. |
| FC-4 | Conditional logic handles edge cases | 🔵 INFO | If the command has conditional instructions ("if X then Y, otherwise Z"), verify both branches are complete and don't leave the AI without instructions. |

## Source Integrity

| # | Check | Severity | How to Verify |
|---|-------|----------|---------------|
| SI-1 | No prior-session references | 🔴 CRITICAL | Scan for: "as we discussed", "from our previous", "based on prior analysis", "from memory". Commands are templates — they must not assume conversation history. |
| SI-2 | No hardcoded user-specific paths | 🟡 WARNING | Scan for: `/home/<username>/`, `/Users/<username>/`, `C:\Users\`. Use `$ARGUMENTS` or relative paths instead. |
