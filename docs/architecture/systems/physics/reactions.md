---
tags:
  - Navigation
status: proposed
todo:
  - "[design] Change combinations so second overlap prevents creation (no triple+ combinations)"
  - "[design] Design cross-layer object creation during reactions"
  - "[implementation] Build hashmap structure for combination reactions (type pairs -> new type)"
  - "[implementation] Design search tree for environmental reaction lookups"
  - "[discussion] Define all timer types needed (burning, freezing, electrified, etc.)"
  - "[discussion] Define all reaction rules (combinations and environmental)"
---

# Reaction System

Type transformations triggered by object combinations, environmental interactions, and timers.

## Overview

The reaction system determines how objects transform when they combine, interact with neighbors, or reach timer thresholds. Reactions are tightly integrated with physics, running every physics frame within the same GPU passes.

## Reaction Triggers

### Combination Reactions

**When**: Objects merge during physics overlap passes when distance < d.

**Lookup**: Hashmap mapping object type pairs to new types: `(type_a, type_b) -> new_type`

**Multiple Objects**: When 3+ objects combine, only pairs are considered (see todo for preventing triple combinations).

**Timer Reset**: All transformations reset the object's timer.

### Environmental Reactions

**When**: Every physics frame during "Apply Forces + Move" pass.

**Gather-Based**: Each object checks its two-layer hex neighborhood for nearby types.

**Lookup**: Search tree structure maps neighborhood patterns to reactions.

**Range**: Uses same two-layer hex range (sqrt(7)d/2 - d) as force calculations.

**Example**: Wood object detects nearby fire → increases heat timer.

### Timer Reactions

**When**: Timer value reaches threshold for transformation.

**Exclusive Timers**: Each object has one active timer (saves memory).

**Timer Types**: Burning, freezing, electrified, etc. (exact types TBD).

**Timer Modifications**: Environmental reactions can increase/decrease/reset timer values or swap timer types.

**Transformations**: When timer reaches threshold, object type transforms based on timer type.

## Timer System

### Timer Structure

**Timer Type**: Limited set of timer types (bit count TBD - see [cross-reference:: [[shader-data-layout|Shader Data Layout]]]).

**Timer Value**: Count-up timer (bit count TBD).

**Exclusive**: Only one active timer per object to minimize storage.

**Reset on Transformation**: All type transformations reset timer to zero.

### Timer Modifications

**Increase/Decrease**: Environmental reactions modify timer value.

**Type Swap**: Reactions can change which timer type is active.

**Threshold Check**: When timer value exceeds threshold, transformation triggers.

**Examples**:
- Wood near fire → heat timer increases → at threshold, wood transforms to fire
- Water near fire → fire timer decreases → at threshold, fire extinguishes

## Environmental Reaction Mechanics

### Neighbor Checking

**Gather Pattern**: Each object examines its two-layer hex neighborhood.

**Search Tree Lookup**: Neighbor configuration maps to reaction data via search tree.

**Reaction Data**: Includes timer modifications, type swaps, and transformation rules.

**Combined Effects**: Neighbor combinations may have distinct reactions (not independent).

### Reaction Application

**Current State**: Object considers its current timer type and value.

**Neighbor Pattern**: Looks up reaction based on nearby object types.

**Modifications**:
- Swap timer type
- Set timer value
- Increase/decrease timer value
- Immediate type transformation (if applicable)

**Example**: Wood object with heat timer near fire → heat timer increases by X per frame.

## Cross-Layer Object Creation

**⚠️ TODO**: Design how reactions can create objects on different layers.

**Constraint**: Maintain one-object-per-cell guarantee within each layer.

**Possibility**: Object on one layer creates object on different layer in same or neighboring cell.

**Use Case**: Fire (air layer) creating ash (ground layer), explosions creating debris, etc.

## Hashmap Structure

### Combination Reactions

**Key**: Ordered or unordered pair of object types `(type_a, type_b)`.

**Value**: New object type after combination.

**Properties**: New object inherits mass from type, velocity from mass-weighted average.

**Element Handling**: If types have elements, use element combination rules.

## Integration with Physics

### Same GPU Passes

**Apply Forces + Move**: Environmental reactions happen during force application.

**Overlap Passes**: Combination reactions happen during object merging.

**Set Grid Position**: Reactions complete before grid position updates.

**Frequency**: Reactions run every physics frame (60fps).

### Shader Integration

**Shared Neighborhood**: Use same two-layer hex data loaded for forces.

**Combined Shaders**: Environmental reactions integrated into force application shader.

**Memory Efficiency**: Reuse neighborhood cache for both forces and reactions.

**Details**: See [cross-reference:: [[gpu-shaders|GPU Shaders]]] for implementation.

## Transformation Types

### Type Change

**Basic**: Object type changes (e.g., wood → fire).

**Properties Updated**: Mass and other properties update based on new type.

**Timer Reset**: Timer returns to zero on transformation.

### Object Destruction

**Removal**: Object not output to next pass, removed from simulation.

**Use Case**: Fire extinguished by water, objects consumed by reactions.

### Object Creation (Future)

**⚠️ TODO**: Cross-layer creation design needed.

**Constraint**: Respect one-per-cell within each layer.

**Examples**: Fire creating smoke, explosions creating particles.
