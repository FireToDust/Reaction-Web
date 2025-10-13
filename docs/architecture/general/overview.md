
# System Architecture Overview

## Purpose and Core Challenge

Reaction is a real-time PvP game where players cast spells that place magical runes on a grid. These runes transform the terrain according to rule-based systems.

The core technical challenge: simulate thousands of interacting tiles at 60 FPS while allowing complex spell interactions that feel responsive and fair.

## System Requirements

**Performance Goal**: High performance with many active tiles

**Determinism**: Identical inputs produce identical outputs (essential for fair PvP)

**Responsiveness**: Spell casting feels immediate despite complex backend processing

**Extensibility**: New spells and tile interactions can be added without engine rewrites

## Module Architecture

The system separates concerns into focused, loosely-coupled modules:

### Core Engine Module
**Purpose**: Central coordination and tile data management.

**Responsibilities**:
- Bit-packed tile storage across 4 layers (Ground, Object, Air, Rune)
- GPU texture management with ping-ponging (enables GPU modules to read from stable data while writing to separate textures, avoiding read-after-write hazards) for race-condition prevention
- Active region optimization (32×32 chunks - chosen to balance GPU workgroup efficiency with memory overhead)
- Frame execution pipeline coordination

**Dependencies**: WebGPU API

### Spell System Module
**Purpose**: Player-controlled spellcasting and resource management.

**Responsibilities**:
- Mana flower economy and recharge timers
- Spell validation and execution
- Rune lifecycle management (placement, delay, triggering, combinations)
- Deck building and curse system
- Player customization options

**Dependencies**: Core Engine (for rune placement)

**Processing**: Initially chosen for CPU because it handles direct player input. This choice may be revisited during implementation.

### Physics Engine Module
**Purpose**: GPU-accelerated tile movement and collision simulation.

**Responsibilities**:
- Velocity-based tile movement
- Collision detection and response
- Force application from runes and environment
- Layer interaction physics (falling, bouncing)

**Dependencies**: Core Engine (texture coordination)

**Processing**: GPU compute shaders with hardcoded physics rules

**Note**: Frame rate coordination approach proposed in [cross-reference:: [[data-flow|data-flow.md]]] - implementation and effectiveness TBD

### Reaction Engine Module
**Purpose**: Rule-based environmental transformations.

**Responsibilities**:
- JSON rule compilation to optimized GPU shaders
- Competitive rule scoring and execution
- Environmental pattern matching (fire spreading, etc.)
- Optimization pipeline (specific implementation TBD)

**Dependencies**: Core Engine (texture access), Build toolchain

**Processing**: GPU compute shaders with compiled rules

**Note**: The rule compilation pipeline allows simple code generation with sophisticated optimization. Alternative approaches welcome if simpler.

### Renderer Module
**Purpose**: Visual display and user interface.

**Responsibilities**:
- Multi-layer world rendering
- UI elements (mana flowers, spell hand)
- Visual effects and animations
- Camera and viewport management

**Dependencies**: Core Engine (tile data access)

**Processing**: GPU rendering pipeline

### Tools Module
**Purpose**: Development and debugging utilities.

**Responsibilities**:
- Visual rule editor with grid-based interface
- Debug overlays and tile inspection
- Performance profiling and rule tracing
- Asset validation and testing tools

**Dependencies**: All modules (for debugging access)

## Data Flow Architecture

**⚠️ PROPOSED ARCHITECTURE**: A Deterministic Time-Sliced Execution approach has been proposed for variable timing and multiplayer synchronization. See [cross-reference:: [[data-flow|data-flow.md]]] for proposed pipeline details - implementation and validation TBD.

## Technical Implementation

### Tile Storage Format
See [cross-reference:: [[tile-storage|tile-storage.md]]] for complete tile format and layer architecture details. Specific bit allocation TBD during implementation.

### Performance Optimizations
See [cross-reference:: [[performance|performance.md]]] and individual system documentation for specific optimization strategies.

### Player Customization
See [cross-reference:: [[gameplay|gameplay mechanics]]] for complete gameplay mechanics and customization systems.

## Development Workflow

### Rule Creation Pipeline
1. **Visual Editor**: Grid-based rule design interface
2. **JSON Export**: Human-readable rule definitions
3. **Compilation**: Automatic shader generation and optimization
4. **Testing**: Live rule testing and validation
5. **Integration**: Hot-reload in development builds

### Debugging and Analysis
- **Tile Inspector**: Real-time tile data examination
- **Rule Tracer**: Understand why specific rules activated
- **Performance Overlay**: Monitor frame timing and bottlenecks
- **Determinism Validation**: Verify identical execution across runs

## Risk Management and Constraints

### Technical Constraints
**Tile Types**: ~64 per layer (chosen to be comfortably under realistic limits)

**World Size**: Fixed at initialization (no dynamic streaming)

**Mana Types**: 8 maximum (player state buffer constraint)

**Spell Hand**: Size TBD based on UI and gameplay needs

### Risk Mitigation
**Performance Degradation**: Automated benchmarks prevent optimization regressions

**Rule Complexity**: Visual editor prevents impossible shader compilation

**Determinism**: Strict execution ordering and integer-only mathematics

**Toolchain Stability**: Containerized build environment for consistent results