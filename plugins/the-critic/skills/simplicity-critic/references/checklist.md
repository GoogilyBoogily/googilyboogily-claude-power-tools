# Simplicity Checklist

Evaluate the target code against every item below. Flag any violation or concern.

## YAGNI Violations
- [ ] Are there features, parameters, or code paths that serve no current requirement?
- [ ] Are there configuration options that only have one possible value in practice?
- [ ] Is there dead code kept "in case we need it later"?
- [ ] Are there abstraction layers introduced for hypothetical future use cases?
- [ ] Does the code handle scenarios that the product doesn't actually require?

## Premature Abstraction
- [ ] Are there interfaces or abstract classes with only one implementation?
- [ ] Are there generic/parameterized types where a concrete type would suffice?
- [ ] Is there a factory or builder pattern where direct construction would work?
- [ ] Are there strategy or plugin patterns with only one strategy or plugin?
- [ ] Has DRY been applied so aggressively that unrelated concepts are forced into shared abstractions?

## Unnecessary Indirection
- [ ] Are there wrapper functions that just call another function with the same arguments?
- [ ] Are there adapter or bridge layers that don't actually adapt or bridge anything?
- [ ] Is there a publish/subscribe or event system where a direct call would be clearer?
- [ ] Are there intermediate data transformations that could be eliminated?
- [ ] Does the call chain pass through more layers than necessary to reach the logic?

## Configuration Over Convention
- [ ] Are there configuration files for behavior that could be hard-coded with sensible defaults?
- [ ] Is there a plugin or extension system for something that will never be extended?
- [ ] Are there environment variables controlling logic that never varies between environments?
- [ ] Is there a DSL or mini-language where plain code would be more readable?
- [ ] Are there metadata-driven or table-driven approaches where simple conditionals would be clearer?

## Premature Optimization
- [ ] Are there caches introduced without evidence of a performance problem?
- [ ] Is there manual memory management or object pooling where the runtime handles it fine?
- [ ] Are there complex concurrent data structures where a simple mutex would suffice?
- [ ] Is there denormalized data for read performance when the dataset is small?
- [ ] Are there batch/bulk operations optimizing for scale that doesn't yet exist?

## Accidental Complexity
- [ ] Could any function be simplified by breaking it into smaller, single-purpose functions?
- [ ] Are there deeply nested conditionals that could be flattened with early returns or guard clauses?
- [ ] Is there complex state management that could be replaced with stateless computation?
- [ ] Are there manual orchestration patterns where a simpler control flow would work?
- [ ] Does the code conflate multiple concerns in a single function or class, making each harder to understand?
