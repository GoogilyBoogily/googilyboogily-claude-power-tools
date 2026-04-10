# Best Practices Checklist

Evaluate the target code against every item below. Flag any violation or concern.

## Language Idioms
- [ ] Does the code use language-idiomatic constructs, or fight the language?
- [ ] Are language-specific features used where they simplify code (destructuring, pattern matching, comprehensions, etc.)?
- [ ] Does the code follow the language's naming conventions (camelCase, snake_case, PascalCase as appropriate)?
- [ ] Are language-native error handling patterns used (Result types, exceptions, error returns) as intended?
- [ ] Does the code avoid reimplementing standard library functionality?

## Framework Conventions
- [ ] Does the code follow the framework's recommended project structure and file organization?
- [ ] Are framework-provided abstractions used instead of raw implementations (ORM vs raw SQL, router middleware vs manual checks)?
- [ ] Does the code use the framework's lifecycle hooks and extension points correctly?
- [ ] Are framework configuration conventions followed (env vars, config files, convention over configuration)?
- [ ] Does the code use the framework's built-in utilities instead of third-party alternatives for standard tasks?

## Anti-Pattern Detection
- [ ] Is there callback hell or deeply nested promise chains where async/await would be cleaner?
- [ ] Are there magic numbers or magic strings without named constants?
- [ ] Is there copy-paste duplication that should be extracted into shared functions?
- [ ] Are there God objects or functions doing too many unrelated things?
- [ ] Is there stringly-typed logic where enums or types would be safer?
- [ ] Are there temporal coupling issues (methods that must be called in a specific order without enforcement)?

## API Design Conventions
- [ ] Do function/method signatures follow the principle of least surprise?
- [ ] Are return types consistent and predictable across similar operations?
- [ ] Do APIs use established patterns (builder, options object, method chaining) appropriately?
- [ ] Are error responses structured consistently across the codebase?
- [ ] Do public APIs validate inputs at the boundary rather than deep inside?

## Convention Consistency
- [ ] Is the code internally consistent in style, even if the style differs from conventions?
- [ ] Are similar operations handled the same way throughout, or does the approach vary randomly?
- [ ] Is the import/dependency organization consistent with the rest of the codebase?
- [ ] Are logging levels and formats consistent with established patterns?
- [ ] Do file, function, and variable names follow a consistent scheme?

## Deprecation & Currency
- [ ] Is the code using deprecated APIs, methods, or patterns from its language or framework?
- [ ] Are there dependencies on libraries that are unmaintained or have known vulnerabilities?
- [ ] Does the code use legacy patterns where modern replacements exist (var vs let/const, class components vs hooks)?
- [ ] Are there compatibility shims or polyfills that are no longer needed for the target platforms?
