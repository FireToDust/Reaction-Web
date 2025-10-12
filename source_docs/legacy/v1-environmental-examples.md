# Environmental Interaction Examples

## Purpose and Context

This document captures environmental interaction patterns from V1 to inform V2 rule design. These examples demonstrate the complexity and emergent behaviors that V2's JSON compilation system should be capable of expressing.

**Source**: Analysis of V1 game logic examples (`src/game.ts` lines 48-158)
**Status**: Reference patterns for V2 rule creation

## 👤 PERSONAL: V1 Terrain Interaction Patterns
**Contributor**: Claude **Status**: Individual analysis of V1 examples

**Personal Addition**: This analysis of V1's environmental behaviors hasn't been discussed with the team.

### Water Flow and Pooling Systems

**V1 Pattern Observed**: Complex water behavior through multiple condition types

**Water Flow Detection**:
```
Condition: Water north (distance 1) AND Water north (distance 2) 
AND NOT (Water northwest OR Water northeast)
```

**Personal Interpretation**: This created directional water flow by detecting "channels" without side branching.

**Water Pooling Detection**:
```
Condition: (Water north distance 1 OR 2) AND 
          (Water east distance 1 OR 2) AND 
          (Water south distance 1 OR 2)
```

**My Assessment**: This detected water collecting in corners or depressions.

**Water Pressure/Volume Detection**:
```
Condition: Water north AND Water east AND Water northeast AND 
          (Water northwest OR Water southeast)
```

**Personal Note**: This seemed to detect "enough water pressure" for certain transformations.

### Mud Formation and Transformation

**V1 Grass-to-Mud Pattern**:
- **Trigger**: Close to water (bias: +4, total reaction bias: -3)
- **Result**: Net positive when water adjacent
- **Behavior**: Grass becomes mud near water sources

**V1 Mud-to-Water Pattern**:
- **Multiple conditions**: Water flow (+2), surrounded by water (+2), close to water (+5), close to sand (+2)
- **Base bias**: -6 (requires multiple conditions to trigger)
- **Behavior**: Mud liquefies under water pressure

**V1 Mud-to-Grass Recovery**:
- **Negative conditions**: Close to water (-2), kind of close to water (-1), close to mud (-1)
- **Base bias**: +2
- **Behavior**: Mud dries to grass when water recedes

**Personal Observation**: This created realistic seasonal or drought cycles in terrain.

### Sand Erosion and Deposition

**V1 Water-to-Sand Pattern**:
- **Negative scoring**: All water-related conditions had negative values
- **Base bias**: -1
- **Interpretation**: Water became sand only when "water pressure" was low

**V1 Sand-to-Water Pattern**:
- **Condition**: Surrounded by water (+2)
- **Base bias**: -1
- **Behavior**: Sand eroded when completely surrounded

**V1 Sand-to-Grass Colonization**:
- **Condition**: Lots of grass nearby (+3)
- **Base bias**: -2
- **Behavior**: Vegetation gradually reclaimed sandy areas

**Personal Assessment**: This created believable geological processes.

### Fire and Lava Propagation

**V1 Lava Spread Pattern**:
```
Condition: Lava northwest AND Lava northeast AND Lava north
```
- **Pattern**: Required 3 adjacent lava tiles in a row formation
- **Target**: Grass tiles (turning them to lava)
- **Base bias**: -1 (requiring the specific pattern to overcome)

**Personal Interpretation**: This created lava "fronts" that advanced in lines rather than randomly.

## 👤 PERSONAL: Emergent Behavior Patterns
**Contributor**: Claude **Status**: Individual analysis not yet discussed

**Personal Addition**: These behavioral observations need team discussion for V2 design.

### Competitive Environmental Dynamics

**Multiple Transformations per Tile Type**: V1 allowed each tile type to have multiple possible reactions with different conditions.

**Example - Grass Tile Transformations**:
1. Grass → Mud (when near water)
2. Grass → Lava (when in lava line formation) 
3. Grass → Sand (when conditions met - though this was commented out)

**Personal Observation**: This created realistic environmental competition where multiple forces could affect the same terrain.

