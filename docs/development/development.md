---
tags:
  - Navigation
---

# Development Documentation

Setup, workflow, and development processes for Reaction v2.

## Navigation

### Getting Started
- [**Getting Started**](getting-started.md) - Project setup and first build
- [**Development Principles**](DEVELOPMENT_PRINCIPLES.md) - Core values and guidelines for contributors
- [**Documentation Structure**](DOCUMENTATION_STRUCTURE.md) - How to organize and navigate documentation
- [**Building Documentation**](building-documentation.md) - Export and deploy documentation to GitHub Pages

### Project Management
- [**Task List**](tasklist.md) - Auto-generated TODO items, warnings, and documentation status

## Quick Start

### Development Commands
```bash
npm install
npm run dev         # Development server
npm run test        # Test suite  
npm run build       # Production build
npm run lint        # ESLint
npm run format      # Prettier
```

### Project Structure
- **Core types**: `src/core/types.ts`
- **Spell types**: `src/spell-system/types.ts`
- **Documentation**: `docs/`
- **Architecture**: `docs/architecture/`

## Development Principles

### Development Guidelines
See [Development Principles](DEVELOPMENT_PRINCIPLES.md) for core values and [Documentation Structure](DOCUMENTATION_STRUCTURE.md) for information organization guidelines.