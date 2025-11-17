---
tags:
  - Navigation
status: proposed
---

# Physics Engine

GPU-accelerated physics simulation on a hexagonal grid with sub-grid positioning, force-based interactions, and object merging mechanics.

## Overview

The physics engine provides realistic object movement, interactions, and transformations using:
- **Hexagonal grid** with polar coordinates for efficient circular world representation
- **Sub-grid positioning** with fixed-point arithmetic for smooth, deterministic movement
- **Force-based physics** including collision repulsion, cohesion attraction, and spell forces
- **Object merging** that combines nearby objects to maintain one object per hex cell
- **Reaction system** for object transformations from merging, environmental interactions, and timers
- **Multi-pass GPU pipeline** for parallel force application, reactions, and collision resolution

## Core Mechanics

### Movement and Forces

- [[movement|Movement]] - Hexagonal grid, sub-grid positioning, velocity, and mass
- [[cohesion|Cohesion]] - Gap-closing attraction forces
- [[collision|Collision]] - Overlap repulsion forces

### Interactions

- [[object-merging|Object Merging]] - How nearby objects combine into single objects
- [[reactions|Reactions]] - Type transformations from merging and environmental patterns

### Integration

- [[passes|Pipeline Passes]] - GPU execution coordination
- [[spell-integration|Spell Integration]] - How spells affect physics layer

## Framework

[cross-reference:: [[general/determinism|Determinism]]] - Fixed-point arithmetic and cross-platform consistency ensuring identical physics results everywhere

## Key Features

**Hexagonal Grid**: Corner-to-corner cell size d ensures no two objects occupy the same cell, even during movement.

**Direct Force Resolution**: Forces applied continuously while objects overlap - no iterative convergence.

**Speed Limits**: Maximum ~9.69 cells/second at 60fps, with typical gameplay 2-6 cells/second.

**Three Layers**: Ground, Object, and Air layers for different entity types.

## Integration Points

**Spell System**: Spells apply forces and trigger tile transformations - see [[spell-integration|Spell Integration]].

**Renderer**: Provides sub-grid positions, velocities, and timer states for smooth visuals.
