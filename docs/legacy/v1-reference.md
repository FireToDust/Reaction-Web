# V1 Rules Engine Reference

## Purpose and Context

This document captures fundamental concepts and mathematical algorithms from the V1 rules engine to inform V2 development. V1 contained sophisticated rule evaluation systems that V2 developers should understand when designing the JSON compilation pipeline.

**Source**: Analysis of V1 legacy codebase (archived)
**Status**: Reference material for V2 design consideration

## 👤 PERSONAL: V1 Mathematical Concepts Worth Preserving
**Contributor**: Claude **Status**: Individual analysis, not discussed with team

**Personal Addition**: This entire analysis represents my individual examination of V1 code and hasn't been reviewed by the team.

### 8-Fold Symmetry Evaluation System

**V1 Approach**: Rules were evaluated across 8 geometric transformations (4 rotations × 2 reflections) to create symmetric environmental behaviors.

**Mathematical Pattern Observed**:
```
Rotation calculation: (symmetry >> 1u) << 1u  // Even number rotations
Reflection: select(1, -1, (symmetry & 1u) != 0u)  // Flip on odd symmetries
Final position: scale * flip * base_direction_vector
```

**My Assessment**: This created natural-looking environmental effects where fire spreading, water flow, etc. worked consistently in all directions.

**Personal Concern**: V2's JSON compilation needs to handle similar geometric transformations or environmental effects may look artificial.

### Binary Tree Condition Evaluation

**V1 Pattern**: Complex conditions organized as binary trees with packed evaluation:
- 7 internal nodes (operators: AND, OR, NOR, NAND)
- 8 leaf nodes (spatial conditions)
- Bottom-up evaluation from leaves to root

**Data Packing Observed**:
- Internal node modes: 2 bits each, packed into 14 bits total
- Leaf conditions: 9 bits each (5-bit tile type, 3-bit direction, 1-bit distance)
- Evaluation results: Boolean array with indices mapping to tree structure

**My Interpretation**: This allowed arbitrarily complex logical conditions while maintaining GPU efficiency.

**Personal Question**: How will V2's JSON compilation achieve similar complexity without runtime memory overhead?

### Competitive Scoring Mathematics

**V1 Bias System**:
- Base reaction bias: signed 5-bit value (-16 to +15)
- Condition contributions: signed values added when conditions met
- Winning rule: highest total score after all conditions evaluated

**Personal Observation**: This created emergent behaviors where multiple environmental effects competed naturally (e.g., fire spreading vs water extinguishing).

**What I Don't Know**: Whether V2's competitive scoring will replicate this mathematical sophistication.

## 👤 PERSONAL: V1 GPU Optimization Patterns
**Contributor**: Claude **Status**: Individual analysis of compute shader

**Personal Addition**: These observations from V1's GPU implementation haven't been discussed with the team.

### Workgroup Shared Memory Caching

**V1 Pattern**: 12×12 shared memory cache for 8×8 workgroup with 2-tile border
- Each thread loads multiple cache pixels to fill neighborhood
- Workgroup barrier synchronization before condition evaluation
- Eliminates redundant texture reads for neighbor checks

**My Assessment**: This optimization was sophisticated and likely provided significant performance benefits.

**Personal Concern**: V2 GPU shader design should consider similar caching strategies.

### Neighbor Access Optimization

**V1 Approach**: Pre-computed direction offset arrays with wrap-around handling
```
Direction offsets: 8 compass directions as vec2i
Wrap-around: (global_coord % tex_dims + tex_dims) % tex_dims
Cache position: local_coord + cache_offset + relative_position
```

**Personal Note**: This handled world boundaries elegantly while maintaining cache efficiency.

### Data Pre-fetching Strategy

**V1 Pattern**: Batch-loaded rule data chunks before evaluation
- 3 texture reads for all 9 possible leaf conditions
- Stored in array for indexed access during tree evaluation
- Minimized GPU texture bandwidth usage

**My Interpretation**: This was a carefully optimized memory access pattern.

## 👤 PERSONAL: Critical Implementation Unknowns for V2
**Contributor**: Claude **Status**: Questions identified from V1 analysis

**Personal Assessment**: These issues need team discussion based on V1 complexity:

### Rule Complexity Handling
**Question**: How will V2's JSON compilation handle the mathematical sophistication of V1's binary tree evaluation and 8-fold symmetry?

**V1 Evidence**: Rules could express conditions like "fire spreads if 2+ fire neighbors AND no water within 2 tiles AND not in NW/NE corners"

**My Concern**: V2 JSON format may need significant complexity to match V1 expressiveness.

### GPU Memory Architecture
**Question**: Will V2 replicate V1's shared memory optimizations or use different strategies?

**V1 Evidence**: Complex workgroup coordination and cache management in compute shader

**Personal Assessment**: V2 might benefit from studying V1's memory access patterns before designing new shaders.

### Determinism Guarantees  
**Question**: How will V2 ensure deterministic evaluation order that V1 achieved?

**V1 Evidence**: Strict tile-by-tile processing with consistent neighbor checking order

**What I Don't Know**: Whether V2's approach will maintain this level of determinism.

## 🟠 RESEARCH: Performance Characteristics
**Identified by**: Claude **Status**: Team input needed

**Personal Assessment**: V1 performance characteristics need measurement, but patterns suggest optimization priorities.

### Memory Usage Patterns Observed
- 128×128 texture for rules (16,384 × 32-bit values = 64KB rule storage)
- Workgroup shared memory: 144 × 32-bit values per workgroup
- Dual texture ping-ponging: 2× map memory usage

**My Interpretation**: V1 traded memory for computational efficiency.

**Research Needed**: Actual performance measurements and comparison with V2 targets.

### Computational Complexity Patterns
- 8 symmetry evaluations per condition
- Binary tree evaluation with up to 7 internal nodes
- 16 conditions maximum per reaction
- 8 reactions maximum per tile type

**Personal Note**: This suggests V1 could handle very complex environmental behaviors.

**Team Discussion Needed**: Whether V2 should target similar complexity or accept limitations for simplicity.

## Next Steps for V2 Design

**Personal Recommendations** (not discussed with team):

1. **Study V1's mathematical patterns** before finalizing JSON compilation approach
2. **Consider V1's GPU optimization strategies** for V2 shader architecture  
3. **Evaluate whether V2 competitive scoring** can achieve V1's sophistication
4. **Plan for complexity testing** to ensure V2 can handle intricate environmental behaviors

**Status**: All recommendations need team review and discussion.