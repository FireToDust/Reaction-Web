import { ReactionClient, GameRenderer } from '../src/api/index.js';

// Example: Basic client setup and usage
async function createBasicClient() {
  // Create client instance
  const client = new ReactionClient({
    serverUrl: 'ws://localhost:8080',
    playerId: 'player-123',
    playerName: 'ExamplePlayer',
    autoReconnect: true,
    debugMode: true,
  });

  // Set up event listeners
  client.on('connected', () => {
    console.log('Connected to server!');
  });

  client.on('disconnected', (reason) => {
    console.log('Disconnected:', reason);
  });

  client.on('gameStateUpdate', (gameState) => {
    console.log(`Game update - Frame: ${gameState.frameId}, Players: ${gameState.players.length}`);
  });

  client.on('spellCastResult', (result) => {
    if (result.success) {
      console.log(`Spell cast successful! Rune ID: ${result.runeId}`);
    } else {
      console.log(`Spell cast failed: ${result.error}`);
    }
  });

  try {
    // Connect to server
    const connectionResult = await client.connect();
    if (!connectionResult.success) {
      throw new Error(connectionResult.error);
    }

    // Join a game
    const joinResult = await client.joinGame();
    if (!joinResult.success) {
      throw new Error(joinResult.error);
    }

    console.log('Joined game as player:', joinResult.data?.name);

    // Cast a spell after 2 seconds
    setTimeout(async () => {
      const spellResult = await client.castSpell({
        spellId: 'fireball',
        targetPosition: { x: 100, y: 100 },
        playerId: 'player-123',
      });

      console.log('Spell cast result:', spellResult);
    }, 2000);

    // Move player around
    setInterval(async () => {
      const direction = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      };
      
      await client.movePlayer(direction);
    }, 1000);

  } catch (error) {
    console.error('Client error:', error);
  }

  return client;
}

// Example: Setting up renderer
function createRenderer() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);

  const renderer = new GameRenderer({
    canvas,
    width: 800,
    height: 600,
    enableParticles: true,
    enableLighting: true,
    enablePostProcessing: true,
    textureQuality: 'high',
    targetFPS: 60,
    vsync: true,
  });

  return renderer;
}

// Example: Complete client with renderer
async function createCompleteExample() {
  const client = await createBasicClient();
  const renderer = createRenderer();

  // Initialize renderer
  await renderer.initialize();

  // Connect renderer to client
  client.on('gameStateUpdate', (gameState) => {
    renderer.renderFrame(gameState);
  });

  // Set up camera to follow player
  client.on('gameStateUpdate', (gameState) => {
    const myPlayer = gameState.players.find(p => p.id === 'player-123');
    if (myPlayer) {
      renderer.followPlayer(myPlayer);
    }
  });

  // Handle canvas clicks for spell casting
  renderer.getCanvasElement().addEventListener('click', async (event) => {
    const worldPos = renderer.getCanvasPosition(event);
    
    await client.castSpell({
      spellId: 'fireball',
      targetPosition: worldPos,
      playerId: 'player-123',
    });
  });

  // Handle keyboard input
  window.addEventListener('keydown', async (event) => {
    const moveSpeed = 1;
    let direction = { x: 0, y: 0 };

    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        direction.y = -moveSpeed;
        break;
      case 's':
      case 'ArrowDown':
        direction.y = moveSpeed;
        break;
      case 'a':
      case 'ArrowLeft':
        direction.x = -moveSpeed;
        break;
      case 'd':
      case 'ArrowRight':
        direction.x = moveSpeed;
        break;
    }

    if (direction.x !== 0 || direction.y !== 0) {
      await client.movePlayer(direction);
    }
  });

  // Start rendering
  renderer.startRendering();

  return { client, renderer };
}

// Example usage
if (typeof window !== 'undefined') {
  // Browser environment
  createCompleteExample().then(({ client, renderer }) => {
    console.log('Game client and renderer ready!');
    
    // Expose to global scope for debugging
    (window as any).reactionClient = client;
    (window as any).reactionRenderer = renderer;
  });
} else {
  // Node.js environment
  createBasicClient().then(client => {
    console.log('Basic client ready!');
  });
}

export { createBasicClient, createRenderer, createCompleteExample };