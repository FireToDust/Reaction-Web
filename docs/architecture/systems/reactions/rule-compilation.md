# Rule Compilation Pipeline

## Purpose and Compilation Strategy

Transform human-readable tile interaction rules into GPU shaders for environmental transformations like fire spreading, water extinguishing flames, and magical interactions.

**Design Approach**: Designed for ease of rule creation and modification during development, allowing rules to be defined in JSON and automatically converted to GPU code. Alternative approaches may be considered during implementation.

## Rule Compilation Pipeline

### Design Philosophy
**Offline Processing**: Move computational work to build time for reduced runtime overhead.

### Compilation Stages

1. **JSON Rule Definition**
   - Human-readable transformation rules
   - Visual editor exports structured rule data
   - Declarative condition and action specifications

2. **GLSL Code Generation**
   - Rust-based rule-to-shader compiler
   - Converts declarative rules to imperative GPU code
   - Generates helper functions for tile data access

3. **SPIR-V Compilation**
   - Standard `glslangValidator` compilation
   - Produces unoptimized intermediate representation
   - Platform-independent shader bytecode

4. **Optimization** (⚠️ **NEEDS DESIGN** - specific tools TBD)
   - Dead code elimination, function inlining
   - Constant folding, loop unrolling
   - Register allocation optimization

5. **WebGPU Conversion**
   - Convert to WebGPU-compatible shader format
   - Runtime loading and execution

## Rule System Architecture

### Competitive Scoring Model
**Problem**: Multiple rules may apply to the same tile simultaneously.

**Solution**: Competitive evaluation where highest-scoring rule wins.

**Characteristics**:
- Deterministic rule resolution
- Priority-based rule ordering
- Complex conditional logic support
- Complex interaction behaviors

### Rule Structure Components

#### Condition Trees
**Logical Operators**: AND, OR, NOT for complex conditions
**Spatial Queries**: Check neighboring tiles and patterns
**Aggregate Functions**: Count tiles in regions, calculate thresholds
**Boolean Conversion**: Transform true/false to numeric scores

#### Scoring System
**Base Priority**: Fixed score for rule importance
**Environmental Bonuses**: Dynamic scoring based on surroundings
**Mandatory Conditions**: Huge negative scores for rule violations
**Threshold Logic**: Activation based on neighbor counts

#### Actions
**Tile Transformation**: Change tile type and properties
**Property Modification**: Update velocity, health, timers
**Force Application**: Apply velocity changes
**State Changes**: Modify custom data fields

### Example Rule: Fire Spreading

```json
{
  "grass": [
    {
      "id": "GrassIgnition",
      "action": { "type": "SetType", "new_type": "fire" },
      "score_calculation": {
        "type": "Add",
        "children": [
          { "type": "Constant", "value": 30 },
          {
            "type": "BooleanToValue",
            "condition": {
              "type": "Aggregate", 
              "region": "3x3", 
              "tile_type": "fire",
              "comparison": "GreaterThan", 
              "count": 0
            },
            "value_if_true": 0, 
            "value_if_false": -10000
          },
          {
            "type": "Aggregate",
            "region": "3x3", 
            "tile_type": "water",
            "expression": "count * -50"
          }
        ]
      }
    }
  ]
}
```

## GPU Execution Model

### Processing Frequency
**Lower frequency than physics**: Reactions may run less frequently for performance.

**Challenge**: Coordination with physics timing is a major technical issue to solve.

### Shader Architecture
- **Rule Evaluation**: Each tile evaluates all applicable rules
- **Score Calculation**: Parallel computation of rule priorities  
- **Winner Selection**: Deterministic highest-score selection
- **Action Application**: Transform winning tiles

### Memory Access
- **Input**: Read post-physics tile states
- **Processing**: Local neighborhood sampling for conditions
- **Output**: Write transformed tiles for next physics cycle
- **Integration**: Seamless data flow with physics engine

## Development Workflow

### Visual Rule Editor Integration
⚠️ **SUGGESTION**: Potential editor features for future development:
- Grid-based visual neighborhood editor
- Point-and-click rule creation interface
- Real-time rule testing and preview
- Direct JSON generation for compilation

### Debugging and Validation
⚠️ **SUGGESTION**: Potential debugging capabilities:
- Rule tracing: Debug which rules activated and why
- Score visualization: See rule competition in real-time
- Validation tools: Detect impossible or conflicting rules
- Performance profiling: Shader execution timing

## Performance Characteristics

### Potential Optimizations
⚠️ **SUGGESTION**: Potential compilation optimizations:
- Compile-time specialization for specific use cases
- Dead code elimination for unused rule paths
- Constant folding for pre-computed values
- Loop unrolling for neighbor checks

### Scalability
- **Rule Complexity**: Handles arbitrary rule complexity through compilation
- **Rule Count**: Compilation-time scaling, not runtime cost
- **Memory Efficiency**: Optimized data access patterns