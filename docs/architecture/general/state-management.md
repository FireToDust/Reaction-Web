---
status: proposed
warnings:
  - "PROPOSED SYSTEM: Unified state management approach serves both single-player and multiplayer"
  - "NEEDS TEAM DISCUSSION: Snapshot retention policy (current proposal: 5 seconds)"
  - "NEEDS TEAM DISCUSSION: Delta compression vs full snapshot frequency (current proposal: every 60 frames)"
  - "NEEDS TEAM DISCUSSION: Rollback window limits for client prediction"
todo:
  - "NEEDS IMPLEMENTATION: Performance benchmarking of snapshot creation overhead"
  - "NEEDS IMPLEMENTATION: Network bandwidth testing with delta compression"
  - "NEEDS IMPLEMENTATION: Cross-platform determinism validation suite"
---

# State Management System

**⚠️ PROPOSED SYSTEM**: This document describes the proposed unified state management approach that serves both single-player gameplay and multiplayer networking requirements through a single pipeline.

## Unified Architecture Principle

### Single Pipeline Design
**Core Concept**: Use identical state management for single-player, multiplayer client prediction, and multiplayer server authority.

**Benefits**:
- Consistent behavior across all game modes
- Simplified testing and debugging
- Reduced code duplication
- Natural multiplayer upgrade path

### State Management Responsibilities
- **Frame-based snapshots** for rollback and networking
- **Deterministic state serialization** for cross-platform consistency  
- **Efficient delta compression** for multiplayer bandwidth optimization
- **Rollback recovery** for client prediction correction

## State Snapshot System

### Snapshot Strategy
**Frequency**: Every frame (60 FPS) for complete state history.

**Retention**: 300 snapshots (5 seconds) in circular buffer for rollback window.

**Compression**: Incremental snapshots with delta compression for memory efficiency.

```typescript
interface GameStateSnapshot {
    frameNumber: number;
    timestamp: number;
    
    // Core game data
    tileData: CompressedTileData;
    playerStates: PlayerStateData[];
    activeChunks: ChunkId[];
    
    // Timing system state
    timeSliceState: TimeSliceSchedulerState;
    manaRechargeState: ManaSchedulerState;
    
    // Validation
    checksum: string;
    
    // Compression metadata
    deltaBaseFrame?: number;
    compressionLevel: 'full' | 'delta' | 'minimal';
}

class StateSnapshotManager {
    private snapshots = new CircularBuffer<GameStateSnapshot>(300);
    private deltaCompressor = new DeltaCompressor();
    
    saveFrameState(frameNumber: number, gameState: GameState): void {
        const snapshot = this.createSnapshot(frameNumber, gameState);
        this.snapshots.push(snapshot);
        
        // Clean up old snapshots beyond retention window
        this.cleanupOldSnapshots();
    }
    
    private createSnapshot(frameNumber: number, state: GameState): GameStateSnapshot {
        // Determine compression strategy
        const useFullSnapshot = frameNumber % 60 === 0; // Every second
        const compressionLevel = useFullSnapshot ? 'full' : 'delta';
        
        return {
            frameNumber,
            timestamp: performance.now(),
            tileData: this.compressTileData(state.tiles, compressionLevel),
            playerStates: this.serializePlayerStates(state.players),
            activeChunks: Array.from(state.activeChunks),
            timeSliceState: state.scheduler.serialize(),
            manaRechargeState: state.manaScheduler.serialize(),
            checksum: this.calculateChecksum(state),
            deltaBaseFrame: useFullSnapshot ? undefined : frameNumber - 1,
            compressionLevel
        };
    }
}
```

## Rollback System

### Rollback Triggers
**Multiplayer Misprediction**: Server state differs from client prediction.

**Determinism Failure**: Checksum mismatch in single-player determinism testing.

**Network Recovery**: Client needs to resynchronize with server.

