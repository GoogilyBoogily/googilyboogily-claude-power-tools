# Testability Checklist

Evaluate the target code against every item below. Flag any violation or concern.

## Dependency Injection
- [ ] Are dependencies passed in (constructor, parameter, or setter) rather than created internally?
- [ ] Are there `new` calls or static factory invocations inside business logic that prevent substitution?
- [ ] Can external services (databases, APIs, file system) be replaced with test doubles?
- [ ] Are there service locator or container lookups that hide dependencies from callers?
- [ ] Is the dependency graph shallow enough that wiring test doubles is straightforward?

## Side Effect Isolation
- [ ] Are side effects (I/O, network, file system, clock, randomness) pushed to the edges of the code?
- [ ] Can pure logic be extracted and tested without triggering any side effects?
- [ ] Are there functions that mix computation with I/O, making it impossible to test the computation alone?
- [ ] Does the code read environment variables, system properties, or global config directly inside logic?
- [ ] Are there hidden side effects (logging that affects behavior, metrics that change state) that complicate testing?

## Test Seams
- [ ] Are there interfaces or abstract types at module boundaries that allow substitution?
- [ ] Can middleware, hooks, or interceptors be bypassed or replaced in tests?
- [ ] Are there clear entry points for each unit of behavior, or must tests go through layers of setup?
- [ ] Do modules expose enough surface area to test important paths without resorting to reflection or private access?
- [ ] Are configuration and feature flags injectable so tests can exercise all code paths?

## Mocking Complexity
- [ ] Would testing this code require mocking more than 2-3 dependencies per test?
- [ ] Are there deep mock chains (mock returns mock returns mock) indicating excessive coupling?
- [ ] Does the code depend on concrete classes that are difficult or impossible to mock?
- [ ] Are there time-dependent or order-dependent behaviors that require complex test orchestration?
- [ ] Would tests need to mock internal implementation details rather than public interfaces?

## State Management for Tests
- [ ] Is there shared mutable state that makes tests order-dependent or non-parallelizable?
- [ ] Can the system under test be initialized to a known state without complex setup procedures?
- [ ] Are there global singletons or module-level state that leaks between tests?
- [ ] Does the code support reset or cleanup operations for test isolation?
- [ ] Are there implicit initialization sequences that tests must replicate exactly?

## Observable Behavior
- [ ] Does the code produce observable outputs (return values, events, state changes) that tests can assert on?
- [ ] Are there important behaviors that only manifest as side effects with no way to verify them?
- [ ] Can error conditions be triggered and verified without relying on specific infrastructure?
- [ ] Are there fire-and-forget operations with no feedback mechanism for test verification?
- [ ] Does the code distinguish between queries (no side effects) and commands (side effects) to enable focused testing?
