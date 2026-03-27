# Architecture Docs Plugin

ADR → HLD → LLD pipeline with gather/generate/audit phases, clean context isolation, and parallel code + web research.

## Installation

```bash
/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools architecture-docs
```

## Skills

### Full Pipeline

| Skill | Command | Description |
|-------|---------|-------------|
| **Pipeline** | `/architecture-docs:arch-pipeline [topic]` | Run the full 9-phase pipeline: ADR → HLD → LLD, each with gather → generate → audit. All phases run in isolated context. |

### ADR (Architecture Decision Records)

| Skill | Command | Description |
|-------|---------|-------------|
| **ADR Gather** | `/architecture-docs:adr-gather [topic]` | Interactive Q&A + code/web research. Compiles a context file for the generator. |
| **ADR Generate** | `/architecture-docs:adr-generate [context-file]` | Generate MADR 4.0.0 ADR from context file. Clean context, non-interactive. |
| **ADR Audit** | `/architecture-docs:audit-adr [adr-path] [--context path]` | Audit ADR for compliance, integrity, consistency. Interactive issue resolution with research option. |

### HLD (High Level Design)

| Skill | Command | Description |
|-------|---------|-------------|
| **HLD Gather** | `/architecture-docs:hld-gather [description] [--adr path]` | Interactive Q&A + research. Explores codebase impact, compiles context file. |
| **HLD Generate** | `/architecture-docs:hld-generate [context-file] [--adr path]` | Generate HLD from context file. Clean context, non-interactive. |
| **HLD Audit** | `/architecture-docs:audit-hld [hld-path] [--context path] [--adr path]` | Audit HLD for completeness, ADR alignment, architectural quality. Interactive resolution. |

### LLD (Low Level Design)

| Skill | Command | Description |
|-------|---------|-------------|
| **LLD Gather** | `/architecture-docs:lld-gather [description] [--hld path]` | Interactive Q&A + research. Validates HLD against codebase reality, compiles context file. |
| **LLD Generate** | `/architecture-docs:lld-generate [context-file] [--hld path]` | Generate LLD from context file. Clean context, non-interactive. |
| **LLD Audit** | `/architecture-docs:audit-lld [lld-path] [--context path] [--hld path]` | Audit LLD for implementation readiness, HLD alignment. Interactive resolution. |

### Research Skills

| Skill | Command | Description |
|-------|---------|-------------|
| **Code Research** | `/architecture-docs:code-research [question]` | Codebase investigation producing structured, citable reports. Used by gather skills. |
| **Web Research** | `/architecture-docs:web-research [question]` | External research using Context7, WebSearch, WebFetch. Used by gather skills. |

### Review & Implementation

| Skill | Command | Description |
|-------|---------|-------------|
| **Doc Review** | `/architecture-docs:doc-review [PR number]` | PR-aware architecture document review. Walks through reviewer comments. |
| **Implement** | `/architecture-docs:implement [path-to-hld-or-lld]` | Phased implementation from HLD or LLD with per-phase approval. |

## Pipeline Architecture

```
/architecture-docs:arch-pipeline "migrate from REST to GraphQL"
  │
  ├─ Phase 1: adr-gather        → docs/context/decisions/<name>-context.md
  │    CHECKPOINT: User reviews context file
  ├─ Phase 2: adr-generate      → docs/decisions/<name>.md
  ├─ Phase 3: audit-adr         → interactive resolution → AUDIT.md
  │
  ├─ Phase 4: hld-gather        → docs/context/hld/<name>-context.md
  │    CHECKPOINT: User reviews context file
  ├─ Phase 5: hld-generate      → docs/hld/<name>.md
  ├─ Phase 6: audit-hld         → interactive resolution → AUDIT.md
  │
  ├─ Phase 7: lld-gather        → docs/context/lld/<name>-context.md
  │    CHECKPOINT: User reviews context file
  ├─ Phase 8: lld-generate      → docs/lld/<name>.md
  └─ Phase 9: audit-lld         → interactive resolution → AUDIT.md
```

Every phase runs with `context: fork` — clean context, no accumulated history. Only file paths pass between phases.

### Context Isolation

| Phase Type | Fork? | Why |
|------------|-------|-----|
| Gather | Yes | Interactive Q&A + research in clean context. Writes findings to context file. |
| Generate | Yes | Non-interactive. Reads context file, produces document. No conversation history needed. |
| Audit | Yes | Interactive resolution loop. Reads document, runs checks, walks user through fixes. |
| Orchestrator | No | Tracks file paths across all 9 phases. Stays lean — delegates all heavy work. |

### Standalone Usage

Each skill works independently. Use the pipeline for full rigor, or individual skills for targeted work:

```bash
# Quick ADR without pipeline
/architecture-docs:adr-gather "use PostgreSQL for user data"
# Review context file, then:
/architecture-docs:adr-generate docs/context/decisions/use-postgresql-context.md

# Audit an existing HLD
/architecture-docs:audit-hld docs/hld/auth-redesign.md --adr docs/decisions/0003-auth-redesign.md

# Just gather context for an LLD
/architecture-docs:lld-gather "payment processing" --hld docs/hld/payments.md
```

## Output Structure

```
docs/
  context/
    decisions/<name>-context.md     # ADR gather output
    hld/<name>-context.md           # HLD gather output
    lld/<name>-context.md           # LLD gather output
  decisions/
    <NNNN>-<name>.md                # ADR document
    <NNNN>-<name>-AUDIT.md          # ADR audit report
  hld/
    <name>.md                       # HLD document
    <name>-AUDIT.md                 # HLD audit report
  lld/
    <name>.md                       # LLD document
    <name>-AUDIT.md                 # LLD audit report
```

## Audit Resolution

Each audit skill walks through issues one at a time. For every issue, you get:

1. **⭐ Recommended fix** — most likely correct based on evidence
2. **Alternative fix(es)** — different approach to resolve
3. **🔍 Research code & web** — forks two parallel agents (codebase + online) for deeper investigation, then re-presents the issue with refined options
4. **Skip** — leave as-is, logged in audit report

Verdicts: **PASS** (all clean), **PASS WITH WARNINGS** (non-critical remain), **FAIL** (critical issues skipped).

## Source Integrity

All skills enforce strict source integrity:
- Every factual claim traces to research performed in the current session
- No references to prior Claude sessions or memory
- Assumptions are explicitly labeled, never hidden
- Context files persist as audit trail for how decisions were made
