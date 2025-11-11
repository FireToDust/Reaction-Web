---
status: approved
tags:
  - Architecture
warnings:
  - "[outdated] All fire/water/earth/air references removed - replaced with 6-element system"
todo:
  - "[discussion] Flower recharge timing balance - 3-turn cycle interaction with action cooldown"
---

# Mana System

Resource economy based on 6 elemental flower types with individual flower tracking and strategic conversion mechanics.

## Flower Types

**6 Base Element Flowers**: Each flower type corresponds to a base element from [cross-reference:: [[element-system|Element System]]]:

- **Order Flowers**
- **Chaos Flowers**
- **Creation Flowers**
- **Destruction Flowers**
- **Spirit Flowers**
- **Form Flowers**

**Default Allocation**: 3 of each type (18 total)

**Individual Tracking**: Each flower has independent recharge state and cooldown.

## Recharge Mechanics

**Duration**: 3 turns per flower

**Individual Cooldowns**: Each flower tracks its own timer independently.

**Recharge Behavior**:
- ✅ Cast spell: Flowers recharge normally
- ✅ Load spell: Flowers recharge normally
- ✅ Movement: Flowers recharge normally
- ❌ Refresh pools: Flowers do NOT recharge (strategic penalty)

**Unlimited Regeneration**: Flowers always regenerate. Never permanently lost during match.

## Spell Costs

**Flexible Costs**: Spells require specific combinations and quantities of flower types.

**Examples**:
- Basic Fire spell: 1 Chaos + 1 Creation
- Powerful Fire spell: 3 Chaos + 2 Creation
- Life spell: 1 Order + 1 Creation + 1 Spirit

**Validation**: All required flowers must be available (not recharging) to cast spell.

**Cost-Power Relationship**: Higher costs = more powerful spells. Specific costs TBD through playtesting.

## Flower Conversion

**When**: During deck building phase (before match starts)

**Operation**: Lose 2 flowers → gain 1 flower of chosen type

**Irreversible**: Conversion affects starting flower configuration for that match.

**Purpose**: Specialize flower distribution to match deck element composition.

**Trade-off**: Increased element focus at cost of total capacity and flexibility.

## Related Systems

[cross-reference:: [[element-system|Element System]]] - Spell costs require combinations matching element structure (dual elements = 2 flower types, triple elements = 3 flower types)

[cross-reference:: [[spells-and-runes|Spells and Runes]]] - Refresh action uniquely prevents flower recharge during cooldown

[cross-reference:: [[deck-building|Deck Building]]] - Flower conversion configured during deck construction
