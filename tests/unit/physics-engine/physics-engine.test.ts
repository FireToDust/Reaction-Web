import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IPhysicsEngine, MovingTile, CollisionEvent, RuneForce } from '../../../src/physics-engine/types.js';
import { LayerType, Vector2 } from '../../../src/shared/types.js';
import { createMockPhysicsEngine } from '../../mocks/mock-implementations.js';
import { createMockGPUDevice, createTestTilePosition, createTestChunkCoords } from '../../utils/test-helpers.js';

describe('IPhysicsEngine Interface', () => {
  let physicsEngine: IPhysicsEngine;
  let mockDevice: GPUDevice;

  beforeEach(() => {
    physicsEngine = createMockPhysicsEngine();
    mockDevice = createMockGPUDevice();
  });

  describe('System Lifecycle', () => {
    it('should initialize with GPU device', async () => {
      await physicsEngine.initialize(mockDevice);
      
      expect(physicsEngine.initialize).toHaveBeenCalledWith(mockDevice);
    });

    it('should shutdown gracefully', async () => {
      await physicsEngine.shutdown();
      
      expect(physicsEngine.shutdown).toHaveBeenCalled();
    });

    it('should handle initialization failure', async () => {
      vi.mocked(physicsEngine.initialize).mockRejectedValue(new Error('GPU context lost'));
      
      await expect(physicsEngine.initialize(mockDevice)).rejects.toThrow('GPU context lost');
    });
  });

  describe('Physics Processing', () => {
    it('should process physics for active chunks', async () => {
      const activeChunks = [
        createTestChunkCoords(0, 0),
        createTestChunkCoords(1, 0),
        createTestChunkCoords(0, 1),
      ];
      
      await physicsEngine.processPhysics(activeChunks);
      
      expect(physicsEngine.processPhysics).toHaveBeenCalledWith(activeChunks);
    });

    it('should handle empty active chunks', async () => {
      const emptyChunks = [];
      
      await physicsEngine.processPhysics(emptyChunks);
      
      expect(physicsEngine.processPhysics).toHaveBeenCalledWith(emptyChunks);
    });

    it('should handle large number of active chunks', async () => {
      const manyChunks = Array.from({ length: 100 }, (_, i) => 
        createTestChunkCoords(i % 10, Math.floor(i / 10))
      );
      
      await physicsEngine.processPhysics(manyChunks);
      
      expect(physicsEngine.processPhysics).toHaveBeenCalledWith(manyChunks);
    });
  });

  describe('Force Application', () => {
    it('should apply force to specific position', () => {
      const position = createTestTilePosition(10, 15, LayerType.Object);
      const force: Vector2 = { x: 100, y: -50 };
      
      physicsEngine.applyForce(position, force);
      
      expect(physicsEngine.applyForce).toHaveBeenCalledWith(position, force);
    });

    it('should apply force to area', () => {
      const center = createTestTilePosition(20, 25, LayerType.Ground);
      const radius = 5;
      const force: Vector2 = { x: 0, y: -200 }; // Gravity-like force
      
      physicsEngine.applyForceArea(center, radius, force);
      
      expect(physicsEngine.applyForceArea).toHaveBeenCalledWith(center, radius, force);
    });

    it('should handle zero force application', () => {
      const position = createTestTilePosition(0, 0, LayerType.Air);
      const zeroForce: Vector2 = { x: 0, y: 0 };
      
      physicsEngine.applyForce(position, zeroForce);
      
      expect(physicsEngine.applyForce).toHaveBeenCalledWith(position, zeroForce);
    });

    it('should handle negative forces', () => {
      const position = createTestTilePosition(5, 5, LayerType.Object);
      const negativeForce: Vector2 = { x: -150, y: -75 };
      
      physicsEngine.applyForce(position, negativeForce);
      
      expect(physicsEngine.applyForce).toHaveBeenCalledWith(position, negativeForce);
    });

    it('should handle very large force values', () => {
      const position = createTestTilePosition(3, 7, LayerType.Ground);
      const largeForce: Vector2 = { x: 99999, y: 99999 };
      
      physicsEngine.applyForce(position, largeForce);
      
      expect(physicsEngine.applyForce).toHaveBeenCalledWith(position, largeForce);
    });
  });

  describe('Velocity Management', () => {
    it('should set tile velocity', () => {
      const position = createTestTilePosition(8, 12, LayerType.Object);
      const velocity: Vector2 = { x: 5, y: -3 };
      
      physicsEngine.setTileVelocity(position, velocity);
      
      expect(physicsEngine.setTileVelocity).toHaveBeenCalledWith(position, velocity);
    });

    it('should get tile velocity', () => {
      const position = createTestTilePosition(15, 20, LayerType.Air);
      const expectedVelocity: Vector2 = { x: 2, y: 4 };
      
      vi.mocked(physicsEngine.getTileVelocity).mockReturnValue(expectedVelocity);
      
      const result = physicsEngine.getTileVelocity(position);
      
      expect(physicsEngine.getTileVelocity).toHaveBeenCalledWith(position);
      expect(result).toEqual(expectedVelocity);
    });

    it('should return null for stationary tile', () => {
      const position = createTestTilePosition(0, 0, LayerType.Ground);
      
      vi.mocked(physicsEngine.getTileVelocity).mockReturnValue(null);
      
      const result = physicsEngine.getTileVelocity(position);
      
      expect(result).toBeNull();
    });

    it('should handle high velocity values', () => {
      const position = createTestTilePosition(25, 30, LayerType.Object);
      const highVelocity: Vector2 = { x: 1000, y: -500 };
      
      physicsEngine.setTileVelocity(position, highVelocity);
      
      expect(physicsEngine.setTileVelocity).toHaveBeenCalledWith(position, highVelocity);
    });

    it('should handle fractional velocities', () => {
      const position = createTestTilePosition(1, 1, LayerType.Air);
      const fractionalVelocity: Vector2 = { x: 0.5, y: -0.25 };
      
      physicsEngine.setTileVelocity(position, fractionalVelocity);
      
      expect(physicsEngine.setTileVelocity).toHaveBeenCalledWith(position, fractionalVelocity);
    });
  });

  describe('Collision Detection', () => {
    it('should queue collision check for position', () => {
      const position = createTestTilePosition(18, 22, LayerType.Object);
      
      physicsEngine.queueCollisionCheck(position);
      
      expect(physicsEngine.queueCollisionCheck).toHaveBeenCalledWith(position);
    });

    it('should handle multiple collision checks', () => {
      const positions = [
        createTestTilePosition(1, 1, LayerType.Object),
        createTestTilePosition(2, 1, LayerType.Object),
        createTestTilePosition(1, 2, LayerType.Object),
      ];
      
      positions.forEach(position => {
        physicsEngine.queueCollisionCheck(position);
      });
      
      expect(physicsEngine.queueCollisionCheck).toHaveBeenCalledTimes(3);
    });

    it('should handle collision checks for all layers', () => {
      const layers = [LayerType.Ground, LayerType.Object, LayerType.Air, LayerType.Rune];
      
      layers.forEach((layer, index) => {
        const position = createTestTilePosition(index, index, layer);
        physicsEngine.queueCollisionCheck(position);
      });
      
      expect(physicsEngine.queueCollisionCheck).toHaveBeenCalledTimes(4);
    });
  });

  describe('Performance Considerations', () => {
    it('should handle rapid force applications', () => {
      const position = createTestTilePosition(10, 10, LayerType.Object);
      const forceCount = 100;
      
      for (let i = 0; i < forceCount; i++) {
        const force: Vector2 = { x: i, y: -i };
        physicsEngine.applyForce(position, force);
      }
      
      expect(physicsEngine.applyForce).toHaveBeenCalledTimes(forceCount);
    });

    it('should handle concurrent velocity updates', () => {
      const positions = Array.from({ length: 50 }, (_, i) => 
        createTestTilePosition(i % 10, Math.floor(i / 10), LayerType.Object)
      );
      
      positions.forEach((position, index) => {
        const velocity: Vector2 = { x: index % 5, y: -(index % 3) };
        physicsEngine.setTileVelocity(position, velocity);
      });
      
      expect(physicsEngine.setTileVelocity).toHaveBeenCalledTimes(50);
    });

    it('should handle frequent physics processing', async () => {
      const chunks = [createTestChunkCoords(0, 0)];
      const frameCount = 60; // Simulate 1 second at 60 FPS
      
      for (let i = 0; i < frameCount; i++) {
        await physicsEngine.processPhysics(chunks);
      }
      
      expect(physicsEngine.processPhysics).toHaveBeenCalledTimes(frameCount);
    });
  });

  describe('Edge Cases', () => {
    it('should handle forces at world boundaries', () => {
      const boundaryPositions = [
        createTestTilePosition(0, 0, LayerType.Ground),
        createTestTilePosition(99999, 99999, LayerType.Ground),
        createTestTilePosition(-1, -1, LayerType.Ground),
      ];
      
      boundaryPositions.forEach(position => {
        const force: Vector2 = { x: 10, y: 10 };
        physicsEngine.applyForce(position, force);
      });
      
      expect(physicsEngine.applyForce).toHaveBeenCalledTimes(3);
    });

    it('should handle zero-radius area forces', () => {
      const center = createTestTilePosition(5, 5, LayerType.Ground);
      const zeroRadius = 0;
      const force: Vector2 = { x: 100, y: 100 };
      
      physicsEngine.applyForceArea(center, zeroRadius, force);
      
      expect(physicsEngine.applyForceArea).toHaveBeenCalledWith(center, zeroRadius, force);
    });

    it('should handle very large area forces', () => {
      const center = createTestTilePosition(50, 50, LayerType.Ground);
      const largeRadius = 9999;
      const force: Vector2 = { x: 1, y: 1 };
      
      physicsEngine.applyForceArea(center, largeRadius, force);
      
      expect(physicsEngine.applyForceArea).toHaveBeenCalledWith(center, largeRadius, force);
    });
  });

  describe('Error Handling', () => {
    it('should handle GPU context loss during processing', async () => {
      const chunks = [createTestChunkCoords(0, 0)];
      
      vi.mocked(physicsEngine.processPhysics).mockRejectedValue(new Error('GPU context lost'));
      
      await expect(physicsEngine.processPhysics(chunks)).rejects.toThrow('GPU context lost');
    });

    it('should handle invalid position coordinates', () => {
      const invalidPosition = createTestTilePosition(NaN, Infinity, LayerType.Object);
      const force: Vector2 = { x: 10, y: 10 };
      
      // Should not throw, but handle gracefully
      physicsEngine.applyForce(invalidPosition, force);
      
      expect(physicsEngine.applyForce).toHaveBeenCalledWith(invalidPosition, force);
    });

    it('should handle invalid force vectors', () => {
      const position = createTestTilePosition(10, 10, LayerType.Object);
      const invalidForce: Vector2 = { x: NaN, y: Infinity };
      
      physicsEngine.applyForce(position, invalidForce);
      
      expect(physicsEngine.applyForce).toHaveBeenCalledWith(position, invalidForce);
    });
  });
});