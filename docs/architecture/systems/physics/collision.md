---
status: proposed
tags:
  - Architecture
  - Implementation
todo:
  - "[implementation] Determine collision force formula through playtesting"
  - "[testing] Validate collision response with various mass ratios"
  - "[discussion] Balance between collision force and combination trigger threshold"
---

# Collision

Repulsion force that pushes overlapping objects apart to prevent interpenetration.

## Purpose

**Overlap Resolution**: Push objects apart when they overlap to prevent interpenetration.

**Continuous Application**: Forces applied every frame while objects remain overlapping.

**Mass-Based Response**: Force produces different accelerations based on object mass.

## Force Characteristics

**Repulsion**: Objects push apart when overlapping, with force directed away from collision point.

**Overlap-Based Magnitude**: Force magnitude increases with overlap amount (closer = stronger repulsion).

**Mass Influence**: Force applied to both objects, with acceleration inversely proportional to mass (F = ma).

**Breaking Threshold**: When objects get very close (distance < d), combination mechanic triggers instead of force application.

**Range**: Operates within two-layer hexagonal neighborhood (sqrt(7)d/2 - d maximum distance).

## Force Formula

**⚠️ NEEDS SPECIFICATION**: Exact collision force formula TBD through playtesting.

**Considerations**:
- Linear vs non-linear force scaling with overlap distance
- Force strength calibration for gameplay feel
- Balance between collision response and combination trigger
- Interaction with cohesion forces

**Expected Behavior**:
- Stronger when objects are closer (higher overlap)
- Strong enough to prevent excessive interpenetration
- Balanced with cohesion to avoid vibration or instability
- Triggers combination when distance falls below threshold d

## Application Process

### Per-Frame Calculation
1. **Overlap Detection**: Check two-layer hex neighborhood for overlapping objects
2. **Distance Measurement**: Calculate distance between object centers (using sub-grid offsets)
3. **Overlap Amount**: Determine how much objects overlap (negative distance or proximity measure)
4. **Force Magnitude**: Calculate repulsion force based on overlap amount
5. **Direction**: Force vector points away from other object's center
6. **Accumulation**: Add to total force for frame

### Multi-Object Collisions
**Pairwise Forces**: Calculate collision force for each overlapping neighbor independently.

**Vector Addition**: All collision forces summed together for net repulsion.

**Symmetric Application**: Each object in collision pair experiences force (Newton's third law).

## Integration with Other Systems

### Mass System
**Acceleration**: a = F/m determines how much each object moves in response to collision.

**Momentum Transfer**: Lighter objects accelerate more than heavier objects from same force.

**Realistic Response**: Mass-based physics creates intuitive collision behavior.

See [[movement|Movement System]] for mass properties and velocity updates.

### Combination Trigger
**Distance Threshold**: When objects closer than combination distance d, merging takes over.

**Force Cutoff**: Collision forces stop applying at very close range (handled by combination instead).

**Transition**: Smooth transition from force-based separation to combination-based merging.

See [[object-merging|Object Merging]] for combination mechanics.

### Cohesion Balance
**Opposing Forces**: Collision (repulsion) must overcome cohesion (attraction) for objects to separate.

**Stable Equilibrium**: Forces should balance to maintain object spacing without oscillation.

**Dominance**: Collision forces typically stronger at close range than cohesion at same distance.

See [[cohesion|Cohesion]] for attraction force mechanics.

## Fixed-Point Implementation

**Determinism**: All calculations use fixed-point arithmetic for cross-platform consistency.

**Precision**: Distance and force calculations use 16.16 fixed-point format.

**Overflow Prevention**: Force magnitude clamped to prevent fixed-point overflow in extreme cases.

See [cross-reference:: [[general/determinism|Determinism]]] for fixed-point implementation details.

## GPU Implementation

**Pass Integration**: Collision forces calculated in "Apply Forces + Move" GPU pass.

**Neighborhood Caching**: Two-layer hex neighborhood loaded into workgroup shared memory.

**Parallel Processing**: Each object independently calculates collision forces from neighbors.

See [[passes|Pipeline Passes]] for integration with multi-pass GPU execution.

## Performance Considerations

**Neighbor Limits**: Two-layer range constraint keeps collision calculations bounded.

**Early Termination**: Skip collision calculations for stationary objects with no nearby motion.

**Shared Memory**: Workgroup caching minimizes texture reads for neighbor data.

## Design Tuning

**Playtesting Required**: Collision formula will be refined through gameplay iteration.

**Adjustable Parameters**: Force strength and response curve exposed as configuration values.

**Gameplay Feel**: Balance between realistic physics response and responsive, fun gameplay.
