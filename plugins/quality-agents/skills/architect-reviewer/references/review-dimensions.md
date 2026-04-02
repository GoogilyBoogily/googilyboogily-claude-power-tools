# Architecture Review Dimensions

## 1. Structural Patterns

Evaluate how the system is organized and how components relate to each other.

- **Layering**: Are there clear architectural layers (presentation, business logic, data access)? Are layer boundaries respected?
- **Component boundaries**: Are modules self-contained with well-defined interfaces? Or do they reach into each other's internals?
- **Dependency direction**: Do dependencies flow in one direction (e.g., inward toward domain)? Are there circular dependencies?
- **Cohesion**: Do modules group related functionality? Or are they grab-bags of unrelated code?
- **Coupling**: How tightly are modules connected? Can one change without rippling through others?
- **Separation of concerns**: Is business logic separated from infrastructure, UI, and I/O?
- **God objects/modules**: Are there oversized components that do too much?
- **Configuration management**: Is configuration externalized, or hardcoded throughout?
- **Entry points**: Are there clear, documented entry points for the system?

## 2. Data Flow

Trace how data moves through the system.

- **Data models**: Are domain models clearly defined? Are they shared or duplicated across layers?
- **State management**: Where is state held? Is it centralized or distributed? Are there consistency risks?
- **API contracts**: Are internal and external APIs clearly defined with types/schemas?
- **Serialization boundaries**: Where does data cross format boundaries (JSON, protobuf, DB rows)? Are transformations explicit?
- **Schema evolution**: How are schema changes handled? Are there migration strategies?
- **Data validation**: Where is input validated? Is validation consistent across entry points?
- **Caching strategy**: Where is caching used? Are invalidation strategies clear?
- **Event/message flow**: If event-driven, are event schemas defined? Is ordering guaranteed where needed?

## 3. Resilience

Evaluate how the system handles failure.

- **Error handling**: Are errors caught, logged, and surfaced appropriately? Are there swallowed exceptions?
- **Failure modes**: What happens when dependencies fail (DB down, API timeout, disk full)?
- **Retry patterns**: Are retries implemented with backoff? Are they idempotent?
- **Circuit breakers**: Are there circuit breakers for external dependencies?
- **Graceful degradation**: Can the system operate in a reduced mode when components fail?
- **Timeouts**: Are all external calls bounded by timeouts?
- **Health checks**: Are there health/readiness endpoints?
- **Observability**: Are metrics, logs, and traces instrumented for debugging production issues?
- **Recovery**: Can the system recover automatically from transient failures?

## 4. Security

Assess the system's security posture.

- **Authentication boundaries**: Where are auth checks enforced? Are there unprotected routes?
- **Authorization model**: Is there a clear permission model (RBAC, ABAC)? Is it consistently applied?
- **Input validation**: Is all external input validated and sanitized?
- **Secrets management**: How are secrets stored and accessed? Are they in code, env vars, or a vault?
- **Attack surface**: What endpoints/interfaces are exposed? Are they minimized?
- **Dependency security**: Are dependencies up to date? Are there known vulnerabilities?
- **Data protection**: Is sensitive data encrypted at rest and in transit?
- **Logging safety**: Are secrets, PII, or tokens excluded from logs?

## 5. Evolution

Evaluate how well the system can adapt to change.

- **Extension points**: Can new features be added without modifying existing code?
- **Abstraction stability**: Are abstractions stable, or do they change with every new requirement?
- **Breaking change risk**: How much code would need to change for a major feature addition?
- **Migration paths**: Are there clear paths for upgrading frameworks, databases, or APIs?
- **Technical debt hotspots**: Which areas have the most accumulated shortcuts or workarounds?
- **Vendor lock-in**: How tightly is the system coupled to specific vendors or services?
- **Test coverage**: Do tests protect against regressions during changes?
- **Documentation**: Are architectural decisions documented (ADRs, design docs)?
- **Onboarding**: Can a new developer understand the system from the codebase and docs?
