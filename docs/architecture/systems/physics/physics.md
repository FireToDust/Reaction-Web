---
tags:
  - Navigation
status: proposed
---

# Physics Engine

GPU-accelerated physics simulation on a hexagonal grid with sub-grid positioning, force-based interactions, and combination mechanics.

## Overview

The physics engine provides realistic object movement, interactions, and transformations using:
- **Hexagonal grid** with polar coordinates for efficient circular world representation
- **Sub-grid positioning** with fixed-point arithmetic for smooth, deterministic movement
- **Force-based physics** including collision repulsion, cohesion attraction, and spell forces
- **Combination mechanic** that merges nearby objects to maintain one object per hex cell
- **Reaction system** for object transformations from combinations, environmental interactions, and timers
- **Multi-pass GPU pipeline** for parallel force application, reactions, and collision resolution

## Core Components

- [**Movement System**](movement-system.md) - Hexagonal grid, sub-grid positioning, velocity, mass, and combinations
- [**Forces**](forces.md) - Collision, cohesion, and spell force mechanics
- [**Reactions**](reactions.md) - Object transformations from combinations, environmental interactions, and timers
- [**GPU Shaders**](gpu-shaders.md) - Multi-pass compute pipeline and implementation
- [**Determinism**](determinism.md) - Fixed-point arithmetic and reproducibility guarantees

## Key Features

**Hexagonal Grid**: Corner-to-corner cell size d ensures no two objects occupy the same cell, even during movement.

**Direct Force Resolution**: Forces applied continuously while objects overlap - no iterative convergence.

**Speed Limits**: Maximum ~9.69 cells/second at 60fps, with typical gameplay 2-6 cells/second.

**Three Layers**: Ground, Object, and Air layers for different entity types.

## Integration

- **Spell System**: Objects check overlapping spell shapes for force application; element combination rules determine reaction outcomes
- **Renderer**: Provides sub-grid positions, velocities, and timer states for smooth visuals
