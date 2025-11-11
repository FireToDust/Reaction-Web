---
status: proposed
tags:
  - Implementation
todo:
  - "[implementation] Implement overlap pass scatter-gather algorithm for combinations"
  - "[implementation] Optimize workgroup shared memory for hex neighborhoods"
  - "[implementation] Determine optimal workgroup size through profiling"
---

# GPU Shader Architecture

Multi-pass GPU compute pipeline for force-based physics with combination mechanics on a hexagonal grid.

## Pipeline Overview

The physics system uses a sequence of GPU compute passes to update object positions and handle combinations:

1. **Apply Forces + Move**: Calculate and apply all forces, update velocities and sub-grid offsets
2. **Overlap Passes (2-N)**: Detect and merge objects that are too close
3. **Set Grid Position**: Update hex cell assignments based on final offsets

## Pass 1: Apply Forces + Move

### Overview

**Purpose**: Apply collision, cohesion, and spell forces; update velocity and sub-grid offset.

**Grid Position Preserved**: Objects remain in their current hex cell until final pass.

**Neighbor Range**: Check two-layer hexagonal neighborhood for force interactions.

### Shader Structure

```wgsl
@compute @workgroup_size(8, 8)
fn apply_forces_and_move(
    @builtin(global_invocation_id) global_id: vec3<u32>,
    @builtin(local_invocation_id) local_id: vec3<u32>
) {
    let hex_coord = calculate_hex_coord(global_id);
    let object = read_object(hex_coord);

    if (!object.exists) {
        return;
    }

    // Load two-layer hex neighborhood into shared memory
    load_hex_neighborhood_to_cache(hex_coord, local_id);
    workgroupBarrier();

    // Accumulate forces from neighbors
    var total_force = vec2<i32>(0, 0); // Fixed-point

    // Collision forces (from overlapping objects)
    total_force += calculate_collision_forces(object, neighborhood_cache);

    // Cohesion forces (from nearby objects within radius)
    total_force += calculate_cohesion_forces(object, neighborhood_cache);

    // Spell forces (from overlapping spell shapes)
    total_force += calculate_spell_forces(object, spell_buffer);

    // Update velocity (F = ma, so a = F/m)
    let acceleration = fixed_point_divide(total_force, object.mass);
    object.velocity = fixed_point_add(object.velocity, acceleration);

    // Clamp velocity to maximum
    object.velocity = clamp_velocity(object.velocity, MAX_VELOCITY);

    // Update sub-grid offset (don't change hex cell assignment yet)
    object.offset = fixed_point_add(object.offset, object.velocity);

    write_object(hex_coord, object);
}
```

### Force Calculations

**Collision Forces**: For each overlapping neighbor, calculate repulsion force based on overlap distance and mass.

**Cohesion Forces**: For neighbors within cohesion radius, calculate attraction force toward group centroid.

**Spell Forces**: Check spell buffer for overlapping spell shapes; apply impulses or set velocities based on element type.

**Details**: See [cross-reference:: [[forces|Forces]]] for force formulas and mechanics.

## Pass 2-N: Overlap Passes

### Overview

**Purpose**: Detect objects closer than combination distance d; merge them into single objects.

**Scatter-Gather**: Complex algorithm to identify and merge groups of nearby objects.

**Multiple Passes**: May require several passes to fully resolve cascading combinations.

**⚠️ NEEDS SPECIFICATION**: Exact scatter-gather implementation approach TBD.

### Shader Structure

```wgsl
@compute @workgroup_size(8, 8)
fn overlap_detection_pass(
    @builtin(global_invocation_id) global_id: vec3<u32>,
    @builtin(local_invocation_id) local_id: vec3<u32>
) {
    let hex_coord = calculate_hex_coord(global_id);
    let object = read_object(hex_coord);

    if (!object.exists) {
        return;
    }

    // Load two-layer hex neighborhood
    load_hex_neighborhood_to_cache(hex_coord, local_id);
    workgroupBarrier();

    // Find all objects within combination distance d
    var nearby_objects = find_objects_within_distance(object, neighborhood_cache, COMBINATION_DISTANCE);

    if (nearby_objects.count > 0) {
        // Mark for combination
        // TODO: Implement scatter-gather algorithm
        // - Assign combination group ID
        // - Calculate combined properties (mass-averaged velocity, centroid position)
        // - Apply reaction rules for type transformation
        // - Write combined object, mark merged objects for deletion
    }
}
```

