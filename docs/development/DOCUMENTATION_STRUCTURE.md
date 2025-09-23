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
- Link to related concepts at the same level
- Reference authoritative sources for shared information
- Avoid circular documentation dependencies

**Maintenance**
- When information changes, update it in one place
- Check that navigation paths remain clear
- Remove or redirect broken internal links
- Ensure new content fits the existing hierarchy

The goal is that readers can efficiently find exactly what they need without encountering duplicate or outdated information.