# Client Prediction System

Local state prediction with rollback mechanisms for responsive gameplay despite network latency.

## Prediction Architecture

**⚠️ UPDATED SYSTEM**: Client prediction now uses the unified Deterministic Time-Sliced Execution pipeline. See [cross-reference:: [[state-management|State Management]]] for complete integration details.

### Unified Pipeline Integration
**Single Engine**: Same game engine used for single-player and multiplayer prediction.

**Deterministic Execution**: Time-sliced pipeline ensures identical client/server results.

**Automatic State Management**: Built-in snapshots and rollback through unified state system.

**Frame Synchronization**: Time slice alignment with server for precise synchronization.

### Client Prediction Responsibilities
- Local state prediction using identical simulation logic
- Server state comparison with automatic mismrediction detection  
- Rollback and re-execution through unified state management
- Ghost simulation for action queue visualization

### Prediction Engine
**Purpose**: Runs identical simulation logic for local prediction.

**Components**:
- Same GPU compute shaders as server
- Physics and reaction processing
- Tile state management with active regions
- Deterministic frame execution pipeline

**Key Differences**:
- Operates on unconfirmed inputs
- Generates visual output during prediction
- Maintains rollback state history
- Handles prediction correction smoothly

## Rollback Mechanism

### State Snapshot System
**Confirmed States**: Server-validated game states stored every 5 frames
**Prediction States**: Local simulation results with input applied
**Rollback Threshold**: Maximum 10 frames (167ms at 60 FPS)

### Misprediction Detection
1. **Server State Reception**: Authoritative state update arrives
2. **Local Comparison**: Compare with predicted state at same frame
3. **Divergence Analysis**: Identify significant differences
4. **Rollback Decision**: Determine if correction is necessary

### Rollback Execution Process
1. **State Restoration**: Revert to last confirmed server state
2. **Input Replay**: Re-apply all inputs since that frame
3. **Simulation Catch-up**: Run physics/reactions to current frame
4. **Visual Interpolation**: Smooth transition to corrected state

## Prediction Strategies

### Conservative Prediction
**Own Actions Only**: Predict consequences of local player inputs
**Physics Prediction**: Tile movement and basic collisions
**Spell Effects**: Immediate visual feedback for cast spells
**Avoid Complex Rules**: Don't predict environmental transformations

### Aggressive Prediction
**All Player Actions**: Predict other players' likely actions
**Rule Interactions**: Attempt complex environmental predictions
**Higher Rollback Risk**: More frequent corrections needed
**Better Responsiveness**: Smoother gameplay when predictions succeed

### Adaptive Prediction
**Network Quality Based**: Adjust strategy based on connection stability
**Misprediction History**: Learn from previous prediction accuracy
**Dynamic Threshold**: Modify rollback sensitivity based on gameplay context

## Input Management

### Input Buffer System
```typescript
interface PredictedInput {
  frameNumber: number;
  playerId: string;
  inputData: PlayerInput;
  timestamp: number;
  confirmed: boolean;
}
```

### Input Processing Pipeline
1. **Local Input Capture**: Player action registration
2. **Immediate Prediction**: Apply to local simulation instantly
3. **Server Transmission**: Send input with frame number
4. **Confirmation Tracking**: Mark inputs as confirmed when server acknowledges
5. **History Cleanup**: Remove old confirmed inputs from buffer

## Visual Smoothing

### Prediction Correction
**Interpolation**: Smooth transition between predicted and actual states
**Temporal Blending**: Gradual adjustment over multiple frames
**Priority System**: Prioritize corrections for player-controlled entities

### Visual Feedback
**Optimistic Updates**: Show immediate response to player actions
**Uncertainty Indicators**: Visual cues for unconfirmed actions
**Rollback Masking**: Hide jarring corrections with effects

## Performance Optimization

### Prediction Scope Limiting
**Spatial Boundaries**: Only predict within player's view range
**Temporal Limits**: Maximum prediction window of 10 frames
**Complexity Filtering**: Skip expensive calculations during prediction

### Memory Management
**State Compression**: Efficient storage of rollback snapshots
**Garbage Collection**: Automatic cleanup of old prediction data
**GPU Resource Sharing**: Reuse textures between prediction and rendering

### Network Adaptation
**Latency Measurement**: Dynamic adjustment of prediction window
**Quality Scaling**: Reduce prediction complexity on slow connections
**Fallback Mode**: Disable prediction on extremely poor connections

## Error Handling

### Prediction Failures
**Desync Recovery**: Full state resynchronization when prediction fails
**Input Loss**: Request missing inputs from server
**State Corruption**: Fallback to last known good state

### Network Issues
**Connection Loss**: Maintain prediction until reconnection
**High Latency**: Extend prediction window with quality reduction
**Packet Loss**: Request state recovery from server

### Performance Degradation
**Frame Drops**: Reduce prediction complexity automatically
**Memory Pressure**: Cleanup old snapshots more aggressively
**GPU Issues**: Fallback to CPU-only prediction if necessary

This system provides responsive gameplay while maintaining competitive integrity through authoritative server validation.