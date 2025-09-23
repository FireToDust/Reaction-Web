# GPU Shader Architecture

Multi-pass compute shader pipeline for collision detection and resolution.

## Pipeline Overview

The physics system uses a sequence of compute shader passes to resolve collisions deterministically:

1. **Velocity Setting Pass**: Process spell inputs and update tile velocities
2. **Collision Detection Pass**: Calculate initial collision paths
3. **Iterative Resolution Passes**: Refine collision paths through multiple iterations  
4. **Final Execution Pass**: Execute movements and handle conflicts

## Compute Shader Structure

### Pass 1: Velocity Setting Shader
```wgsl
@compute @workgroup_size(8, 8)
fn velocity_setting_pass(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let world_coord = calculate_world_coord(global_id);
    
    // Read current tile and spell inputs
    let current_tile = read_tile(world_coord);
    let spell_inputs = read_spell_velocity_changes(world_coord);
    
    // Apply velocity modifications
    let updated_tile = apply_velocity_changes(current_tile, spell_inputs);
    
    write_tile(world_coord, updated_tile);
}
```

### Pass 2: Initial Collision Detection Shader  
```wgsl
@compute @workgroup_size(8, 8)
fn collision_detection_pass(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let world_coord = calculate_world_coord(global_id);
    let current_tile = read_tile(world_coord);
    
    if (!has_velocity(current_tile)) {
        return; // Skip stationary tiles in initial pass
    }
    
    // Load neighborhood into workgroup shared memory
    let neighborhood = load_neighborhood(world_coord, 7); // 7x7 for moving tiles
    
    // Calculate collision paths
    let collision_result = calculate_minimum_collision_time(current_tile, neighborhood);
    
    // Store collision path and timing
    write_collision_path(world_coord, collision_result);
}
```

### Pass 3+: Iterative Resolution Shaders
```wgsl
@compute @workgroup_size(8, 8)  
fn iterative_resolution_pass(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let world_coord = calculate_world_coord(global_id);
    let current_tile = read_tile(world_coord);
    
    // Load neighborhood with updated collision paths
    let neighborhood = load_neighborhood_with_paths(world_coord);
    
    // Recalculate collision assuming neighbors follow their stored paths
    let updated_collision = recalculate_collision_with_paths(current_tile, neighborhood);
    
    // Update collision path if changed
    if (path_changed(updated_collision)) {
        write_collision_path(world_coord, updated_collision);
        mark_convergence_flag(false);
    }
}
```

### Final Pass: Execution Shader
```wgsl
@compute @workgroup_size(8, 8)
fn execution_pass(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let world_coord = calculate_world_coord(global_id);
    let current_tile = read_tile(world_coord);
    let collision_path = read_collision_path(world_coord);
    
    // Check for convergence - would another pass change the result?
    if (would_collision_change(current_tile, collision_path)) {
        // Write error tile for non-convergent scenario
        write_error_tile(world_coord);
        return;
    }
    
    // Execute collision resolution
    let final_position = collision_path.final_position;
    let collision_events = collision_path.events;
    
    // Atomic write to destination (handles conflicts)
    if (!atomic_write_tile(final_position, current_tile)) {
        // Conflict detected - write error tile
        write_error_tile(world_coord);
    }
    
    // Write collision events for renderer
    write_collision_events(collision_events);
}
```

## Workgroup Architecture

### Memory Management
**Shared Memory Caching**: Each workgroup loads neighborhood data into local memory.

**Cache Size**: 7×7 neighborhood fits within workgroup shared memory limits.

**Synchronization**: Workgroup barriers ensure data consistency across threads.

