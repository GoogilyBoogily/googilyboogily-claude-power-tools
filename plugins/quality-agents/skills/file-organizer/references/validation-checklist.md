# Validation Checklist

After any reorganization, verify all of the following:

- [ ] **MECE**: Every file has exactly one home — no duplicates, no orphans
- [ ] **Depth**: No path exceeds 4 directory levels from root
- [ ] **Breadth**: Top level has 5-12 categories
- [ ] **No catch-alls**: Zero `misc/`, `other/`, `temp/` directories
- [ ] **No empties**: Zero empty directories
- [ ] **Consistent naming**: All files/dirs follow one naming convention
- [ ] **Single axis**: Each directory level sorts by exactly one dimension
- [ ] **No broken references**: Internal links/imports still resolve (if applicable)
- [ ] **Backup exists**: Original path list was saved before migration
