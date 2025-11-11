---
status: deprecated
tags:
  - Architecture
warnings:
  - "[outdated] Entire file - Spell system now fully GPU-accelerated, not CPU-based"
---

# CPU Architecture

⚠️ **DEPRECATED**: This document describes a CPU-based spell system that was not implemented.

## Current Architecture

The spell system is now **fully GPU-accelerated**. See [cross-reference:: [[spells-and-runes|Spells and Runes]]] for current architecture.

**GPU Processing**:
- Shape evaluation (compute shaders)
- Element combination (shader computation)
- Rune delay countdown (GPU texture counters)
- Rune triggering and cleanup (multi-pass shaders)

## Historical Context

This document originally explored CPU-based spell processing for flexibility and ease of debugging. The decision was later revised to use GPU processing for consistency with physics and reaction systems, better performance at scale, and deterministic parallel evaluation.
