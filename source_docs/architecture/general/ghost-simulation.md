---
status: proposed
warnings:
  - "PROPOSED SYSTEM: Predictive action visualization system shows players their queued actions"
  - "NEEDS TEAM DISCUSSION: Default simulation complexity level (minimal/basic/detailed)"
  - "NEEDS TEAM DISCUSSION: Ghost prediction accuracy vs performance trade-offs"
  - "NEEDS TEAM DISCUSSION: Visual design for ghost representation (transparency, colors, indicators)"
todo:
  - "NEEDS IMPLEMENTATION: Performance benchmarking of different complexity levels"
  - "NEEDS IMPLEMENTATION: User experience testing of ghost feedback effectiveness"
  - "NEEDS IMPLEMENTATION: Integration testing with action queue and timing systems"
---

# Ghost Simulation System

**⚠️ PROPOSED SYSTEM**: This document describes the proposed predictive action visualization system that shows players their queued actions and their likely outcomes without affecting the main game simulation.

## Design Goals

### Player Feedback Requirements
**Action Preview**: Show visual representation of 3 queued player actions.

**Spell Effect Prediction**: Display where runes will be placed and their likely effects.

**Movement Prediction**: Show future player positions based on queued movement.

**Performance Constraint**: Ghost simulation must not impact main game performance.

## Ghost Simulation Architecture

### Lightweight Simulation Strategy
**Simplified Rules**: Use fast approximations instead of full physics/reaction simulation.

**Position-Only Physics**: Predict movement without complex collision interactions.

**Basic Spell Effects**: Show rune placement without full environmental predictions.

**Selective Simulation**: Only simulate aspects visible to players.

```typescript
interface GhostPrediction {
    actionIndex: number;           // Which queued action (0, 1, 2)
    playerPosition: Position;      // Predicted player position
    spellEffects: RunePlacement[]; // Predicted rune placements
    confidence: number;            // Prediction confidence (0-1)
    timestamp: number;             // When prediction was generated
}

class GhostSimulator {
    private predictionCache = new Map<string, GhostPrediction[]>();
    private simulationComplexity: 'minimal' | 'basic' | 'detailed' = 'basic';
    
    updatePlayerGhosts(playerId: string): GhostPrediction[] {
        const cacheKey = this.generateCacheKey(playerId);
        
        // Check cache validity
        if (this.isCacheValid(cacheKey)) {
            return this.predictionCache.get(cacheKey);
        }
        
        // Generate new predictions
        const predictions = this.simulatePlayerActions(playerId);
        this.predictionCache.set(cacheKey, predictions);
        
        return predictions;
    }
}
```

### Simulation Complexity Levels

**Minimal**: Position-only prediction with no interaction simulation.
- Movement vectors applied directly
- Spell targeting shown without environmental effects
- Fastest performance, lowest accuracy

**Basic**: Position + simple spell effects prediction.
- Basic collision detection for movement
- Rune placement validation
- Simple environmental effects (obvious barriers, holes)
- Balanced performance and accuracy

**Detailed**: Full simulation using simplified rules.
- Complete physics simulation with reduced precision
- Environmental rule evaluation with fast heuristics
- Complex spell interactions predicted
- Higher accuracy, potential performance impact

## Prediction Algorithms

### Movement Prediction
```typescript
class MovementPredictor {
    predictMovement(player: PlayerState, action: MovementAction): Position {
        let currentPos = player.position;
        const moveVector = this.calculateMoveVector(action);
        
        // Simple collision detection for ghost prediction
        const targetPos = {
            x: currentPos.x + moveVector.x,
            y: currentPos.y + moveVector.y
        };
        
        // Check for obvious barriers
        if (this.isPositionBlocked(targetPos)) {
            return currentPos; // No movement if blocked
        }
        
        return targetPos;
    }
    
    private isPositionBlocked(position: Position): boolean {
        // Simplified collision detection for performance
        const tile = this.getTileAt(position);
        return tile?.type === TileType.SOLID || tile?.type === TileType.WALL;
    }
}
```

