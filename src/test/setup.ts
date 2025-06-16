// Test setup file
// Mock WebGPU for testing since it's not available in Node.js environment
import { vi } from 'vitest';

// Mock GPU interface
const mockGPU = {
  requestAdapter: vi.fn().mockResolvedValue({
    requestDevice: vi.fn().mockResolvedValue({
      createShaderModule: vi.fn(),
      createBuffer: vi.fn(),
      createTexture: vi.fn(),
      createBindGroup: vi.fn(),
      createComputePipeline: vi.fn(),
      createRenderPipeline: vi.fn(),
      queue: {
        submit: vi.fn(),
        writeBuffer: vi.fn(),
      },
    }),
  }),
  getPreferredCanvasFormat: vi.fn().mockReturnValue('bgra8unorm'),
};

// Mock navigator.gpu
Object.defineProperty(globalThis.navigator, 'gpu', {
  value: mockGPU,
  writable: true,
});

// Mock HTMLCanvasElement methods used by WebGPU
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType: string) => {
  if (contextType === 'webgpu') {
    return {
      configure: vi.fn(),
      getCurrentTexture: vi.fn().mockReturnValue({
        createView: vi.fn(),
      }),
    };
  }
  return null;
});

// Mock performance.now for game timing
Object.defineProperty(globalThis.performance, 'now', {
  value: vi.fn(() => Date.now()),
  writable: true,
});