### Rollback Process
```typescript
class RollbackManager {
    async rollbackToFrame(targetFrame: number): Promise<boolean> {
        // Find target snapshot
        const snapshot = this.snapshotManager.getSnapshot(targetFrame);
        if (!snapshot) {
            console.error(`Cannot rollback: snapshot ${targetFrame} not found`);
            return false;
        }
        
        // Restore game state
        await this.restoreGameState(snapshot);
        
        // Re-execute frames from rollback point to current
        const currentFrame = this.gameEngine.getCurrentFrame();
        for (let frame = targetFrame + 1; frame <= currentFrame; frame++) {
            await this.replayFrame(frame);
        }
        
        return true;
    }
    
    private async restoreGameState(snapshot: GameStateSnapshot): Promise<void> {
        // Restore tile data
        await this.tileManager.restoreFromSnapshot(snapshot.tileData);
        
        // Restore player states
        this.playerManager.restoreFromSnapshot(snapshot.playerStates);
        
        // Restore timing system state
        this.scheduler.deserialize(snapshot.timeSliceState);
        this.manaScheduler.deserialize(snapshot.manaRechargeState);
        
        // Validate restoration
        const restoredChecksum = this.calculateChecksum(this.gameState);
        if (restoredChecksum !== snapshot.checksum) {
            throw new Error('State restoration checksum mismatch');
        }
    }
}
```

## Multiplayer Integration

### Client Prediction Mode
**Local Simulation**: Run complete game simulation locally for responsiveness.

**Server Validation**: Compare local state with authoritative server updates.

**Automatic Correction**: Rollback and re-execute when server state differs.

```typescript
class ClientPredictionManager {
    private pendingInputs = new Map<number, PlayerInput[]>();
    private serverStates = new Map<number, GameStateSnapshot>();
    
    processServerUpdate(serverSnapshot: GameStateSnapshot): void {
        const frameNumber = serverSnapshot.frameNumber;
        this.serverStates.set(frameNumber, serverSnapshot);
        
        // Compare with local prediction
        const localSnapshot = this.snapshotManager.getSnapshot(frameNumber);
        if (localSnapshot && !this.statesMatch(localSnapshot, serverSnapshot)) {
            console.log(`Misprediction detected at frame ${frameNumber}, rolling back`);
            this.rollbackManager.rollbackToFrame(frameNumber);
        }
        
        // Confirm inputs up to this frame
        this.confirmInputsUpToFrame(frameNumber);
    }
    
    private statesMatch(local: GameStateSnapshot, server: GameStateSnapshot): boolean {
        // Compare essential game state (ignore client-only data)
        return (
            local.checksum === server.checksum &&
            this.tileDataMatches(local.tileData, server.tileData) &&
            this.playerStatesMatch(local.playerStates, server.playerStates)
        );
    }
}
```

### Server Authority Mode
**Authoritative Simulation**: Server runs definitive game simulation.

**Input Validation**: Validate all client inputs before application.

**State Broadcasting**: Send compressed state updates to all clients.

```typescript
class ServerAuthorityManager {
    private connectedClients = new Set<ClientConnection>();
    
    processFrame(): void {
        // Standard game processing
        this.gameEngine.processFrame();
        
        // Generate state delta for clients
        const currentFrame = this.gameEngine.getCurrentFrame();
        const stateDelta = this.generateStateDelta(currentFrame);
        
        // Broadcast to all clients
        this.broadcastStateDelta(stateDelta);
    }
    
    private generateStateDelta(frameNumber: number): StateDelta {
        const currentSnapshot = this.snapshotManager.getSnapshot(frameNumber);
        const previousSnapshot = this.snapshotManager.getSnapshot(frameNumber - 1);
        
        return this.deltaCompressor.createDelta(previousSnapshot, currentSnapshot);
    }
}
```

## Delta Compression

### Tile Data Compression
**Change Detection**: Only transmit modified tiles per frame.

