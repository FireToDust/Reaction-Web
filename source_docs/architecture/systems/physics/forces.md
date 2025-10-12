# Velocity System

Spell-driven velocity changes and directional movement constraints.

## System Overview

**Velocity Model**: Discrete directional movement (8 directions) with bit-packed representation.

**Input Source**: Spell system provides velocity change requests processed in the velocity setting pass.

**Movement Constraints**: No traditional forces - tiles move in grid-aligned directions only.

## Velocity Setting Pass

### Input Processing
**Spell Integration**: First pass of physics pipeline processes spell system velocity requests.

**Velocity Changes**: Direct velocity modifications rather than force accumulation.

**Tile Type Changes**: Spell effects can modify tile types alongside velocity changes.

### Velocity Representation
**Bit-Packed Format**: 
- 3 bits for direction (8 cardinal/diagonal directions)
- Remaining bits for magnitude/speed
- Optimized for GPU memory bandwidth

**Direction Constraints**: Movement limited to 8 directions to maintain grid alignment:
- 4 Cardinal: North, South, East, West  
- 4 Diagonal: Northeast, Northwest, Southeast, Southwest

### Neighborhood Context
**Context-Dependent Changes**: May examine local neighborhood for spell effects that depend on surrounding tiles.

**Area Effects**: Handle spell effects that modify velocities across multiple tiles simultaneously.

## Integration with Multi-Pass System

### Pass 1 Role
**Pipeline Position**: Velocity setting occurs before collision detection passes.

**State Preparation**: Establishes initial velocity state for collision calculation.

/**Data Flow**: Reads spell inputs → applies velocity changes → writes updated tile data.

### Collision Response
**Velocity Changes from Collisions**: Collision resolution can modify tile velocities.

**Type-Dependent Collision**: Different tile types may have different collision behaviors affecting resulting velocities.

**Destruction Events**: Collisions can destroy tiles, removing them from velocity processing.

## Spell System Integration

### Input Format
**Velocity Change Requests**: Structured data from spell system specifying:
- Target tile position
- New velocity vector (direction + magnitude)
- Optional tile type changes
- Priority/timing information

**Batch Processing**: Handle multiple spell effects per tile in single pass.

### Spell Effect Types
**Direct Velocity**: Set tile velocity to specific value.

**Velocity Modification**: Add/subtract from existing velocity.

**Conditional Changes**: Velocity changes based on tile type or neighborhood.

**Area Effects**: Velocity changes applied to regions around spell targets.

## Movement Model

### Sub-Grid Positioning
**Offset System**: Tiles maintain sub-grid offsets between discrete positions.

**Smooth Interpolation**: Renderer uses offsets for smooth visual movement.

**Physics Tick Alignment**: Offset precision ensures tiles align with grid at physics ticks.

### Speed and Timing
**Variable Speeds**: Different tiles can move at different rates.

**Physics Tick Coordination**: All speeds calibrated to reach grid positions at physics ticks.

**Deterministic Movement**: Consistent timing across all platforms and runs.

## Technical Implementation

### GPU Compute Integration
```wgsl
// Velocity setting pass structure
@compute @workgroup_size(8, 8)
fn velocity_setting_pass(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let world_coord = calculate_world_coord(global_id);
    
    // Read current state
    let current_tile = read_tile(world_coord);
    let spell_inputs = read_spell_velocity_changes(world_coord);
    
    // Apply velocity modifications
    var updated_tile = current_tile;
    for (let i = 0; i < spell_inputs.count; i++) {
        updated_tile = apply_spell_effect(updated_tile, spell_inputs.effects[i]);
    }
    
    write_tile(world_coord, updated_tile);
}
```

### Memory Layout
**Compact Storage**: Velocity data packed into minimal bits within tile data structure.

**Efficient Access**: Velocity reading/writing optimized for GPU memory patterns.

**Spell Input Buffer**: Temporary buffer for spell system velocity change requests.

## Performance Characteristics

### Processing Efficiency
**Parallel Processing**: Each tile processes its velocity changes independently.

**Minimal Computation**: Simple velocity assignment rather than complex force calculations.

**Memory Bandwidth**: Optimized data structures minimize GPU memory access.

### Scalability Considerations
**Spell Load**: Performance scales with number of active spell effects.

**Area Effects**: Efficient handling of spells affecting multiple tiles.

**Context Processing**: Optional neighborhood examination for context-dependent effects.

## Integration Points

### Spell System
**Input Interface**: Structured velocity change requests from spell processing.

**Timing Coordination**: Velocity changes applied at correct physics tick timing.

**Effect Validation**: Ensure spell effects produce valid velocity values.

### Collision System
**State Handoff**: Provides initial velocity state for collision detection passes.

**Result Integration**: Accepts velocity changes from collision resolution.

**Type Coordination**: Handles tile type changes that affect collision behavior.

### Renderer
**Interpolation Data**: Provides velocity and offset data for smooth visual movement.

**Event Coordination**: Velocity changes may trigger visual effects.

## Design Rationale

### No Traditional Forces
**Grid Alignment**: Force-based physics would complicate grid-aligned movement.

**Determinism**: Direct velocity setting is more predictable than force accumulation.

**Performance**: Simpler calculations than continuous force integration.

**Spell Integration**: Direct velocity control better matches spell effect design.

### Direction Constraints
**Grid Consistency**: 8-direction movement maintains tile alignment with grid.

**Visual Clarity**: Predictable movement directions improve gameplay readability.

**Collision Simplification**: Limited directions simplify collision detection algorithms.

**Memory Efficiency**: 3 bits sufficient for direction encoding.