### Combination Process

**Distance Check**: Calculate distance between object centers; trigger if < d.

**Group Formation**: All objects within d of combined center merge together.

**Property Calculation**:
- Velocity: Mass-weighted average of all merged objects
- Position: Mass-weighted centroid
- Type: Determined by reaction rules (see [cross-reference:: [[reactions|Reaction System]]])
- Mass: Based on new type

**Atomic Operations**: Use atomics to prevent race conditions when multiple groups overlap.

## Final Pass: Set Grid Position

### Overview

**Purpose**: Update which hex cell each object occupies based on its final sub-grid offset.

**Boundary Wrapping**: Handle objects that have moved across world edges.

**Spatial Indexing**: Ensure objects are correctly indexed for next frame's neighbor queries.

### Shader Structure

```wgsl
@compute @workgroup_size(8, 8)
fn set_grid_position(
    @builtin(global_invocation_id) global_id: vec3<u32>
) {
    let hex_coord = calculate_hex_coord(global_id);
    let object = read_object(hex_coord);

    if (!object.exists) {
        return;
    }

    // Calculate new hex cell based on offset
    let new_hex_coord = calculate_hex_from_offset(hex_coord, object.offset);

    // Normalize offset relative to new cell center
    let normalized_offset = normalize_offset_to_cell(object.offset, new_hex_coord);

    // Handle world wrapping
    let wrapped_coord = wrap_hex_coordinate(new_hex_coord);

    if (wrapped_coord != hex_coord) {
        // Object moved to new cell - relocate it
        object.offset = normalized_offset;
        atomic_write_object(wrapped_coord, object);
        delete_object(hex_coord);
    } else {
        // Object stayed in same cell - just update offset
        object.offset = normalized_offset;
        write_object(hex_coord, object);
    }
}
```

## Hexagonal Grid Algorithms

### Polar/Cube Coordinates

**Coordinate System**: Use cube coordinates (q, r, s) where q + r + s = 0.

**Neighbor Lookup**: Efficient neighbor calculation using coordinate offsets.

**Point-to-Hex**: Convert Cartesian (x, y) position to hex coordinates using cube algorithm.

### Skewed Parallelogram Storage

**GPU Layout**: Grid stored as skewed parallelogram in texture memory.

**Rectangular Indexing**: Standard 2D texture coordinates map to hex cells.

**Wrapped Boundaries**: World edges wrap seamlessly for continuous circular world.

### Two-Layer Neighborhood

**Layer Definition**: Objects check 19 hex cells (center + 6 immediate + 12 second-layer).

**Shared Memory Size**: 19 objects fit efficiently in workgroup shared memory.

**Coordinate Calculation**: Precompute neighbor offsets for each hex layer.

## Workgroup Architecture

### Shared Memory Caching

**Purpose**: Load neighborhood data once per workgroup to minimize texture reads.

**Cache Size**: 19 hex cells × object data size (position, velocity, type, mass).

**Synchronization**: Workgroup barriers ensure all threads see cached data.

```wgsl
// Workgroup shared memory for hex neighborhood
var<workgroup> neighborhood_cache: array<ObjectData, 19>;
var<workgroup> cache_loaded: bool;

fn load_hex_neighborhood_to_cache(
    center_hex: vec2<i32>,
    local_id: vec3<u32>
) {
    // First thread loads all 19 neighbors
    if (local_id.x == 0 && local_id.y == 0) {
        for (var i = 0; i < 19; i++) {
            let neighbor_hex = center_hex + HEX_NEIGHBOR_OFFSETS[i];
            neighborhood_cache[i] = read_object(neighbor_hex);
        }
        cache_loaded = true;
    }
}
```

### Workgroup Size

**Current Choice**: 8×8 workgroups (64 threads).

**Rationale**: Balance between GPU occupancy and shared memory usage.

**⚠️ NEEDS TUNING**: Optimal workgroup size TBD through GPU profiling.

## Data Structures

### Object Physics Data

