---
status: proposed
tags:
  - Architecture
  - Implementation
todo:
  - "[implementation] Specify exact combination distance threshold d"
  - "[implementation] Implement scatter-gather algorithm for multi-object merges"
  - "[testing] Validate momentum conservation in merges"
warnings:
  - "[proposed] Scatter-gather implementation approach needs specification"
---

# Object Merging

Mechanic for combining nearby objects into single unified objects, maintaining one-per-cell guarantee and enabling dynamic reactions.

## Purpose

**One-Per-Cell Guarantee**: Ensures no hex cell ever contains more than one object.

**Gameplay Feature**: Creates dynamic object fusion and reaction chains through spatial proximity.

**Physics Stability**: Prevents infinite force application from perpetually overlapping objects.

## Trigger Conditions

### Distance Threshold
**Combination Distance d**: Merging triggered when two objects approach closer than distance d.

**⚠️ NEEDS SPECIFICATION**: Exact value of d TBD through gameplay testing.

**Relationship to Forces**: Distance d marks transition from force-based separation to merge-based combination.

### Merge Radius
**Inclusive Radius**: All objects with centers within distance d of the combined center are included in the merge.

**Multi-Object Merges**: Single combination event can merge 3+ objects if they're all within radius.

**Cascading Merges**: May require multiple passes to resolve chain reactions of combinations.

## Merging Process

### Step 1: Detection
**Overlap Detection**: GPU pass identifies objects closer than distance d.

**Scatter-Gather Algorithm**: Complex algorithm to identify groups of nearby objects that should merge together.

**⚠️ NEEDS SPECIFICATION**: Exact scatter-gather implementation approach TBD.

### Step 2: Physical Averaging
**Position**: Combined object placed at mass-weighted centroid of merged objects.

**Velocity**: Combined velocity is mass-weighted average of all merged objects.

**Momentum Conservation**: Total momentum preserved during combination:
```
m1*v1 + m2*v2 + ... = m_combined * v_combined
```

### Step 3: Type Transformation
**Reaction Rules**: New object type determined by reaction rules applied to merged object types.

**Type Lookup**: Reaction system provides type transformation based on merging object types.

**Mass Assignment**: New object mass based on its transformed type.

See [[reactions|Reactions]] for type transformation rules.

## Multi-Pass Resolution

### Iterative Combination
**Multiple Passes**: May require 2-N overlap passes to fully resolve cascading combinations.

**Convergence Detection**: Terminate when no more objects need merging.

**Pass Skipping**: Early termination if no combinations triggered in previous pass.

See [[passes|Pipeline Passes]] for multi-pass coordination.

## Fixed-Point Implementation

**Determinism**: All position and velocity calculations use fixed-point arithmetic.

**Precision**: Mass-weighted averaging maintains fixed-point format throughout.

**Overflow Prevention**: Weighted calculations designed to prevent overflow in extreme cases.

See [cross-reference:: [[general/determinism|Determinism]]] for fixed-point implementation details.

## GPU Implementation

### Scatter-Gather Complexity
**Challenge**: Identifying all objects in merge group requires coordination across GPU threads.

**Atomic Operations**: May use atomic operations to flag objects for combination.

**Multiple Passes**: Iterative approach resolves combinations step by step.

### Data Flow
**Input**: Object positions and velocities from previous pass.

**Processing**: Detect nearby objects, calculate merged properties, apply transformations.

**Output**: Updated object layout with merged objects replacing separate objects.

## Integration Points

### Collision Forces
**Transition Point**: At distance > d, collision forces apply; at distance < d, merging takes over.

**Smooth Handoff**: No force application during merge (combination replaces force-based separation).

See [[collision|Collision]] for repulsion force mechanics.

### Reactions System
**Type Transformation**: Merging triggers reaction rules to determine new object type.

**Environmental Context**: Reactions may consider environmental factors in transformation.

See [[reactions|Reactions]] for transformation rules and environmental interactions.

## Performance Considerations

**Convergence Speed**: Most combinations should resolve in 2-3 passes.

**Early Termination**: Stop iteration when no combinations detected.

**Workgroup Coordination**: Efficient GPU implementation critical for performance with many objects.

## Design Considerations

**Threshold Tuning**: Distance d must balance gameplay feel with physics stability.

**Mass Conservation**: Consider whether mass should be conserved or type-determined in merges.

**Gameplay Impact**: Merging creates strategic depth through spatial positioning and object manipulation.
