# SOLID Checklist

Evaluate the target code against every item below. Flag any violation or concern.

## Single Responsibility Principle (SRP)
- [ ] Does each class/module have exactly one reason to change?
- [ ] Are there classes that mix business logic with I/O, formatting, or persistence?
- [ ] Are there functions that both compute a result and produce a side effect (logging, writing, sending)?
- [ ] Would a change to one feature force modifications in unrelated code within the same class?
- [ ] Are there god classes or god modules that accumulate unrelated responsibilities over time?

## Open/Closed Principle (OCP)
- [ ] Can new behavior be added by extending (new classes, new implementations) rather than modifying existing code?
- [ ] Are there switch/case or if/else chains that must be modified every time a new type or variant is added?
- [ ] Is polymorphism or strategy pattern used where type-checking conditionals currently exist?
- [ ] Are configuration and behavior separated so new configurations don't require code changes?
- [ ] Does adding a new feature require touching more than one file that shouldn't logically change?

## Liskov Substitution Principle (LSP)
- [ ] Can every subclass be used in place of its parent without surprising behavior?
- [ ] Do subclasses strengthen preconditions (requiring more than the parent promises)?
- [ ] Do subclasses weaken postconditions (delivering less than the parent promises)?
- [ ] Are there subclasses that throw exceptions for methods they inherit but don't support?
- [ ] Does any override change the semantic meaning of the method it replaces?

## Interface Segregation Principle (ISP)
- [ ] Are clients forced to depend on methods they do not use?
- [ ] Are there fat interfaces with methods that most implementors leave as no-ops or throw NotImplemented?
- [ ] Could large interfaces be split into focused role-based interfaces?
- [ ] Are there parameter objects or options bags where most callers only use a subset of fields?
- [ ] Do changes to unused interface methods force recompilation or retesting of unaffected clients?

## Dependency Inversion Principle (DIP)
- [ ] Do high-level modules depend on abstractions, or directly on low-level implementations?
- [ ] Are concrete dependencies (database clients, HTTP libraries, file system) injected or hardcoded?
- [ ] Can dependencies be swapped for test doubles without modifying the code under test?
- [ ] Are there `new` / `import` statements inside business logic that create tight coupling?
- [ ] Is the dependency direction consistent — do all arrows point toward the domain, not toward infrastructure?

## Cross-Cutting Concerns
- [ ] Are SOLID violations causing concrete harm (harder testing, forced shotgun surgery, fragile inheritance)?
- [ ] Is there over-application of SOLID — unnecessary abstractions that add indirection without value?
- [ ] Are the violation patterns systemic (affecting multiple classes) or isolated incidents?
- [ ] Would fixing the violations require a refactoring scope proportional to the harm they cause?
