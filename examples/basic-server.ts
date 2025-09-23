import { ReactionServer } from '../src/api/index.js';
import { IGameEngine } from '../src/engine.js';

// Mock game engine for example purposes
class MockGameEngine implements IGameEngine {
  core = {} as any;
  spellSystem = {} as any;
  physicsEngine = {} as any;
  reactionEngine = {} as any;
  renderer = {} as any;

  async initialize(config: any): Promise<void> {
    console.log('Game engine initialized with config:', config);
  }

  async shutdown(): Promise<void> {
    console.log('Game engine shut down');
  }

  start(): void { console.log('Game engine started'); }
  stop(): void { console.log('Game engine stopped'); }
  pause(): void { console.log('Game engine paused'); }
  resume(): void { console.log('Game engine resumed'); }

  getCurrentFrameState(): any {
    return {
      frameId: Date.now(),
      timestamp: Date.now(),
      activeChunks: [],
      systemStates: new Map(),
    };
  }

  getEngineStats(): any {
    return {
      frameRate: 60,
      frameTime: 16.67,
      coreStats: { activeTiles: 0, activeChunks: 0, textureMemoryMB: 0 },
      spellStats: { activePlayers: 0, activeRunes: 0, spellsCastThisSecond: 0 },
      physicsStats: { movingTiles: 0, collisionsThisFrame: 0, physicsTimeMs: 0 },
      reactionStats: { rulesProcessed: 0, reactionsTriggered: 0, reactionTimeMs: 0 },
      renderStats: { drawCalls: 0, triangles: 0, renderTimeMs: 0 },
    };
  }

  setTargetFPS(fps: number): void { console.log('Target FPS set to:', fps); }
  setTimeSlicesPerFrame(slices: number): void { console.log('Time slices set to:', slices); }

  onFrameComplete = () => {};
  onError = () => {};
}

// Example: Basic server setup
async function createBasicServer() {
  const gameEngine = new MockGameEngine();
  
  const server = new ReactionServer({
    port: 8080,
    maxPlayers: 16,
    gameMode: 'deathmatch',
    name: 'Example Reaction Server',
    description: 'A demonstration server for Reaction v2',
    region: 'US-West',
    tickRate: 60,
    enableCORS: true,
    enableLogging: true,
    debugMode: true,
  }, gameEngine);

  return server;
}

// Example: Server with event handlers
async function createServerWithEvents() {
  const server = await createBasicServer();

  // Set up event listeners
  server.on('playerConnected', (playerId) => {
    console.log(`Player connected: ${playerId}`);
    
    // Send welcome message or initial data
    const player = server.getPlayer(playerId);
    if (player) {
      console.log(`Welcome ${player.name}! Position: ${player.position.x}, ${player.position.y}`);
    }
  });

  server.on('playerDisconnected', (playerId, reason) => {
    console.log(`Player disconnected: ${playerId} (${reason})`);
  });

  server.on('spellCast', (playerId, request) => {
    console.log(`Player ${playerId} cast spell ${request.spellId} at (${request.targetPosition.x}, ${request.targetPosition.y})`);
  });

  server.on('gameStateUpdated', (state) => {
    // Log game state periodically
    if (state.frameId % 300 === 0) { // Every 5 seconds at 60 FPS
      console.log(`Game State - Frame: ${state.frameId}, Players: ${state.players.length}, Effects: ${state.effects.length}`);
    }
  });

  server.on('error', (error) => {
    console.error('Server error:', error);
  });

  return server;
}

// Example: Custom connection handling
class CustomClientConnection {
  id: string;
  playerId: string = '';
  connected: boolean = true;
  lastPing: number = Date.now();
  latency: number = 0;

  constructor(id: string) {
    this.id = id;
  }

  send(message: any): void {
    // In real implementation, this would send via WebSocket
    console.log(`Sending to ${this.id}:`, JSON.stringify(message).substring(0, 100) + '...');
  }

  close(reason?: string): void {
    this.connected = false;
    console.log(`Connection ${this.id} closed: ${reason || 'Unknown reason'}`);
  }
}

// Example: Server with simulated clients
async function createServerWithSimulatedClients() {
  const server = await createServerWithEvents();

  // Start the server
  await server.start();
  console.log('Server started successfully!');

  // Simulate some client connections
  setTimeout(async () => {
    for (let i = 1; i <= 3; i++) {
      const connection = new CustomClientConnection(`client-${i}`);
      server.addConnection(connection);

      // Add player
      const playerResult = await server.addPlayer(`player-${i}`, `TestPlayer${i}`);
      if (playerResult.success) {
        connection.playerId = `player-${i}`;
        console.log(`Added player: ${playerResult.data?.name}`);
      }
    }
  }, 1000);

  // Simulate spell casting
  setTimeout(async () => {
    for (let i = 1; i <= 3; i++) {
      const spellResult = await server.processSpellCast(`player-${i}`, {
        spellId: 'fireball',
        targetPosition: { x: Math.random() * 1024, y: Math.random() * 1024 },
        playerId: `player-${i}`,
      });

      console.log(`Player ${i} spell result:`, spellResult.success ? 'Success' : spellResult.error);
    }
  }, 3000);

  // Simulate player movement
  setInterval(async () => {
    for (let i = 1; i <= 3; i++) {
      await server.processPlayerAction(`player-${i}`, {
        type: 'move',
        playerId: `player-${i}`,
        timestamp: Date.now(),
        data: {
          direction: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
          },
        },
      });
    }
  }, 2000);

  return server;
}

// Example: Server status monitoring
function addServerMonitoring(server: ReactionServer) {
  // Log server info periodically
  setInterval(() => {
    const info = server.getServerInfo();
    console.log('Server Status:', {
      uptime: Math.round(info.uptime / 1000) + 's',
      players: `${info.currentPlayers}/${info.maxPlayers}`,
      gameMode: info.gameMode,
    });
  }, 10000); // Every 10 seconds

  // Handle process signals for graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Server terminated');
    await server.stop();
    process.exit(0);
  });
}

// Example usage
async function runExample() {
  try {
    const server = await createServerWithSimulatedClients();
    addServerMonitoring(server);

    console.log('Example server running! Press Ctrl+C to stop.');
    
    // Keep the process alive
    return new Promise(() => {});
  } catch (error) {
    console.error('Failed to start example server:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runExample();
}

export {
  createBasicServer,
  createServerWithEvents,
  createServerWithSimulatedClients,
  addServerMonitoring,
  MockGameEngine,
  CustomClientConnection,
};