### Spell Effect Prediction
```typescript
class SpellEffectPredictor {
    predictSpellCast(player: PlayerState, spell: SpellAction): RunePlacement[] {
        const placements: RunePlacement[] = [];
        
        // Validate mana requirements
        if (!this.hasRequiredMana(player, spell)) {
            return []; // No effect if insufficient mana
        }
        
        // Calculate rune placements
        const pattern = this.getSpellPattern(spell.spellId);
        const targetPos = spell.targetPosition;
        
        for (const offset of pattern.runeOffsets) {
            const runePos = {
                x: targetPos.x + offset.x,
                y: targetPos.y + offset.y
            };
            
            // Basic placement validation
            if (this.canPlaceRune(runePos)) {
                placements.push({
                    position: runePos,
                    runeType: pattern.runeType,
                    delay: pattern.delay,
                    confidence: this.calculatePlacementConfidence(runePos)
                });
            }
        }
        
        return placements;
    }
}
```

## Performance Optimization

### Caching Strategy
**Cache Keys**: Based on player state hash and action queue hash.

**Invalidation**: Cache invalidated when player state or world state changes significantly.

**Selective Updates**: Only update ghosts for players whose state changed.

```typescript
class GhostCacheManager {
    private readonly CACHE_DURATION = 100; // ms
    
    generateCacheKey(playerId: string): string {
        const player = this.getPlayer(playerId);
        const actionQueueHash = this.hashActionQueue(player.actionQueue);
        const playerStateHash = this.hashPlayerState(player);
        const worldStateHash = this.getRelevantWorldStateHash(player.position);
        
        return `${playerId}-${actionQueueHash}-${playerStateHash}-${worldStateHash}`;
    }
    
    isCacheValid(cacheKey: string): boolean {
        const cached = this.predictionCache.get(cacheKey);
        if (!cached) return false;
        
        const age = performance.now() - cached.timestamp;
        return age < this.CACHE_DURATION;
    }
    
    invalidatePlayerCache(playerId: string): void {
        // Remove all cache entries for this player
        for (const [key, _] of this.predictionCache) {
            if (key.startsWith(playerId)) {
                this.predictionCache.delete(key);
            }
        }
    }
}
```

### Adaptive Complexity
**Performance Monitoring**: Adjust simulation complexity based on frame rate.

**Player Count Scaling**: Reduce complexity when many players are active.

**Network Condition Adaptation**: Simplify predictions on slow connections.

```typescript
class AdaptiveGhostManager {
    private performanceMonitor = new PerformanceMonitor();
    
    updateSimulationComplexity(): void {
        const currentFPS = this.performanceMonitor.getCurrentFPS();
        const playerCount = this.getActivePlayerCount();
        
        if (currentFPS < 55 || playerCount > 6) {
            this.ghostSimulator.setComplexity('minimal');
        } else if (currentFPS < 58 || playerCount > 4) {
            this.ghostSimulator.setComplexity('basic');
        } else {
            this.ghostSimulator.setComplexity('detailed');
        }
    }
}
```

## Visual Representation

### Ghost Rendering
**Player Ghosts**: Translucent player sprites at predicted positions.

**Action Indicators**: Visual cues showing queued action types.

**Spell Previews**: Targeting lines and rune placement previews.

**Confidence Visualization**: Alpha/color coding based on prediction confidence.

