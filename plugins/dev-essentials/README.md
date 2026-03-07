# dev-essentials

Daily developer commands for git workflows, checkpoints, code quality, and configuration.

## Install

```
/plugin install dev-essentials@googilyboogily-claude-power-tools
```

## Commands

### Git (`git/`)
- **commit** -- Create a git commit following the project's established style
- **status** -- Analyze git status and provide insights about current project state
- **push** -- Push commits to remote with safety checks
- **checkout** -- Smart branch creation and switching with conventional naming
- **ignore-init** -- Initialize .gitignore with Claude Code specific patterns

### Checkpoint (`checkpoint/`)
- **create** -- Create a git stash checkpoint with optional description
- **list** -- List all Claude Code checkpoints with time and description
- **restore** -- Restore project to a previous checkpoint

### Quality (`quality/`)
- **validate-and-fix** -- Run quality checks and automatically fix issues
- **code-review** -- Multi-aspect code review using parallel agents

### Dev (`dev/`)
- **cleanup** -- Clean up debug files, test artifacts, and status reports

### Config (`config/`)
- **bash-timeout** -- Configure bash timeout values in Claude Code settings

## Usage

After installing, use these as slash commands:

```
/dev-essentials:git:commit
/dev-essentials:checkpoint:create "before refactor"
/dev-essentials:quality:validate-and-fix
```
