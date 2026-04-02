# Taxonomies Reference

## Classification Decision

Scan the target directory to determine which taxonomy applies:

- If >70% of files are `.md`, `.rst`, `.adoc` → use **Diataxis**
- Otherwise → use **PARA**
- For hybrid projects → apply PARA at top level, Diataxis within a `docs/` subtree

## PARA Taxonomy (General Files)

Use for non-documentation file collections (downloads, digital assets, knowledge bases, project files):

```
├── projects/       # Active work with deadlines or deliverables
├── areas/          # Ongoing responsibilities (no end date)
├── resources/      # Reference material for future use
└── archive/        # Completed or inactive items
```

Rules:
- A file moves from `projects/` → `archive/` when the project completes
- `areas/` contains things you maintain indefinitely (e.g., "brand-assets", "team-docs")
- `resources/` is for reference material you didn't create but want to keep
- Review `archive/` quarterly; delete or promote back

## Diataxis Taxonomy (Documentation Files)

Use when the target is primarily documentation:

```
docs/
├── tutorials/      # Learning-oriented — "follow along to learn X"
├── how-to/         # Task-oriented — "steps to accomplish Y"
├── reference/      # Information-oriented — "lookup table for Z"
└── explanation/    # Understanding-oriented — "why W works this way"
```

Rules:
- Tutorials teach concepts through guided exercises — they are NOT how-to guides
- How-to guides solve specific problems — they assume prerequisite knowledge
- Reference is purely descriptive — no opinions, no tutorials, just facts
- Explanation provides context and rationale — "why" not "how"