**Run-Length Encoding**: Compress sequences of similar changes.

**Spatial Compression**: Group changes by active regions.

```typescript
class TileDeltaCompressor {
    compressTileChanges(oldTiles: TileData, newTiles: TileData): CompressedTileData {
        const changes: TileChange[] = [];
        
        // Detect changes
        for (let y = 0; y < this.worldHeight; y++) {
            for (let x = 0; x < this.worldWidth; x++) {
                const oldTile = oldTiles.getTile(x, y);
                const newTile = newTiles.getTile(x, y);
                
                if (oldTile !== newTile) {
                    changes.push({ x, y, oldValue: oldTile, newValue: newTile });
                }
            }
        }
        
        // Apply compression algorithms
        return this.compressChanges(changes);
    }
    
    private compressChanges(changes: TileChange[]): CompressedTileData {
        // Group by active chunks
        const chunkChanges = this.groupByChunk(changes);
        
        // Apply run-length encoding within chunks
        const compressed = chunkChanges.map(chunk => 
            this.runLengthEncode(chunk.changes)
        );
        
        return {
            changedChunks: compressed,
            compressionRatio: changes.length / compressed.length
        };
    }
}
```

## Performance Optimizations

### Memory Management
**Snapshot Pooling**: Reuse snapshot objects to reduce garbage collection.

**Lazy Compression**: Compress snapshots in background thread when possible.

**Memory-Mapped Storage**: Use efficient binary formats for large state data.

### Network Efficiency
**Adaptive Compression**: Adjust compression level based on network conditions.

**Priority Transmission**: Send critical state changes immediately.

**Batch Optimization**: Group small changes into larger network packets.

### Rollback Efficiency
**Incremental Replay**: Only re-execute affected systems during rollback.

**State Caching**: Cache frequently accessed rollback points.

**Parallel Processing**: Use worker threads for rollback computation when possible.

## Error Handling and Recovery

### State Corruption Detection
**Checksum Validation**: Verify state integrity at snapshot creation and restoration.

**Cross-Reference Checking**: Validate state consistency across different data structures.

**Automated Recovery**: Attempt automatic recovery from last known good state.

### Network Failure Handling
**Connection Recovery**: Seamless reconnection with state synchronization.

**Missing Data Recovery**: Request missing snapshots from server.

**Graceful Degradation**: Continue local simulation during temporary disconnections.

### Determinism Validation
```typescript
class DeterminismValidator {
    validateStateConsistency(snapshot: GameStateSnapshot): ValidationResult {
        // Check internal consistency
        const tileConsistency = this.validateTileData(snapshot.tileData);
        const playerConsistency = this.validatePlayerStates(snapshot.playerStates);
        const timingConsistency = this.validateTimingState(snapshot.timeSliceState);
        
        // Verify checksum
        const calculatedChecksum = this.calculateChecksum(snapshot);
        const checksumValid = calculatedChecksum === snapshot.checksum;
        
        return {
            valid: tileConsistency && playerConsistency && timingConsistency && checksumValid,
            errors: this.collectValidationErrors(),
            warnings: this.collectValidationWarnings()
        };
    }
}
```

## Navigation

- [cross-reference:: [[data-flow|Data Flow Architecture]]] - Parent pipeline architecture  
- [cross-reference:: [[variable-timing|Variable Timing System]]] - Integration with time slice scheduling
- [cross-reference:: [[multiplayer|Multiplayer System]]] - Network protocol and client prediction details

**⚠️ NEEDS TEAM DISCUSSION**:
- Snapshot retention policy (current proposal: 5 seconds)
- Delta compression vs full snapshot frequency (current proposal: every 60 frames)
- Rollback window limits for client prediction

**⚠️ NEEDS IMPLEMENTATION**:
- Performance benchmarking of snapshot creation overhead
- Network bandwidth testing with delta compression
- Cross-platform determinism validation suite