---
status: proposed
warnings:
  - "PROPOSED SYSTEM: Time slice scheduling system enables variable player action timing"
  - "NEEDS TEAM DISCUSSION: Optimal slice count (current proposal: 8 slices per frame)"
  - "NEEDS TEAM DISCUSSION: Speed multiplier ranges (current proposal: 0.1x to 10x)"
  - "NEEDS TEAM DISCUSSION: Ghost prediction complexity vs performance trade-offs"
todo:
  - "NEEDS IMPLEMENTATION: Detailed performance benchmarking of time slice overhead"
  - "NEEDS IMPLEMENTATION: Integration testing with existing Core Engine texture management"
  - "NEEDS IMPLEMENTATION: Multiplayer synchronization validation"
---

# Variable Timing System

**⚠️ PROPOSED SYSTEM**: This document describes the proposed time slice scheduling system that enables variable player action timing while maintaining deterministic 60 FPS execution.

## Design Goals

### Core Requirements
**Variable Player Speeds**: Different players can have different action timing based on status effects.

**Fixed Mana Timing**: Mana recharge remains strategically consistent regardless of player speed changes.

**Smooth Physics**: Maintain 60 FPS physics simulation for fluid movement.

**Deterministic Execution**: All timing decisions must be reproducible for multiplayer.

## Time Slice Architecture

### Frame Subdivision
**Frame Duration**: 16.67ms (60 FPS)
**Time Slices**: 8 slices per frame
**Slice Duration**: 2.08ms per slice

**Rationale**: 8 slices provides sufficient granularity for speed effects (0.5x to 2x) while maintaining reasonable processing overhead.

### Slice Allocation Strategy
```typescript
interface TimeSliceSchedule {
    // Base timing (normal speed)
    baseActionInterval: 8;      // 8 slices = 1 action
    baseManaInterval: 24;       // 24 slices = 3 actions
    
    // Physics runs every slice for smooth motion
    physicsInterval: 1;
    
    // Reactions run less frequently for performance
    reactionInterval: 4;        // Every 4 slices
}
```

## Player Action Scheduling

### Speed Multiplier System
**Speed Effects**: Status effects modify player action timing immediately.

**Calculation**: `newInterval = baseInterval / speedMultiplier`

**Speed Ranges**: 
- Slowed: 0.5x (16 slices per action)
- Normal: 1.0x (8 slices per action) 
- Hasted: 2.0x (4 slices per action)

### Action Queue Management
```typescript
interface PlayerActionSchedule {
    playerId: string;
    currentInterval: number;        // Current slices between actions
    nextActionSlice: number;        // When next action executes
    queuedActions: PlayerAction[];  // 3 actions lookahead
    speedMultiplier: number;        // Current speed effect
}

class TimeSliceScheduler {
    private playerSchedules = new Map<string, PlayerActionSchedule>();
    private currentSlice = 0;
    
    // Process all scheduled actions for this slice
    processSlice(sliceIndex: number) {
        this.currentSlice = sliceIndex;
        
        // Process players in deterministic order (by ID)
        const sortedPlayerIds = Array.from(this.playerSchedules.keys()).sort();
        
        for (const playerId of sortedPlayerIds) {
            this.processPlayerSchedule(playerId, sliceIndex);
        }
    }
    
    private processPlayerSchedule(playerId: string, slice: number) {
        const schedule = this.playerSchedules.get(playerId);
        
        if (schedule.nextActionSlice === slice) {
            // Execute queued action
            const action = schedule.queuedActions.shift();
            this.executePlayerAction(playerId, action);
            
            // Schedule next action
            schedule.nextActionSlice = slice + schedule.currentInterval;
            
            // Request new action for queue
            this.requestNextAction(playerId);
        }
    }
}
```

## Mana Recharge System

### Fixed Timing Strategy
**Independence**: Mana timing unaffected by player speed changes.

**Strategic Consistency**: Players can rely on consistent mana timing for tactical planning.

**Implementation**: Separate timing system running parallel to player actions.

```typescript
class ManaRechargeScheduler {
    private readonly MANA_RECHARGE_INTERVAL = 24; // 3 base actions worth
    private nextRechargeSlice = 24;
    
    processSlice(sliceIndex: number) {
        if (sliceIndex === this.nextRechargeSlice) {
            this.rechargeManaFlowers();
            this.nextRechargeSlice += this.MANA_RECHARGE_INTERVAL;
        }
    }
    
    private rechargeManaFlowers() {
        // Recharge all mana flowers regardless of player speeds
        for (const flower of this.getAllManaFlowers()) {
            flower.recharge();
        }
    }
}
```

