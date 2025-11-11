---
todo:
  - "[discussion] Specific mass values for different tile types in collision physics"
  - "[discussion] Frame rate coordination between physics, reactions, and rendering"
---

# Technical Decisions

Design choices, rationale, and alternative approaches considered during Reaction v2 architecture.

## Core Architecture Decisions

### Modular Design Choice
**Decision**: Separate concerns into focused, loosely-coupled modules
**Rationale**: Enables independent development and testing of complex systems
**Alternative Considered**: Monolithic architecture - rejected for maintainability concerns

### WebGPU Selection
**Decision**: WebGPU-based processing for physics, reactions, and rendering
**Rationale**: Required performance for thousands of interacting tiles at 60 FPS
**Trade-offs**: Added complexity vs. performance requirements

## Processing Model Decisions

### CPU Vs GPU Assignment
**Spell System**: GPU compute shaders for shape evaluation, element combination, and rune lifecycle
**Rationale**: Consistency with physics/reaction systems, parallel evaluation, deterministic combination results
**Alternative Considered**: CPU processing - rejected for performance at scale and system consistency

**Physics Engine**: GPU compute shaders with hardcoded physics rules
**Rationale**: High parallelization needs for tile movement and collision detection
**Update**: Physics now includes **mass-based collisions** with momentum transfer for realistic tile interactions

**Reaction Engine**: GPU compute shaders with compiled rules
**Rationale**: Complex rule evaluation benefits from parallel processing

### Frame Pipeline Order
**Decision**: Input → Physics → Runes → Reactions → Render
**Rationale**: Ensures deterministic execution and proper data dependencies
**⚠️ UNSOLVED**: Timing coordination between systems at different frequencies

### Determinism Approach
**Decision**: Simultaneous single-read/single-write GPU passes with deterministic internal rules
**Rationale**: Achieves determinism without complex spatial ordering or thread synchronization
**Alternatives Considered**: Spatial ordering strategy - rejected for complexity

## Data Storage Decisions

### Bit-Packed Tile Format
**Decision**: 32-bit integers with packed tile data
**Rationale**: GPU cache efficiency and memory bandwidth optimization
**⚠️ NOTE**: Specific bit allocation TBD during implementation. See [tile-storage.md](../systems/core-engine/tile-storage.md) for current architectural approach.

### Four-Layer Architecture
**Decision**: Ground, Object, Air, Rune layers
**Rationale**: Clean separation of different tile behaviors and interactions
**Alternative Considered**: Single layer with type flags - rejected for complexity

### Texture Ping-Ponging
**Decision**: Dual texture approach for each layer
**Rationale**: Prevents GPU read-after-write hazards and race conditions
**Trade-off**: Double memory usage for synchronization safety

## Optimization Decisions

### Active Region System
**Decision**: NOT IMPLEMENTING active region optimization
**Rationale**: Implementation deemed too complex for expected benefit; planning for relatively few dormant areas in game design
**~~Alternative Sizes Considered~~**: ~~32×32 tile chunks were originally proposed to balance GPU workgroup efficiency with memory overhead~~
**Status**: All 32×32 chunk references throughout documentation are now outdated

### Rule Compilation Strategy
**Decision**: JSON rules → GPU shaders via offline compilation
**Rationale**: Move computational work to build time for runtime performance
**⚠️ NOTE**: Alternative approaches may be considered during implementation

## Spell System Decisions

### Element System Design
**Decision**: 26 elements organized in cube/octahedron geometric structure
**Rationale**: Intuitive geometric opposition creates natural counter-play, component-level cancellation enables emergent combinations
**Structure**: 6 base + 12 dual + 8 triple elements
**Alternative Considered**: Smaller element set - rejected for strategic depth

### Slot/Pool Casting Interface
**Decision**: N slots + N pools system with three player actions (cast/load/refresh)
**Rationale**: Creates meaningful decisions between immediate casting and deck cycling
**Trade-offs**: Refresh action uniquely prevents flower recharge (strategic cost)
**Alternative Considered**: Traditional hand system - rejected for limited strategic depth

### Spell Shape Representation
**Decision**: Abstract geometric primitives evaluated at runtime in GPU shaders
**Rationale**: Perfect rotational symmetry, minimal memory, flexible design
**Alternative Considered**: Pre-rendered texture system - rejected for memory cost and symmetry concerns

### Deck Building Format
**Decision**: Singleton format (no duplicates) with infinite reshuffle
**Rationale**: Encourages spell variety, prevents deck depletion strategies
**Minimum Size**: 6 × number of pools ensures sufficient variety
**Alternative Considered**: Duplicate limits with deck depletion - rejected for complexity

## Resource Management Decisions

### Mana Flower Economy
**Decision**: 6 flower types matching base elements with 3-turn recharge cycle
**Rationale**: Direct correspondence with element system, individual tracking enables strategic timing
**Default Allocation**: 3 of each type (18 total), unlimited regeneration
**Alternative Considered**: 4-element system (fire/water/earth/air) - rejected for misalignment with element structure

**Decision**: 2:1 flower conversion ratio during deck building
**Rationale**: Enables element specialization at meaningful cost (total capacity reduction)
**Alternative Considered**: No conversion - rejected for limited deck customization

### Tile Type Limits
**Decision**: ~64 tile types per layer
**Rationale**: Chosen to be comfortably under realistic GPU and memory limits
**Constraint**: Leaves room for expansion without architectural changes

## Performance Constraint Decisions

### Determinism Requirements
**Decision**: Identical inputs must produce identical outputs
**Rationale**: Essential for fair PvP gameplay
**Implementation**: Integer-only mathematics, simultaneous single-read/single-write GPU passes with deterministic internal rules
**~~⚠️ CHALLENGE~~**: ~~GPU thread execution order is not inherently deterministic~~ - Addressed through simultaneous read/write pass architecture

### World Size Constraints
**Decision**: Fixed world size at initialization
**Rationale**: Avoids dynamic streaming complexity
**Trade-off**: Limits map variety for implementation simplicity

## Development Workflow Decisions

### Visual Rule Editor
**Decision**: Grid-based rule design interface planned
**Rationale**: Simplifies rule creation and prevents impossible shader compilation
**Status**: Design planned, implementation TBD

### Containerized Build Environment
**Decision**: Use containerized build for consistent results
**Rationale**: Ensures deterministic shader compilation across development environments
**⚠️ STATUS**: Implementation approach needs specification

## Open Questions Requiring Further Decision

⚠️ **Major Design Decisions Still Needed**:

1. **Frame Rate Coordination**: How to handle different update frequencies between physics (60 FPS) and reactions (potentially lower)?

2. **Rule Compilation Pipeline**: Exact toolchain and optimization steps?

3. **World Size Limits**: Performance testing needed to determine optimal map dimensions?

4. **Build System Integration**: How rule compilation integrates with main build process?

**Spell System TBD**:

5. **Number of Casting Slots/Pools**: Using 4 as example, optimal count requires playtesting

6. **Spell Shape Primitives**: Which geometric primitives to support for spell design

7. **Void Rune Effects**: Powerful secret mechanic effects need design

8. **Single Element Rune Effects**: Beyond mana recharge, additional effects TBD

9. **Curse System Implementation**: Mechanics, stacking rules, balancing approach

10. **Spell Acquisition System**: How players unlock/collect spells