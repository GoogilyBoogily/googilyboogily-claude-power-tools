# Performance Checklist

Evaluate the target code against every item below. Flag any violation or concern.

## Algorithmic Complexity
- [ ] Are there nested loops over the same or related collections producing O(n^2) or worse behavior?
- [ ] Could a hash map, set, or index eliminate a linear scan?
- [ ] Are sorting operations repeated unnecessarily when data could be sorted once and reused?
- [ ] Are there recursive algorithms without memoization that recompute the same subproblems?
- [ ] Is there string concatenation in a loop instead of using a builder/buffer?
- [ ] Are regular expressions compiled once and reused, or recompiled on every call?

## Memory Usage & Leaks
- [ ] Are large collections (arrays, maps, buffers) growing unbounded without size limits or eviction?
- [ ] Are event listeners, subscriptions, or callbacks registered without corresponding cleanup/unsubscription?
- [ ] Are closures capturing large objects or entire scopes when they only need a small value?
- [ ] Is data being copied unnecessarily when a reference or view would suffice?
- [ ] Are temporary/intermediate data structures freed or eligible for garbage collection after use?
- [ ] Is there potential for memory fragmentation from frequent allocation/deallocation of variable-size objects?

## I/O & Network Patterns
- [ ] Are multiple sequential network/disk calls made where a single batch request would work?
- [ ] Are N+1 query patterns present — fetching a list then individually fetching details for each item?
- [ ] Is there synchronous/blocking I/O on a thread that should remain non-blocking?
- [ ] Are large files or responses loaded entirely into memory instead of streamed?
- [ ] Are HTTP connections reused (connection pooling) or created fresh for each request?
- [ ] Are timeouts and circuit breakers configured for external service calls?

## Database Query Efficiency
- [ ] Are queries selecting more columns or rows than needed (SELECT * when only 2 fields are used)?
- [ ] Are there missing indexes on columns used in WHERE, JOIN, or ORDER BY clauses?
- [ ] Are queries inside loops that could be replaced with a single query using IN, JOIN, or batch operations?
- [ ] Are transactions held open longer than necessary, increasing lock contention?
- [ ] Is pagination implemented for queries that could return unbounded result sets?

## Caching Strategy
- [ ] Are expensive computations or I/O results being recalculated on every request when they could be cached?
- [ ] Do caches have appropriate TTLs and eviction policies, or do they grow unbounded?
- [ ] Is cache invalidation correct — are stale entries served after the underlying data changes?
- [ ] Are cache keys granular enough to avoid excessive misses, but not so granular they defeat the purpose?
- [ ] Is there a thundering herd risk — many concurrent requests computing the same uncached value?

## Concurrency & Parallelism
- [ ] Are independent I/O operations executed sequentially when they could run in parallel (Promise.all, asyncio.gather, etc.)?
- [ ] Are shared data structures accessed from multiple threads/coroutines without synchronization?
- [ ] Are locks held during I/O operations, creating unnecessary contention?
- [ ] Is there potential for deadlocks from inconsistent lock ordering?
- [ ] Are thread/worker pools sized appropriately — not creating a thread per request or starving the pool?
