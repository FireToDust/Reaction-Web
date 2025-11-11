---
status: approved
tags:
  - Architecture
warnings:
  - "[outdated] Previously mentioned CPU processing - now fully GPU-accelerated"
todo:
  - "[discussion] Number of casting slots/pools - using 4 as example, final count TBD"
  - "[discussion] Obstruction checks for line of sight"
  - "[discussion] Specific shape primitives for spell design"
  - "[discussion] Single element rune additional effects beyond mana recharge"
---

# Spells and Runes

Slot/pool casting interface with GPU-accelerated spell shapes, element combinations, and rune lifecycle management.

## Casting Interface

### Slot and Pool System

**Structure**: N casting slots + N casting pools (using 4 as example, final count TBD)

**Starting State**: All slots empty, all pools filled with random spells from deck

### Three Player Actions

**1. Cast Spell** (from filled slot):
- Consumes required mana flowers (see [cross-reference:: [[mana-system|Mana System]]])
- Triggers directional targeting mode
- Slot becomes empty after cast
- Pools unchanged

**2. Load Spell** (pool → empty slot):
- Player selects spell from any pool
- Chosen spell moves to clicked slot
- All pools refill sequentially from deck (see [cross-reference:: [[deck-building|Deck Building]]])
- No mana cost

**3. Refresh Pools**:
- Manually replace all pool spells with new draws from deck
- Triggers action cooldown
- Flowers do NOT recharge during refresh cooldown (unique penalty)

### Action Cooldown

**Universal Cooldown**: Single shared cooldown applies to all three actions

**Movement**: Not affected by action cooldown

**Hold-to-Cast Queueing**: Hold mouse on filled slot during cooldown to queue cast for immediate execution when ready

### Directional Targeting

**Activation**: After clicking cast, enter targeting mode

**Input**: Player clicks direction and distance from avatar

**Placement**: Spell shape centered on clicked location

**Range Limits**: Each spell has maximum range from caster

**Obstruction**: ⚠️ **NEEDS DESIGN** - Line of sight checks TBD

## Spell Shapes

**Design**: Abstract geometric primitives (circles, rectangles, lines, etc.) evaluated at runtime

**Not Textures**: Mathematical definitions, not pre-rendered images

**Evaluation**: GPU compute shaders evaluate shape membership per-pixel

**Primitives**: ⚠️ **NEEDS SPECIFICATION** - Specific primitive set TBD through spell design process

**Shape Components**:
- Position (relative to spell center)
- Rotation and scale
- Element type (from [cross-reference:: [[element-system|Element System]]])
- Force vector
- Delay value

## Rune System

### Rune Lifecycle

1. **Placement**: Spell casting writes runes to rune layer via GPU
2. **Delay Countdown**: GPU shader decrements delay counter each frame
3. **Trigger + Removal**: Simultaneous - apply effects and remove rune when delay reaches zero
4. **Combination**: Multiple runes on same pixel combine before triggering

### Rune Properties

**Element Type**: One of 26 elements (see [cross-reference:: [[element-system|Element System]]])

**Force Vector**: Applied to physics layer when triggered

**Delay Counter**: Frame-based countdown

**Storage**: Per-pixel on dedicated rune layer texture

### Rune Combination

**Timing**: Runes combine when multiple exist on same pixel

**Element Rules**: Uses element system cancellation rules (see [cross-reference:: [[element-system|Element System]]])

**Force Combination**: Vector addition of all force components

**Delay Resolution**: Combined rune uses minimum delay of components

**Trigger Timing**: Combined rune triggers when shortest delay expires

## GPU Processing

**Delay System**: 16-bit looping time counter, runes store target trigger time

**Shape Evaluation**: Compute shaders evaluate abstract primitives per-pixel during spell placement

**Element Combination**: Shader-based component-level cancellation during rune combination

**Cleanup**: Separate shader pass removes triggered runes

**Determinism**: Fixed-point precision, order-independent combination results
