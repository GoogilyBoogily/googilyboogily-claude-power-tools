# Anti-Patterns Reference

## Phase 1: Audit Commands

Run these to understand the current structure:

```bash
# Map current structure (max 4 levels deep)
find "${TARGET}" -maxdepth 4 -type f | head -200

# Count files per directory
find "${TARGET}" -type d -exec sh -c 'echo "$(find "$1" -maxdepth 1 -type f | wc -l) $1"' _ {} \; | sort -rn | head -20

# Identify file types
find "${TARGET}" -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -15
```

## Anti-Pattern Detection Commands

```bash
# Depth violations (>4 levels)
find "${TARGET}" -type f | awk -F/ '{print NF}' | sort -rn | head -1

# Catch-all folders (misc, other, temp, stuff, random, unsorted)
find "${TARGET}" -type d -iregex '.*/\(misc\|other\|temp\|stuff\|random\|unsorted\|junk\|old\|backup[0-9]*\)' 2>/dev/null

# One-file folders (over-categorization)
find "${TARGET}" -type d -exec sh -c 'count=$(find "$1" -maxdepth 1 -type f | wc -l); [ "$count" -eq 1 ] && echo "Single-file dir: $1"' _ {} \;

# Empty directories
find "${TARGET}" -type d -empty

# Duplicate filenames (same name in different dirs)
find "${TARGET}" -type f -exec basename {} \; | sort | uniq -d

# Inconsistent naming (mixed kebab-case, snake_case, camelCase)
find "${TARGET}" -type f | xargs -I{} basename {} | grep -E '^[a-z].*[A-Z]' | head -5  # camelCase
find "${TARGET}" -type f | xargs -I{} basename {} | grep -E '^[a-z].*_[a-z]' | head -5  # snake_case
find "${TARGET}" -type f | xargs -I{} basename {} | grep -E '^[a-z].*-[a-z]' | head -5  # kebab-case
```

## Anti-Patterns Fix Table

| Anti-Pattern | Signal | Fix |
|---|---|---|
| Catch-all folder | `misc/`, `other/`, `temp/` | Distribute contents to proper categories |
| Over-nesting | >4 directory levels | Flatten by merging intermediate dirs |
| One-file folder | Directory with single file | Promote file to parent directory |
| Mixed naming | `myFile.md` next to `my-file.md` | Standardize to one convention |
| Empty directories | No files inside | Remove unless intentionally reserved |
| Duplicate names | Same filename in multiple dirs | Rename to reflect context or merge |
| Date-prefixed sprawl | `2024-01-report.md`, `2024-02-report.md`... | Group by topic, not date |
