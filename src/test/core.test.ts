import { describe, it, expect } from 'vitest';
import { GameData } from '../core/types';
import { InputManager } from '../core/input-manager';
import { MapGenerator } from '../core/map-generator';
import { GAME_CONFIG } from '../core/game-config';
import { GameError, WebGPUError, RuleError } from '../core/errors';

describe('Core System', () => {
  describe('Types', () => {
    it('should create valid GameData object', () => {
      const gameData: GameData = {
        time: 0,
        rules: undefined,
        map: undefined,
        mapW: 256,
        mapH: 256,
        cameraX: 128,
        cameraY: 128,
        zoomX: 30,
        zoomY: 30,
      };
      
      expect(gameData.mapW).toBe(256);
      expect(gameData.mapH).toBe(256);
      expect(gameData.time).toBe(0);
    });
  });

  describe('MapGenerator', () => {
    it('should generate map with correct dimensions', () => {
      const map = MapGenerator.generateRandomMap(100, 100);
      expect(map.length).toBe(10000);
      expect(map).toBeInstanceOf(Uint32Array);
    });

    it('should generate test pattern correctly', () => {
      const map = MapGenerator.generateTestPattern(4, 4);
      expect(map.length).toBe(16);
      
      // Check checkerboard pattern
      expect(map[0]).toBe(0); // (0,0) -> 0+0 = 0 % 2 = 0
      expect(map[1]).toBe(1); // (1,0) -> 1+0 = 1 % 2 = 1
      expect(map[4]).toBe(1); // (0,1) -> 0+1 = 1 % 2 = 1
      expect(map[5]).toBe(0); // (1,1) -> 1+1 = 2 % 2 = 0
    });

    it('should throw error for empty tile choices', () => {
      expect(() => MapGenerator.generateRandomMap(10, 10, [])).toThrow('Cannot select from empty array');
    });
  });

  describe('InputManager', () => {
    it('should create input manager with valid game data', () => {
      const gameData: GameData = {
        time: 0,
        rules: undefined,
        map: undefined,
        mapW: 256,
        mapH: 256,
        cameraX: 128,
        cameraY: 128,
        zoomX: 30,
        zoomY: 30,
      };
      
      const inputManager = new InputManager(gameData);
      expect(inputManager).toBeDefined();
    });
  });

  describe('Game Config', () => {
    it('should have valid configuration constants', () => {
      expect(GAME_CONFIG.MAP_WIDTH).toBe(256);
      expect(GAME_CONFIG.MAP_HEIGHT).toBe(256);
      expect(GAME_CONFIG.UPDATE_PERIOD).toBe(0.1);
      expect(GAME_CONFIG.CAMERA_SPEED).toBe(0.01);
      expect(GAME_CONFIG.ZOOM_FACTOR).toBe(1.1);
    });
  });

  describe('Error Classes', () => {
    it('should create GameError with message and code', () => {
      const error = new GameError('Test error', 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('GameError');
    });

    it('should create WebGPUError', () => {
      const error = new WebGPUError('WebGPU failed');
      expect(error.message).toBe('WebGPU failed');
      expect(error.code).toBe('WEBGPU_ERROR');
      expect(error.name).toBe('WebGPUError');
    });

    it('should create RuleError', () => {
      const error = new RuleError('Rule invalid');
      expect(error.message).toBe('Rule invalid');
      expect(error.code).toBe('RULE_ERROR');
      expect(error.name).toBe('RuleError');
    });

    it('should be instanceof GameError', () => {
      const webgpuError = new WebGPUError('test');
      const ruleError = new RuleError('test');
      
      expect(webgpuError).toBeInstanceOf(GameError);
      expect(ruleError).toBeInstanceOf(GameError);
      expect(webgpuError).toBeInstanceOf(WebGPUError);
      expect(ruleError).toBeInstanceOf(RuleError);
    });
  });
});