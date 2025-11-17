---
status: proposed
tags:
  - Architecture
todo:
  - "[implementation] Specify exact fixed-point formats for velocity and position"
  - "[implementation] Implement cross-platform validation test suite"
  - "[testing] Validate determinism across different GPU architectures"
warnings:
  - "[proposed] Fixed-point precision needs validation through testing"
---

# Determinism

Framework for achieving deterministic execution across different hardware platforms, ensuring identical game outcomes for competitive multiplayer.

## Core Requirements

### Fundamental Guarantee
**Identical Inputs → Identical Outputs**: Essential for fair PvP gameplay and competitive integrity.

**Cross-Platform Consistency**: Same results across different hardware, GPU architectures, and drivers.

**Replay Capability**: Matches must be perfectly reproducible from recorded input sequences.

## Deterministic Execution Approach

### Simultaneous Read/Write Strategy
**Decision**: Simultaneous single-read/single-write GPU passes with deterministic internal rules.

**How It Works**:
- All tiles read from one texture
- All tiles write to separate output texture
- Processing order doesn't matter because no tile reads another tile's writes
- Deterministic internal rules govern tile behavior

**Rationale**: Achieves determinism without complex spatial ordering or thread synchronization overhead.

**Alternative Considered**: Spatial ordering strategy (process tiles top-left to bottom-right) - rejected for implementation complexity.

### Integer-Only Mathematics
**No Floating-Point Operations**: All physics calculations use fixed-point arithmetic (scaled integers).

**Platform Independence**: Avoids floating-point precision differences across GPU architectures and driver implementations.

**Consistency**: Integer operations produce identical results on all hardware.

## Fixed-Point Arithmetic

### Format Specification
**Precision Format**: 16.16 fixed-point (16 bits integer, 16 bits fractional).

**Scale Factor**: 2^16 = 65536

**⚠️ NEEDS SPECIFICATION**: Exact precision requirements for velocity and position through gameplay testing.

### Operations

**Addition** (trivial):
```wgsl
fn fixed_point_add(a: vec2<i32>, b: vec2<i32>) -> vec2<i32> {
    return a + b;
}
```

**Multiplication**:
```wgsl
fn fixed_point_multiply(a: i32, b: i32) -> i32 {
    return (i64(a) * i64(b)) >> 16;
}
```

**Division**:
```wgsl
fn fixed_point_divide(numerator: i32, denominator: i32) -> i32 {
    return (i64(numerator) << 16) / i64(denominator);
}
```

### Precision Considerations
**Bit Precision**: Balance between accuracy and overflow risk.

**Rounding Consistency**: Deterministic rounding rules applied uniformly across all calculations.

**Range Limits**: Fixed-point format constrains maximum values (prevents overflow in extreme cases).

## State Isolation

### Processing Independence
**No Shared Mutable State**: Tiles don't share mutable state during GPU pass execution.

**Read/Write Separation**: Texture ping-ponging prevents read-after-write hazards.

**Data Race Prevention**: Concurrent read/write conflicts eliminated by architecture.

### Atomic Operations
**Selective Use**: Atomic operations only where absolutely necessary (e.g., marking active chunks).

**Deterministic Atomics**: When used, atomic operations follow consistent ordering rules.

**Minimal Dependency**: Architecture minimizes need for atomics through pass design.

## Cross-Platform Validation

### Testing Strategy
**Replay Testing**: Identical input sequences must produce identical outputs across platforms.

**Hardware Variation**: Test on NVIDIA, AMD, and Intel GPU architectures.

**Driver Versions**: Validate consistency across different graphics driver versions.

**⚠️ NEEDS IMPLEMENTATION**: Automated cross-platform validation test suite.

### Validation Framework
**Checksum Verification**: Calculate state checksums at frame boundaries.

**Regression Detection**: Automated testing prevents determinism breaks during development.

**CI/CD Integration**: Determinism validation runs on every commit.

## Performance Considerations

### Overhead
**Minimal Impact**: Simultaneous read/write approach adds negligible overhead.

**Integer Operations**: GPU integer math is as fast as (or faster than) floating-point.

**Memory Usage**: Texture ping-ponging doubles memory usage but ensures safety.

### Optimization Opportunities
**Maintain Determinism**: All optimizations must preserve deterministic behavior.

**Memory Access Patterns**: Optimize texture reads while keeping deterministic guarantees.

**Early Termination**: Can skip processing for provably inactive regions without breaking determinism.

## Integration Points

### Physics System
Physics implements deterministic execution through:
- Fixed-point arithmetic for all force calculations
- Simultaneous read/write passes for collision and movement
- Integer-only velocity and position updates
- See [cross-reference:: [[physics/physics|Physics System]]] for implementation details

### Multiplayer System
Multiplayer relies on determinism for:
- State synchronization between clients and server
- Client-side prediction and rollback
- Replay validation and cheat detection
- See [cross-reference:: [[multiplayer/multiplayer|Multiplayer System]]] for integration details

## Development Guidelines

### Determinism-First Design
**All Changes**: Consider determinism impact before implementing any physics/gameplay changes.

**Code Review**: Explicit review of determinism implications required.

**Testing**: Validate determinism before and after modifications.

### Common Pitfalls to Avoid
**Floating-Point Math**: Never use floating-point in gameplay logic.

**Random Numbers**: Use deterministic RNG with consistent seeding.

**Timing Dependencies**: Don't rely on wall-clock time or variable frame timing.

**Undefined Ordering**: Ensure all operations have well-defined execution order.
