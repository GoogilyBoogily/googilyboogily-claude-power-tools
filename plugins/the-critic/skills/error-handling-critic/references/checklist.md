# Error Handling Checklist

Evaluate the target code against every item below. Flag any violation or concern.

## Exception & Error Propagation
- [ ] Are exceptions caught at the right level, or are they swallowed too early / too late?
- [ ] Are generic catch-all handlers (catch Exception, catch Error) hiding specific failure causes?
- [ ] Is error context preserved when re-throwing or wrapping exceptions?
- [ ] Are error types specific enough to distinguish different failure modes?
- [ ] Do async operations propagate errors correctly (unhandled promise rejections, missing await)?

## Edge Cases & Boundary Conditions
- [ ] Are null/undefined/nil inputs handled explicitly, not by accident?
- [ ] Does the code handle empty collections, zero-length strings, and missing keys?
- [ ] Are integer overflow, underflow, and division-by-zero scenarios addressed?
- [ ] Are concurrent access edge cases considered (race conditions, double-submit, stale reads)?
- [ ] Does the code handle partial data — truncated responses, incomplete records, mid-stream failures?

## Failure Recovery & Retry Logic
- [ ] Are retries implemented with backoff, or do they hammer the failing service?
- [ ] Is there a maximum retry limit to prevent infinite loops?
- [ ] Are retries idempotent — will retrying cause duplicate side effects?
- [ ] Does the code distinguish between transient failures (retry) and permanent failures (fail fast)?
- [ ] Is circuit-breaker or bulkhead logic present where repeated failures could cascade?

## Logging & Observability
- [ ] Are errors logged with enough context to diagnose the root cause without reproduction?
- [ ] Are sensitive values (passwords, tokens, PII) excluded from error messages and logs?
- [ ] Are error codes or structured error types used for programmatic handling downstream?
- [ ] Do logs distinguish between expected errors (user input) and unexpected errors (system bugs)?

## Graceful Degradation
- [ ] Does the system provide a degraded experience rather than a full outage when a dependency fails?
- [ ] Are timeouts configured for all external calls (HTTP, database, file I/O)?
- [ ] Are default/fallback values safe and clearly documented, not silently masking failures?
- [ ] Does the code fail loudly for conditions that should never happen (assertions, invariants)?
- [ ] Are partial failures handled — if 3 of 5 batch items fail, do the 2 successes still commit?

## Resource Cleanup & Disposal
- [ ] Are resources (file handles, connections, locks) released in finally blocks or equivalent?
- [ ] Does the code handle cleanup when an error occurs mid-operation (partial writes, half-open connections)?
- [ ] Are database transactions rolled back on error, not left hanging?
- [ ] Is memory freed or references cleared in error paths, not just success paths?
