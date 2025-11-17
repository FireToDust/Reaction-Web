---
status: proposed
tags:
  - Architecture
  - Implementation
todo:
  - "[discussion] Define mass values for different object types across all layers"
  - "[testing] Validate velocity damping needs through playtesting"
---

# Movement

Hexagonal grid with sub-grid positioning, velocity management, and mass-based interactions.

## Overview

Objects move freely on a hexagonal grid using sub-grid offsets and persistent velocities. Movement is driven by forces (collision, cohesion, spells) that modify velocity each frame, with mass determining acceleration response.

## Hexagonal Grid Positioning

### Grid Structure

**Hex Cell Size**: Corner-to-corner distance d chosen to equal the minimum object merging distance.

**One-Per-Cell Guarantee**: Cell size ensures no two objects can occupy the same cell.

**Polar Coordinates**: Grid uses polar/cube coordinate system for neighbor lookup and point-to-hex conversion.

**GPU Storage**: Grid stored as skewed parallelogram with wrapped boundaries, enabling rectangular indexing.

**World Wrapping**: Objects at world edges wrap to opposite side for continuous circular world.

### Sub-Grid Positioning

**Offset Storage**: Each object stores precise x,y offsets from its hex cell center using fixed-point arithmetic.

**Unconstrained Movement**: Objects can move freely in any direction based on applied forces.

**Precision**: Fixed-point representation ensures deterministic positioning across platforms.

**Cell Assignment**: Objects remain assigned to their current hex cell until the final "set grid position" pass.

See [cross-reference:: [[general/determinism|Determinism]]] for fixed-point arithmetic implementation.

## Velocity Management

### Velocity Storage

**Vector Representation**: Two-component velocity (x,y) stored with fixed-point precision.

**Texture Storage**: Velocities stored in GPU textures alongside position data.

**Deterministic Updates**: All velocity changes use fixed-point arithmetic for cross-platform consistency.

**Frame Persistence**: Velocity persists frame-to-frame unless modified by forces.

### Velocity Sources

**Applied Forces**: Collision, cohesion, and spell forces modify velocity each frame.
- See [[cohesion|Cohesion]] for gap-closing attraction
- See [[collision|Collision]] for overlap repulsion
- See [[spell-integration|Spell Integration]] for spell-driven forces

**Mass Response**: Velocity change determined by F=ma (acceleration inversely proportional to mass).

**Object Merging**: Merged objects receive mass-weighted average velocity.

**Damping**: ⚠️ **TBD** - Optional velocity damping to prevent perpetual motion (needs playtesting).

### Speed Limits

**Maximum Velocity**: ~9.69 hex cells/second at 60fps based on two-layer force range guarantee.

**Gameplay Range**: Typical gameplay velocities 2-6 cells/second, providing margin for force application.

**Range Guarantee**: Two hex layers sufficient for all force interactions within speed limits.

## Mass System

### Object Mass

**Type-Based**: Each object type has an associated mass value.

**Layer Variation**: Different layers may have different mass ranges (e.g., ground heavier than air).

**Gameplay Impact**: Mass affects force response and merging outcomes.

**⚠️ NEEDS SPECIFICATION**: Specific mass values for object types TBD through gameplay balancing.

### Mass in Physics

**Force Response**: Heavier objects accelerate less from the same applied force (a = F/m).

**Collision Interaction**: Mass ratio between colliding objects affects their relative acceleration responses.

**Momentum Conservation**: When objects merge, velocities are mass-averaged to conserve total momentum:
```
m1*v1 + m2*v2 + ... = m_combined * v_combined
```

See [[object-merging|Object Merging]] for combination mechanics.

## Data Structures

### Object Physics Data

**Position**:
- Hex cell coordinates (using polar/cube system)
- Fixed-point offset (x,y) from cell center

**Velocity**:
- Fixed-point vector (x,y)
- Stored in GPU texture alongside position

**Properties**:
- Object type ID (for mass lookup and reactions)
- Mass value (may be stored or computed from type)
- Layer assignment (Ground/Object/Air)

**Texture Layout**: Data packed efficiently for GPU texture storage and access patterns.

## GPU Implementation

### Pipeline Integration

**Force Application Pass**: Velocity updated by accumulated forces in "Apply Forces + Move" pass.

**Position Update**: Sub-grid offset updated by velocity in same pass.

**Cell Assignment**: Final hex cell determined in "Set Grid Position" pass.

See [[passes|Pipeline Passes]] for multi-pass execution coordination.

### Fixed-Point Operations

**Arithmetic**: All position and velocity calculations use 16.16 fixed-point format.

**Overflow Prevention**: Calculations designed to prevent overflow in extreme cases.

**Determinism**: Integer-only operations ensure identical results across platforms.

## Integration Points

### Forces System
Forces modify velocity each frame:
- [[cohesion|Cohesion]] - Gap-closing attraction
- [[collision|Collision]] - Overlap repulsion
- [[spell-integration|Spell Integration]] - Spell-driven forces

### Object Merging
[[object-merging|Object Merging]] - Mass-weighted velocity averaging when objects combine

### Reactions
[[reactions|Reactions]] - Type transformations affect mass assignment

### Renderer
- Sub-grid offsets provide precise visual positioning
- Velocities available for motion blur and particle effects

## Three-Layer Architecture

- **Ground Layer**: Terrain foundation (dirt, stone, water)
- **Object Layer**: Interactive entities (rocks, trees, creatures, players)
- **Air Layer**: Gases and effects (fire, smoke, magic)

Each layer maintains independent position and velocity data but shares the same movement mechanics.
