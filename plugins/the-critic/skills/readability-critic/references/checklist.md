# Readability Checklist

Evaluate the target code against every item below. Flag any violation or concern.

## Naming Quality
- [ ] Do variable names describe what the value represents, not how it was computed?
- [ ] Do function names describe what they do (verb + noun), not how they do it?
- [ ] Are boolean variables/parameters named as yes/no questions (isReady, hasPermission, canRetry)?
- [ ] Are abbreviations avoided unless they are universally understood in the domain (id, url, http)?
- [ ] Are names proportional to scope — short for tiny scopes (i, x), descriptive for wide scopes?
- [ ] Are misleading names absent — names that imply a different type, behavior, or purpose than actual?

## Cognitive Complexity
- [ ] Can each function be understood without scrolling — is it under ~30 lines?
- [ ] Is nesting depth 3 or fewer levels — no arrow-shaped code?
- [ ] Are early returns used to eliminate unnecessary nesting?
- [ ] Does each function do one thing, or does it chain unrelated responsibilities?
- [ ] Are complex conditionals extracted into well-named boolean variables or functions?
- [ ] Is the cyclomatic complexity reasonable — fewer than 5 branches per function?

## Code Organization & Flow
- [ ] Does the code read top-to-bottom without requiring the reader to jump around?
- [ ] Are related operations grouped together, not interleaved with unrelated logic?
- [ ] Is the public API / interface at the top of the file, implementation details below?
- [ ] Are helper functions close to where they are used, not scattered across the file?
- [ ] Is the file doing one thing, or is it a grab-bag of unrelated functionality?

## Comment Quality
- [ ] Are comments explaining why, not what — the code itself should explain what?
- [ ] Are there stale comments that no longer match the code they describe?
- [ ] Is tricky or non-obvious code explained, rather than left as a puzzle for the reader?
- [ ] Are TODO/FIXME/HACK comments tracked with context, not orphaned?
- [ ] Are comments absent where the code is already self-explanatory (no noise comments)?

## Consistency & Conventions
- [ ] Is the naming style consistent within the file (camelCase, snake_case, etc.)?
- [ ] Are similar operations done the same way, or are there multiple styles for the same pattern?
- [ ] Does the code follow the conventions already established in the surrounding codebase?
- [ ] Are magic numbers and string literals extracted into named constants?

## Abstraction Level Alignment
- [ ] Does each function operate at a single level of abstraction, not mixing high and low?
- [ ] Are low-level details (parsing, formatting, I/O) separated from business logic?
- [ ] Can the reader understand the high-level flow without reading implementation details?
- [ ] Are unnecessary abstractions absent — no wrapper classes or indirection that add nothing?
