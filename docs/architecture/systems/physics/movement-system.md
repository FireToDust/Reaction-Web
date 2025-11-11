---
status: proposed
tags:
  - Architecture
  - Implementation
todo:
  - "[discussion] Define mass values for different object types across all layers"
---

# Movement System

Hexagonal grid with sub-grid positioning, velocity management, mass-based interactions, and combination mechanics.

## Overview

Objects move freely on a hexagonal grid using sub-grid offsets and persistent velocities. The combination mechanic merges objects that get too close, maintaining the one-object-per-cell guarantee while enabling dynamic physics interactions.

## Hexagonal Grid Positioning

### Grid Structure

**Hex Cell Size**: Corner-to-corner distance d chosen to equal the minimum combination distance.

**One-Per-Cell Guarantee**: Cell size ensures no two objects can occupy the same cell, even during mid-movement.

**Polar Coordinates**: Grid uses polar/cube coordinate system for neighbor lookup and point-to-hex conversion.

**GPU Storage**: Grid stored as skewed parallelogram with wrapped boundaries, enabling rectangular indexing.

**World Wrapping**: Objects at world edges wrap to opposite side for continuous circular world.

### Sub-Grid Positioning

**Offset Storage**: Each object stores precise x,y offsets from its hex cell center using fixed-point arithmetic.

**Unconstrained Movement**: Objects can move freely in any direction based on applied forces.

**Precision**: Fixed-point representation ensures deterministic positioning across platforms.

**Cell Assignment**: Objects remain assigned to their current hex cell until the final "set grid position" pass.

## Velocity Management

### Velocity Storage

**Vector Representation**: Two-component velocity (x,y) stored with fixed-point precision.

**Texture Storage**: Velocities stored in GPU textures alongside position data.

**Deterministic Updates**: All velocity changes use fixed-point arithmetic.

**Frame Persistence**: Velocity persists frame-to-frame unless modified by forces.

### Velocity Sources

**Applied Forces**: Collision, cohesion, and spell forces modify velocity each frame (see [cross-reference:: [[forces|Forces]]]).

**Spell Inputs**: Spell elements can apply impulses or directly set velocities.

**Combinations**: Merged objects receive mass-averaged velocity.

**Damping**: Optional velocity damping to prevent perpetual motion (TBD through playtesting).

### Speed Limits

**Maximum Velocity**: ~9.69 hex cells/second at 60fps based on two-layer force range guarantee.

**Gameplay Range**: Typical gameplay velocities 2-6 cells/second, providing margin for force application.

**Range Guarantee**: Two hex layers sufficient for all force interactions within speed limits.

## Mass System

### Object Mass

**Type-Based**: Each object type has an associated mass value.

**Layer Variation**: Different layers may have different mass ranges (e.g., ground heavier than air).

**Gameplay Impact**: Mass affects force response and combination outcomes.

**⚠️ NEEDS SPECIFICATION**: Specific mass values for object types TBD through gameplay balancing.

### Mass in Physics

**Force Response**: Heavier objects accelerate less from the same applied force (F = ma).

**Collision Interaction**: Mass ratio between colliding objects affects their relative force responses.

**Combination Averaging**: When objects combine, velocities are mass-averaged to conserve momentum.

**Conservation**: Total momentum preserved during combinations: `m1*v1 + m2*v2 = m_combined * v_combined`

## Combination Mechanic

### Purpose

**One-Per-Cell Guarantee**: Ensures no hex cell ever contains more than one object.

**Gameplay Feature**: Creates dynamic object fusion and reaction chains.

**Physics Stability**: Prevents infinite force application from perpetually overlapping objects.

### Trigger Conditions

**Distance Threshold**: Combination triggered when two objects approach closer than distance d.

**Merge Radius**: All objects with centers within d of the combined center are included in the merge.

**Multi-Object Merges**: Single combination can merge 3+ objects if they're all within radius.

### Combination Process

**Velocity Averaging**: Combined velocity is mass-weighted average of all merged objects.

**Type Transformation**: New object type determined by reaction rules applied to merged objects (see [cross-reference:: [[reactions|Reaction System]]]).

**Mass Assignment**: New object mass based on its transformed type.

**Position**: Combined object placed at mass-weighted centroid of merged objects.

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

## Integration Points

### Forces System
- Velocity modified by forces each frame
- See [cross-reference:: [[forces|Forces]]] for force types and calculations

### GPU Implementation
- Movement calculations performed in GPU compute shaders
- See [cross-reference:: [[gpu-shaders|GPU Shaders]]] for pipeline details

### Spell System
- Objects check spell buffer for overlapping spell shapes
- Spell elements determine force application method
- See [cross-reference:: [[spells|Spell System]]] for spell mechanics

### Reaction System
- Combination types determined by reaction rules
- New object mass based on reaction-determined type
- See [cross-reference:: [[reactions|Reaction System]]] for transformation rules

### Renderer
- Sub-grid offsets provide precise visual positioning
- Velocities available for motion blur and particle effects

## Three-Layer Architecture

- **Ground Layer**: Terrain foundation (dirt, stone, water)
- **Object Layer**: Interactive entities (rocks, trees, creatures, players)
- **Air Layer**: Gases and effects (fire, smoke, magic)
