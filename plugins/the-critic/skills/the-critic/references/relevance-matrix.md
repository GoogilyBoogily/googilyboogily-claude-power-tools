# Critic Relevance Matrix

Maps file types to which critics should run. The orchestrator uses this to skip irrelevant critics and save context budget.

## Matrix

| File Pattern | approach | architecture | best-practices | simplicity | testability | maintainability | security | performance | error-handling | readability | solid |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Source code (*.ts, *.js, *.py, *.go, *.rs, *.java, *.rb, *.php, *.cs, *.swift, *.kt) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Test files (*.test.*, *.spec.*, *_test.*, test_*.*) | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Config files (*.json, *.yaml, *.yml, *.toml, *.ini, *.env*) | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Markup/docs (*.md, *.txt, *.rst, *.adoc) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| SQL (*.sql) | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Shell scripts (*.sh, *.bash, *.zsh) | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Styles (*.css, *.scss, *.less) | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Mixed / Unknown | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Rules

1. If the target contains **any source code files**, run ALL 11 critics (mixed wins).
2. If the target is **exclusively** one non-source type, use the row above to filter.
3. The `--critics` flag **overrides** this matrix entirely — if the user specifies critics, run exactly those.
4. Always run at least **readability** and **maintainability** — they apply to everything.
