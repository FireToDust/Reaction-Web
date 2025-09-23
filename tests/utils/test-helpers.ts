import { vi } from 'vitest';
import { Vector2, TilePosition, LayerType, ChunkCoords, TileData } from '../../src/shared/types.js';

export const createMockGPUDevice = (): GPUDevice => ({
  label: 'mock-device',
  features: new Set(),
  limits: {} as GPULimits,
  queue: {
    label: 'mock-queue',
    submit: vi.fn(),
    onSubmittedWorkDone: vi.fn().mockResolvedValue(undefined),
    writeBuffer: vi.fn(),
    writeTexture: vi.fn(),
    copyExternalImageToTexture: vi.fn(),
  } as any,
  createBuffer: vi.fn().mockReturnValue({
    label: 'mock-buffer',
    size: 1024,
    usage: 0,
    mapState: 'unmapped',
    destroy: vi.fn(),
    createView: vi.fn(),
    getMappedRange: vi.fn(),
    mapAsync: vi.fn().mockResolvedValue(undefined),
    unmap: vi.fn(),
  }),
  createTexture: vi.fn().mockReturnValue({
    label: 'mock-texture',
    width: 256,
    height: 256,
    depthOrArrayLayers: 1,
    mipLevelCount: 1,
    sampleCount: 1,
    dimension: '2d',
    format: 'rgba8unorm',
    usage: 0,
    destroy: vi.fn(),
    createView: vi.fn(),
  }),
  createSampler: vi.fn(),
  createBindGroupLayout: vi.fn(),
  createBindGroup: vi.fn(),
  createPipelineLayout: vi.fn(),
  createRenderPipeline: vi.fn(),
  createComputePipeline: vi.fn(),
  createShaderModule: vi.fn(),
  createQuerySet: vi.fn(),
  createCommandEncoder: vi.fn().mockReturnValue({
    label: 'mock-encoder',
    beginRenderPass: vi.fn(),
    beginComputePass: vi.fn(),
    copyBufferToBuffer: vi.fn(),
    copyBufferToTexture: vi.fn(),
    copyTextureToBuffer: vi.fn(),
    copyTextureToTexture: vi.fn(),
    clearBuffer: vi.fn(),
    writeTimestamp: vi.fn(),
    pushDebugGroup: vi.fn(),
    popDebugGroup: vi.fn(),
    insertDebugMarker: vi.fn(),
    finish: vi.fn().mockReturnValue({}),
  }),
  createRenderBundleEncoder: vi.fn(),
  importExternalTexture: vi.fn(),
  destroy: vi.fn(),
  lost: Promise.resolve({ reason: 'destroyed', message: 'Device destroyed' }),
  pushErrorScope: vi.fn(),
  popErrorScope: vi.fn().mockResolvedValue(null),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
} as any);

export const createMockCanvas = (): HTMLCanvasElement => ({
  width: 800,
  height: 600,
  getContext: vi.fn().mockReturnValue({
    canvas: {},
    configure: vi.fn(),
    unconfigure: vi.fn(),
    getCurrentTexture: vi.fn().mockReturnValue({
      createView: vi.fn(),
    }),
  }),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
} as any);

export const createTestVector2 = (x = 0, y = 0): Vector2 => ({ x, y });

export const createTestTilePosition = (x = 0, y = 0, layer = LayerType.Ground): TilePosition => ({
  x,
  y,
  layer,
});

export const createTestChunkCoords = (x = 0, y = 0): ChunkCoords => ({ x, y });

export const createTestTileData = (type = 0, velocity?: Vector2, customData = 0): TileData => ({
  type,
  velocity: velocity || createTestVector2(),
  customData,
});

export const createTestGameConfig = () => ({
  worldWidth: 1024,
  worldHeight: 1024,
  targetFPS: 60,
  timeSlicesPerFrame: 8,
});

export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const expectToBeCloseTo = (actual: number, expected: number, precision = 2) => {
  const diff = Math.abs(actual - expected);
  const threshold = Math.pow(10, -precision);
  if (diff > threshold) {
    throw new Error(`Expected ${actual} to be close to ${expected} (precision: ${precision})`);
  }
};

export const expectVectorToBeCloseTo = (actual: Vector2, expected: Vector2, precision = 2) => {
  expectToBeCloseTo(actual.x, expected.x, precision);
  expectToBeCloseTo(actual.y, expected.y, precision);
};

export const createPerformanceTimer = () => {
  const start = performance.now();
  return {
    elapsed: () => performance.now() - start,
    expectUnder: (maxMs: number) => {
      const elapsed = performance.now() - start;
      if (elapsed > maxMs) {
        throw new Error(`Operation took ${elapsed}ms, expected under ${maxMs}ms`);
      }
    },
  };
};

export const createFrameCounter = () => {
  let frameCount = 0;
  let lastTime = performance.now();
  
  return {
    tick: () => {
      frameCount++;
      const now = performance.now();
      const deltaTime = now - lastTime;
      lastTime = now;
      return { frameCount, deltaTime };
    },
    reset: () => {
      frameCount = 0;
      lastTime = performance.now();
    },
    getFrameRate: (windowMs = 1000) => {
      const now = performance.now();
      const elapsed = now - lastTime;
      return (frameCount / elapsed) * windowMs;
    },
  };
};