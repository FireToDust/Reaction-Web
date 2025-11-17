---
tags:
  - Development
  - TaskList
---

# Development Task List

Automatically generated task list from all TODO items found in the documentation using Dataview.

## Overview

> [!abstract]+ Status Overview
> ```dataview
> TABLE length(todo) as "TODOs", length(warnings) as "Warnings", status
> FROM ""
> WHERE todo OR status OR warnings
> SORT status ASC, length(todo) DESC
> ```

> [!todo]+ All TODO Items
> ```dataview
> LIST todo
> FROM ""
> WHERE todo
> SORT file.name ASC
> ```

> [!warning]+ All Warnings
> ```dataview
> LIST warnings
> FROM ""
> WHERE warnings
> SORT file.name ASC
> ```

> [!tip]+ Files by Status
> ```dataview
> TABLE status, tags, length(todo) as "TODOs", length(warnings) as "Warnings"
> FROM ""
> WHERE status
> SORT status ASC, file.name ASC
> ```

## TODO Items by Category

> [!todo]- Implementation Tasks
> ```dataview
> LIST todo
> FROM ""
> WHERE todo
> FLATTEN todo AS task
> WHERE contains(task, "[implementation]")
> ```

> [!todo]- Testing Tasks
> ```dataview
> LIST todo
> FROM ""
> WHERE todo
> FLATTEN todo AS task
> WHERE contains(task, "[testing]")
> ```

> [!todo]- Discussion Items
> ```dataview
> LIST todo
> FROM ""
> WHERE todo
> FLATTEN todo AS task
> WHERE contains(task, "[discussion]")
> ```

> [!todo]- Research Items
> ```dataview
> LIST todo
> FROM ""
> WHERE todo
> FLATTEN todo AS task
> WHERE contains(task, "[research]")
> ```

> [!todo]- Documentation Tasks
> ```dataview
> LIST todo
> FROM ""
> WHERE todo
> FLATTEN todo AS task
> WHERE contains(task, "[documentation]")
> ```

> [!todo]- Review Tasks
> ```dataview
> LIST todo
> FROM ""
> WHERE todo
> FLATTEN todo AS task
> WHERE contains(task, "[review]")
> ```

## Warnings by Type

> [!warning]- Proposed Systems
> ```dataview
> LIST warnings
> FROM ""
> WHERE warnings
> FLATTEN warnings AS warning
> WHERE contains(warning, "[proposed]")
> ```

> [!warning]- Outdated Documents
> ```dataview
> LIST warnings
> FROM ""
> WHERE warnings
> FLATTEN warnings AS warning
> WHERE contains(warning, "[outdated]")
> ```

> [!warning]- Breaking Changes
> ```dataview
> LIST warnings
> FROM ""
> WHERE warnings
> FLATTEN warnings AS warning
> WHERE contains(warning, "[breaking]")
> ```

> [!warning]- Performance Concerns
> ```dataview
> LIST warnings
> FROM ""
> WHERE warnings
> FLATTEN warnings AS warning
> WHERE contains(warning, "[performance]")
> ```

> [!warning]- Security Concerns
> ```dataview
> LIST warnings
> FROM ""
> WHERE warnings
> FLATTEN warnings AS warning
> WHERE contains(warning, "[security]")
> ```

> [!warning]- Technical Debt
> ```dataview
> LIST warnings
> FROM ""
> WHERE warnings
> FLATTEN warnings AS warning
> WHERE contains(warning, "[debt]")
> ```

## Specific Status Views

> [!info]- Stub Files
> ```dataview
> TABLE status, tags
> FROM ""
> WHERE status = "stub"
> SORT file.name ASC
> ```

> [!abstract]- Proposed Documents
> ```dataview
> TABLE status, tags
> FROM ""
> WHERE status = "proposed"
> SORT file.name ASC
> ```

> [!warning]- Outdated Documents
> ```dataview
> TABLE status, tags
> FROM ""
> WHERE status = "outdated"
> SORT file.name ASC
> ```

---

**Note**: This page automatically aggregates todos, warnings, and status information from frontmatter metadata across all documentation files. For complete documentation on how to use frontmatter fields (status, tags, todo categories, warning types) and integration with the documentation structure, see [cross-reference:: [[documentation-structure#Frontmatter Metadata|Frontmatter Metadata Documentation]]].