**GPU Texture Layout**:
```wgsl
struct ObjectData {
    // Position (12 bytes)
    hex_coord: vec2<i32>,      // 8 bytes - hex cell coordinates
    offset: vec2<i32>,         // 8 bytes - fixed-point offset from cell center

    // Velocity (8 bytes)
    velocity: vec2<i32>,       // 8 bytes - fixed-point velocity vector

    // Properties (8 bytes)
    type_id: u32,              // 4 bytes - object type
    mass: u32,                 // 4 bytes - mass (or could be computed from type)

    // Flags (4 bytes)
    layer: u32,                // 4 bytes - Ground/Object/Air (could be packed)
    exists: bool,              // 1 byte - object exists flag
    // ... potential padding or additional flags
}
// Total: ~32 bytes per object (may be optimized with bit-packing)
```

**Memory Packing**: Consider bit-packing to reduce texture memory and bandwidth.

### Spell Buffer

**Structure**: Array of active spell shapes in GPU buffer.

**Data Per Spell**:
- Shape geometry (circle, rectangle, etc.)
- Position and radius
- Element type(s)
- Cast time (for element combination ordering)
- Force magnitude/velocity value

**Spatial Partitioning**: Future optimization to limit spell checks per object.

## Fixed-Point Arithmetic

### Determinism Guarantee

**Integer-Only Operations**: All physics calculations use fixed-point (scaled integers).

**Platform Independence**: Avoids floating-point precision differences across GPUs.

**Bit Precision**: Balance accuracy vs overflow risk (e.g., 16.16 fixed-point).

**Details**: See [cross-reference:: [[determinism|Determinism]]] for implementation.

### Example Operations

```wgsl
// Fixed-point addition (trivial)
fn fixed_point_add(a: vec2<i32>, b: vec2<i32>) -> vec2<i32> {
    return a + b;
}

// Fixed-point multiplication (scale factor = 2^16)
fn fixed_point_multiply(a: i32, b: i32) -> i32 {
    return (i64(a) * i64(b)) >> 16;
}

// Fixed-point division
fn fixed_point_divide(numerator: i32, denominator: i32) -> i32 {
    return (i64(numerator) << 16) / i64(denominator);
}
```

## Performance Optimizations

### Early Termination

**Stationary Objects**: Skip force calculations for objects with zero velocity and no nearby activity.

**Convergence Detection**: In overlap passes, terminate early if no combinations triggered.

**Pass Skipping**: Skip remaining overlap passes once no objects need merging.

### Memory Bandwidth

**Coalesced Access**: Threads in workgroup access contiguous memory locations.

**Texture Cache**: Structure data layout for optimal GPU cache utilization.

**Bit-Packing**: Compress object data to minimize texture memory bandwidth.

### Atomic Operations

**Combination Conflicts**: Use atomic operations when multiple objects try to merge.

**Cell Relocation**: Atomic writes when moving objects to new hex cells.

**Flag Updates**: Atomic flags for convergence detection across workgroups.

## Integration Points

### Movement System
- Pipeline implements movement, velocity, and combination mechanics
- See [cross-reference:: [[movement-system|Movement System]]] for conceptual details

### Forces
- Force calculation details and formulas
- See [cross-reference:: [[forces|Forces]]] for force types and equations

### Spell System
- Spell buffer provides force input
- Objects check for overlapping spell shapes
- See [cross-reference:: [[spells|Spell System]]] for spell mechanics

### Reaction System
- Combination type transformations use reaction rules
- See [cross-reference:: [[reactions|Reaction System]]] for transformation rules

## Shader Development

### WGSL Implementation

**Language**: WebGPU Shading Language (WGSL).

**Compilation**: Shaders compiled at runtime by WebGPU driver.

**Validation**: Browser provides shader compilation errors during development.

### Hot Reloading

**Development Mode**: Support shader hot-reloading for rapid iteration.

**Error Handling**: Graceful fallback when shader compilation fails.

**Debugging**: Use browser GPU debugging tools for shader profiling.

### Performance Profiling

**GPU Timers**: Measure individual pass execution times.

**Bandwidth Monitoring**: Track texture read/write operations.

**Workgroup Tuning**: Profile different workgroup sizes for optimal performance.
