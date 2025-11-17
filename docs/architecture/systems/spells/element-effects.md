---
status: proposed
tags:
  - Architecture
  - Implementation
  - Reference
todo:
  - "[design] Define force types and magnitudes for all 26 elements"
  - "[design] Define tile transformation effects for double-element spells"
  - "[design] Define passive modifications for triple-element spells"
  - "[discussion] Determine which elements use impulse vs velocity-set forces"
warnings:
  - "[proposed] Element effects are design proposals awaiting gameplay testing"
---

# Element Effects

Catalog of all 26 spell elements and their effects on physics and tiles.

## Overview

Each element determines how a spell affects the game world. Elements are organized in a geometric structure (core, single-axis, double-axis, triple-axis) and combine through cancellation rules.

See [[element-system|Element System]] for structure and cancellation mechanics.

## Effect Categories

### Core Elements (1 element)
**Properties**: No directional component, neutral/null element.

**Force Effects**: ⚠️ **TBD** through spell system design.

**Transformation Effects**: ⚠️ **TBD** through spell system design.

### Single-Axis Elements (6 elements)
**Properties**: Pure directional elements along three axes (hot/cold, kinetic/static, light/dark).

**Force Effects**: ⚠️ **TBD** - May provide basic force application.

**Transformation Effects**: ⚠️ **TBD** - Single-element transformation capabilities.

### Double-Axis Elements (12 elements)
**Properties**: Combination of two axis components (e.g., hot+kinetic, cold+light).

**Primary Duty**: Most double-element spells provide BOTH force application AND tile transformations.

**Force Types**: ⚠️ **NEEDS SPECIFICATION** - Impulse vs velocity-set per element.

**Transformation Effects**: ⚠️ **NEEDS SPECIFICATION** - Tile type changes triggered by spell.

### Triple-Axis Elements (6 elements)
**Properties**: Combination of all three axis components.

**Primary Duty**: Passive modifications to physics behavior.

**⚠️ TODO**: Triple-element spells will provide passive modifications to reactions and forces for their duration.

**Design Intent**: Global or area-of-effect modifiers to game rules while spell is active.

**Examples** (speculative): Modify force strengths, alter reaction rates, change timer behaviors.

### Null/Core Element (1 element)
**Properties**: Absence of all axes, neutral element.

**Special Role**: ⚠️ **TBD** - May have unique mechanics or serve as cancellation result.

## Force Application Methods

### Impulse Forces
**Method**: Add velocity delta to current object velocity.

**Application**: Δv applied once when spell contacts object.

**Use Cases**: Push, pull, explosion effects.

**Elements**: ⚠️ **NEEDS SPECIFICATION** - Which elements use impulse method?

### Velocity-Set Forces
**Method**: Directly replace object velocity with spell-specified value.

**Application**: Overrides current velocity entirely.

**Use Cases**: Wind, flow, directional movement effects.

**Elements**: ⚠️ **NEEDS SPECIFICATION** - Which elements use velocity-set method?

### Mass Consideration
**⚠️ NEEDS DISCUSSION**: Do spell forces ignore mass (magical effects) or respect mass (physical forces)?

**Impact**: Determines if heavy objects respond same as light objects to spells.

## Tile Transformation Effects

### Double-Element Transformations
**Trigger**: When double-element spell activates on a tile.

**Process**: Tile type changes based on spell elements and current tile type.

**Rule Source**: Transformation rules defined per element combination.

**⚠️ NEEDS SPECIFICATION**: Complete mapping of element combinations to tile transformations.

**Examples** (speculative):
- Fire element: Transform wood → burning wood → ash
- Ice element: Transform water → ice
- Earth element: Create/modify terrain

### Integration with Reactions
**Coordination**: Spell transformations may interact with reaction system environmental effects.

**Rule Separation**: Spell-triggered transformations separate from physics-driven reactions.

See [cross-reference:: [[physics/spell-integration|Spell Integration]]] and [cross-reference:: [[physics/reactions|Reactions]]].

## Passive Modifications (Triple-Element)

**⚠️ TODO**: Design passive modification system for triple-element spells.

**Duration**: Modifications active while spell is present.

**Scope**: May affect global rules or localized area.

**Potential Effects**:
- Modify force strengths (amplify/dampen collision, cohesion, spell forces)
- Alter reaction rates (speed up/slow down environmental reactions)
- Change timer behaviors (faster burning, slower freezing, etc.)
- Modify mass response (objects lighter/heavier under effect)

## Element Catalog

**⚠️ NEEDS COMPLETION**: Catalog all 26 elements with specific effects.

### Structure Reference
The 26 elements are organized as:
- 1 Core (null)
- 6 Single-axis (hot, cold, kinetic, static, light, dark)
- 12 Double-axis (all pairwise combinations of opposite axes)
- 6 Triple-axis (hot/cold + kinetic/static + light/dark combinations)
- 1 Null (three cancellations)

See [[element-system|Element System]] for complete structure and cancellation rules.

## Design Considerations

### Element Distinctiveness
**Goal**: Each element should feel unique and have clear gameplay identity.

**Balance**: Elements should be roughly balanced in power/utility.

**Synergy**: Element combinations should create interesting strategic choices.

### Force Magnitudes
**Tuning**: Force strengths will require gameplay testing and iteration.

**Configuration**: Expose force values as tunable parameters.

**Variation**: Different elements may have different force strengths for balance.

### Transformation Design
**Clarity**: Players should understand what each element does to tiles.

**Consistency**: Similar elements should have thematically consistent effects.

**Balance**: Transformation effects balanced against force effects for double-elements.

## Integration Points

### Spell System
[[element-system|Element System]] - Structure and cancellation rules

[[spells-and-runes|Spells and Runes]] - How elements are cast and combined

### Physics Integration
[cross-reference:: [[physics/spell-integration|Spell Integration]]] - How elements affect physics layer

[cross-reference:: [[physics/reactions|Reactions]]] - Interaction with reaction system

## Implementation Status

**Current State**: Structure defined, specific effects TBD through design process.

**Next Steps**:
1. Define force type (impulse/velocity-set) for each element
2. Specify force magnitudes for gameplay testing
3. Design tile transformation rules for double-elements
4. Design passive modification system for triple-elements
5. Iterate through playtesting and balance
