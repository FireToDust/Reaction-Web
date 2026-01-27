---
tags:
  - Development
  - Reference
---

# Current State

## Purpose

**This is the authoritative source for project decisions and current state.** When other documentation conflicts with this document, this document is correct and the other documentation needs updating.

**When working on this project**:
1. If unsure about a decision, check here first
2. If it's not listed here, ask the user
3. If the user says something here is inaccurate or provides new information that should be tracked, update this document immediately before continuing

This document overrides outdated information elsewhere in the codebase.

## Current State

- **Project Name**: Reaction, was never "Reaction V2" or "Reaction 2.0"
- **Current Phase**: Architecture
- **Terrain (Gameplay)**: Continuous, changed from grid-based
- **Terrain (Internal)**: Hexagonal grid representation
- **Spell Representation**: Abstract spell shapes, changed from tile-based runes

---

## Adding Entries

**Purpose of entries**: Clarify changes from previous implementations and prevent halucinations from persisting in the documentation. Don't document obvious things.

**When to add an entry**:
- A new decision is made
- User corrects outdated information
- User corrects a mistake you made
- User mentions something you keep getting wrong across conversations

**When NOT to add an entry**:
- Obvious facts that don't need clarification
- Implementation details that are already in other docs
- Things that haven't changed or aren't commonly mistaken

**How to write entries**:
- Format: **Topic**: Value, minimal clarifications
- Add "changed from {previous}" for old implementation changes, or "was never {hallucination}" for halucinations
- Keep entries minimal
