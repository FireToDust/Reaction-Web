# Reaction v2 Project Context

Real-time PvP grid-based spellcasting game where players cast spells that place magical runes, transforming terrain through rule-based systems.

## Current Development Stage
**ARCHITECTURE PHASE** - Designing system architecture before interfaces/tests/implementation

## Key Links
- **Complete Documentation**: [docs/](docs/)
- **Architecture Overview**: [docs/architecture/overview.md](docs/architecture/overview.md)
- **Development Setup**: [docs/development/getting-started.md](docs/development/getting-started.md)
- **Documentation Building**: [docs/development/building-documentation.md](docs/development/building-documentation.md)

## Documentation Build Process
**Note for Claude**: Documentation builds require the user to manually run the Obsidian "Webpage HTML Export" plugin to export `docs/` to `build/docs`. The `build/docs` folder is a git worktree of the gh-pages branch. After the user exports, changes can be committed directly in the worktree. You cannot build documentation yourself - always ask the user to run the Obsidian export first.

## Development Commands
```bash
npm run dev    # Development server
npm run test   # Test suite
npm run build  # Production build
```

## Development Guidelines
**IMPORTANT**: At the start of any conversation, read through the complete documentation in [docs/](docs/) to fully understand the project before beginning work.

**Required Reading**: Check these before contributing to the project
- **Development Principles**: [docs/development/DEVELOPMENT_PRINCIPLES.md](docs/development/DEVELOPMENT_PRINCIPLES.md)
- **Documentation Structure**: [docs/development/DOCUMENTATION_STRUCTURE.md](docs/development/DOCUMENTATION_STRUCTURE.md)

## Critical Guidelines
- Always ask approval before making design decisions not explicitly provided
- Ask before adding quantitative claims or performance specifications
- Reflect uncertainty in design choices using "initially chosen", "may be revisited", "TBD"

## Working Principles
- Focus on writing good code and documentation, not on pleasing the user
- Follow the development principles consistently
- Prioritize clarity and quality over speed or cleverness

## Source Control Guidelines
- Write clear, descriptive commit messages explaining the "why"
- Make atomic commits - one logical change per commit
- Never commit broken code or failing tests to main
- Use feature branches and pull requests for development
- Test changes locally before committing
- Review your own diffs before pushing