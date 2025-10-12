---
status: outdated
warnings:
  - "OUTDATED DOCUMENT: Physics system has been updated and this document no longer reflects current architectural direction"
  - "NEEDS TEAM DISCUSSION: Optimal time slice count (8 vs 4 vs 16)"
  - "NEEDS TEAM DISCUSSION: Performance impact of deterministic GPU ordering"
  - "NEEDS TEAM DISCUSSION: Ghost simulation complexity vs performance trade-offs"
---

# Data Flow Architecture

**⚠️ OUTDATED DOCUMENT**: This document describes a previously proposed Deterministic Time-Sliced Execution pipeline. The physics system has been updated and this document no longer reflects the current architectural direction. This document will be rebuilt to match the current physics system approach.

## Pipeline Overview: Deterministic Time-Sliced Execution

The new pipeline subdivides each 60 FPS frame into 8 time slices, enabling variable player action timing while maintaining perfect determinism for multiplayer.

### Key Innovation
- **Frame Duration**: 16.67ms (60 FPS)
- **Time Slices**: 8 slices per frame (2.08ms each)
- **Variable Timing**: Different systems execute at different slice intervals
- **Deterministic Order**: All processing uses strict spatial/temporal ordering

## Frame Execution Pipeline

Each frame processes 8 time slices in deterministic order:

### Time Slice Processing (Repeated 8x per frame)
1. **Scheduled Action Processing**: Execute player actions based on individual timing
2. **Mana Recharge Processing**: Fixed 3-action interval regardless of player speed
3. **Physics Processing**: Every slice for 60 FPS smooth motion
4. **Reaction Processing**: Less frequent, deterministic intervals
5. **Ghost Prediction Updates**: Maintain 3-action lookahead for all players

### Frame Completion
- **State Snapshot**: Save complete game state for rollback/networking
- **Network Delta Generation**: Create compressed updates for multiplayer
- **Validation**: Verify deterministic execution consistency

## Variable Timing System

### Player Action Scheduling
- **Base Interval**: 8 time slices (normal speed)
- **Speed Multipliers**: Status effects modify timing (0.5x = slowed, 2x = hasted)
- **Immediate Application**: Speed changes affect next scheduled action
- **Deterministic Order**: Players processed by ID for consistent results

### Mana Recharge Timing
- **Fixed Schedule**: 24 time slices (3 base actions) regardless of player speed
- **Strategic Consistency**: Mana timing remains constant tactical element
- **Independent Processing**: Separate from player action timing

### Action Queue Management
- **3-Action Lookahead**: Players maintain queue of upcoming actions
- **Ghost Predictions**: Visual preview of queued actions
- **Queue Validation**: Invalid actions automatically replaced

## Deterministic Execution Framework

### GPU Determinism Strategy
- **Spatial Ordering**: Process tiles in strict top-left to bottom-right order
- **Chunk Processing**: Handle 32×32 chunks in deterministic sequence
- **Integer Mathematics**: Fixed-point arithmetic prevents floating-point drift
- **Synchronization Barriers**: GPU compute barriers ensure execution order

### Cross-Platform Consistency
- **Deterministic Math Library**: Custom integer-only calculations
- **Hardware Independence**: Identical results across GPU architectures
- **Validation Testing**: Automated cross-platform determinism verification

## State Management Integration

### Unified State System
- **Single Pipeline**: Same engine for single-player and multiplayer modes
- **State Snapshots**: Automatic frame-based state saving
- **Rollback Capability**: Support for multiplayer prediction correction
- **Network Synchronization**: Frame-based state delta compression

### Multiplayer Integration
- **Client Prediction**: Local state prediction with server validation
- **Rollback Recovery**: Automatic correction on server mismatch
- **Network Protocol**: Frame-synchronized state updates
- **Ghost Simulation**: Predictive action visualization

## Performance Optimizations

### Time Slice Efficiency
- **Selective Processing**: Only active systems process each slice
- **GPU Batching**: Maintain efficient compute shader dispatches
- **Memory Coherence**: Optimize texture access patterns
- **Chunk Activation**: Process only regions with activity

### Scalability Considerations
- **Adaptive Frequencies**: Reduce reaction frequency under load
- **Prediction Caching**: Cache ghost simulations for performance
- **Network Efficiency**: Delta compression minimizes bandwidth
- **State Cleanup**: Automatic old state garbage collection

## Navigation

### Detailed Implementation
- [cross-reference:: [[deterministic-execution|Deterministic Execution]]] - GPU determinism and cross-platform consistency
- [cross-reference:: [[variable-timing|Variable Timing System]]] - Time slice scheduling and player action management
- [cross-reference:: [[state-management|State Management]]] - Snapshots, rollback, and multiplayer synchronization
- [cross-reference:: [[ghost-simulation|Ghost Simulation]]] - Predictive action visualization system

**⚠️ NEEDS TEAM DISCUSSION**: 
- Optimal time slice count (8 vs 4 vs 16)
- Performance impact of deterministic GPU ordering
- Ghost simulation complexity vs performance trade-offs