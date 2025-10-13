# Spells and Runes

Casting mechanics, rune lifecycle, and spell combinations.

## Spell Casting Process

### Casting Flow
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

### Validation Rules
**Mana Requirements**: Must have sufficient flowers of correct types
**Range Limits**: Target must be within spell's maximum range
**Obstruction Checks**: ⚠️ **NEEDS DESIGN** - Line of sight or other targeting restrictions
**Cooldown Status**: Cannot cast if required mana flowers still recharging

## Rune System

### Rune Properties
- **Type**: Determines transformation effects (fire, ice, force, etc.)
- **Force**: Velocity applied when triggered  
- **Delay**: Countdown timer before activation

### Rune Lifecycle
1. **Placement**: Created by spell casting on rune layer
2. **Delay**: Countdown each CPU processing cycle
3. **Triggering**: Apply transformations and forces when delay reaches zero
4. **Combination**: Merge with other runes on same tile
5. **Removal**: Clean up spent runes after effects applied

## Rune Interactions

### Combination Mechanics
**Purpose**: Create spell combinations.

**Automatic Merging**: Multiple runes on same tile combine automatically
**Force Combination**: Result has combined force vectors
**Delay Resolution**: Combined rune uses minimum delay of components
**Type Resolution**: New type determined by combination rules table

### Combination Examples
⚠️ **NEEDS SPECIFICATION**: Detailed combination rules and outcomes

**Fire + Water**: Steam rune with area effect
**Earth + Air**: Dust storm with movement effects
**Force + Force**: Amplified knockback effects
**Conflicting Types**: Some combinations may cancel forces or produce no rune

### Emergent Complexity
**Simple Rules**: Basic combination table creates complex interactions
**Strategic Depth**: Players can plan multi-spell combinations
**Unpredictable Results**: Opponent spells can interfere with combinations

## Spell Hand Management

### Hand Mechanics
- **Hand Size**: ⚠️ **TBD** based on UI and gameplay needs
- **Replenishment**: Draw from personal spell deck each turn
- **Deck Construction**: Pre-game selection from available spells

### Spell Availability
**Turn-based Drawing**: New spells available each turn
**Deck Cycling**: ⚠️ **NEEDS DESIGN** - What happens when deck is exhausted?
**Hand Limits**: Maximum spells available at once for UI and balance

## Integration with Game Systems

### Physics Engine Integration
**Force Application**: Runes queue forces for physics processing
**Timing Coordination**: Rune triggers coordinate with physics updates
**Movement Effects**: Spell effects can alter tile velocities

### Reaction Engine Integration
**Environmental Triggers**: Runes can trigger environmental transformations
**Rule Interactions**: Spell effects interact with world transformation rules
**Compound Effects**: Spells + environment create complex interactions

### Core Engine Integration
**Rune Placement**: Direct texture writes to rune layer
**State Queries**: Read tile data for spell validation
**Layer Coordination**: Ensure proper interaction between spell effects and world state

## Performance Considerations

### CPU Processing Benefits
**Complex Logic**: Conditional spell rules without shader limitations
**Easy Debugging**: Step-through debugging of spell logic
**Immediate Response**: No GPU compilation delays for spell modifications
**Dynamic Rules**: Runtime spell behavior changes possible

### Potential Optimizations
⚠️ **FUTURE CONSIDERATION**: Moving some spell processing to GPU if CPU becomes bottleneck
- Simple rune countdown could be GPU-accelerated
- Complex combination logic likely remains CPU-bound

## Design Challenges

⚠️ **NEEDS RESOLUTION**:
- **Hand Size Balancing**: Too many spells overwhelming, too few limiting strategy
- **Deck Exhaustion**: What happens when player runs out of spells?
- **Combination Complexity**: How complex should rune interactions become?
- **Performance Scaling**: CPU spell processing vs. large numbers of active runes