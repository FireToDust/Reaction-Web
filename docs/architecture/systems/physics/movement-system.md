# Movement System

Free-form positioning with cohesion forces and multi-pass collision resolution architecture.

## System Overview

**Movement Model**: Unconstrained movement using integer-precision positioning for deterministic physics.

**Collision Resolution**: Multi-pass GPU compute pipeline for deterministic collision handling.

**Cohesion Forces**: Automatic gap-closing and tile clustering for natural density management.

**Integration**: Provides collision events and position data to renderer for smooth visual interpolation.

## Free-Form Movement Model

### Offset Positioning System
**Precision**: Fixed-point arithmetic using texture-optimized bit precision for deterministic results.

**Unconstrained Direction**: Tiles can move in any direction based on collision physics and spell effects.

**Offset Storage**: Each tile stores its precise x,y offsets from grid center as integer values within texture memory.

### Movement Integration
**Renderer Interpolation**: Smooth visual movement using precise position data and collision event timing.

**Continuous Positioning**: Tiles can have any offset from their grid centers using integer coordinates.

**Velocity Representation**: Two-component velocity vectors (x,y) stored with texture-optimized precision.

## Cohesion Force System

### Gap-Closing Mechanics
**Purpose**: Automatically close gaps between tiles and maintain dense tile coverage without rigid grid constraints.

**Force Calculation**: Clamped linear attraction between tiles within 1.5 block radius.

**Neighborhood Processing**: 5x5 grid examination to account for tile positioning at sub-grid locations.

### Cohesion Force Implementation
**Distance Calculation**: Calculate center-to-center distance between current tile and all neighbors in 5x5 area.

**Force Formula**: `Force = max(0, cohesion_strength * (1.5 - distance) / 1.5)`

**Force Direction**: Attraction toward the centroid (average position) of nearby tiles within cohesion radius.

### Benefits
**Dense Coverage**: Tiles automatically maintain dense world coverage without explicit positioning rules.

**Gap Elimination**: Empty spaces between adjacent tiles get naturally filled by cohesion attraction.

**Breaking Force**: High-velocity impacts can overcome cohesion to separate tiles and create temporary gaps.

**Emergent Organization**: Organic tile distribution that responds dynamically to collisions and spell effects while maintaining coverage.

## Multi-Pass Collision Pipeline

### Pipeline Overview
The collision system uses multiple GPU compute passes to resolve complex scenarios:

1. **Velocity Setting Pass**: Apply spell inputs to update tile velocities
2. **Initial Collision Pass**: Calculate collision times assuming straight-line paths  
3. **Iterative Passes**: Recalculate collisions based on updated paths from previous passes
4. **Final Pass**: Execute collisions or generate error tiles for conflicts

### Pass 1: Velocity Setting
**Input Processing**: 
- Read spell system velocity change requests
- Apply velocity modifications to affected tiles
- Handle spell-induced tile type changes

**Neighborhood Analysis**: May examine local area for context-dependent velocity changes.

### Pass 2: Initial Collision Detection
**Neighborhood Scanning**: 
- Moving tiles: Examine 7×7 grid around tile position
- Stationary tiles: Examine 5×5 grid for efficiency  
- Dynamic sizing: Calculate affected cells based on velocity and current position

**Collision Calculation**: 
- Project straight-line paths for all tiles in neighborhood
- Calculate collision time based on tile size and relative velocities
- Find minimum collision time across all potential collisions

**Path Storage**: Write collision path, timing, and tile type changes to tile's memory location.

### Pass 3 to 3+n: Iterative Resolution
**Updated Collision Detection**:
- Recalculate collisions assuming tiles follow stored paths from previous pass
- Update neighborhood based on new projected movements
- Store refined collision paths and timings

**Convergence Checking**: Continue until paths stabilize or maximum pass count reached.

### Final Pass: Collision Execution
**Convergence Verification**: Check if collision times would change with another iteration.

**Collision Resolution**: 
- Execute tile movements to calculated positions
- Apply collision-induced tile type changes
- Handle tile destruction from collision results

**Conflict Handling**: Use GPU atomics to generate error tiles when multiple tiles target same location.

## Technical Implementation

### GPU Compute Architecture
**Workgroup Organization**: Each workgroup processes a neighborhood region with shared local memory cache.

**Memory Access Patterns**:
- Preload neighborhood data into workgroup local memory
- Sequential processing to maintain deterministic order
- Atomic operations for collision conflict resolution

### Boundary Conditions
**World Wrapping**: Tiles at world edges wrap to opposite side by default.

**Neighborhood Handling**: 7×7 neighborhoods near edges access wrapped coordinates for collision detection.

### Performance Optimizations
**Early Termination**: Skip remaining passes if no collision paths change.

**Workgroup Caching**: Load full neighborhood into local memory when possible.

**Bit-Packed Data**: Minimize memory bandwidth with compact data structures.

## Integration Points

### Core Engine
**Texture Coordination**: Read from stable textures, write to ping-pong buffers.

**Active Region Processing**: Focus compute resources on chunks containing moving tiles.

### Spell System
**Velocity Input**: Receive velocity changes from spell processing.

**Event Coordination**: Provide collision timing for spell trigger synchronization.

### Renderer
**Event Buffer**: Generate collision events with precise timing data.

**Interpolation Data**: Provide sub-grid positioning for smooth visual movement.

### Reaction System
**Layer Separation**: Physics handles same-layer interactions; reactions handle cross-layer effects.

**Performance Integration**: May merge shaders for efficiency if beneficial.

## Data Structures

### Tile Physics Data
- **Offset**: Unconstrained x,y offset from grid center (texture-optimized precision)
- **Velocity Vector**: Two-component velocity (x,y) with texture-optimized precision
- **Collision Path**: Projected movement and collision points
- **Type Changes**: Tile transformations from collision results

### Event Buffer Format
- **Collision Timing**: When collisions occur within physics tick
- **Collision Results**: Tile movements, destructions, type changes
- **Interpolation Points**: Data needed for smooth rendering

## Performance Characteristics

### Scalability Considerations
**Pass Limiting**: Configurable maximum iterations prevent infinite loops.

**Workgroup Efficiency**: Balance neighborhood size with GPU architecture.

**Memory Bandwidth**: Optimized data layout for GPU texture cache.

### Determinism Guarantees
**Convergence-Based Determinism**: Multi-pass iteration ensures consistent collision resolution regardless of processing order.

**Integer Mathematics**: Fixed-point arithmetic prevents floating-point drift.

**Atomic Consistency**: GPU atomics ensure deterministic conflict resolution when multiple tiles target same destination.