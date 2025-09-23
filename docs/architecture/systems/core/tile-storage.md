# Tile Storage System

## Purpose and Challenge

**Problem**: GPU shaders need packed data, but game logic needs flexible representations.

**Solution**: Bit-packed 32-bit tiles stored in GPU textures.

## Layer Architecture

#### Layer Organization
- **Ground Layer**: Terrain foundation (dirt, stone, water)
- **Object Layer**: Interactive entities (rocks, trees, creatures)
- **Air Layer**: Gases and effects (fire, smoke, magic)  
- **Rune Layer**: Spell-placed magical effects (temporary)

#### Bit-Packing Format
**Note**: Specific bit allocation TBD during implementation. Approximate layout:
- Tile Type (~6 bits, chosen for comfortable headroom)
- Velocity X/Y (signed values for movement)
- Custom Data (remaining bits for health, timers, charges)

### Texture Management
**Texture Ping-Ponging**: Each layer uses paired textures (`layer_A`, `layer_B`) enabling GPU modules to read from stable data while writing to separate textures, avoiding read-after-write hazards.

**Memory Layout**: Textures use `r32uint` format for optimal GPU cache performance.

### Active Region System
**Purpose**: Avoid processing static regions to maintain performance.

**Implementation**:
- Divide world into 32×32 tile chunks (chosen to balance GPU workgroup efficiency with memory overhead)
- Track chunks with active tiles in GPU buffer
- Shaders only process listed active chunks
- Activity propagates to neighboring chunks automatically
- Dormant regions have minimal GPU cost

## API Design

### Core Classes
- `TileStorage`: Manages texture allocation and bit-packing
- `TextureManager`: Handles ping-ponging and synchronization
- `GameLoop`: Coordinates frame execution pipeline
- `ActiveRegionTracker`: Optimizes chunk-based processing

### Integration Points
- **Spell System**: Writes rune data to rune layer textures
- **Physics Engine**: Reads/writes velocity data via texture pairs
- **Reaction Engine**: Processes transformation rules on tile data
- **Renderer**: Reads current tile states for display