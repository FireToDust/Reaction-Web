# Core System Documentation

This directory contains the core infrastructure and types for the reaction game.

## Files Overview

### `types.ts`
Defines the main data structures used throughout the application:
- `GameData`: Main game state including time, rules, map data, and camera position
- `GameDataBufferGroup`: GPU buffer and texture handles for WebGPU operations

### `setup.ts`
Initializes WebGPU context and devices:
- Checks WebGPU availability
- Requests GPU adapter and device
- Sets up canvas context for rendering
- Handles resize events

### `errors.ts`
Custom error classes for different failure scenarios:
- `GameError`: Base class for all game errors
- `WebGPUError`: WebGPU initialization failures
- `ShaderError`: Shader compilation errors
- `RuleError`: Rule validation errors
- `BufferError`: Buffer operation failures

### `game-config.ts`
Centralized configuration constants:
- Map dimensions and camera defaults
- Update timing and input sensitivity
- Default tile distribution for map generation

### `input-manager.ts`
Handles user input:
- Arrow key camera movement
- Mouse wheel zoom controls
- Clean event listener management

### `map-generator.ts`
Utilities for creating initial map data:
- Random map generation with configurable tile distribution
- Test pattern generation for debugging
- Parameterized map creation

## Usage

```typescript
import { GameData } from './core/types';
import setup from './core/setup';
import { InputManager } from './core/input-manager';
import { MapGenerator } from './core/map-generator';

// Initialize WebGPU
const { device, context } = await setup();

// Create game data
const gameData: GameData = {
  time: 0,
  rules: undefined,
  map: MapGenerator.generateRandomMap(256, 256),
  mapW: 256,
  mapH: 256,
  cameraX: 128,
  cameraY: 128,
  zoomX: 30,
  zoomY: 30,
};

// Set up input handling
const inputManager = new InputManager(gameData);
```

## Error Handling

All core modules use custom error types that extend the base `GameError` class. This allows for:
- Better error categorization
- Consistent error handling across the application
- Easier debugging with specific error codes

Example:
```typescript
try {
  const { device, context } = await setup();
} catch (error) {
  if (error instanceof WebGPUError) {
    console.error('WebGPU not available:', error.message);
  }
}
```