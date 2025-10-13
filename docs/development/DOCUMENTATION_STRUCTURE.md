# Documentation Structure

## Search Tree Architecture

Documentation should function as a navigational search tree where each level provides just enough information to guide readers to the right destination.

### Core Principles

**Parent nodes are signposts, not encyclopedias**
- Overview documents help readers navigate to specifics
- Include enough detail to make informed navigation choices
- Avoid comprehensive coverage at high levels

**No redundant information**
- Each piece of information has one authoritative location
- Link to sources rather than copying content
- Update links when information moves

**Hierarchical information flow**
- Overview → Category → Implementation Details
- General concepts → Specific examples
- Architecture → Component details

### Practical Guidelines

**Overview Documents**
- List what's covered and where to find it
- Provide context for understanding relationships
- Include links to detailed documentation
- Don't duplicate content from linked pages

**Category Documents**
- Explain concepts specific to that category
- Direct readers to implementation details
- Show how pieces relate within the category
- Link to related categories when relevant

**Detail Documents**
- Contain complete implementation information
- Reference but don't duplicate architectural context
- Link back to parent concepts when helpful
- Focus on specific, actionable content

### Navigation Patterns

**Top-Down Discovery**
- Start with high-level goals or concepts
- Follow links to increasingly specific information
- Each level adds detail without repeating previous levels

**Cross-Referencing**

The documentation uses two types of links to distinguish hierarchical structure from references:

*Regular Links* - Use standard wiki-link syntax for direct parent-child relationships:
```markdown
[[child-document|Display Name]]
```

*Cross-Reference Links* - Use cross-reference syntax for non-hierarchical links:
```markdown
[cross-reference:: [[other-document|Display Name]]]
```

**When to use cross-reference syntax**:
- Linking to files that are NOT direct children of the current document
- Referencing related concepts at the same level or in different branches
- Linking to authoritative sources for shared information
- Any link that represents a reference rather than a structural parent-child relationship

**Purpose**: The cross-reference syntax allows Obsidian's graph view to filter out reference links, displaying only the hierarchical documentation tree structure. This makes it easier to visualize and maintain the documentation organization.

**Guidelines**:
- Use regular links to show "this document contains these sub-topics"
- Use cross-reference links to show "see this other document for more information"
- Avoid circular documentation dependencies regardless of link type

**Maintenance**
- When information changes, update it in one place
- Check that navigation paths remain clear
- Remove or redirect broken internal links
- Ensure new content fits the existing hierarchy

## Frontmatter Metadata

Documentation files use YAML frontmatter to track document status, categorization, and task management. This metadata integrates with Dataview for automated task tracking and status monitoring.

### Status Field

Tracks document lifecycle and implementation state:

- `stub` - Placeholder document that needs content
- `draft` - Being actively written, incomplete
- `proposed` - Complete proposal awaiting team approval
- `approved` - Approved design ready for implementation
- `implemented` - Code exists matching this documentation
- `outdated` - Document needs updating to match current state
- `deprecated` - Obsolete but kept for historical reference

Example:
```yaml
---
status: proposed
---
```

### Tags Field

Categorizes document type for filtering and organization:

- `Navigation` - Index, overview, or parent pages
- `Architecture` - System architecture and design
- `Implementation` - Detailed implementation specifications
- `Reference` - API references, data formats, constants
- `Development` - Development process and workflow
- `Testing` - Testing strategies and requirements
- `Performance` - Performance analysis and optimization
- `Security` - Security considerations and requirements
- `Multiplayer` - Multiplayer-specific systems
- `Legacy` - Version 1 reference material
- `TaskList` - Special: automated task aggregator pages

Example:
```yaml
---
tags:
  - Architecture
  - Performance
---
```

### Todo Field

Task tracking with subcategories using tagged items. Each todo item can have an optional `[category]` tag at the start:

**Categories**:
- `[implementation]` - Code needs to be written
- `[testing]` - Tests need to be written
- `[discussion]` - Requires team discussion/decision
- `[research]` - Requires investigation or research
- `[documentation]` - Documentation needs to be written
- `[review]` - Needs code or design review
- *(no tag)* - General uncategorized task

Example:
```yaml
---
todo:
  - "[implementation] Detailed performance benchmarking of time slice overhead"
  - "[testing] Cross-platform determinism validation suite"
  - "[discussion] Optimal slice count (current proposal: 8 slices)"
  - "[research] Alternative scheduling algorithms"
  - "[documentation] Complete API reference section"
  - "General task without category"
---
```

### Warnings Field

Tracks concerns, proposals, and issues requiring attention. Each warning can have an optional `[type]` tag:

**Types**:
- `[proposed]` - Proposed system or architectural decision
- `[outdated]` - Content is outdated and needs updating
- `[breaking]` - Breaking change to existing implementations
- `[performance]` - Performance concern or bottleneck
- `[security]` - Security concern or vulnerability
- `[debt]` - Technical debt that should be addressed
- *(no tag)* - General warning

Example:
```yaml
---
warnings:
  - "[proposed] Time slice scheduling system enables variable timing"
  - "[performance] High memory usage with 300 snapshot buffer"
  - "[breaking] API changes required for state management"
  - "[debt] Inefficient memory allocation in snapshot system"
---
```

### Complete Frontmatter Example

```yaml
---
status: proposed
tags:
  - Architecture
  - Multiplayer
todo:
  - "[implementation] Performance benchmarking of snapshot creation"
  - "[testing] Network bandwidth testing with delta compression"
  - "[discussion] Snapshot retention policy (current: 5 seconds)"
warnings:
  - "[proposed] Unified state management serves single and multiplayer"
  - "[performance] Snapshot creation overhead needs measurement"
---
```

### Integration with Dataview

The subcategorized todo and warning items allow Dataview queries to filter by specific types. See [cross-reference:: [[tasklist|Task List]]] for automated queries that collect and organize these items across all documentation.

### Usage Guidelines

- Use `status` to track document maturity through its lifecycle
- Apply `tags` for broad categorization (multiple tags allowed)
- Subcategorize `todo` items to help with task filtering and prioritization
- Subcategorize `warnings` to identify types of concerns at a glance
- Update `status` as documents progress from draft → proposed → approved → implemented
- Mark documents as `outdated` when code diverges from documentation

The goal is that readers can efficiently find exactly what they need without encountering duplicate or outdated information.