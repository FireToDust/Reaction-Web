# Welcome to Reaction

## A 2D Real-Time PvP Spellcasting Game

Reaction is a real-time PvP spellcasting game where spells interact with terrain and each other through deterministic physics. The terrain transforms continuously, fire spreads, tiles collide and transfer momentum, and the battlefield evolves as you fight.

## Current Status: Architecture Phase

We're currently in the architecture design phase, focusing on creating robust system designs before moving to implementation.

## Key Features

- **Real-Time PvP** - Continuous action combat with no turns
- **Interactive Terrain** - Spells transform the environment, which affects gameplay
- **Deterministic Physics** - Fair competitive play where identical inputs produce identical results
- **High Performance** - Thousands of interacting tiles at 60 FPS

## Documentation

### Core Documentation
- [cross-reference:: [[architecture/architecture|Architecture]]] - System design and technical approach
- [cross-reference:: [[development/development|Development]]] - Setup, workflow, and development processes
- [cross-reference:: [[gameplay/gameplay|Gameplay]]] - Core game mechanics and design philosophy

## Getting Started

1. **Development Setup**: See [cross-reference:: [[development/getting-started|Getting Started Guide]]]
2. **Architecture Overview**: Read [cross-reference:: [[architecture/general/overview|System Overview]]]
3. **Development Principles**: Review [cross-reference:: [[development/development-principles|Core Principles]]]

## Quick Commands

```bash
npm run dev    # Start development server
npm run test   # Run test suite
npm run build  # Create production build
```

## Project Structure

- `/docs` - Documentation source (Markdown)
- `/src` - Source code
- `/tests` - Test suites
- `/build` - Build outputs (gitignored)

## Links

- [GitHub Repository](https://github.com/FireToDust/Reaction-Web)
- [cross-reference:: [[development/building-documentation|Building Documentation]]]
- [[docs|Full Documentation Index]]

---

*For detailed documentation, explore the links above or browse the documentation tree.*