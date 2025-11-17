---
status: proposed
tags:
  - Architecture
  - Implementation
todo:
  - "[discussion] Define which spell elements use impulses vs velocity setting"
  - "[implementation] Specify spell force magnitudes per element"
  - "[discussion] Determine if spell forces ignore mass or not"
  - "[design] Triple-element spells will provide passive modifications to reactions and forces for their duration"
warnings:
  - "[proposed] Element-to-force mapping needs spell system design completion"
---

# Spell Integration

How spells affect the physics layer through force application and tile transformations.

## Overview

Spells interact with physics in two primary ways:
1. **Force Application** - Spell shapes apply forces to objects, modifying their velocities
2. **Tile Transformations** - Spells trigger tile type changes (double-element duty)

## Force Application

### Spell Shape Mechanics

**Shape Definition**: Spells define geometric shapes (circles, rectangles, etc.) that cover regions of the game world.

**Force Vectors**: Each spell shape stores a force vector to be applied to overlapping objects.

**Trigger Timing**: Forces applied when spell triggers (after delay countdown).

**Overlap Detection**: Objects check if their center point overlaps any active spell shapes.

### Force Types

**Impulse Elements**: Apply instantaneous velocity changes (add to current velocity).

**Velocity-Set Elements**: Directly replace object velocity with spell-specified value.

**Element Determination**: Spell element type determines which force application method is used.

**⚠️ NEEDS SPECIFICATION**: Mapping of spell elements to force types TBD through spell system design.

See [cross-reference:: [[spells/element-effects|Element Effects]]] for which elements create which force types.

### Multiple Spell Handling

**Overlapping Spells**: Objects can be affected by multiple spell shapes simultaneously.

**Element Combination**: When multiple spells overlap, combine elements using cancellation rules.

**Cast Time Ordering**: Process spells in cast time order for deterministic element combination.

**Force Combination**: After element combination, resulting force applied to object.

## Tile Transformations

### Double-Element Spells

**Primary Duty**: Most double-element spells trigger tile type transformations in addition to applying forces.

**Transformation Trigger**: When spell activates on a tile, triggers type transformation rules.

**Physics Integration**: Transformations occur during physics pipeline execution.

### Transformation Process

1. **Spell Triggers**: Double-element spell activates on specific tiles
2. **Type Lookup**: Determine target tile type and spell element combination
3. **Rule Application**: Apply transformation rules based on spell elements
4. **Tile Update**: Update tile type in physics layer

### Triple-Element Effects

**⚠️ TODO**: Triple-element spells will provide passive modifications to reactions and forces for their duration.

**Design Intent**: Global or area-of-effect modifications to physics behavior while spell is active.

**Implementation**: TBD through spell system design.

## Integration with Forces Pass

### Force Accumulation

**Spell Buffer Lookup**: Objects check spell buffer for overlapping spell shapes during force accumulation.

**Force Calculation**: Calculate spell force based on element type and spell properties.

**Vector Addition**: Add spell forces to collision and cohesion forces for net force.

**Mass Consideration**: ⚠️ **TBD** - Determine if spell forces ignore mass or use standard F=ma.

### Pass Timing

**Force Application Pass**: Spell forces calculated in "Apply Forces + Move" GPU pass.

**Transformation Pass**: Tile transformations may occur in separate pass or integrated with forces.

**Coordination**: Ensure spell effects and physics forces execute in deterministic order.

See [[passes|Pipeline Passes]] for multi-pass execution coordination.

## Spell Buffer Structure

### GPU Buffer Layout

**Spell Data** (per active spell):
- Shape geometry (circle, rectangle, polygon, etc.)
- Position and dimensions
- Element type(s) after cancellation
- Cast time (for ordering)
- Force magnitude and direction
- Trigger status

**Spatial Partitioning**: ⚠️ **Future optimization** - Partition spells spatially to limit checks per object.

### Buffer Access

**Per-Object Lookup**: Each object queries spell buffer for overlapping shapes.

**Overlap Test**: Geometric test determines if object center is within spell shape.

**Parallel Access**: All objects can read spell buffer simultaneously (read-only access).

## Fixed-Point Implementation

**Determinism**: All force calculations and transformations use fixed-point arithmetic.

**Precision**: Force vectors use 16.16 fixed-point format matching physics calculations.

**Cross-Platform**: Ensures identical spell effects across all hardware.

See [cross-reference:: [[general/determinism|Determinism]]] for fixed-point implementation details.

## Element-Force Mapping

**⚠️ NEEDS SPECIFICATION**: Complete mapping of spell elements to force behaviors.

**Expected Categories**:
- **Impulse Elements**: Push, pull, explosion effects (add to velocity)
- **Velocity-Set Elements**: Wind, flow, directional movement (set velocity)
- **Transformation Elements**: Tile type changes (double-element duty)
- **Modifier Elements**: Physics behavior modifications (triple-element effects)

**Design Source**: Element effects defined in spell system documentation.

See [cross-reference:: [[spells/element-effects|Element Effects]]] for complete element catalog.

## Integration Points

### Spell System

**Shape Evaluation**: Spells define shapes that physics checks for overlap.

**Element System**: Element types determine force application method.

**Trigger Lifecycle**: Spell timing determines when forces are applied.

Cross-references:
- [cross-reference:: [[spells/spells|Spell System]]] - Overall spell mechanics
- [cross-reference:: [[spells/element-effects|Element Effects]]] - What each element does

### Physics Components

**Forces**: Spell forces accumulate with collision and cohesion forces.

**Movement**: Spell forces modify object velocities like any other force.

**Reactions**: Spell transformations may interact with reaction system.

Internal references:
- [[passes|Pipeline Passes]] - GPU execution integration
- [[cohesion|Cohesion]] and [[collision|Collision]] - Other force sources
- [[movement|Movement]] - Velocity and position updates
- [[reactions|Reactions]] - Environmental transformations

## Performance Considerations

**Buffer Size**: Number of active spells affects lookup performance.

**Overlap Tests**: Geometric tests must be efficient (many objects checking many spells).

**Spatial Optimization**: Future partitioning can reduce checks per object.

**GPU Parallelism**: Spell force calculations fully parallelizable across objects.

## Design Considerations

**Force Balance**: Spell forces should be noticeable over ambient physics forces.

**Element Diversity**: Different elements should feel distinct through force behaviors.

**Gameplay Clarity**: Players should understand how spell elements affect physics.

**Tuning Flexibility**: Force magnitudes and behaviors exposed as configuration values.
