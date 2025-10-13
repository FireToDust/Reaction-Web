---
tags:
  - Navigation
---

# Physics Engine System

GPU-accelerated physics simulation providing smooth tile movement between grid locations with sub-grid positioning and deterministic collision resolution.

## System Overview

**Design Principle**: Multi-pass GPU compute pipeline optimized for parallel collision detection and resolution.

**Movement Model**: Free-form movement with integer-precision positioning for deterministic physics calculations.

## Core Responsibilities

- **Free-form tile movement** with unconstrained offsets from grid centers
- **Multi-pass collision detection** and deterministic resolution  
- **Velocity management** from spell inputs and collision results
- **Cohesion forces** for natural gap-closing and tile clustering
- **Event generation** for renderer interpolation between physics ticks

## Navigation

### Core Components
- [**Movement System**](movement-system.md) - Velocity and collision mechanics
- [**GPU Shaders**](gpu-shaders.md) - Compute shader architecture and implementation
- [**Forces**](forces.md) - Rune forces and environmental effects
- [**Determinism**](determinism.md) - Precision and reproducibility guarantees

## Key Technical Features

### Free-Form Movement System
**Offset Positioning**: Tiles store unconstrained offsets from grid centers using fixed-point arithmetic with texture-optimized precision.

**Unconstrained Movement**: Tiles can move in any direction with collision-determined velocities and bouncing.

**Renderer Integration**: Physics generates collision events with timing data for smooth visual interpolation.

### Multi-Pass Collision Pipeline
**Iterative Resolution**: Multiple GPU compute passes resolve complex multi-tile collision scenarios.

**Deterministic Results**: Configurable pass limit ensures consistent behavior across platforms.

**Atomic Conflict Handling**: Multiple tiles targeting the same location generate error tiles through GPU atomics.

### Cohesion Force System
**Gap Closure**: Tiles within 1.5 block radius attract each other using clamped linear forces.

**5x5 Neighborhood**: Cohesion calculations examine 5x5 area to account for sub-grid positioning.

**Natural Clustering**: Automatic tile density management without rigid grid constraints.

## Integration Points

### Core Engine Integration
- **Texture Coordination**: Read/write physics data via texture ping-ponging
- **World Boundaries**: Wrapping system for tiles at world edges
- **Memory Efficiency**: Direct texture operations with workgroup caching

### Spell System Integration
- **Velocity Input**: Receive velocity changes from spell processing
- **Collision Response**: Tile type changes and destruction from collision results
- **Event Output**: Collision timing and results for spell trigger coordination

### Renderer Integration
- **Event Buffer**: Collision events with precise timing for smooth interpolation
- **Offset Data**: Tile offsets from grid centers for accurate visual positioning
- **Velocity Data**: Current tile velocities for motion blur and particle effects

## Dependencies
- **Core Engine**: Required for texture management and active region optimization
- **WebGPU**: GPU compute shaders for parallel processing