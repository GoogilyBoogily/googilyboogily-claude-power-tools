# Architecture Docs Plugin

Interactive ADR → HLD → LLD pipeline with code and web research skills for architecture documentation.

## Installation

```bash
/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools architecture-docs
```

## Skills

### Design Pipeline (ADR → HLD → LLD)

Each skill is interactive and human-in-the-loop. They can be used independently or as a connected pipeline where each skill offers to invoke the next.

| Skill | Command | Description |
|-------|---------|-------------|
| **ADR** | `/architecture-docs:adr [topic]` | Generate Architecture Decision Records following MADR 4.0.0. Walks through context, options, and decision outcome interactively. |
| **HLD** | `/architecture-docs:hld [description]` | Create High Level Design documents covering architecture, data model, API design, alternatives, and implementation phases. |
| **LLD** | `/architecture-docs:lld [path-to-hld]` | Translate an HLD into a Low Level Design with method signatures, sequence diagrams, state machines, error catalogs, and file-level implementation plans. |

### Research Skills

These support the design pipeline's exploration phases and can also be used standalone.

| Skill | Command | Description |
|-------|---------|-------------|
| **Code Research** | `/architecture-docs:code-research [question]` | Systematic codebase investigation producing structured, citable reports with findings, gaps, and patterns. |
| **Web Research** | `/architecture-docs:web-research [question]` | External knowledge research using Context7, WebSearch, and WebFetch producing structured reports with source reliability ratings. |

## Pipeline Flow

```
/architecture-docs:adr "migrate from REST to GraphQL"
        │
        ▼ (offers to continue)
/architecture-docs:hld "based on ADR at docs/decisions/0005-migrate-to-graphql.md"
        │
        ▼ (offers to continue)
/architecture-docs:lld "docs/hld-graphql-migration.md"
```

Each skill in the pipeline automatically back-references its predecessor and offers to invoke the next skill when complete.

## Source Integrity

All design skills enforce strict source integrity:
- Every factual claim must be traceable to research performed in the current session
- No references to prior Claude sessions or memory
- Assumptions are explicitly labeled, never hidden
