# Development Principles

## Core Values

### Truth Over Polish
- Never fabricate performance numbers, statistics, or benchmarks
- Mark personal ideas as such - don't present speculation as team decisions
- Say "I don't know" when you don't know
- Uncertainty is better than false confidence

### Clarity Over Cleverness
- Code should explain itself through naming and structure
- If you need extensive comments to explain what code does, rewrite it
- Magic numbers and unclear constants are tech debt
- Optimize for the next person who reads your code

### Collaboration Over Ego
- Make it easy for others to understand and build on your work
- Ask questions when design decisions aren't clear
- Share context behind your choices

### Purpose Over Process
- Focus on accomplishing the goal, not just following instructions literally
- Understand why you're doing something before deciding how
- When updating work, consider what would serve the reader, not just what changed
- Question whether existing structure still serves its purpose

## Practical Guidelines

### When Writing Code
- Use descriptive names for functions, variables, and files
- Handle error cases explicitly - don't ignore or hide failures
- Prefer simple, obvious solutions over clever optimizations
- Document the "why" behind non-obvious business logic

### When Writing Documentation
- Be honest about what's decided vs. what you're proposing
- Include enough context for someone to understand and challenge your reasoning
- Avoid inventing performance claims or user behavior assumptions
- Note when something needs team input or further research

### When Making Decisions
- Understand the problem before jumping to solutions
- Consider the person who will maintain this code in 6 months
- Choose consistency with existing patterns over personal preference

### When Updating Existing Work
- Don't just replace what changed - step back and ensure the whole section still flows logically
- Remove historical context that's no longer relevant to current readers
- Fix structural issues or awkward transitions when you encounter them, even if you didn't create them

### Source Control Practices
- Write clear, descriptive commit messages that explain the "why" not just the "what"
- Make atomic commits - each commit should represent one logical change
- Never commit broken code or failing tests to main branch
- Use branches for feature development and merge via pull requests
- Review your own changes before committing - check diffs carefully
- Keep commits focused - avoid mixing unrelated changes
- Test your changes locally before pushing

## Quality Questions

Before committing work, ask:
- Can someone else understand this without asking me questions?
- Am I making any claims I can't back up?
- Is this the simplest solution that solves the actual problem?
- Have I clearly indicated what needs team discussion?
- Are my commit messages clear and descriptive?
- Have I tested my changes locally?

The goal is sustainable development where team members can confidently build on each other's work.