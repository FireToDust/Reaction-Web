import { Tile } from '../rules/rules';

/**
 * Game configuration constants
 */
export const GAME_CONFIG = {
  MAP_WIDTH: 2 ** 8,
  MAP_HEIGHT: 2 ** 8,
  DEFAULT_CAMERA_X: 2 ** 7,
  DEFAULT_CAMERA_Y: 2 ** 7,
  DEFAULT_ZOOM_X: 30,
  DEFAULT_ZOOM_Y: 30,
  UPDATE_PERIOD: 0.1,
  CAMERA_SPEED: 0.01,
  ZOOM_FACTOR: 1.1,
} as const;

/**
 * Default tile distribution for map generation
 */
export const DEFAULT_TILE_CHANCES = [
  ...Array(100).fill(Tile.GRASS),
  Tile.WATER,
  20, // Sand (hardcoded value - should be moved to Tile enum)
  20,
  20,
] as const;