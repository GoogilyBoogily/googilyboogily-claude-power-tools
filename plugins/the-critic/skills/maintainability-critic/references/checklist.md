# Maintainability Checklist

Evaluate the target code against every item below. Flag any violation or concern.

## Change Resilience
- [ ] Can a single requirement change be implemented by modifying one file/module, or does it cascade across many?
- [ ] Are there hardcoded values (magic numbers, string literals, URLs) that should be constants or configuration?
- [ ] Is the code structured so that adding a new variant (type, case, handler) requires only additive changes, not shotgun surgery?
- [ ] Are feature flags, toggles, or conditional behavior organized for clean removal later?
- [ ] Would changing the database schema, API contract, or external dependency require touching unrelated code?

## Bus Factor & Knowledge Transfer
- [ ] Could a developer unfamiliar with this codebase understand what this code does within 15 minutes?
- [ ] Are there "clever" tricks, implicit conventions, or non-obvious control flows that require tribal knowledge?
- [ ] Is the code's purpose obvious from its structure, or does it require reading comments/docs to understand?
- [ ] Are there undocumented side effects that a new developer would likely miss?
- [ ] Is the git history clean enough to use `git blame` to understand why decisions were made?

## Modular Boundaries
- [ ] Does each module/class/function have a single, clear responsibility?
- [ ] Are there circular dependencies between modules?
- [ ] Can modules be understood, tested, and modified independently?
- [ ] Are public APIs minimal — exposing only what consumers need, not internal implementation details?
- [ ] Are shared utilities truly general-purpose, or are they tightly coupled to specific callers?

## Debugging Affordances
- [ ] Are error messages specific enough to diagnose problems without attaching a debugger?
- [ ] Is there sufficient logging at appropriate levels (debug, info, warn, error)?
- [ ] Can the code's state be inspected at runtime without modifying source code?
- [ ] Are failures traceable — can you follow the chain from symptom to root cause?
- [ ] Do stack traces and error paths preserve enough context to be actionable?

## Documentation Sufficiency
- [ ] Are non-obvious "why" decisions documented — not what the code does, but why it does it this way?
- [ ] Are public APIs documented with parameter descriptions, return values, and edge case behavior?
- [ ] Are there outdated comments that describe behavior the code no longer exhibits?
- [ ] Is there documentation for setup, configuration, and deployment that a new team member needs?

## Upgrade & Migration Path
- [ ] Are external dependencies pinned to specific versions with a clear upgrade strategy?
- [ ] Does the code use deprecated APIs or patterns that will require migration?
- [ ] Is there a clear separation between framework-coupled code and business logic, enabling framework upgrades?
- [ ] Are data formats versioned so that schema changes can be migrated without data loss?
- [ ] Would upgrading a major dependency (language version, framework, database) require rewriting this code?
