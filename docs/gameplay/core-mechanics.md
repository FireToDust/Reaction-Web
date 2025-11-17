---
todo:
  - "[discussion] Confirm healing mechanics approach (no healing vs tile-based healing zones)"
  - "[discussion] Map size constraints for optimal performance"
---

# Core Mechanics

## Core Game Flow

### Victory Conditions
**Elimination**: Last player standing wins. Players are eliminated when their avatar tile is destroyed.

### Match Structure
**Duration**: Unlimited match length - games end only when elimination occurs
**Player Count**: Variable player count, limited only by performance constraints
**Real-Time Execution**: Continuous simulation

## Player Action System

### Movement and Timing
**Execution Timing**: Player actions execute in real-time
**Status Effects**: Players can be slowed, frozen, or otherwise affected by spells and environment

### Action Flow Pattern
**Player → Spell → World → Player**: Clear action consequence chain
1. Player casts spell
2. Spell affects world tiles and environment
3. World changes affect all players through environmental interactions

## Player Representation

### Avatar System
**Player Tiles**: Players exist as tiles on the object layer
**Physics Only**: Player avatars affected by physics (velocity, collisions, forces) but never transform into other tile types
**Damage System**: Players can take damage and be destroyed but maintain their tile type while alive
**Movement**: Players move using same physics system as other object layer tiles

### Health and Damage
**Damage Sources**: Tiles can deal damage, apply slow effects, or other status conditions to players
**Healing**: Either no healing mechanics, or healing through specific terrain tiles
**Regeneration Strategy**: No health regeneration vs. tile-based healing zones (to be playtested)
**Destruction**: Players eliminated when health reaches zero, but tile type never changes

## World Design

### Map Generation
**Physics-Driven**: Maps generated through built-in physics simulation and tile reactions
**Emergent Terrain**: World evolves naturally through rule-based transformations
**Dynamic Environment**: Continuous world changes create evolving strategic opportunities

### Terrain Strategy
**Strategic Terrain**: Different tile types provide tactical advantages and challenges
**Reactive Tiles**: Special tiles that explode, ignite, or transform when targeted by spells
**Environmental Interactions**: Terrain affects tactical gameplay
**Spell-Terrain Synergy**: Spells designed to interact meaningfully with terrain types

### Map Constraints
**Size**: To be determined through playtesting for optimal performance and gameplay balance
**Performance Scaling**: Map size limited by ability to maintain 60 FPS with active player count

## Balance and Progression

### Resource Management
**No Scarcity**: Unlimited mana flower regeneration - focus on timing and positioning over resource conservation
**Mana Recharge**: Timed recharge cycle provides natural pacing without creating resource pressure

### Anti-Stalemate Mechanics
**Tile-Based Escalation**: Environmental changes naturally create pressure and opportunities
**No Regeneration Alternative**: Potential no-healing system to ensure permanent consequences
**Environmental Pressure**: Reactive terrain and ongoing world changes prevent static positioning

### Power Scaling
**Balanced Design**: Spells designed for diverse strategies
**Situational Advantage**: Different spells excel in different terrain and tactical situations
**No Power Creep**: Focus on interesting combinations rather than raw damage scaling

## Strategic Elements

### Core Strategy Sources
1. **Terrain Understanding**: Learning different tile type behaviors
2. **Spell Combinations**: Combining rune effects
3. **Positioning**: Tactical movement and area control
4. **Timing**: Execution of pre-planned actions at optimal moments
5. **Environmental Prediction**: Anticipating world changes and terrain evolution

### Spell System Strategy

See [cross-reference:: [[../architecture/systems/spells/spells|Spell System]]] for complete spell mechanics.

**Element Mastery**:
- Understanding 26 elements and geometric opposition structure
- Recognizing cancellation opportunities (complete, partial, Void)
- Defensive counter-element selection against opponents

**Resource Management**:
- Mana flower spending patterns with timed recharge cycles
- Action cooldown timing (cast/load/refresh decisions)
- Refresh action strategic use (tempo cost for pool cycling)

**Deck Construction**:
- Pre-match element focus vs diverse coverage decisions
- Mana flower conversion optimization (2:1 trade-off)
- Singleton format encourages spell variety strategies

**Tactical Execution**:
- Slot/pool management (when to cast vs load)
- Directional targeting precision
- Spell overlap timing for combinations

### Depth Mechanisms
- **Rule Interactions**: Complex behaviors arising from rule combinations
- **Adaptive Strategy**: Changing world state requires flexible tactical adaptation
- **Risk/Reward**: Curse system and aggressive positioning create choices
- **Long-term Planning**: Pre-planning system rewards strategic foresight
- **Element Counter-Play**: Geometric opposition creates natural counter-strategies