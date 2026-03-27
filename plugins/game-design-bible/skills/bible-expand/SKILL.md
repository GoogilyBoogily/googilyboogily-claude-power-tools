---
name: bible-expand
description: "Deep-dive and expand a specific section of the Game Design Bible with additional detail, sub-sections, or aspect exploration."
disable-model-invocation: true
context: fork
argument-hint: "[section-path] [aspect]"
allowed-tools: Read, Write, Edit, Glob, Grep, AskUserQuestion
model: opus
---

# Bible Expand — Section Deep-Dive

## Argument Parsing

Parse the following from `$ARGUMENTS`:
- `section-path`: Path to a file or directory within the bible, relative to bible root (optional — prompt if missing)
- `aspect`: Specific aspect to explore, e.g., "economy balancing", "boss design", "environmental storytelling" (optional)

## Step 1: Locate the Bible Root

If `section-path` is relative, resolve it by searching upward for INDEX.md to find the bible root.

If no `section-path` provided:
1. Find the bible root (look for INDEX.md in current directory or parent directories)
2. Read INDEX.md
3. Present the section list:
   > "Which section would you like to expand?"
   > [numbered list of all sections from INDEX.md with their current file sizes]
4. Wait for user selection

## Step 2: Re-establish Pillar Context

Read `<bible-root>/DESIGN-PILLARS.md`.

**ALWAYS** re-read pillars — every expansion must align with the established design pillars. This is non-negotiable.

## Step 3: Read Target Section

Resolve the section path:
- **If file**: Read the target file
- **If directory**: Read all `.md` files in the directory, build a content map

Also read cross-referenced files:
- Grep the target for references to other bible sections (patterns like `see [section-name]`, links to other files)
- Read referenced files to understand the full context

Present a section summary:
> "📄 **[Section Name]**
> - Current size: N lines
> - Cross-references: [list]
> - Open questions: [count]
> - Pillar alignment: [which pillars this section serves]"

## Step 4: Assess Expansion Type

Based on the section content and user's aspect request, determine the expansion type:

### A. Depth Expansion
The section exists but needs more detail within its current structure.
- **Trigger**: Section is thin (< 50 lines of content), or user asks for "more detail"
- **Action**: Edit the existing file to add depth to existing subsections

### B. Split Expansion
The section is too large or covers too many topics for a single file.
- **Trigger**: File exceeds 300 lines, or covers 3+ distinct topics
- **Action**: Create a subdirectory, split into focused sub-files, update the original as an index

### C. Aspect Expansion
The user wants a specific aspect explored that doesn't exist yet.
- **Trigger**: User provides an `aspect` argument, or the section has gaps
- **Action**: Create a new file for the aspect, cross-reference from parent

Present the assessment:
> "I recommend **[Type] Expansion** because [reason]. This will [description of what changes].
> Alternatively, I could do [other type] instead. Which approach?"

## Step 5: Targeted Expansion Questions

Ask 2-4 questions tailored to the expansion type and section domain:

**For gameplay systems**: "What's the intended complexity ceiling?", "How does this interact with [related system]?"
**For narrative sections**: "What emotional beat should this section support?", "Are there themes from the pillars we should reinforce?"
**For technical sections**: "What are the performance constraints?", "Should this cover the prototype or production architecture?"
**For art/audio sections**: "What reference games or media capture the feel you want?", "Are there specific moods or atmospheres to emphasize?"

Always include: "Anything specific you want to make sure gets covered?"

## Step 6: Write Expanded Content

### For Depth Expansion (Type A):
Use Edit to add content within the existing file. Preserve existing structure, add depth to subsections.

### For Split Expansion (Type B):
1. Create the subdirectory: `<section-path>/` (if section was a file, rename it)
2. Write focused sub-files for each topic
3. Write an `index.md` in the subdirectory that links all sub-files
4. Update the parent reference to point to the new directory

### For Aspect Expansion (Type C):
1. Write a new file for the aspect: `<section-dir>/<aspect-name>.md`
2. Edit the parent file to add a cross-reference to the new aspect file

## Content Requirements

ALL expanded content MUST include:

1. **Pillar Alignment header** at the top of each new section:
   ```markdown
   > **Pillar Alignment**: [Pillar Name] — [how this content serves the pillar]
   ```

2. **Pillar validation**: Every feature, system, or design decision described must serve at least one pillar. If something doesn't align, flag it:
   ```markdown
   > ⚠️ **Pillar Check**: This feature doesn't clearly serve any current pillar. Consider whether it belongs or if a pillar needs updating.
   ```

3. **Open Questions**: End each new section with unresolved questions:
   ```markdown
   > **Open Questions**:
   > - ❓ [Question about this section that needs user input]
   ```

4. **Cross-references**: Link back to the parent section and any related sections:
   ```markdown
   > **See also**: [Related Section](../path/to/related.md)
   ```

## Step 7: Update INDEX.md

If any new files were created:
1. Read `<bible-root>/INDEX.md`
2. Add entries for new files in the appropriate phase section
3. Update file counts if tracked

Present the expansion summary:
> "✅ **Expansion Complete**
> - Type: [Depth/Split/Aspect]
> - Files modified: [list]
> - Files created: [list]
> - New open questions: [count]
> - Pillar alignment: [confirmed/flagged]"
