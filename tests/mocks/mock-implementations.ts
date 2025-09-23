import { vi } from 'vitest';
import {
  ICoreEngine,
  ITileStorage,
  ITextureManager,
  IActiveRegionManager,
  IFramePipeline,
  ISystem,
  CoreGameConfig,
  CoreFrameState,
} from '../../src/core/types.js';
import {
  ISpellSystem,
  IPlayer,
  ISpell,
  IRune,
  IManaFlower,
  ManaType,
  RuneType,
  PlayerAction,
  ActionResult,
  SpellValidationResult,
} from '../../src/spell-system/types.js';
import {
  IPhysicsEngine,
  IMovementSystem,
  ICollisionSystem,
  IForceSystem,
  MovingTile,
  CollisionEvent,
  RuneForce,
} from '../../src/physics-engine/types.js';
import {
  IReactionEngine,
  IRuleCompiler,
  IRuleSystem,
  ReactionRule,
  CompiledRuleSet,
  ReactionContext,
  ReactionResult,
  ReactionValidationResult,
} from '../../src/reaction-engine/types.js';
import {
  IRenderer,
  IWorldRenderer,
  IUIRenderer,
  IEffectRenderer,
  RenderScene,
  Camera,
  Viewport,
  UIElement,
} from '../../src/renderer/types.js';
import { 
  TilePosition, 
  TileData, 
  ChunkCoords, 
  LayerType, 
  Vector2,
  GameConfig,
  FrameState,
} from '../../src/shared/types.js';

export const createMockTileStorage = (): ITileStorage => ({
  getTile: vi.fn().mockReturnValue(null),
  setTile: vi.fn(),
  getTileLayer: vi.fn().mockReturnValue(null),
  setTileLayer: vi.fn(),
  getChunkTiles: vi.fn().mockReturnValue([]),
  setChunkTiles: vi.fn(),
});

export const createMockTextureManager = (): ITextureManager => ({
  createTexture: vi.fn().mockReturnValue({} as GPUTexture),
  destroyTexture: vi.fn(),
  getCurrentTexture: vi.fn().mockReturnValue({} as GPUTexture),
  getNextTexture: vi.fn().mockReturnValue({} as GPUTexture),
  swapTextures: vi.fn(),
  uploadTileData: vi.fn(),
  downloadTileData: vi.fn().mockResolvedValue([]),
});

export const createMockActiveRegionManager = (): IActiveRegionManager => ({
  markChunkActive: vi.fn(),
  markChunkInactive: vi.fn(),
  isChunkActive: vi.fn().mockReturnValue(false),
  getActiveChunks: vi.fn().mockReturnValue([]),
  getActiveRegionBounds: vi.fn().mockReturnValue(null),
  updateActiveRegions: vi.fn(),
});

export const createMockSystem = (name = 'mock-system'): ISystem => ({
  name,
  priority: 1,
  update: vi.fn().mockResolvedValue(undefined),
  processTimeSlice: vi.fn().mockResolvedValue(undefined),
});

export const createMockFramePipeline = (): IFramePipeline => ({
  executeFrame: vi.fn().mockResolvedValue(undefined),
  executeTimeSlice: vi.fn().mockResolvedValue(undefined),
  registerSystem: vi.fn(),
  unregisterSystem: vi.fn(),
  getCurrentFrameState: vi.fn().mockReturnValue({
    frameId: 0,
    timestamp: 0,
    activeChunks: [],
    systemStates: new Map(),
  } as CoreFrameState),
});

export const createMockCoreEngine = (): ICoreEngine => ({
  tileStorage: createMockTileStorage(),
  textureManager: createMockTextureManager(),
  activeRegionManager: createMockActiveRegionManager(),
  framePipeline: createMockFramePipeline(),
  initialize: vi.fn().mockResolvedValue(undefined),
  shutdown: vi.fn().mockResolvedValue(undefined),
  getWorldBounds: vi.fn().mockReturnValue({ width: 1024, height: 1024 }),
  worldToChunk: vi.fn().mockReturnValue({ x: 0, y: 0 }),
  chunkToWorld: vi.fn().mockReturnValue({ x: 0, y: 0 }),
});

export const createMockManaFlower = (): IManaFlower => ({
  manaType: ManaType.Fire,
  position: { x: 0, y: 0 },
  currentMana: 100,
  maxMana: 100,
  rechargeRate: 10,
  lastRechargeTime: 0,
  rechargeMana: vi.fn(),
  drainMana: vi.fn().mockReturnValue(true),
  canAfford: vi.fn().mockReturnValue(true),
});

export const createMockSpell = (): ISpell => ({
  id: 'test-spell',
  name: 'Test Spell',
  manaCosts: new Map([[ManaType.Fire, 50]]),
  castTime: 1000,
  cooldown: 5000,
  canCast: vi.fn().mockReturnValue(true),
  cast: vi.fn().mockResolvedValue({
    success: true,
    manaCost: new Map([[ManaType.Fire, 50]]),
  }),
  validateTarget: vi.fn().mockReturnValue(true),
});

export const createMockRune = (): IRune => ({
  id: 'test-rune',
  spellId: 'test-spell',
  position: { x: 0, y: 0, layer: LayerType.Rune },
  placedTime: 0,
  delay: 1000,
  caster: 'player1',
  runeType: RuneType.Delayed,
  trigger: vi.fn().mockResolvedValue(undefined),
  isReady: vi.fn().mockReturnValue(false),
  update: vi.fn(),
});

