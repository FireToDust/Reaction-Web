# Rules System Documentation

The rules system defines how tiles transform based on their neighborhood conditions. It uses a sophisticated binary tree evaluation system that supports 8-way symmetry.

## Core Concepts

### Tiles
Tiles represent different materials in the game world:
```typescript
enum Tile {
  VOID = 0,    // Empty space
  WATER = 1,   // Water tiles
  LAVA = 2,    // Lava tiles
  MAGIC = 3,   // Magic tiles
  GRASS = 4,   // Grass/dirt tiles
  MUD = 5,     // Mud tiles
  SAND = 20,   // Sand tiles (legacy value)
}
```

### Directions
8-directional neighborhood checking:
```typescript
enum Dir {
  N = 0,   // North
  NE = 1,  // Northeast
  E = 2,   // East
  SE = 3,  // Southeast
  S = 4,   // South
  SW = 5,  // Southwest
  W = 6,   // West
  NW = 7,  // Northwest
}
```

## Rule Construction

### Basic Conditions
```typescript
// Check for water tile to the north
const waterNorth = tileAt(Tile.WATER, Dir.N);

// Check for water tile 2 spaces north
const waterFarNorth = tileAt(Tile.WATER, Dir.N, 2);
```

### Logical Operators
```typescript
// Combine conditions with AND
const waterAndGrass = and(
  tileAt(Tile.WATER, Dir.N),
  tileAt(Tile.GRASS, Dir.S)
);

// Combine conditions with OR
const waterOrLava = or(
  tileAt(Tile.WATER, Dir.N),
  tileAt(Tile.LAVA, Dir.E)
);

// Negate conditions
const notWater = not(tileAt(Tile.WATER, Dir.N));
```

### Reactions
Reactions define how tiles transform:
```typescript
// Create a reaction that transforms to MUD with base bias of -3
const dirtToMud = new Reaction(Tile.MUD, -3);

// Add conditions that modify the reaction probability
dirtToMud.add_condition(closeToWater, 4);  // +4 if near water
dirtToMud.add_condition(closeToMud, 2);    // +2 if near mud
```

### Rule Sets
```typescript
const rules = new Rules();

// Add reactions for specific tile types
rules.add_reaction(Tile.GRASS, dirtToMud);
rules.add_reaction(Tile.GRASS, dirtToLava);
rules.add_reaction(Tile.MUD, mudToWater);
```

## Binary Tree Evaluation

The system converts complex logical expressions into efficient binary trees:

1. **Tree Structure**: Up to 7 internal nodes (0-6) with 8 leaf nodes
2. **Symmetry Support**: Each condition is evaluated across 8 rotational/reflection symmetries
3. **GPU Optimization**: Trees are packed into compact binary format for shader execution

### Example Tree Construction
```typescript
const complexCondition = and(
  or(
    tileAt(Tile.WATER, Dir.N),
    tileAt(Tile.WATER, Dir.E)
  ),
  not(tileAt(Tile.LAVA, Dir.S))
);
```

This creates a tree structure:
```
     AND (root)
    /          \
   OR           NOT
  /  \           |
Water Water    LAVA
(N)   (E)      (S)
```

## GPU Data Format

Rules are encoded into a binary format optimized for GPU compute shaders:

- **Packed Conditions**: 9-bit encoding for tile type, direction, and distance
- **Compact Trees**: Internal node modes packed into 32-bit values
- **Texture Storage**: Rules stored in GPU textures for fast random access

## Example Usage

```typescript
// Create water flow detection
const waterFlow = and(
  tileAt(Tile.WATER, Dir.N, 1),
  tileAt(Tile.WATER, Dir.N, 2),
  not(or(
    tileAt(Tile.WATER, Dir.NW, 1),
    tileAt(Tile.WATER, Dir.NE, 1)
  ))
);

// Create mud formation reaction
const mudReaction = new Reaction(Tile.MUD, -2);
mudReaction.add_condition(waterFlow, 3);

// Add to rule set
const rules = new Rules();
rules.add_reaction(Tile.GRASS, mudReaction);
```

## Performance Characteristics

- **GPU Parallel**: All conditions evaluated in parallel across the entire map
- **Symmetry Optimization**: Single rule definition covers 8 orientations
- **Memory Efficient**: Compact binary encoding minimizes GPU memory usage
- **Cache Friendly**: Workgroup shared memory reduces texture reads

## Limitations

- Maximum 32 tile types (5-bit encoding)
- Maximum 8 reactions per tile type
- Maximum 16 conditions per reaction
- Tree depth limited to 3 levels (7 internal nodes)