### Workgroup Organization
```wgsl
// Workgroup shared memory for neighborhood caching
var<workgroup> neighborhood_cache: array<array<TileData, 7>, 7>;
var<workgroup> cache_loaded: bool;

@compute @workgroup_size(8, 8)
fn collision_pass(@builtin(global_invocation_id) global_id: vec3<u32>,
                  @builtin(local_invocation_id) local_id: vec3<u32>) {
    
    // First thread in workgroup loads neighborhood
    if (local_id.x == 0 && local_id.y == 0) {
        load_neighborhood_to_cache();
        cache_loaded = true;
    }
    
    workgroupBarrier();
    
    // All threads process using cached data
    process_tile_with_cached_neighborhood(global_id, local_id);
}
```

## Memory Access Patterns

### Texture Ping-Ponging
**Read Phase**: Sample from texture set A (stable data from previous frame).

**Write Phase**: Output to texture set B (prevents read-after-write hazards).

**Buffer Swapping**: Core engine swaps texture sets between physics ticks.

### Neighborhood Access
**Dynamic Sizing**: Calculate required neighborhood based on tile velocity and offset.

**Boundary Handling**: World wrapping for neighborhoods that extend beyond edges.

**Memory Coalescing**: Thread groups access contiguous texture regions for GPU cache efficiency.

## Deterministic Execution

### Convergence-Based Determinism
**Iterative Resolution**: Determinism achieved through multi-pass convergence rather than processing order.

**Consistent Results**: Same collision scenarios produce identical outcomes across runs and platforms.

**Atomic Operations**: GPU atomics ensure consistent conflict resolution when multiple tiles target same location.

### Precision Control  
```wgsl
// Integer-only collision time calculation
fn calculate_collision_time(tile_a: TileData, tile_b: TileData) -> u32 {
    // Use fixed-point arithmetic to avoid floating-point drift
    let relative_velocity = tile_a.velocity - tile_b.velocity;
    let distance = tile_a.position - tile_b.position;
    
    // Integer division with proper rounding
    return fixed_point_divide(distance, relative_velocity);
}
```

## Performance Optimizations

### Early Termination
**Convergence Detection**: Global flag indicates when no collision paths change.

**Pass Skipping**: Skip remaining iterative passes when convergence reached.

**Implementation**: Atomic flag updated by any thread that changes a collision path.

### Memory Bandwidth Optimization
**Bit-Packed Data**: Compress tile data to minimize texture memory usage.

**Coalesced Access**: Align memory access patterns with GPU architecture.

**Cache Optimization**: Structure data layout for optimal GPU cache utilization.

### Dynamic Dispatch
**Active Region Processing**: Only dispatch shaders for chunks containing moving tiles.

**Indirect Compute**: Use indirect dispatch for dynamic workload sizing.

**Workgroup Scaling**: Adjust workgroup count based on active tile density.

## Integration Points

### Core Engine Integration
**Texture Management**: Coordinate with core engine texture ping-ponging system.

**Active Chunks**: Receive list of active chunks to focus processing.

**Resource Sharing**: Share GPU resources with other compute systems.

### Event Buffer Management
**Collision Events**: Write collision timing and results to structured buffer.

**Renderer Integration**: Format events for efficient renderer consumption.

**Memory Layout**: Optimize event buffer layout for sequential access patterns.

## Shader Compilation Pipeline

### Build Process
**WGSL Source**: Write shaders in WebGPU Shading Language.

**Compilation**: Compile shaders during build process for validation.

**Hot Reload**: Development builds support shader hot-reloading.

### Error Handling
**Compilation Failures**: Graceful handling of shader compilation errors.

**Runtime Validation**: Verify shader resources and binding compatibility.

**Fallback Behavior**: Default error handling for GPU context loss.

## Performance Characteristics

### Scalability Considerations
**Pass Limiting**: Configurable maximum iteration count prevents infinite loops.

**Memory Bandwidth**: Texture access patterns optimized for GPU memory hierarchy.

**Compute Utilization**: Workgroup sizing balanced for GPU architecture efficiency.

### Bottleneck Identification
**GPU Utilization**: Monitor compute shader execution timing.

**Memory Bandwidth**: Track texture access patterns and cache hit rates.

**Convergence Speed**: Measure average iterations needed for collision resolution.