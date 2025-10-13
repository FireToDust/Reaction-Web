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
**Spell System**: Initially chosen for CPU because it handles direct player input and seemed more straightforward to implement. This choice may be revisited during implementation.

**Physics Engine**: GPU compute shaders with hardcoded physics rules
**Rationale**: High parallelization needs for tile movement and collision detection

**Reaction Engine**: GPU compute shaders with compiled rules  
**Rationale**: Complex rule evaluation benefits from parallel processing

### Frame Pipeline Order
**Decision**: Input → Physics → Runes → Reactions → Render
**Rationale**: Ensures deterministic execution and proper data dependencies
**⚠️ UNSOLVED**: Timing coordination between systems at different frequencies

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
**Decision**: 32×32 tile chunks for processing optimization
**Rationale**: Balances GPU workgroup efficiency with memory overhead
**Alternative Sizes Considered**: 16×16 (too small), 64×64 (too large for cache)

### Rule Compilation Strategy
**Decision**: JSON rules → GPU shaders via offline compilation
**Rationale**: Move computational work to build time for runtime performance
**⚠️ NOTE**: Alternative approaches may be considered during implementation

## Resource Management Decisions

### Mana Flower Economy
**Decision**: 3-turn recharge cycle with unlimited regeneration
**Rationale**: Balances spell casting incentive vs strategic saving
**Alternative Considered**: Scarcity-based system - rejected for pacing concerns

**Decision**: 2:1 mana flower trading removed
**Rationale**: Simplified resource management model

### Tile Type Limits
**Decision**: ~64 tile types per layer
**Rationale**: Chosen to be comfortably under realistic GPU and memory limits
**Constraint**: Leaves room for expansion without architectural changes

## Performance Constraint Decisions

### Determinism Requirements
**Decision**: Identical inputs must produce identical outputs
**Rationale**: Essential for fair PvP gameplay
**Implementation**: Integer-only mathematics, strict execution ordering
**⚠️ CHALLENGE**: GPU thread execution order is not inherently deterministic

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

2. **GPU Determinism**: Specific approach to ensure consistent thread execution order?

3. **Rule Compilation Pipeline**: Exact toolchain and optimization steps?

4. **Spell Hand Size**: UI and gameplay constraints on number of spells available?

5. **World Size Limits**: Performance testing needed to determine optimal map dimensions?

6. **Build System Integration**: How rule compilation integrates with main build process?