---
tags:
  - Navigation
warnings:
  - "[outdated] Active Region System referenced but not being implemented"
  - "[outdated] Multiple linked documents describe outdated approaches (implementation-guide, data-flow)"
todo:
  - "[documentation] Update navigation to mark outdated documents"
  - "[documentation] Remove active region references"
---

# General Architecture Documentation

Core architectural concepts, design patterns, and system design documentation for Reaction v2.

## Navigation

### Core Architecture
- [**System Overview**](overview.md) - Complete architectural design and module relationships
- [**Data Flow**](data-flow.md) - Frame execution pipeline and module communication **⚠️ OUTDATED**
- [**Performance Strategy**](performance.md) - Optimization approaches and technical constraints
- [**Technical Decisions**](technical-decisions.md) - Design choices and rationale

### Implementation Guides
- [**Implementation Guide**](implementation-guide.md) - Step-by-step implementation approach **⚠️ STUB**
- [**Determinism**](determinism.md) - Fixed-point arithmetic and cross-platform consistency
- [**Variable Timing System**](variable-timing.md) - Time slice scheduling and player action management **⚠️ PROPOSED**
- [**State Management**](state-management.md) - Snapshots, rollback, and multiplayer synchronization **⚠️ STUB**
- [**Ghost Simulation**](ghost-simulation.md) - Predictive action visualization system **⚠️ PROPOSED**

## Architectural Approach

**Modular Design**: Modules with focused responsibilities

**WebGPU Processing**: Physics, reactions, and rendering use GPU compute

**Deterministic Requirements**: Identical inputs must produce identical outputs for PvP through simultaneous single-read/single-write GPU passes

~~**Active Region System**: Process only chunks with changing tiles~~ **⚠️ NOT IMPLEMENTED**: Active region optimization was decided against

## Major Technical Challenges

⚠️ **Unsolved Issues Requiring Design Work**:
- Frame rate coordination between physics, reactions, and rendering systems
- GPU thread execution determinism guarantees (current approach: simultaneous read/write passes)
- Specific rule compilation pipeline implementation