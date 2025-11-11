---
status: proposed
tags:
  - Architecture
todo:
  - "[discussion] Curse system implementation details"
  - "[discussion] Curse stacking rules and limits"
---

# Customization Systems

Player customization through deck building and optional curse mechanics.

## Deck Building

Deck building is the primary customization system. See [cross-reference:: [[deck-building|Deck Building]]] for complete rules.

**Key Decisions**:
- Spell selection from collection
- Mana flower conversion to match deck composition (see [cross-reference:: [[mana-system|Mana System]]])
- Element focus vs diverse coverage

## Curse System

⚠️ **NEEDS DESIGN**: Curse system implementation details TBD.

### Design Philosophy

**Risk/Reward**: Cursed builds offer advantages with meaningful drawbacks

**Optional**: Curses are optional - pure builds remain viable

**Build Diversity**: Support multiple viable build approaches

### Implementation Questions

⚠️ **NEEDS SPECIFICATION**:
- Curse selection mechanics
- Stacking rules (can multiple curses be combined?)
- Activation conditions and triggers
- Balancing approach between pure and cursed builds
- Integration with deck building and flower conversion
