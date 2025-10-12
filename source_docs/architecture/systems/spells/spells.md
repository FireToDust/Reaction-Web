---
tags:
  - Navigation
---

# Spell System

Player-controlled spellcasting, mana management, and rune interactions.

## System Overview

Player-controlled spellcasting with resource management and rune interactions.

**Design Goal**: CPU-based processing allows flexible spell logic without GPU shader constraints.

## Core Responsibilities

- **Mana flower economy** and recharge timers
- **Spell validation** and execution
- **Rune lifecycle management** (placement, delay, triggering, combinations)
- **Deck building** and curse system
- **Player customization** options

## Navigation

### Core Components
- [**Mana System**](mana-system.md) - Flower economy and recharge mechanics
- [**Spells and Runes**](spells-and-runes.md) - Casting mechanics and rune lifecycle
- [**Customization**](customization.md) - Deck building and curse system
- [**CPU Architecture**](cpu-architecture.md) - Processing model and integration

## Key Mechanics

See individual component documentation for detailed mechanics:
- [Mana System](mana-system.md) - Resource management and recharge cycles
- [Spells and Runes](spells-and-runes.md) - Casting mechanics and rune interactions

## Customization Features  

### Deck Building
- **Pre-game Selection**: Choose spells from available collection
- **Deck Constraints**: ⚠️ **NEEDS DISCUSSION** - Specific deck building rules TBD
- **Spell Relationships**: ⚠️ **SUGGESTION** - Consider thematic spell interactions

### Curse System  
- **Risk/Reward**: Power vs. risk trade-offs
- **Build Balance**: ⚠️ **NEEDS DISCUSSION** - Balance between pure and cursed builds
- **Implementation**: ⚠️ **NEEDS DESIGN** - Specific curse mechanics and effects

## Processing Model

**CPU-Only Design**: See [cross-reference:: [[technical-decisions]]] for processing architecture rationale.

### Integration Points
- **Core Engine**: Direct texture writes to rune layer [Key:: Value]
- **Physics Engine**: Queue forces for tile movement
- **Player Input**: Immediate response to spell casting actions

## Dependencies
- **Core Engine**: Required for rune placement and tile data access
- **User Interface**: Integration with spell hand and mana flower display