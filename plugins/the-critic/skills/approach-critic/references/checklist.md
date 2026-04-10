# Approach Checklist

Evaluate the target code against every item below. Flag any violation or concern.

## Problem Definition
- [ ] Is the code solving the right problem, or a symptom of the real problem?
- [ ] Are the requirements clearly reflected in the implementation, or has the intent drifted?
- [ ] Does the solution address the root cause, or paper over it with a workaround?
- [ ] Are there implicit assumptions about the problem that aren't validated?

## Algorithm & Strategy
- [ ] Is the chosen algorithm appropriate for the data size and access patterns?
- [ ] Are there simpler algorithms that achieve the same result?
- [ ] Does the approach scale to realistic production data volumes?
- [ ] Are there well-known solutions (standard library, established patterns) being reinvented?
- [ ] Is the approach brute-force where a more efficient strategy exists?

## Alternatives Not Considered
- [ ] Could a different data structure eliminate complexity?
- [ ] Could the problem be decomposed differently for a cleaner solution?
- [ ] Is there a declarative approach where imperative code is being used (or vice versa)?
- [ ] Could an existing library/framework feature replace custom code?
- [ ] Would a different architectural pattern (event-driven, pipeline, etc.) be more natural?

## Assumptions & Preconditions
- [ ] Are input assumptions validated or documented?
- [ ] Does the code handle the empty case, the single-element case, and the boundary case?
- [ ] Are there assumptions about ordering, uniqueness, or data shape that could break?
- [ ] Does the code assume network/disk/service availability without fallback?
- [ ] Are timezone, locale, encoding, or platform assumptions hardcoded?

## Trade-off Awareness
- [ ] Are the trade-offs in the approach explicit, or hidden and accidental?
- [ ] Is consistency vs. availability considered where relevant?
- [ ] Is the solution optimizing for the right dimension (speed, memory, readability, flexibility)?
- [ ] Are there trade-offs the author likely didn't consider?

## Scope & Boundaries
- [ ] Does the code do more than it should? (Feature creep, gold-plating)
- [ ] Does the code do less than it should? (Missing edge cases, incomplete implementation)
- [ ] Are the boundaries of responsibility clear — where does this code's job end?
- [ ] Is there logic here that belongs in a different layer (database, middleware, client)?
