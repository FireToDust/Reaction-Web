---
tags:
  - Navigation
---

# Core Engine System

Central coordination and tile data management for the Reaction v2 game engine.

## System Overview

The Core Engine coordinates data flow between CPU spell logic and GPU simulation systems while maintaining high performance and deterministic execution.

**Key Challenge**: Synchronize three different processing systems (CPU spells, GPU physics, GPU reactions) without race conditions or performance bottlenecks.

## Core Responsibilities

- **Bit-packed tile storage** across 4 layers (Ground, Object, Air, Rune)
- **GPU texture management** with ping-ponging for race-condition prevention  
- **Active region optimization** using 32×32 chunks
- **Frame execution pipeline coordination**

## Navigation

### Core Components
- [**Tile Storage System**](tile-storage.md) - Bit-packing format and layer organization
- [**Texture Management**](texture-management.md) - GPU texture coordination and ping-ponging
- [**Active Regions**](active-regions.md) - Chunk-based processing optimization
- [**API Reference**](api-reference.md) - Classes and integration points

## Key Technical Features

### Four-Layer Architecture
- **Ground Layer**: Terrain foundation (dirt, stone, water)
- **Object Layer**: Interactive entities (rocks, trees, creatures, players)
- **Air Layer**: Gases and effects (fire, smoke, magic)  
- **Rune Layer**: Spell-placed magical effects (temporary)

### Technical Features
- **Active Region System**: Only process chunks with changing tiles
- **Texture Ping-Ponging**: Prevents GPU read-after-write hazards
- **Bit-Packed Storage**: 32-bit tile representation
- **Chunk-Based Processing**: 32×32 tile regions

## Integration Points

### Input Interfaces
- **Spell System**: Writes rune data to rune layer textures
- **Physics Engine**: Reads/writes velocity data via texture pairs
- **Reaction Engine**: Processes transformation rules on tile data

### Output Interfaces
- **Renderer**: Provides read-only access to current tile states for display
- **Game Logic**: Exposes tile query API for validation and state checking

## Dependencies
- **WebGPU API**: Required for texture management and GPU compute coordination