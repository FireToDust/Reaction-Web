---
tags:
  - Navigation
---

# Architecture Documentation

High-level system design, technical decisions, and performance considerations for Reaction v2.

## Navigation

### Core Architecture
- [cross-reference:: [[overview|System Overview]]] - Complete architectural design and module relationships
- [**General Architecture**](general/general.md) - Core architectural concepts and design patterns

### System Implementations
- [**Systems**](systems/systems.md) - Individual system modules and implementations

## Architectural Approach

**Modular Design**: Modules with focused responsibilities

**WebGPU Processing**: Physics, reactions, and rendering use GPU compute

**Deterministic Requirements**: Identical inputs must produce identical outputs for PvP

**Active Region System**: Process only chunks with changing tiles

## Major Technical Challenges

⚠️ **Unsolved Issues Requiring Design Work**:
- Frame rate coordination between physics, reactions, and rendering systems
- GPU thread execution determinism guarantees
- Specific rule compilation pipeline implementation

## System Summary

- **Tile Storage**: 4 layers (Ground, Object, Air, Rune) with bit-packed 32-bit tiles
- **Chunk Size**: 32×32 tiles (balances GPU workgroup efficiency with memory overhead)
- **Processing Order**: Input → Physics → Runes → Reactions → Render
- **Communication**: Core Engine coordinates data flow between modules