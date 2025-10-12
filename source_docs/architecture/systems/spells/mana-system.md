# Mana System

## Purpose and Design Goals

**Purpose**: Create resource allocation decisions without resource scarcity pressure.

**Philosophy**: Focus on timing and positioning over resource conservation.

## Player Resources

### Mana Flower System
**Purpose**: Create resource allocation decisions.

**Mechanics**:
- Default: 3 flowers per mana type (fire, water, earth, air)
- Recharge: 3 non-stunned turns to restore after use (balances spell casting incentive vs saving)
- Strategy: Specialization vs. flexibility trade-offs

### Spell Hand Management
- **Hand Size**: TBD based on UI and gameplay needs
- **Replenishment**: Draw from personal spell deck each turn
- **Deck Construction**: Pre-game selection from available spells

## Spell Mechanics

### Casting Process
1. **Selection**: Player chooses spell from hand
2. **Validation**: Check mana cost and target range
3. **Execution**: Place runes according to spell pattern
4. **Cost**: Exhaust required mana flowers
5. **Cooldown**: Start mana flower recharge timers

### Spell Properties
- **Mana Cost**: Specific mana types and quantities required
- **Range**: Maximum targeting distance from caster
- **Pattern**: Grid layout of runes placed around target
- **Effects**: Rune types, forces, and delays in pattern

## Rune System

### Rune Properties
- **Type**: Determines transformation effects (fire, ice, force, etc.)
- **Force**: Velocity applied when triggered
- **Delay**: Countdown timer before activation

### Rune Lifecycle
1. **Placement**: Created by spell casting
2. **Delay**: Countdown each CPU processing cycle
3. **Triggering**: Apply transformations and forces when delay reaches zero
4. **Combination**: Merge with other runes on same tile
5. **Removal**: Clean up spent runes

### Rune Interactions
**Purpose**: Create emergent spell combinations.

**Mechanics**:
- Multiple runes on same tile combine automatically
- Result has combined force and minimum delay
- Type determined by combination rules table
- Some combinations cancel forces or produce no rune

## Customization Systems

### Curse System
**Purpose**: Power vs. risk trade-offs.

**Balance Philosophy**: Pure builds viable but less interesting than cursed builds.

**Example Curses**:
- **Glass Cannon**: +50% spell damage, -50% health
- **Mana Leak**: -1 mana cost, 20% spell failure rate
- **Berserker**: +2 spell range when below 25% health, -1 max health

### Deck Building
- **Collection**: Players build from available spell library
- **Constraints**: Deck size limits encourage focused strategies
- **Synergies**: Spells designed to work together thematically

## Processing Architecture

**CPU-Only Design**: See [../../architecture/technical-decisions.md](../../architecture/technical-decisions.md) for architecture rationale and integration details.