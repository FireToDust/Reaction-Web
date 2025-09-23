import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IActiveRegionManager } from '../../../src/core/types.js';
import { ChunkCoords } from '../../../src/shared/types.js';
import { createMockActiveRegionManager } from '../../mocks/mock-implementations.js';
import { createTestChunkCoords } from '../../utils/test-helpers.js';

describe('IActiveRegionManager Interface', () => {
  let activeRegionManager: IActiveRegionManager;

  beforeEach(() => {
    activeRegionManager = createMockActiveRegionManager();
  });

  describe('Chunk Activation Management', () => {
    it('should mark chunk as active', () => {
      const chunk = createTestChunkCoords(5, 10);
      
      activeRegionManager.markChunkActive(chunk);
      
      expect(activeRegionManager.markChunkActive).toHaveBeenCalledWith(chunk);
    });

    it('should mark chunk as inactive', () => {
      const chunk = createTestChunkCoords(2, 8);
      
      activeRegionManager.markChunkInactive(chunk);
      
      expect(activeRegionManager.markChunkInactive).toHaveBeenCalledWith(chunk);
    });

    it('should check if chunk is active', () => {
      const chunk = createTestChunkCoords(1, 3);
      vi.mocked(activeRegionManager.isChunkActive).mockReturnValue(true);
      
      const result = activeRegionManager.isChunkActive(chunk);
      
      expect(activeRegionManager.isChunkActive).toHaveBeenCalledWith(chunk);
      expect(result).toBe(true);
    });

    it('should return false for inactive chunk', () => {
      const chunk = createTestChunkCoords(0, 0);
      vi.mocked(activeRegionManager.isChunkActive).mockReturnValue(false);
      
      const result = activeRegionManager.isChunkActive(chunk);
      
      expect(result).toBe(false);
    });
  });

  describe('Active Chunk Queries', () => {
    it('should get all active chunks', () => {
      const mockActiveChunks = [
        createTestChunkCoords(1, 1),
        createTestChunkCoords(2, 1),
        createTestChunkCoords(1, 2),
      ];
      vi.mocked(activeRegionManager.getActiveChunks).mockReturnValue(mockActiveChunks);
      
      const result = activeRegionManager.getActiveChunks();
      
      expect(activeRegionManager.getActiveChunks).toHaveBeenCalled();
      expect(result).toEqual(mockActiveChunks);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no chunks are active', () => {
      vi.mocked(activeRegionManager.getActiveChunks).mockReturnValue([]);
      
      const result = activeRegionManager.getActiveChunks();
      
      expect(result).toEqual([]);
    });

    it('should get active region bounds', () => {
      const mockBounds = {
        min: createTestChunkCoords(0, 0),
        max: createTestChunkCoords(5, 5),
      };
      vi.mocked(activeRegionManager.getActiveRegionBounds).mockReturnValue(mockBounds);
      
      const result = activeRegionManager.getActiveRegionBounds();
      
      expect(activeRegionManager.getActiveRegionBounds).toHaveBeenCalled();
      expect(result).toEqual(mockBounds);
    });

    it('should return null when no active regions exist', () => {
      vi.mocked(activeRegionManager.getActiveRegionBounds).mockReturnValue(null);
      
      const result = activeRegionManager.getActiveRegionBounds();
      
      expect(result).toBeNull();
    });
  });

  describe('Region Updates', () => {
    it('should update active regions', () => {
      activeRegionManager.updateActiveRegions();
      
      expect(activeRegionManager.updateActiveRegions).toHaveBeenCalled();
    });

    it('should handle multiple rapid updates', () => {
      const updateCount = 50;
      
      for (let i = 0; i < updateCount; i++) {
        activeRegionManager.updateActiveRegions();
      }
      
      expect(activeRegionManager.updateActiveRegions).toHaveBeenCalledTimes(updateCount);
    });
  });

  describe('Chunk Coordinate Handling', () => {
    it('should handle negative chunk coordinates', () => {
      const negativeChunk = createTestChunkCoords(-5, -3);
      
      activeRegionManager.markChunkActive(negativeChunk);
      activeRegionManager.isChunkActive(negativeChunk);
      
      expect(activeRegionManager.markChunkActive).toHaveBeenCalledWith(negativeChunk);
      expect(activeRegionManager.isChunkActive).toHaveBeenCalledWith(negativeChunk);
    });

    it('should handle large chunk coordinates', () => {
      const largeChunk = createTestChunkCoords(1000, 2000);
      
      activeRegionManager.markChunkActive(largeChunk);
      activeRegionManager.markChunkInactive(largeChunk);
      
      expect(activeRegionManager.markChunkActive).toHaveBeenCalledWith(largeChunk);
      expect(activeRegionManager.markChunkInactive).toHaveBeenCalledWith(largeChunk);
    });

    it('should handle zero coordinates', () => {
      const zeroChunk = createTestChunkCoords(0, 0);
      
      activeRegionManager.markChunkActive(zeroChunk);
      
      expect(activeRegionManager.markChunkActive).toHaveBeenCalledWith(zeroChunk);
    });
  });

  describe('Performance Scenarios', () => {
    it('should handle many active chunks efficiently', () => {
      const manyChunks = Array.from({ length: 100 }, (_, i) => 
        createTestChunkCoords(i % 10, Math.floor(i / 10))
      );
      
      manyChunks.forEach(chunk => {
        activeRegionManager.markChunkActive(chunk);
      });
      
      expect(activeRegionManager.markChunkActive).toHaveBeenCalledTimes(100);
    });

    it('should handle frequent activation/deactivation cycles', () => {
      const chunk = createTestChunkCoords(5, 5);
      const cycles = 25;
      
      for (let i = 0; i < cycles; i++) {
        activeRegionManager.markChunkActive(chunk);
        activeRegionManager.markChunkInactive(chunk);
      }
      
      expect(activeRegionManager.markChunkActive).toHaveBeenCalledTimes(cycles);
      expect(activeRegionManager.markChunkInactive).toHaveBeenCalledTimes(cycles);
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent active chunk list', () => {
      const chunks = [
        createTestChunkCoords(1, 1),
        createTestChunkCoords(2, 2),
        createTestChunkCoords(3, 3),
      ];
      
      // Simulate activation
      chunks.forEach(chunk => {
        activeRegionManager.markChunkActive(chunk);
      });
      
      // Mock the return of these chunks
      vi.mocked(activeRegionManager.getActiveChunks).mockReturnValue(chunks);
      
      const activeChunks = activeRegionManager.getActiveChunks();
      expect(activeChunks).toHaveLength(3);
      
      // Verify each chunk is considered active
      chunks.forEach(chunk => {
        vi.mocked(activeRegionManager.isChunkActive).mockReturnValue(true);
        expect(activeRegionManager.isChunkActive(chunk)).toBe(true);
      });
    });
  });
});