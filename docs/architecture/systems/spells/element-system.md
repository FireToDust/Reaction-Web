---
status: approved
tags:
  - Architecture
todo:
  - "[discussion] Void rune effects"
  - "[discussion] Triple element spell niche uses"
---

# Element System

26 elements organized in cube/octahedron geometric structure where opposing elements are geometrically opposite and cancel when combined.

## Structure

**Geometric Foundation**: Elements map onto cube/octahedron vertices (6), edges (12), and faces (8).

**Opposition Principle**: Geometric opposites are element opposites. Opposite elements cancel when combined.

**Total**: 26 elements (6 base + 12 dual + 8 triple)

## Base Elements (6)

Fundamental forces forming three opposing pairs:

- **Order** ↔ **Chaos**
- **Creation** ↔ **Destruction**
- **Spirit** ↔ **Form**

**Usage**: Base elements used as mana costs, rarely appear as standalone spell elements.

## Dual Elements (12)

Combinations of two base elements, forming primary spell types:

| Element | Components | Opposite | Opposite Components |
|---------|-----------|----------|---------------------|
| **Fire** | Chaos + Creation | **Frost** | Order + Destruction |
| **Earth** | Creation + Spirit | **Quake** | Destruction + Form |
| **Storm** | Chaos + Form | **Stasis** | Order + Spirit |
| **Water** | Order + Creation | **Acid** | Chaos + Destruction |
| **Growth** | Creation + Form | **Decay** | Destruction + Spirit |
| **Phantom** | Destruction + Spirit | **Force** | Creation + Form |

**Usage**: Most spells use dual elements. Core gameplay.

## Triple Elements (8)

Combinations of three base elements, forming rare specialized magic:

| Element          | Components                   | Opposite      | Opposite Components          |
| ---------------- | ---------------------------- | ------------- | ---------------------------- |
| **Life**         | Order + Creation + Spirit    | **Death**     | Chaos + Destruction + Form   |
| **Preservation** | Order + Creation + Form      | **Ruin**      | Chaos + Destruction + Spirit |
| **Purity**       | Order + Destruction + Form   | **Madness**   | Chaos + Creation + Spirit    |
| **Entropy**      | Order + Destruction + Spirit | **Maelstrom** | Chaos + Creation + Form      |

**Usage**: Created by rare spells or combination mechanics. Will dramatically change terrain and biome.

## Cancellation Mechanics

**Component-Level**: Elements cancel at base element level according to three opposition pairs.

**Complete Cancellation**: When all components cancel, no rune is created.
- Example: Fire (Chaos+Creation) + Frost (Order+Destruction) = nothing

**Partial Cancellation**: When some but not all components cancel, remaining elements determine result.
- Example: Fire (Chaos+Creation) + Water (Order+Creation) = Creation (single element rune)

**Order Independence**: Combination result is deterministic regardless of evaluation order.

## Special Runes

### Single Element Runes

**Creation**: Partial cancellation between dual elements with one shared component.

**Effect**: Recharge player's mana flowers when triggered.

**Additional Effects**: ⚠️ **TBD**

### Void Rune

**Creation**: Triple element rune + opposite triple element rune on same location.

**Example**: Life (Order+Creation+Spirit) + Death (Chaos+Destruction+Form) = Void

**Discovery**: Not explained in tutorials. Players discover through experimentation.

**Effects**: ⚠️ **NEEDS DESIGN** - Powerful secret mechanic, details TBD.

## Related Systems

[[element-effects|Element Effects]] - What each element does (forces, transformations, passive effects)

[cross-reference:: [[mana-system|Mana System]]] - Flower types match base elements, spell costs require specific combinations

[cross-reference:: [[spells-and-runes|Spells and Runes]]] - Element combinations computed in GPU shaders during rune placement

**Availability**: All 26 elements accessible from game start. No progression gate on element types.
