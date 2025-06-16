import { randomChoice } from '../utils/util';
import { DEFAULT_TILE_CHANCES } from './game-config';

/**
 * Generates initial map data
 */
export class MapGenerator {
  /**
   * Generate a random map with the given dimensions
   * @param width - Map width
   * @param height - Map height
   * @param tileChances - Array of possible tile values with their relative probabilities
   * @returns Uint32Array containing tile data
   */
  static generateRandomMap(
    width: number, 
    height: number, 
    tileChances: readonly (number)[] = DEFAULT_TILE_CHANCES
  ): Uint32Array {
    const mapData = new Uint32Array(width * height);
    
    for (let i = 0; i < mapData.length; i++) {
      mapData[i] = randomChoice([...tileChances]);
    }
    
    return mapData;
  }

  /**
   * Generate a test pattern map for debugging
   * @param width - Map width
   * @param height - Map height
   * @returns Uint32Array containing test pattern
   */
  static generateTestPattern(width: number, height: number): Uint32Array {
    const mapData = new Uint32Array(width * height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        // Create a checkerboard pattern for testing
        mapData[index] = (x + y) % 2;
      }
    }
    
    return mapData;
  }
}