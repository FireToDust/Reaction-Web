---
tags:
  - Development
  - TaskList
---

# Development Task List

Automatically generated task list from all TODO items found in the documentation using Dataview.

## Status Overview

Summary of documentation completion status:

```dataview
TABLE length(todo) as "TODO Count", length(warnings) as "Warning Count", status
FROM ""
WHERE todo OR status OR warnings
SORT status ASC, length(todo) DESC
```

## TODO Items

Organized view of TODO items grouped by file:

```dataview
LIST todo
FROM ""
WHERE todo
SORT file.name ASC
```

## Warnings and Discussion Items

Files with warnings or items requiring team discussion:

```dataview
LIST warnings
FROM ""
WHERE warnings
SORT file.name ASC
```

## Stub Files Requiring Completion

Files marked as stubs that need to be completed:

```dataview
TABLE status, tags
FROM ""
WHERE status = "stub"
SORT file.name ASC
```

---

**Note**: This task list is automatically generated using Dataview queries. Add `todo:` fields to any documentation file's frontmatter to have items appear here automatically.

**Usage**: 
- Add TODO items to file frontmatter: `todo: ["Item 1", "Item 2"]`
- Mark files as stubs: `status: stub`
- Items will automatically appear in the appropriate sections above