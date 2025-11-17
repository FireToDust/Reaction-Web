---
status: approved
tags:
  - Navigation
warnings:
  - "[outdated] Previously mentioned CPU-only design - now fully GPU-accelerated"
---

# Spell System

GPU-accelerated spellcasting with 26-element magic system, mana flower economy, slot/pool casting interface, and deck customization.

## System Overview

Player-controlled spellcasting creates runes on the game world through geometric element combinations, resource management, and strategic deck building.

**Processing**: Fully GPU-accelerated (shape evaluation, element combination, rune lifecycle)

**Core Systems**: Elements (26), Mana (6 flowers), Casting (slot/pool), Runes (lifecycle), Deck Building (singleton)

## Navigation

### Core Components

- [[element-system|Element System]] - 26 elements in cube/octahedron structure
- [[element-effects|Element Effects]] - What each element does (forces, transformations, passives)
- [[mana-system|Mana System]] - 6 flower types with recharge and conversion
- [[spells-and-runes|Spells and Runes]] - Casting interface and rune lifecycle
- [[deck-building|Deck Building]] - Deck rules and pre-match construction
- [[customization|Customization]] - Curse system and build options
- ~~[[cpu-architecture|CPU Architecture]]~~ - Outdated, system now GPU-accelerated

### Related Systems

- [cross-reference:: [[../physics/spell-integration|Spell Integration]]] - How spells affect physics layer
- [cross-reference:: [[../core/core|Core Engine]]] - Texture management and layer coordination

## Integration Points

**Physics Engine**: Spells apply forces and trigger tile transformations - see [cross-reference:: [[../physics/spell-integration|Spell Integration]]].

**Core Engine**: Manages spell layer texture for GPU processing.

**UI System**: Displays casting slots/pools, mana flower availability, targeting overlay, and deck builder interface.

## Implementation Status

**Documented**:
- Element system (26 elements, cancellation rules)
- Mana system (6 flowers, recharge, conversion)
- Casting interface (slot/pool, actions, cooldown)
- Rune lifecycle (placement, delay, trigger, combination)
- Deck building rules (minimum size, singleton, reshuffle)

**Needs Design**:
- Specific spell shape primitives
- Void rune effects
- Single element rune additional effects
- Curse system mechanics
- Spell acquisition/progression system
- Line of sight obstruction rules
- Number of casting slots/pools

---

**Entry Point**: Start with [[element-system|Element System]] to understand the foundational magic structure.
