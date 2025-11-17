---
status: proposed
tags:
  - Architecture
  - Implementation
todo:
  - "[implementation] Determine optimal number of overlap passes through profiling"
  - "[discussion] Frame timing coordination with reactions and rendering"
---

# Pipeline Passes

Multi-pass GPU compute pipeline for processing physics interactions in deterministic order.

## Pipeline Overview

The physics system uses a sequence of GPU compute passes executed each frame:

1. **Apply Forces + Move** - Calculate forces, update velocities and sub-grid offsets
2. **Overlap Passes (2-N)** - Detect and merge objects that are too close
3. **Set Grid Position** - Update hex cell assignments based on final offsets

## Pass 1: Apply Forces + Move

### Purpose
**Force Accumulation**: Calculate and apply all forces (collision, cohesion, spell) to objects.

**Velocity Update**: Modify object velocities based on net force and mass.

**Sub-Grid Movement**: Update sub-grid offsets without changing hex cell assignment yet.

**Grid Preservation**: Objects remain in current hex cells until final pass.

### Processing Steps
1. Load two-layer hex neighborhood into workgroup shared memory
2. Calculate collision forces from overlapping neighbors
3. Calculate cohesion forces from nearby neighbors
4. Calculate spell forces from overlapping spell shapes
5. Sum all forces using vector addition
6. Update velocity: `v_new = v_old + (F_total / mass)`
7. Clamp velocity to maximum speed
8. Update sub-grid offset: `offset_new = offset_old + v_new`
9. Write updated object to output texture

### Integration
**Forces**: [[cohesion|Cohesion]], [[collision|Collision]], [[spell-integration|Spell Forces]]

**Movement**: [[movement|Movement System]] for velocity and offset details

## Pass 2-N: Overlap Passes

### Purpose
**Object Merging**: Detect objects closer than combination distance d and merge them.

**Multi-Object Groups**: Handle groups of 3+ objects that should all merge together.

**Cascading Merges**: Resolve combinations that create new combinations.

### Iterative Resolution
**Multiple Passes**: May require 2-N passes to fully resolve all combinations.

**Convergence Detection**: Terminate when no combinations triggered in previous pass.

**Pass Skipping**: Early exit if no merging activity detected.

### Processing Steps
1. Detect objects with distance < d
2. Identify merge groups using scatter-gather algorithm
3. Calculate mass-weighted centroid and velocity
4. Apply reaction rules for type transformation
5. Create merged object, remove component objects
6. Check for convergence (no more merges needed)

### Integration
**Merging**: [[object-merging|Object Merging]] for combination mechanics

**Transformations**: [[reactions|Reactions]] for type changes during merges

## Pass 3: Set Grid Position

### Purpose
**Hex Cell Assignment**: Update which hex cell each object occupies based on final offset.

**Boundary Wrapping**: Handle world edge wrapping for continuous world.

**Final Position**: Establish object positions for next frame and rendering.

### Processing Steps
1. Read final sub-grid offset from previous pass
2. Determine if offset exceeds hex cell boundary
3. Calculate new hex cell coordinates if needed
4. Adjust offset relative to new cell center
5. Write final position to output texture

## Texture Ping-Ponging

### Read/Write Separation
**Dual Textures**: Each layer has two textures (read and write).

**Simultaneous Access**: All objects read from one texture, write to the other.

**Determinism**: Prevents read-after-write hazards and ensures consistent ordering.

**Swap**: Textures swap roles between passes (output becomes input for next pass).

See [cross-reference:: [[general/determinism|Determinism]]] for deterministic execution approach.

## Frame Timing

### 60 FPS Target
**Frame Budget**: 16.67ms total frame time.

**Physics Allocation**: Physics should complete in <12ms to leave time for rendering.

**Pass Budget**: Each pass optimized to execute efficiently within time constraints.

### Coordination
**⚠️ NEEDS DISCUSSION**: Timing coordination between physics, reactions, and rendering systems.

**Sequential Execution**: Passes execute in strict order (no overlap between passes).

**Synchronization**: GPU barriers ensure pass completion before next begins.

## Performance Considerations

### Workgroup Architecture
**Shared Memory Caching**: Load hex neighborhoods once per workgroup to minimize texture reads.

**Workgroup Size**: 8×8 threads (64 total) balances occupancy and shared memory usage.

**⚠️ NEEDS TUNING**: Optimal workgroup size TBD through GPU profiling.

### Early Termination
**Stationary Objects**: Skip force calculations for objects with zero velocity and no nearby activity.

**Convergence**: Terminate overlap passes when no more merges detected.

**Empty Cells**: Skip processing for hex cells with no objects.

### Memory Bandwidth
**Coalesced Access**: Structure memory access patterns for optimal GPU cache utilization.

**Texture Formats**: Use efficient r32uint formats for object data storage.

**Bit-Packing**: Compress object properties to minimize memory bandwidth.

## GPU System Integration

**Implementation Details**: See GPU system documentation for:
- Buffer layouts and texture formats
- Workgroup configuration
- Memory access patterns
- Shader structure templates

**Note**: Physics documents describe the logic and algorithms; GPU documents describe the technical implementation.

## Integration Points

### Movement System
[[movement|Movement]] - Velocity, mass, and positioning mechanics

### Forces
[[cohesion|Cohesion]] - Gap-closing attraction forces

[[collision|Collision]] - Overlap repulsion forces

[[spell-integration|Spell Integration]] - Spell-driven forces and transformations

### Object Merging
[[object-merging|Object Merging]] - Combination mechanics and multi-pass resolution

### Reactions
[[reactions|Reactions]] - Type transformations during merges and environmental interactions
