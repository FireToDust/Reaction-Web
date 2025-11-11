---
tags:
  - Navigation
warnings:
  - "[outdated] Active Region System mentioned but not being implemented"
  - "[outdated] 32×32 chunk references - active region optimization decided against"
todo:
  - "[documentation] Remove active region references from architectural overview"
  - "[discussion] Determinism approach without spatial ordering needs documentation"
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

**Deterministic Requirements**: Identical inputs must produce identical outputs for PvP through simultaneous single-read/single-write GPU passes

~~**Active Region System**: Process only chunks with changing tiles~~ **⚠️ NOT IMPLEMENTED**: Active region optimization was decided against

## Major Technical Challenges

⚠️ **Unsolved Issues Requiring Design Work**:
- Frame rate coordination between physics, reactions, and rendering systems
- GPU thread execution determinism guarantees (current approach: simultaneous read/write passes)
- Specific rule compilation pipeline implementation

## System Summary

- **Tile Storage**: 4 layers (Ground, Object, Air, Rune) with bit-packed 32-bit tiles
- ~~**Chunk Size**: 32×32 tiles (balances GPU workgroup efficiency with memory overhead)~~ **⚠️ Active region system not implemented**
- **Processing Order**: Input → Physics → Runes → Reactions → Render
- **Communication**: Core Engine coordinates data flow between modules