export const createMockPlayer = (): IPlayer => ({
  id: 'player1',
  name: 'Test Player',
  position: { x: 100, y: 100 },
  manaFlowers: [createMockManaFlower()],
  spellHand: [createMockSpell()],
  activeRunes: [createMockRune()],
  castSpell: vi.fn().mockResolvedValue({
    success: true,
    manaCost: new Map([[ManaType.Fire, 50]]),
  }),
  addManaFlower: vi.fn(),
  removeManaFlower: vi.fn(),
  updateManaRecharge: vi.fn(),
});

export const createMockSpellSystem = (): ISpellSystem => ({
  players: new Map([['player1', createMockPlayer()]]),
  initialize: vi.fn().mockResolvedValue(undefined),
  shutdown: vi.fn().mockResolvedValue(undefined),
  addPlayer: vi.fn(),
  removePlayer: vi.fn(),
  processPlayerActions: vi.fn().mockResolvedValue([]),
  updateManaRecharge: vi.fn(),
  processRuneTriggers: vi.fn().mockResolvedValue(undefined),
  validateSpellCast: vi.fn().mockReturnValue({ valid: true }),
});

export const createMockMovementSystem = (): IMovementSystem => ({
  updateTilePositions: vi.fn().mockResolvedValue([]),
  calculateCollisions: vi.fn().mockReturnValue([]),
  resolveCollisions: vi.fn(),
  applyVelocityDecay: vi.fn(),
});

export const createMockCollisionSystem = (): ICollisionSystem => ({
  detectCollisions: vi.fn().mockReturnValue([]),
  checkTileCollision: vi.fn().mockReturnValue(null),
  checkBoundaryCollision: vi.fn().mockReturnValue(null),
  resolveCollision: vi.fn().mockReturnValue({
    tile1NewVelocity: { x: 0, y: 0 },
    tile2NewVelocity: { x: 0, y: 0 },
    tile1NewPosition: { x: 0, y: 0, layer: LayerType.Object },
    tile2NewPosition: { x: 1, y: 0, layer: LayerType.Object },
    bounceOccurred: false,
    energyLoss: 0,
  }),
});

export const createMockForceSystem = (): IForceSystem => ({
  applyGravity: vi.fn(),
  applyRuneForces: vi.fn(),
  applyEnvironmentalForces: vi.fn(),
  calculateNetForce: vi.fn().mockReturnValue({ x: 0, y: 0 }),
});

export const createMockPhysicsEngine = (): IPhysicsEngine => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  shutdown: vi.fn().mockResolvedValue(undefined),
  processPhysics: vi.fn().mockResolvedValue(undefined),
  applyForce: vi.fn(),
  applyForceArea: vi.fn(),
  setTileVelocity: vi.fn(),
  getTileVelocity: vi.fn().mockReturnValue({ x: 0, y: 0 }),
  queueCollisionCheck: vi.fn(),
});

export const createMockRuleCompiler = (): IRuleCompiler => ({
  compileRule: vi.fn().mockResolvedValue({
    id: 'test-rule',
    priority: 1,
    shaderCode: '',
    conditions: [],
    actions: [],
    pattern: { positions: [], rotations: [], reflections: false },
    cooldownFrames: 0,
    triggerLimit: 0,
  }),
  compileRuleSet: vi.fn().mockResolvedValue({
    rules: [],
    shaderCode: '',
    uniformData: new Float32Array(),
    optimizations: {
      rulesOptimized: 0,
      conditionsReduced: 0,
      duplicatesRemoved: 0,
      compilationTimeMs: 0,
    },
    version: '1.0.0',
  }),
  optimizeRuleSet: vi.fn().mockImplementation((ruleSet) => ruleSet),
  generateShaderCode: vi.fn().mockReturnValue(''),
});

export const createMockRuleSystem = (): IRuleSystem => ({
  evaluateRules: vi.fn().mockResolvedValue([]),
  selectWinningRule: vi.fn().mockReturnValue(null),
  applyReaction: vi.fn().mockResolvedValue(undefined),
  getMatchingRules: vi.fn().mockReturnValue([]),
});

export const createMockReactionEngine = (): IReactionEngine => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  shutdown: vi.fn().mockResolvedValue(undefined),
  processReactions: vi.fn().mockResolvedValue(undefined),
  compileRules: vi.fn().mockResolvedValue({
    rules: [],
    shaderCode: '',
    uniformData: new Float32Array(),
    optimizations: {
      rulesOptimized: 0,
      conditionsReduced: 0,
      duplicatesRemoved: 0,
      compilationTimeMs: 0,
    },
    version: '1.0.0',
  }),
  loadCompiledRules: vi.fn(),
  addRule: vi.fn().mockResolvedValue(undefined),
  removeRule: vi.fn(),
  validateRule: vi.fn().mockReturnValue({ valid: true, errors: [], warnings: [] }),
});

export const createMockWorldRenderer = (): IWorldRenderer => ({
  renderLayer: vi.fn(),
  renderChunk: vi.fn(),
  setTileAtlas: vi.fn(),
  updateTileVisibility: vi.fn(),
});

export const createMockUIRenderer = (): IUIRenderer => ({
  renderManaFlowers: vi.fn(),
  renderSpellHand: vi.fn(),
  renderPlayerStatus: vi.fn(),
  renderDebugOverlay: vi.fn(),
  renderCustomUI: vi.fn(),
});

export const createMockEffectRenderer = (): IEffectRenderer => ({
  renderParticles: vi.fn(),
  renderSpellEffects: vi.fn(),
  renderRunes: vi.fn(),
  renderForceFields: vi.fn(),
});

export const createMockRenderer = (): IRenderer => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  shutdown: vi.fn().mockResolvedValue(undefined),
  render: vi.fn().mockResolvedValue(undefined),
  setCamera: vi.fn(),
  setViewport: vi.fn(),
  addUIElement: vi.fn(),
  removeUIElement: vi.fn(),
  updateUIElement: vi.fn(),
});