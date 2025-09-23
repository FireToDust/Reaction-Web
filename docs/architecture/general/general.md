---
tags:
  - Navigation
---

# General Architecture Documentation

Core architectural concepts, design patterns, and system design documentation for Reaction v2.

## Navigation

### Core Architecture
- [**System Overview**](overview.md) - Complete architectural design and module relationships
- [**Data Flow**](data-flow.md) - Frame execution pipeline and module communication
- [**Performance Strategy**](performance.md) - Optimization approaches and technical constraints
- [**Technical Decisions**](technical-decisions.md) - Design choices and rationale

### Implementation Guides
- [**Implementation Guide**](implementation-guide.md) - Step-by-step implementation approach
- [**Deterministic Execution**](deterministic-execution.md) - GPU determinism and cross-platform consistency
- [**Variable Timing System**](variable-timing.md) - Time slice scheduling and player action management
- [**State Management**](state-management.md) - Snapshots, rollback, and multiplayer synchronization
- [**Ghost Simulation**](ghost-simulation.md) - Predictive action visualization system

## Architectural Approach

**Modular Design**: Modules with focused responsibilities

**WebGPU Processing**: Physics, reactions, and rendering use GPU compute

**Deterministic Requirements**: Identical inputs must produce identical outputs for PvP

**Active Region System**: Process only chunks with changing tiles

## Major Technical Challenges

⚠️ **Unsolved Issues Requiring Design Work**:
- Frame rate coordination between physics, reactions, and rendering systems
- GPU thread execution determinism guarantees
- Specific rule compilation pipeline implementation