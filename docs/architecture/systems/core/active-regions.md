# Active Region System

Chunk-based processing optimization to avoid processing static regions.

## Purpose

**Purpose**: Avoid processing static regions to maintain performance.

**Core Characteristic**: Automatic scaling with activity level rather than world size.

## Implementation Strategy

### Chunk Division
- **Chunk Size**: 32×32 tile chunks (chosen to balance GPU workgroup efficiency with memory overhead)
- **World Organization**: Divide entire world into fixed chunk grid
- **Chunk Coordinates**: Each chunk identified by (chunk_x, chunk_y) coordinates

### Activity Tracking
- **Active Chunk Buffer**: GPU buffer maintains list of chunks with active tiles
- **Shader Processing**: Shaders only process tiles in listed active chunks
- **Dynamic Updates**: Chunks added/removed from active list based on tile changes

### Activity Propagation
- **Neighbor Activation**: Activity automatically propagates to neighboring chunks
- **Movement Spreading**: Moving tiles mark their destination chunks as active
- **Collision Effects**: Collisions spread activity to neighboring regions
- **Gradual Decay**: Activity in stable regions decays over time

## GPU Shader Integration

### Compute Shader Architecture
```wgsl
@compute @workgroup_size(8, 8)
fn process_active_chunks(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let chunk_coord = active_chunks[workgroup_id.x];
    let local_coord = global_id.xy;
    let world_coord = chunk_coord * 32u + local_coord;
    
    // Process only tiles in active chunks
    if (world_coord.x < world_size.x && world_coord.y < world_size.y) {
        process_tile(world_coord);
    }
}
```

### Workgroup Efficiency
**GPU Alignment**: 32×32 chunks align well with GPU workgroup sizes
**Memory Coalescing**: Chunk-based processing improves memory access patterns
**Thread Utilization**: Reduces wasted GPU threads on empty regions

## Performance Characteristics

### Scaling Characteristics
- **Activity-Based Cost**: Processing cost scales with active tiles, not world size
- **Dormant Regions**: Static areas have minimal GPU cost
- **Memory Access**: Reduced texture memory accesses in inactive regions

### Memory Overhead
**Active Chunk Buffer**: Small GPU buffer storing active chunk coordinates
**Tracking Data**: Minimal per-chunk metadata for activity state
**Negligible Cost**: Buffer size insignificant compared to texture memory

## Activity Management

### Activation Triggers
- **Tile Movement**: Moving tiles activate their current and destination chunks
- **Spell Casting**: Rune placement activates target chunks
- **Environmental Changes**: Rule transformations mark chunks active
- **Force Application**: Physics forces spread activation

### Deactivation Strategy
⚠️ **NEEDS DESIGN**: Specific strategy for marking chunks inactive
- Potential approaches: Timer-based decay, change detection, activity counters
- **Challenge**: Balance between responsiveness and performance

### Edge Cases
**Chunk Boundaries**: Ensure proper handling of tiles affecting multiple chunks
**Large Effects**: Spells or explosions affecting many chunks simultaneously
**Performance Spikes**: Sudden activation of many dormant regions

## Integration Points

### Physics Engine
- **Movement Processing**: Physics updates active chunk list based on tile movement
- **Collision Detection**: Collision effects activate neighboring chunks

### Reaction Engine  
- **Rule Processing**: Environmental transformations mark affected chunks active
- **Pattern Matching**: Large-scale patterns may activate multiple chunks

### Spell System
- **Rune Placement**: Spell casting activates target chunks immediately
- **Area Effects**: Large spells properly handle multi-chunk activation

## Technical Implementation

⚠️ **NEEDS SPECIFICATION**: Detailed implementation approach for:
- Active chunk buffer data structure
- GPU buffer update mechanisms  
- Integration with existing texture ping-ponging
- Performance monitoring and tuning capabilities