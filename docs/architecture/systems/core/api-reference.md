# Core Engine API Reference

Classes, interfaces, and integration points for the Core Engine system.

⚠️ **STATUS**: API design has not been established yet. The following are suggestions for future design work.

## Core Classes

### TileStorage
⚠️ **SUGGESTION**: Manages texture allocation and bit-packing operations.

**Potential Responsibilities**:
- Bit-packing and unpacking of tile data
- Texture allocation and memory management
- Layer-specific data access patterns

⚠️ **NEEDS DESIGN**: Detailed method signatures and data structures

### TextureManager
Handles ping-ponging and GPU synchronization.

**Responsibilities**:
- Texture pair management for each layer
- Ping-pong switching between frames
- GPU resource lifecycle management
- Synchronization barrier coordination

⚠️ **NEEDS DESIGN**: WebGPU integration patterns and error handling

### GameLoop
Coordinates frame execution pipeline across all modules.

**Responsibilities**:
- Frame timing and execution order
- Module coordination and communication
- Performance monitoring and bottleneck detection

⚠️ **NEEDS SPECIFICATION**: Integration with different module update frequencies

### ActiveRegionTracker
Optimizes chunk-based processing across GPU modules.

**Responsibilities**:
- Active chunk list management
- Activity propagation logic
- GPU buffer updates for active regions
- Performance scaling based on activity

⚠️ **NEEDS SPECIFICATION**: Activity detection and decay algorithms

## Integration Interfaces

### Spell System Integration
**Rune Placement API**:
```typescript
// Preliminary interface - subject to change
interface RunePlacementAPI {
    placeRune(position: TileCoord, rune: RuneData): void;
    removeRune(position: TileCoord): void;
    queryRune(position: TileCoord): RuneData | null;
}
```

### Physics Engine Integration  
**Velocity Management API**:
```typescript
// Preliminary interface - subject to change
interface VelocityAPI {
    setVelocity(position: TileCoord, velocity: Vector2): void;
    getVelocity(position: TileCoord): Vector2;
    applyForce(position: TileCoord, force: Vector2): void;
}
```

### Reaction Engine Integration
**Tile State API**:
```typescript
// Preliminary interface - subject to change  
interface TileStateAPI {
    getTile(position: TileCoord, layer: LayerType): TileData;
    setTile(position: TileCoord, layer: LayerType, data: TileData): void;
    queryNeighborhood(center: TileCoord, radius: number): TileData[];
}
```

### Renderer Integration
**Read-Only Display API**:
```typescript
// Preliminary interface - subject to change
interface DisplayAPI {
    getCurrentTileState(position: TileCoord): LayeredTileData;
    getVisibleRegion(viewport: Rectangle): TileData[];
    subscribeToChanges(callback: (changes: TileChange[]) => void): void;
}
```

## Data Structures

### TileData Format
⚠️ **NEEDS FINALIZATION**: Specific bit allocation during implementation

```typescript
// Preliminary structure - bit allocation TBD
interface TileData {
    type: number;      // ~6 bits - tile type identifier
    velocity: Vector2; // 16 bits - movement vector (signed)
    customData: number; // ~10 bits - health, timers, charges
}
```

### LayerType Enumeration
```typescript
enum LayerType {
    Ground = 0,  // Terrain foundation
    Object = 1,  // Interactive entities  
    Air = 2,     // Gases and effects
    Rune = 3     // Spell-placed effects
}
```

### TileCoord System
```typescript
interface TileCoord {
    x: number;
    y: number;
}

interface ChunkCoord {
    chunkX: number;
    chunkY: number;
}
```

## Error Handling

⚠️ **NEEDS DESIGN**: Comprehensive error handling strategy for:
- GPU resource allocation failures
- WebGPU device lost scenarios  
- Texture memory exhaustion
- Invalid tile coordinate access
- Synchronization failures

## Performance Monitoring

⚠️ **NEEDS IMPLEMENTATION**: Built-in profiling capabilities for:
- Frame timing breakdown by module
- GPU utilization and memory bandwidth
- Active region processing efficiency
- Texture ping-pong overhead measurement

## Dependencies

### External Dependencies
- **WebGPU API**: Core dependency for all GPU operations
- **TypeScript**: Type safety and development experience

### Internal Dependencies  
- Integration with all other game modules
- Shared type definitions across the codebase
- Common utility functions and error types