---
status: proposed
tags:
  - Architecture
  - Implementation
todo:
  - "[implementation] Determine cohesion force formula through playtesting"
  - "[implementation] Determine cohesion radius through playtesting"
  - "[testing] Validate cohesion interaction with collision forces"
---

# Cohesion

Attraction force that pulls nearby objects together, maintaining density and closing gaps in the object field.

## Purpose

**Gap Closure**: Automatically close gaps between objects for natural density management.

**Clustering**: Maintain dense object coverage without rigid grid constraints.

**Breaking Force**: Allow high-velocity impacts to overcome cohesion and create temporary gaps.

## Force Characteristics

**Attraction**: Objects within cohesion radius pull toward each other.

**Density Management**: Prevents permanent gaps in object field while allowing dynamic separation.

**Gameplay Interaction**: Creates emergent behavior where objects naturally cluster unless disrupted by external forces.

**Range**: Operates within two-layer hexagonal neighborhood (sqrt(7)d/2 - d maximum distance).

## Force Formula

**⚠️ NEEDS SPECIFICATION**: Exact cohesion force formula and radius TBD through playtesting.

**Considerations**:
- Cohesion radius (likely smaller than two-layer neighborhood range)
- Force strength relative to collision forces
- Linear vs clamped force falloff with distance
- Centroid-based vs pairwise attraction approach

**Expected Behavior**:
- Stronger at medium distances (to close gaps)
- Weaker or zero at very close distances (to avoid conflict with collision)
- Falls off with distance to limit range

## Application Process

### Per-Frame Calculation
1. **Neighbor Detection**: Check two-layer hex neighborhood for nearby objects
2. **Distance Calculation**: Measure distance between object centers (using sub-grid offsets)
3. **Force Computation**: Calculate attraction force based on distance and formula
4. **Vector Direction**: Force directed toward other object (or group centroid)
5. **Accumulation**: Add to total force for frame

### Mass Influence
**Acceleration**: Force produces acceleration inversely proportional to object mass (a = F/m).

**Symmetric Application**: Force applied to both objects in pair (Newton's third law).

**Balance**: Cohesion must be strong enough to close gaps but weak enough to allow spell forces to dominate.

## Integration with Other Forces

**Collision Balance**: Collision forces must overcome cohesion to prevent objects from merging when they shouldn't.

**Spell Override**: Spell forces should be noticeable and able to overcome cohesion attraction.

**Combination Trigger**: At very close distances (< d), object merging takes over instead of force application.

## Fixed-Point Implementation

**Determinism**: All calculations use fixed-point arithmetic for cross-platform consistency.

**Precision**: Distance and force calculations use 16.16 fixed-point format.

**Overflow Prevention**: Force magnitude clamped to prevent fixed-point overflow.

See [cross-reference:: [[general/determinism|Determinism]]] for fixed-point implementation details.

## GPU Implementation

**Pass Integration**: Cohesion forces calculated in "Apply Forces + Move" GPU pass.

**Neighborhood Caching**: Two-layer hex neighborhood loaded into workgroup shared memory.

**Parallel Processing**: Each object independently calculates cohesion forces from neighbors.

See [[passes|Pipeline Passes]] for integration with multi-pass GPU execution.

## Performance Considerations

**Neighbor Limits**: Two-layer range constraint keeps cohesion calculations bounded and efficient.

**Early Termination**: Skip cohesion calculations for stationary objects with no nearby activity.

**Shared Memory**: Workgroup caching minimizes texture reads for neighbor data.

## Design Tuning

**Playtesting Required**: Cohesion formula and radius will be refined through gameplay iteration.

**Adjustable Parameters**: Force strength and radius exposed as configuration values for tuning.

**Gameplay Feel**: Balance between maintaining density and allowing dynamic, responsive movement.
