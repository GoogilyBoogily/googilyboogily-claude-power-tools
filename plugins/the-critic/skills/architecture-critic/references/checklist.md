# Architecture Checklist

Evaluate the target code against every item below. Flag any violation or concern.

## Component Boundaries
- [ ] Are component boundaries drawn at natural seams, or do they split related logic?
- [ ] Does each component have a single, clear responsibility?
- [ ] Are there God classes or God modules that accumulate unrelated functionality?
- [ ] Do component interfaces expose only what consumers need, or do they leak internals?
- [ ] Are boundary contracts (interfaces, types, protocols) explicitly defined?

## Layering & Separation
- [ ] Are presentation, business logic, and data access in distinct layers?
- [ ] Does any layer bypass the one below it to reach a deeper layer directly?
- [ ] Is there business logic leaking into controllers, handlers, or UI code?
- [ ] Are infrastructure concerns (logging, metrics, auth) separated from domain logic?
- [ ] Does the code respect layer isolation — can one layer be replaced without rewriting others?

## Coupling & Cohesion
- [ ] Are modules tightly coupled to each other's internals rather than abstractions?
- [ ] Do changes in one module ripple into unrelated modules?
- [ ] Is there high cohesion within each module — do all members serve the module's purpose?
- [ ] Are there shared mutable state or global singletons creating hidden coupling?
- [ ] Do modules communicate through well-defined interfaces or through side effects?

## Dependency Direction
- [ ] Do dependencies point inward (toward domain/core) rather than outward (toward infrastructure)?
- [ ] Are there circular dependencies between modules or packages?
- [ ] Does high-level policy depend on low-level detail instead of abstractions?
- [ ] Are third-party libraries wrapped behind interfaces, or do they leak throughout the codebase?
- [ ] Is dependency injection used where appropriate, or are dependencies hardcoded?

## Module Organization
- [ ] Is the module/package structure navigable — can a new developer find things?
- [ ] Are related files co-located, or scattered across distant directories?
- [ ] Is there a consistent organizational principle (by feature, by layer, by domain)?
- [ ] Are there orphaned modules that nothing imports or references?
- [ ] Do module names accurately reflect their contents?

## Scalability of Structure
- [ ] Will this structure accommodate foreseeable growth without major reorganization?
- [ ] Are there bottleneck components that everything must route through?
- [ ] Can new features be added without modifying existing modules (open/closed at the architecture level)?
- [ ] Are there horizontal scaling barriers baked into the structure (shared state, single-writer assumptions)?
- [ ] Does the architecture support independent deployment/testing of components?
