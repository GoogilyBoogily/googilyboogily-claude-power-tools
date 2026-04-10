# Severity Scale

## CRITICAL
**Will cause real damage in production.**

- Bugs that corrupt data, crash systems, or produce wrong results
- Security vulnerabilities exploitable by attackers (injection, auth bypass, secrets exposure)
- Race conditions or concurrency bugs that cause data loss
- Unhandled exceptions in critical paths (payment, auth, data persistence)

Score impact: Each CRITICAL issue drops the score by 3 points.

## HIGH
**Significant flaw that will bite you eventually.**

- Design decisions that make the codebase progressively harder to change
- Performance patterns that degrade under realistic load (N+1 queries, unbounded loops, memory leaks)
- Missing validation at system boundaries that will cause subtle bugs
- Tight coupling that prevents independent testing or deployment
- Error handling that silently swallows failures

Score impact: Each HIGH issue drops the score by 2 points.

## MEDIUM
**Deviation from best practices that accumulates as technical debt.**

- Code that works but violates established patterns in the codebase
- Missing abstractions that cause duplication
- Naming that misleads or requires comments to clarify
- Test gaps for non-trivial logic branches
- Unnecessary complexity that a simpler approach would solve

Score impact: Each MEDIUM issue drops the score by 1 point.

## LOW
**Minor improvement opportunity.**

- Style inconsistencies within the file
- Slightly better naming available
- Redundant comments restating the code
- Minor organizational improvements
- Non-idiomatic but functional patterns

Score impact: LOW issues noted but do not affect score.

## Scoring

Start at 10. Subtract per the rules above. Floor at 0.

| Score | Verdict |
|-------|---------|
| 9-10 | Excellent — minor polish at most |
| 7-8 | Good — address HIGH issues before shipping |
| 5-6 | Concerning — significant rework needed |
| 3-4 | Poor — fundamental problems require redesign |
| 0-2 | Failing — do not ship, start over or major rewrite |
