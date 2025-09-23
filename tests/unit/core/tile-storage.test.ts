import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ITileStorage } from '../../../src/core/types.js';
import { LayerType, TilePosition, TileData } from '../../../src/shared/types.js';
import { createMockTileStorage } from '../../mocks/mock-implementations.js';
import { createTestTilePosition, createTestTileData } from '../../utils/test-helpers.js';

describe('ITileStorage Interface', () => {
  let tileStorage: ITileStorage;

  beforeEach(() => {
    tileStorage = createMockTileStorage();
  });

  describe('Tile Management', () => {
    it('should get tile at position', () => {
      const position = createTestTilePosition(10, 20, LayerType.Ground);
      const mockTile = createTestTileData(1, { x: 0, y: 0 }, 100);
      
      vi.mocked(tileStorage.getTile).mockReturnValue(mockTile);
      
      const result = tileStorage.getTile(position);
      
      expect(tileStorage.getTile).toHaveBeenCalledWith(position);
      expect(result).toEqual(mockTile);
    });

    it('should return null for empty tile', () => {
      const position = createTestTilePosition(0, 0, LayerType.Ground);
      
      vi.mocked(tileStorage.getTile).mockReturnValue(null);
      
      const result = tileStorage.getTile(position);
      
      expect(result).toBeNull();
    });

    it('should set tile at position', () => {
      const position = createTestTilePosition(5, 15, LayerType.Object);
      const tileData = createTestTileData(2, { x: 1, y: -1 }, 50);
      
      tileStorage.setTile(position, tileData);
      
      expect(tileStorage.setTile).toHaveBeenCalledWith(position, tileData);
    });

    it('should handle all layer types', () => {
      const layers = [LayerType.Ground, LayerType.Object, LayerType.Air, LayerType.Rune];
      const tileData = createTestTileData(1);
      
      layers.forEach(layer => {
        const position = createTestTilePosition(0, 0, layer);
        tileStorage.setTile(position, tileData);
        
        expect(tileStorage.setTile).toHaveBeenCalledWith(position, tileData);
      });
    });
  });

  describe('Layer-specific Operations', () => {
    it('should get tile from specific layer', () => {
      const mockTile = createTestTileData(3);
      vi.mocked(tileStorage.getTileLayer).mockReturnValue(mockTile);
      
      const result = tileStorage.getTileLayer(LayerType.Air, 8, 12);
      
      expect(tileStorage.getTileLayer).toHaveBeenCalledWith(LayerType.Air, 8, 12);
      expect(result).toEqual(mockTile);
    });

    it('should set tile in specific layer', () => {
      const tileData = createTestTileData(4, { x: 2, y: 3 });
      
      tileStorage.setTileLayer(LayerType.Rune, 10, 15, tileData);
      
      expect(tileStorage.setTileLayer).toHaveBeenCalledWith(LayerType.Rune, 10, 15, tileData);
    });
  });

  describe('Chunk Operations', () => {
    it('should get chunk tiles', () => {
      const chunk = { x: 2, y: 3 };
      const mockTiles = [
        createTestTileData(1),
        createTestTileData(2),
        createTestTileData(3),
      ];
      
      vi.mocked(tileStorage.getChunkTiles).mockReturnValue(mockTiles);
      
      const result = tileStorage.getChunkTiles(chunk, LayerType.Ground);
      
      expect(tileStorage.getChunkTiles).toHaveBeenCalledWith(chunk, LayerType.Ground);
      expect(result).toEqual(mockTiles);
      expect(result).toHaveLength(3);
    });

    it('should set chunk tiles', () => {
      const chunk = { x: 1, y: 4 };
      const tiles = [
        createTestTileData(1, { x: 0, y: 1 }),
        createTestTileData(2, { x: -1, y: 0 }),
      ];
      
      tileStorage.setChunkTiles(chunk, LayerType.Object, tiles);
      
      expect(tileStorage.setChunkTiles).toHaveBeenCalledWith(chunk, LayerType.Object, tiles);
    });

    it('should handle empty chunk', () => {
      const chunk = { x: 0, y: 0 };
      vi.mocked(tileStorage.getChunkTiles).mockReturnValue([]);
      
      const result = tileStorage.getChunkTiles(chunk, LayerType.Ground);
      
      expect(result).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative coordinates', () => {
      const position = createTestTilePosition(-5, -10, LayerType.Ground);
      const tileData = createTestTileData(1);
      
      tileStorage.setTile(position, tileData);
      
      expect(tileStorage.setTile).toHaveBeenCalledWith(position, tileData);
    });

    it('should handle large coordinates', () => {
      const position = createTestTilePosition(999999, 999999, LayerType.Air);
      
      tileStorage.getTile(position);
      
      expect(tileStorage.getTile).toHaveBeenCalledWith(position);
    });

    it('should handle zero velocity tiles', () => {
      const tileData = createTestTileData(1, { x: 0, y: 0 }, 0);
      const position = createTestTilePosition(0, 0, LayerType.Object);
      
      tileStorage.setTile(position, tileData);
      
      expect(tileStorage.setTile).toHaveBeenCalledWith(position, tileData);
    });
  });
});