### Seasonal and Cyclical Behaviors

**Observed Pattern**: Mud ↔ Grass ↔ Sand cycles
- Wet seasons: Grass → Mud → Water
- Dry seasons: Water → Sand, Mud → Grass
- Vegetation recovery: Sand → Grass (slow colonization)

**Personal Assessment**: V1's bias system created natural environmental cycles without explicit seasonal programming.

### Threshold-Based State Changes

**Pattern**: Many transformations required specific neighbor counts or arrangements
- Water flow: Exactly the right configuration
- Lava spread: 3-tile line formation required
- Vegetation growth: Multiple grass neighbors needed

**My Interpretation**: This prevented chaotic transformations and created stable intermediate states.

## 👤 PERSONAL: V2 Design Implications
**Contributor**: Claude **Status**: Questions raised from V1 analysis

**Personal Addition**: These design considerations haven't been discussed with the team.

### Rule Complexity Requirements

**Observed V1 Complexity**:
- Conditions checking multiple directions and distances
- Logical combinations with AND, OR, NOT operators
- Negative scoring for inhibitory effects
- Distance-based neighbor detection (1 and 2 tiles away)

**Personal Question**: Can V2's JSON format express this level of spatial complexity?

**Example V1 Rule Expressed in Potential V2 JSON**:
```json
{
  "grass": [
    {
      "id": "WaterFlow_Erosion",
      "action": {"type": "SetType", "new_type": "mud"},
      "score_calculation": {
        "type": "Add",
        "children": [
          {"type": "Constant", "value": -3},
          {
            "type": "BooleanToValue",
            "condition": {
              "type": "AND",
              "children": [
                {"type": "TileAt", "tile": "water", "direction": "N", "distance": 1},
                {"type": "TileAt", "tile": "water", "direction": "N", "distance": 2},
                {
                  "type": "NOT",
                  "child": {
                    "type": "OR",
                    "children": [
                      {"type": "TileAt", "tile": "water", "direction": "NW", "distance": 1},
                      {"type": "TileAt", "tile": "water", "direction": "NE", "distance": 1}
                    ]
                  }
                }
              ]
            },
            "value_if_true": 4,
            "value_if_false": 0
          }
        ]
      }
    }
  ]
}
```

**Personal Concern**: This JSON is already complex for a single V1 condition. V1 reactions had up to 16 conditions.

### Performance Considerations

**V1 Optimization Evidence**: 
- Rules were pre-compiled into GPU textures
- Complex conditions evaluated in parallel across all tiles
- Shared memory caching for neighbor access

**Personal Assessment**: V2 needs comparable optimization strategies for similar environmental complexity.

**Research Needed**: Performance testing of JSON compilation vs V1's direct GPU implementation.

## 🟠 RESEARCH: Environmental Behavior Validation
**Identified by**: Claude **Status**: Team input needed

**Personal Assessment**: V1 examples suggest specific environmental behavior goals that V2 should validate.

### Behavior Realism Targets
- **Geological cycles**: Water erosion, sediment deposition, vegetation recovery
- **Competitive dynamics**: Multiple environmental forces affecting same areas
- **Threshold stability**: Avoiding chaotic oscillations between states
- **Directional flow**: Water and lava following realistic propagation patterns

**Team Discussion Needed**: 
- Should V2 target similar environmental realism?
- How important are complex multi-condition interactions?
- What level of rule complexity should V2 support?

### Rule Authoring Complexity
**V1 Evidence**: Creating realistic environmental behaviors required intricate condition combinations and careful bias tuning.

**Personal Question**: Will V2's visual editor be capable of creating rules of similar sophistication?

**Research Needed**: UI/UX design for complex rule creation without overwhelming users.

## Next Steps for V2 Examples

**Personal Recommendations** (not discussed with team):

1. **Use V1 patterns as test cases** for V2 JSON compilation system
2. **Create V2 equivalents** of key V1 environmental behaviors
3. **Validate rule complexity limits** early in V2 development
4. **Design rule editor** to handle spatial complexity observed in V1

**Status**: All recommendations need team review and design discussion.