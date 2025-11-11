---
status: approved
tags:
  - Architecture
todo:
  - "[discussion] Maximum deck size limits"
  - "[discussion] Spell acquisition and progression system"
---

# Deck Building

Pre-match deck construction with singleton format, infinite reshuffle, and mana flower conversion.

## Core Deck Rules

**Minimum Size**: 6 × number of casting pools
- Example: 4 pools requires minimum 24 spells
- Ensures sufficient variety for pool cycling

**Singleton Format**: No duplicate spells
- Maximum 1 copy of each spell in deck
- Prevents single-spell spam strategies

**Maximum Size**: ⚠️ **NEEDS DISCUSSION** - Should there be a deck size cap?

**Infinite Reshuffle**: Deck never depletes
- Automatically reshuffles when exhausted
- All spells remain available throughout match

## Pre-Match Construction

**Timing**: Deck built before match starts in pre-game lobby

**Construction Steps**:
1. Select spells from player's collection
2. Configure mana flower conversion (see [cross-reference:: [[mana-system|Mana System]]])
3. Validate deck meets minimum size
4. Enter match with finalized configuration

**Immutable**: Deck and flower configuration cannot change during match

## Flower Conversion

Flower conversion details in [cross-reference:: [[mana-system|Mana System]]].

**Mechanic**: Lose 2 flowers → gain 1 flower of chosen type

**Purpose**: Specialize flower distribution to match deck's element composition

**Trade-off**: More specialized casting capability at cost of total flower capacity

**Examples**:
- Fire-focused deck: Convert toward Chaos/Creation flowers
- Balanced deck: Use default 3-3-3-3-3-3 allocation

## Element and Spell Availability

**Element Access**: All 26 elements accessible from game start (see [cross-reference:: [[element-system|Element System]]])
- No progression gate on element types
- Base, dual, and triple elements all available

**Spell Acquisition**: ⚠️ **NEEDS DESIGN** - How players acquire spells for collection
- Spells are collectible (specific system TBD)
- Element availability ≠ spell availability
- Strategic depth from spell variety, not element unlocks
