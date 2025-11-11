---
status: stub
tags:
  - Reference
  - Implementation
todo:
  - "[implementation] List all data fields needed in GPU shader passes"
  - "[implementation] Determine bit allocation for each field"
  - "[implementation] Calculate total storage requirements per object"
  - "[implementation] Optimize bit-packing to minimize texture memory usage"
  - "[discussion] Determine timer type bit count based on number of timer types needed"
  - "[discussion] Determine timer value bit count based on maximum time duration needed"
---

# Shader Data Layout

Central tracking document for all data stored in GPU shader passes and bit allocation for each field.

## Purpose

This document tracks all fields that need to be stored in GPU textures for physics, reactions, and rendering systems. Once all requirements are gathered, bit allocations will be determined to optimize texture memory usage.

## Object Data Fields

### Position
- Hex cell coordinates (q, r)
- Sub-grid offset (x, y) - fixed-point

### Velocity
- Velocity vector (x, y) - fixed-point

### Type and Properties
- Object type ID
- Mass (may be computed from type instead of stored)
- Layer (Ground/Object/Air)

### Timer System
- Timer type (number of bits TBD - depends on number of timer types)
- Timer value (number of bits TBD - count-up timer, max duration TBD)

### Flags
- Object exists flag
- (Additional flags TBD)

## Bit Allocation

**⚠️ TODO**: Determine bit counts for each field once all requirements are gathered.

## Total Storage Requirements

**⚠️ TODO**: Calculate total bits per object and optimize packing strategy.

## Related Systems

- **Physics**: Position, velocity, mass - see [cross-reference:: [[movement-system|Movement System]]]
- **Reactions**: Timer type, timer value, type transformations - see [cross-reference:: [[reactions|Reaction System]]]
- **Rendering**: All data for visual representation - see [cross-reference:: [[rendering|Rendering]]]
