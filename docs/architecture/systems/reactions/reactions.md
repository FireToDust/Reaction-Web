---
tags:
  - Navigation
---

# Reaction Engine System

Rule-based environmental transformations through GPU shader compilation for complex tile interactions.

## System Overview

Transform human-readable tile interaction rules into highly optimized GPU shaders for environmental transformations like fire spreading, water extinguishing flames, and magical interactions.

**Design Approach**: Designed for ease of rule creation and modification during development, allowing rules to be defined in JSON and automatically converted to efficient GPU code. Alternative approaches may be considered during implementation.

## Core Responsibilities

- **JSON rule compilation** to optimized GPU shaders
- **Competitive rule scoring** and execution for deterministic behavior
- **Environmental pattern matching** (fire spreading, water interactions, etc.)
- **Rule optimization pipeline** (specific implementation TBD)

## Navigation

### Core Components
- [**Rule Compilation**](rule-compilation.md) - JSON to GPU shader pipeline
- [**Rule System**](rule-system.md) - Competitive scoring model and execution
- [**Visual Editor**](visual-editor.md) - Development tools and rule creation interface
- [**Examples**](examples.md) - Sample rules and common patterns

## Key Technical Features

### Competitive Scoring Model
**Problem**: Multiple rules may apply to the same tile simultaneously.
**Solution**: Competitive evaluation where highest-scoring rule wins.

### Offline Optimization
**Design Philosophy**: Move all possible computational work to build time for minimal runtime overhead.

## Processing Model

### GPU Execution
**Lower frequency than physics**: Reactions may run less frequently for performance.
**⚠️ Challenge**: Coordination with physics timing is a major technical issue to solve.

## Dependencies
- **Core Engine**: Required for texture access and coordination
- **Build Toolchain**: Rule compilation requires build-time processing