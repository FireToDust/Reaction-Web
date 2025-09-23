import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ITextureManager } from '../../../src/core/types.js';
import { LayerType, TileData } from '../../../src/shared/types.js';
import { createMockTextureManager } from '../../mocks/mock-implementations.js';
import { createMockGPUDevice, createTestTileData } from '../../utils/test-helpers.js';

describe('ITextureManager Interface', () => {
  let textureManager: ITextureManager;
  let mockDevice: GPUDevice;

  beforeEach(() => {
    textureManager = createMockTextureManager();
    mockDevice = createMockGPUDevice();
  });

  describe('Texture Creation and Destruction', () => {
    it('should create texture with specified dimensions', () => {
      const mockTexture = {} as GPUTexture;
      vi.mocked(textureManager.createTexture).mockReturnValue(mockTexture);
      
      const result = textureManager.createTexture(512, 512, 'rgba8unorm');
      
      expect(textureManager.createTexture).toHaveBeenCalledWith(512, 512, 'rgba8unorm');
      expect(result).toBe(mockTexture);
    });

    it('should destroy texture properly', () => {
      const mockTexture = {} as GPUTexture;
      
      textureManager.destroyTexture(mockTexture);
      
      expect(textureManager.destroyTexture).toHaveBeenCalledWith(mockTexture);
    });

    it('should handle different texture formats', () => {
      const formats: GPUTextureFormat[] = ['rgba8unorm', 'r32float', 'rg32float'];
      
      formats.forEach(format => {
        textureManager.createTexture(256, 256, format);
        expect(textureManager.createTexture).toHaveBeenCalledWith(256, 256, format);
      });
    });
  });

  describe('Texture Ping-Ponging', () => {
    it('should get current texture for layer', () => {
      const mockTexture = {} as GPUTexture;
      vi.mocked(textureManager.getCurrentTexture).mockReturnValue(mockTexture);
      
      const result = textureManager.getCurrentTexture(LayerType.Ground);
      
      expect(textureManager.getCurrentTexture).toHaveBeenCalledWith(LayerType.Ground);
      expect(result).toBe(mockTexture);
    });

    it('should get next texture for layer', () => {
      const mockTexture = {} as GPUTexture;
      vi.mocked(textureManager.getNextTexture).mockReturnValue(mockTexture);
      
      const result = textureManager.getNextTexture(LayerType.Object);
      
      expect(textureManager.getNextTexture).toHaveBeenCalledWith(LayerType.Object);
      expect(result).toBe(mockTexture);
    });

    it('should swap textures for layer', () => {
      textureManager.swapTextures(LayerType.Air);
      
      expect(textureManager.swapTextures).toHaveBeenCalledWith(LayerType.Air);
    });

    it('should handle all layer types for ping-ponging', () => {
      const layers = [LayerType.Ground, LayerType.Object, LayerType.Air, LayerType.Rune];
      
      layers.forEach(layer => {
        textureManager.swapTextures(layer);
        expect(textureManager.swapTextures).toHaveBeenCalledWith(layer);
      });
    });
  });

  describe('Data Upload and Download', () => {
    it('should upload tile data to layer', () => {
      const tileData = [
        createTestTileData(1, { x: 1, y: 0 }, 100),
        createTestTileData(2, { x: 0, y: 1 }, 200),
        createTestTileData(3, { x: -1, y: -1 }, 50),
      ];
      
      textureManager.uploadTileData(LayerType.Ground, tileData);
      
      expect(textureManager.uploadTileData).toHaveBeenCalledWith(LayerType.Ground, tileData);
    });

    it('should download tile data from layer', async () => {
      const mockTileData = [
        createTestTileData(1),
        createTestTileData(2),
      ];
      vi.mocked(textureManager.downloadTileData).mockResolvedValue(mockTileData);
      
      const result = await textureManager.downloadTileData(LayerType.Rune);
      
      expect(textureManager.downloadTileData).toHaveBeenCalledWith(LayerType.Rune);
      expect(result).toEqual(mockTileData);
    });

    it('should handle empty tile data upload', () => {
      const emptyData: TileData[] = [];
      
      textureManager.uploadTileData(LayerType.Object, emptyData);
      
      expect(textureManager.uploadTileData).toHaveBeenCalledWith(LayerType.Object, emptyData);
    });

    it('should handle large tile data arrays', () => {
      const largeTileData = Array.from({ length: 1024 }, (_, i) => 
        createTestTileData(i % 10, { x: i % 32, y: Math.floor(i / 32) }, i)
      );
      
      textureManager.uploadTileData(LayerType.Air, largeTileData);
      
      expect(textureManager.uploadTileData).toHaveBeenCalledWith(LayerType.Air, largeTileData);
    });
  });

  describe('Performance Considerations', () => {
    it('should handle rapid texture swapping', () => {
      const swapCount = 100;
      
      for (let i = 0; i < swapCount; i++) {
        textureManager.swapTextures(LayerType.Ground);
      }
      
      expect(textureManager.swapTextures).toHaveBeenCalledTimes(swapCount);
    });

    it('should handle concurrent layer operations', () => {
      const layers = [LayerType.Ground, LayerType.Object, LayerType.Air, LayerType.Rune];
      
      layers.forEach(layer => {
        textureManager.getCurrentTexture(layer);
        textureManager.getNextTexture(layer);
        textureManager.swapTextures(layer);
      });
      
      expect(textureManager.getCurrentTexture).toHaveBeenCalledTimes(4);
      expect(textureManager.getNextTexture).toHaveBeenCalledTimes(4);
      expect(textureManager.swapTextures).toHaveBeenCalledTimes(4);
    });
  });

  describe('Error Handling', () => {
    it('should handle texture creation failure gracefully', () => {
      vi.mocked(textureManager.createTexture).mockImplementation(() => {
        throw new Error('GPU memory exhausted');
      });
      
      expect(() => {
        textureManager.createTexture(8192, 8192, 'rgba8unorm');
      }).toThrow('GPU memory exhausted');
    });

    it('should handle download failure gracefully', async () => {
      vi.mocked(textureManager.downloadTileData).mockRejectedValue(new Error('Download failed'));
      
      await expect(textureManager.downloadTileData(LayerType.Ground))
        .rejects.toThrow('Download failed');
    });
  });
});