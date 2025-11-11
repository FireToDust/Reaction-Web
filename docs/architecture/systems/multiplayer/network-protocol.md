---
warnings:
  - "[outdated] Active region optimization section updated - system not being implemented"
---

# Network Protocol

WebSocket-based communication protocol with optimized state synchronization and delta compression.

## Protocol Overview

### Transport Layer
**WebSocket Connection**: Persistent bidirectional communication
**Message Format**: Binary protocol with structured headers
**Compression**: LZ4 compression for large state updates
**Reliability**: Application-level acknowledgments and retransmission

### Message Types
- **Input Messages**: Client actions (spell casts, movement)
- **State Updates**: Server game state changes
- **Control Messages**: Connection management and metadata
- **Heartbeat Messages**: Connection health monitoring

## Message Structure

### Base Message Format
```typescript
interface NetworkMessage {
  type: MessageType;
  frameNumber: number;
  playerId: string;
  sequence: number;
  timestamp: number;
  checksum: number;
  payload: MessagePayload;
}
```

### Input Message Types
```typescript
interface SpellCastInput {
  spellId: number;
  targetX: number;
  targetY: number;
  manaType: ManaType;
}

interface MovementInput {
  direction: number; // 8-directional movement
  intensity: number; // 0-255 for analog input
}

interface SpellSelectInput {
  spellIndex: number;
  handPosition: number;
}
```

### State Update Types
```typescript
interface TileDelta {
  x: number;
  y: number;
  layer: Layer;
  oldTile: number; // bit-packed tile data
  newTile: number; // bit-packed tile data
}

interface PlayerUpdate {
  playerId: string;
  positionX: number;
  positionY: number;
  health: number;
  manaLevels: number[]; // array of mana amounts
}

interface FullStateSnapshot {
  frameNumber: number;
  tileData: Uint32Array; // complete world state
  playerStates: PlayerUpdate[];
  activeChunks: ChunkCoord[];
}
```

## Compression Strategy

### Tile Delta Compression
**Change Detection**: Only transmit modified tiles per frame
**Run-Length Encoding**: Compress sequences of identical tiles
**Bit-Packing Efficiency**: Leverage existing 32-bit tile format
**Estimated Savings**: 90% bandwidth reduction vs full state

### ~~Active Region Optimization~~ (System Not Implemented)
**⚠️ NOT IMPLEMENTED**: Active region system was decided against. Network optimization uses alternative strategies:
- **Spatial Compression**: Group changes by geographic proximity
- **Change Detection**: Only transmit modified tiles
- **Bandwidth Scaling**: Optimized through efficient delta compression

### Payload Compression
**LZ4 Algorithm**: Fast compression/decompression for real-time use
**Adaptive Compression**: Skip compression for small messages
**Dictionary Building**: Maintain compression context across frames

## State Synchronization

### Update Frequency
**Input Messages**: Send immediately on player action
**State Deltas**: Every frame (16.67ms at 60 FPS)
**Full Snapshots**: Every 60 frames (1 second) for recovery
**Heartbeat**: Every 5 seconds for connection monitoring

### Reliability Mechanism
**Sequence Numbers**: Detect missing or duplicate messages
**Acknowledgment System**: Confirm receipt of critical updates
**Retransmission**: Resend lost messages with exponential backoff
**Recovery Mode**: Request full state snapshot on desync

### Priority System
**Critical Updates**: Player health, elimination, match state
**High Priority**: Direct player actions and immediate consequences
**Medium Priority**: Environmental changes and rule effects
**Low Priority**: Cosmetic updates and distant tile changes

## Connection Management

### Handshake Protocol
1. **Client Connection**: WebSocket establishment
2. **Authentication**: Player credentials and session validation
3. **Game Joining**: Match assignment and initial state transfer
4. **Synchronization**: Frame alignment and latency measurement

### Quality Adaptation
**Latency Measurement**: Round-trip time calculation
**Bandwidth Detection**: Adaptive compression and update frequency
**Connection Quality**: Network stability monitoring
**Fallback Modes**: Reduced fidelity on poor connections

### Disconnection Handling
**Graceful Disconnect**: Planned disconnection with state preservation
**Timeout Detection**: Automatic disconnection after communication failure
**Reconnection**: Resume gameplay with state synchronization
**Ghost Mode**: Temporary AI control during brief disconnections

## Performance Optimization

### Bandwidth Management
**Target Bandwidth**: <16MB per player per minute
**Peak Optimization**: Burst protection during high-activity periods
**Regional Scaling**: Reduced updates for distant regions
**Predictive Filtering**: Skip redundant state updates

### Latency Optimization
**Message Batching**: Combine multiple updates per frame
**Predictive Transmission**: Send likely state changes early
**Compression Caching**: Reuse compression dictionaries
**Priority Queuing**: Critical messages bypass normal queue

### Network Efficiency
```typescript
// Efficient tile delta encoding
interface CompressedTileDelta {
  chunkId: number;        // 16 bits - chunk identifier
  relativeTiles: number;  // 10 bits - tiles changed in chunk
  deltaData: Uint8Array;  // variable length - compressed changes
}
```

## Security Considerations

### Message Validation
**Input Sanitization**: Validate all client inputs against game rules
**Range Checking**: Ensure coordinates and values within bounds
**Rate Limiting**: Prevent input flooding and spam
**Checksum Verification**: Detect message corruption or tampering

### Anti-Tampering
**Message Signing**: Cryptographic signatures for critical messages
**Sequence Validation**: Detect replay attacks and message injection
**Timing Verification**: Validate message timestamps against server time
**State Integrity**: Server-side validation of all game state changes

### Connection Security
**TLS Encryption**: Secure WebSocket connections (WSS)
**Session Management**: Secure token-based authentication
**DoS Protection**: Rate limiting and connection throttling
**IP Filtering**: Geographic and reputation-based access control

This protocol provides efficient, reliable communication optimized for Reaction's real-time gameplay requirements while maintaining competitive integrity.