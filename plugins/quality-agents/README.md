# quality-agents

Code quality expert subagents for Claude Code.

## Agents

- **code-review-expert** — Deep 9-layer code review with root cause analysis and impact prioritization
- **architect-reviewer** — Architecture review, design validation, scalability analysis, tech debt
- **refactoring-expert** — Code smell detection, proven refactoring techniques, structural improvements
- **linting-expert** — ESLint/Prettier/Stylelint configuration, rule conflicts, custom rules
- **triage-expert** — Initial problem diagnosis, context gathering, error investigation
- **code-search** — Specialized codebase search for files, functions, and patterns
- **dead-code-analyst** — Dead code detection and removal analysis
- **file-organizer** — Directory structure, naming conventions, project layout organization

## Install

```
/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools --plugin quality-agents
```