```typescript
interface GhostVisual {
    playerId: string;
    actionIndex: number;
    position: Position;
    alpha: number;              // Transparency based on confidence
    actionIndicator: ActionType;
    spellPreview?: SpellPreview;
}

class GhostRenderer {
    renderPlayerGhosts(predictions: GhostPrediction[]): void {
        for (let i = 0; i < predictions.length; i++) {
            const prediction = predictions[i];
            const alpha = this.calculateAlpha(prediction.confidence, i);
            
            this.renderGhostPlayer({
                playerId: prediction.playerId,
                actionIndex: i,
                position: prediction.playerPosition,
                alpha: alpha,
                actionIndicator: prediction.actionType,
                spellPreview: prediction.spellEffects
            });
        }
    }
    
    private calculateAlpha(confidence: number, actionIndex: number): number {
        // Closer actions are more opaque, further actions more transparent
        const timeAlpha = 1.0 - (actionIndex * 0.2);
        const confidenceAlpha = 0.3 + (confidence * 0.7);
        return timeAlpha * confidenceAlpha;
    }
}
```

## Integration with Timing System

### Time Slice Synchronization
**Prediction Timing**: Account for variable action timing in predictions.

**Speed Effect Integration**: Update predictions when player speed changes.

**Action Queue Synchronization**: Maintain predictions synchronized with action queue.

```typescript
class GhostTimingIntegration {
    updateGhostTimingForSpeedChange(playerId: string, newSpeedMultiplier: number): void {
        // Recalculate prediction timing based on new speed
        const predictions = this.ghostSimulator.getPlayerPredictions(playerId);
        
        for (const prediction of predictions) {
            const newTiming = this.recalculateActionTiming(
                prediction.actionIndex,
                newSpeedMultiplier
            );
            prediction.expectedExecutionSlice = newTiming;
        }
        
        // Invalidate cache to force regeneration
        this.ghostCacheManager.invalidatePlayerCache(playerId);
    }
    
    private recalculateActionTiming(actionIndex: number, speedMultiplier: number): number {
        const baseInterval = 8; // 8 time slices per action at normal speed
        const adjustedInterval = Math.ceil(baseInterval / speedMultiplier);
        return this.currentSlice + (adjustedInterval * (actionIndex + 1));
    }
}
```

## Error Handling and Fallbacks

### Prediction Failures
**Invalid Actions**: Show warning indicators for actions that can't be executed.

**Resource Conflicts**: Display mana insufficiency or other blocking conditions.

**Simulation Errors**: Graceful degradation to simpler prediction methods.

```typescript
class GhostErrorHandler {
    handlePredictionError(playerId: string, error: PredictionError): GhostPrediction {
        console.warn(`Ghost prediction error for ${playerId}:`, error);
        
        switch (error.type) {
            case 'insufficient-mana':
                return this.createManaWarningGhost(playerId, error.actionIndex);
            
            case 'invalid-target':
                return this.createTargetWarningGhost(playerId, error.actionIndex);
            
            case 'simulation-timeout':
                return this.fallbackToPositionOnlyPrediction(playerId, error.actionIndex);
            
            default:
                return this.createErrorGhost(playerId, error.actionIndex);
        }
    }
}
```

## Testing and Validation

### Prediction Accuracy
**Accuracy Metrics**: Track how often predictions match actual outcomes.

**Performance Benchmarks**: Monitor ghost simulation performance impact.

**User Experience Testing**: Validate that ghost feedback improves gameplay.

### Edge Case Coverage
**Action Queue Edge Cases**: Test ghost behavior with rapidly changing queues.

**Speed Effect Interactions**: Verify ghost timing updates with status effects.

**Network Lag Simulation**: Test ghost behavior under various network conditions.

## Navigation

- [cross-reference:: [[data-flow|Data Flow Architecture]]] - Parent pipeline architecture
- [cross-reference:: [[variable-timing|Variable Timing System]]] - Integration with action scheduling
- [cross-reference:: [[rendering|Renderer System]]] - Visual rendering integration

**⚠️ NEEDS TEAM DISCUSSION**:
- Default simulation complexity level (minimal/basic/detailed)
- Ghost prediction accuracy vs performance trade-offs
- Visual design for ghost representation (transparency, colors, indicators)

**⚠️ NEEDS IMPLEMENTATION**:
- Performance benchmarking of different complexity levels
- User experience testing of ghost feedback effectiveness
- Integration testing with action queue and timing systems