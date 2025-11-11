---
status: proposed
tags:
  - Architecture
  - Implementation
todo:
  - "[implementation] Determine collision force formulas through playtesting"
  - "[implementation] Determine cohesion force formulas and radius through playtesting"
  - "[discussion] Define which spell elements use impulses vs velocity setting"
---

# Forces

Force mechanics for collision repulsion, cohesion attraction, and spell-driven movement.

## Overview

Forces modify object velocities each frame, creating realistic physics interactions. All forces operate within the two-layer hexagonal neighborhood range, ensuring objects can respond before collisions become problematic.

## Force Range

### Two-Layer Hex Neighborhood

**Coverage**: Objects check two layers of surrounding hexagons for force interactions.

**Maximum Range**: All forces operate within sqrt(7)d/2 - d distance limit, where d is the hex cell size.

**Range Guarantee**: Two hex layers provide sufficient coverage for all force interactions given speed limits (~9.69 cells/second max).

**Efficiency**: Neighbor checking limited to necessary range reduces computation.

### Hexagonal Neighbor Lookup

**Polar Coordinates**: Use polar/cube coordinate system for efficient neighbor queries.

**Wrapped Boundaries**: Handle world wrapping when checking neighbors near edges.

**Layer Order**: Process neighbors in consistent order for deterministic results.

## Collision Forces

### Purpose

**Overlap Resolution**: Push objects apart when they overlap to prevent interpenetration.

**Continuous Application**: Forces applied every frame while objects remain overlapping.

**Mass-Based Response**: Force produces different accelerations based on object mass.

### Force Characteristics

**Repulsion**: Objects push apart when overlapping, with force directed away from collision point.

**Overlap-Based Magnitude**: Force magnitude increases with overlap amount.

**Mass Influence**: Force applied to both objects, with acceleration inversely proportional to mass (F = ma).

**Breaking Threshold**: High overlap triggers combination mechanic instead of force (when distance < d).

### Formula

**⚠️ NEEDS SPECIFICATION**: Exact collision force formula TBD through playtesting.

**Considerations**:
- Linear vs non-linear force scaling with overlap distance
- Force strength calibration for gameplay feel
- Balance between collision response and combination trigger
- Interaction with cohesion forces

## Cohesion Forces

### Purpose

**Gap Closure**: Automatically close gaps between objects for natural density management.

**Clustering**: Maintain dense object coverage without rigid grid constraints.

**Breaking Force**: Allow high-velocity impacts to overcome cohesion and create temporary gaps.

### Force Characteristics

**Attraction**: Objects within cohesion radius pull toward each other.

**Density Management**: Prevents permanent gaps in object field while allowing dynamic separation.

**Gameplay Interaction**: Creates emergent behavior where objects naturally cluster unless disrupted.

### Formula

**⚠️ NEEDS SPECIFICATION**: Exact cohesion force formula and radius TBD through playtesting.

**Considerations**:
- Cohesion radius (likely smaller than two-layer range)
- Force strength relative to collision forces
- Linear vs clamped force falloff with distance
- Centroid vs pairwise attraction

## Spell Forces

### Element-Based Application

**Impulse Elements**: Some spell elements apply instantaneous velocity changes (impulses).

**Velocity-Setting Elements**: Other spell elements directly set object velocities to specific values.

**Element Determination**: Spell element type determines force application method.

**⚠️ NEEDS SPECIFICATION**: Mapping of spell elements to force types TBD through spell system design.

### Spell Shape Overlap

**Buffer Lookup**: Objects check spell buffer for active spell shapes.

**Overlap Detection**: Determine which spell shapes overlap the object's center point.

**Multiple Spells**: Objects can be affected by multiple overlapping spell shapes.

**Combination Order**: When multiple spells overlap, combine elements by cast time order (see [cross-reference:: [[spells|Spell System]]]).

### Force Application

**Impulse Method**: Add velocity delta to current velocity (Δv applied once per spell contact).

**Velocity-Set Method**: Directly replace velocity with spell-specified value.

**Mass Independence**: Spell forces may ignore mass (TBD through spell design).

**Details**: See [cross-reference:: [[spells|Spell System]]] for spell shape mechanics and element combination rules.

## Force Accumulation

### Per-Frame Process

**Force Sources**: Each frame, objects accumulate forces from:
1. Collision forces (from overlapping objects)
2. Cohesion forces (from nearby objects within radius)
3. Spell forces (from overlapping spell shapes)

**Summation**: Forces summed using vector addition.

**Velocity Update**: Net force applied to update velocity: `v_new = v_old + (F_total / mass) * dt`

**Position Update**: Updated velocity used to modify sub-grid offset.

### Fixed-Point Arithmetic

**Determinism**: All force calculations use fixed-point arithmetic for platform-independent results.

**Precision**: Bit precision chosen to balance accuracy and GPU texture storage.

**Overflow Prevention**: Force magnitudes clamped to prevent fixed-point overflow.

**Details**: See [cross-reference:: [[determinism|Determinism]]] for fixed-point implementation.

## Integration Points

### Movement System
- Forces modify object velocities each frame
- See [cross-reference:: [[movement-system|Movement System]]] for velocity and mass details

### GPU Implementation
- Force calculations performed in "Apply Forces + Move" pass
- See [cross-reference:: [[gpu-shaders|GPU Shaders]]] for pipeline details

### Spell System
- Spell shapes provide force input from buffer
- Element types determine force application method
- See [cross-reference:: [[spells|Spell System]]] for spell mechanics

## Design Considerations

### Force Balance

**Collision vs Cohesion**: Collision forces must overcome cohesion to allow object separation.

**Spell Dominance**: Spell forces should be noticeable over ambient collision/cohesion forces.

**Combination Threshold**: Objects approaching distance d should combine rather than bounce indefinitely.

### Gameplay Tuning

**Playtesting Required**: Force formulas will be refined through gameplay iteration.

**Adjustable Parameters**: Force strengths and radii exposed as configuration values.

**Element Variation**: Different spell elements may use different force strengths/types.

### Performance

**Neighbor Limits**: Two-layer range constraint keeps force calculations bounded.

**Parallel Computation**: Force calculations fully parallelizable across objects in GPU.

**Early Termination**: Skip force calculations for stationary objects with no nearby activity.