## Status Effect Integration

### Immediate Speed Changes
**Timing Update**: Speed effects immediately modify next action timing.

**Queue Preservation**: Existing action queue remains valid but timing adjusts.

**Deterministic Application**: Speed changes processed in consistent order.

```typescript
class StatusEffectManager {
    applySpeedEffect(playerId: string, newMultiplier: number) {
        const schedule = this.scheduler.getPlayerSchedule(playerId);
        const currentSlice = this.scheduler.getCurrentSlice();
        
        // Calculate remaining time to next action
        const remainingSlices = schedule.nextActionSlice - currentSlice;
        
        // Apply speed change to remaining time
        const speedChange = newMultiplier / schedule.speedMultiplier;
        const newRemainingSlices = Math.ceil(remainingSlices / speedChange);
        
        // Update schedule
        schedule.speedMultiplier = newMultiplier;
        schedule.currentInterval = Math.ceil(8 / newMultiplier); // 8 = base interval
        schedule.nextActionSlice = currentSlice + newRemainingSlices;
        
        // Invalidate affected ghost predictions
        this.ghostSimulator.invalidatePlayerPredictions(playerId);
    }
}
```

## Deterministic Scheduling

### Conflict Resolution
**Simultaneous Actions**: When multiple players have actions scheduled for same slice, process in deterministic order (player ID).

**Queue Validation**: Validate action legality when scheduled, not when executed.

**Timing Consistency**: Ensure identical timing calculations across all clients and server.

### Edge Case Handling
```typescript
class SchedulingEdgeCases {
    // Handle sub-slice timing precision
    handleFractionalSlices(calculatedSlices: number): number {
        // Always round up to ensure actions don't execute too early
        return Math.ceil(calculatedSlices);
    }
    
    // Handle extreme speed changes
    clampSpeedMultiplier(multiplier: number): number {
        return Math.max(0.1, Math.min(10.0, multiplier));
    }
    
    // Handle action queue overflow
    validateActionQueue(queue: PlayerAction[]): boolean {
        // Ensure queue never exceeds 3 actions
        return queue.length <= 3;
    }
}
```

## Performance Optimizations

### Scheduling Efficiency
**Sparse Processing**: Only process slices with scheduled events.

**Batch Operations**: Group similar operations within same slice.

**Memory Efficiency**: Use circular buffers for timing data.

### Integration with Physics
**Consistent Frequency**: Physics processes every slice for smooth motion.

**Interpolation**: Visual interpolation between physics updates for display.

**State Synchronization**: Ensure physics state consistency with action timing.

## Ghost Simulation Integration

### Prediction Timeline
**Lookahead**: Simulate 3 queued actions for each player.

**Timing Prediction**: Account for current speed effects in predictions.

**Invalidation**: Update predictions when speed effects change.

```typescript
class GhostTimingPredictor {
    predictActionTiming(playerId: string, actionCount: number): number[] {
        const schedule = this.scheduler.getPlayerSchedule(playerId);
        const predictions: number[] = [];
        
        let nextSlice = schedule.nextActionSlice;
        for (let i = 0; i < actionCount; i++) {
            predictions.push(nextSlice);
            nextSlice += schedule.currentInterval;
        }
        
        return predictions;
    }
}
```

## Testing and Validation

### Timing Accuracy
**Determinism Tests**: Verify identical timing across multiple runs.

**Edge Case Coverage**: Test extreme speed values and rapid changes.

**Synchronization Validation**: Ensure client-server timing consistency.

### Performance Benchmarks
**Slice Processing Overhead**: Measure time slice processing cost.

**Memory Usage**: Monitor scheduling data structure efficiency.

**Scalability**: Test with varying player counts and speed effects.

## Navigation

- [cross-reference:: [[data-flow|Data Flow Architecture]]] - Parent pipeline architecture
- [cross-reference:: [[deterministic-execution|Deterministic Execution]]] - Execution order and consistency
- [cross-reference:: [[state-management|State Management]]] - Integration with state snapshots

**⚠️ NEEDS TEAM DISCUSSION**:
- Optimal slice count (current proposal: 8 slices per frame)
- Speed multiplier ranges (current proposal: 0.1x to 10x)
- Ghost prediction complexity vs performance trade-offs

**⚠️ NEEDS IMPLEMENTATION**:
- Detailed performance benchmarking of time slice overhead
- Integration testing with existing Core Engine texture management
- Multiplayer synchronization validation