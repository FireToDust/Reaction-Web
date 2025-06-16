import { describe, it, expect, beforeEach } from 'vitest';
import { Rules, Reaction, Tile, Dir, tileAt, and, or } from '../rules/rules';
import { MapGenerator } from '../core/map-generator';
import { GameData } from '../core/types';

describe('Integration Tests', () => {
  let gameData: GameData;
  let rules: Rules;

  beforeEach(() => {
    gameData = {
      time: 0,
      rules: undefined,
      map: undefined,
      mapW: 64,
      mapH: 64,
      cameraX: 32,
      cameraY: 32,
      zoomX: 10,
      zoomY: 10,
    };

    rules = new Rules();
  });

  describe('Map Generation + Rules', () => {
    it('should create map and apply rules without errors', () => {
      // Generate a simple test map
      gameData.map = MapGenerator.generateRandomMap(64, 64, [Tile.GRASS, Tile.WATER]);
      
      // Create a simple rule: grass near water becomes mud
      const grassToMud = new Reaction(Tile.MUD, -1);
      grassToMud.add_condition(tileAt(Tile.WATER, Dir.N), 2);
      
      rules.add_reaction(Tile.GRASS, grassToMud);
      gameData.rules = rules.getData();
      
      expect(gameData.map).toBeDefined();
      expect(gameData.rules).toBeDefined();
      expect(gameData.rules.length).toBeGreaterThan(0);
    });

    it('should handle complex rule combinations', () => {
      gameData.map = MapGenerator.generateTestPattern(8, 8);
      
      // Complex condition: water flow detection
      const waterFlow = and(
        tileAt(Tile.WATER, Dir.N, 1),
        or(
          tileAt(Tile.WATER, Dir.E, 1),
          tileAt(Tile.WATER, Dir.W, 1)
        )
      );
      
      const erosion = new Reaction(Tile.MUD, -2);
      erosion.add_condition(waterFlow, 3);
      
      rules.add_reaction(Tile.GRASS, erosion);
      gameData.rules = rules.getData();
      
      expect(gameData.rules).toBeDefined();
    });
  });

  describe('Rule System Validation', () => {
    it('should validate tile type limits', () => {
      const reaction = new Reaction(Tile.MUD, 0);
      
      // Should work for valid tile types
      expect(() => rules.add_reaction(Tile.GRASS, reaction)).not.toThrow();
      
      // Should fail for invalid tile types
      expect(() => rules.add_reaction(999, reaction)).toThrow('Tile type out of range');
    });

    it('should handle maximum reactions per tile', () => {
      const grassReactions = [];
      
      // Add maximum number of reactions
      for (let i = 0; i < 8; i++) {
        const reaction = new Reaction(Tile.MUD, i);
        grassReactions.push(reaction);
        expect(() => rules.add_reaction(Tile.GRASS, reaction)).not.toThrow();
      }
      
      // Adding one more should fail
      const extraReaction = new Reaction(Tile.MUD, 0);
      expect(() => rules.add_reaction(Tile.GRASS, extraReaction)).toThrow('Too many reactions');
    });

    it('should handle maximum conditions per reaction', () => {
      const reaction = new Reaction(Tile.MUD, 0);
      
      // Add maximum number of conditions
      for (let i = 0; i < 16; i++) {
        const condition = tileAt(Tile.WATER, Dir.N);
        expect(() => reaction.add_condition(condition, i)).not.toThrow();
      }
      
      // Adding one more should fail
      const extraCondition = tileAt(Tile.WATER, Dir.S);
      expect(() => reaction.add_condition(extraCondition, 1)).toThrow('Too many conditions');
    });
  });

  describe('Data Format Validation', () => {
    it('should produce valid rule data format', () => {
      const reaction = new Reaction(Tile.MUD, -3);
      reaction.add_condition(tileAt(Tile.WATER, Dir.N), 2);
      
      rules.add_reaction(Tile.GRASS, reaction);
      const ruleData = rules.getData();
      
      // Should be a Uint32Array
      expect(ruleData).toBeInstanceOf(Uint32Array);
      
      // Should have expected size (128x128)
      expect(ruleData.length).toBe(128 * 128);
      
      // Should contain non-zero data where rules are defined
      const hasNonZeroData = Array.from(ruleData).some(value => value !== 0);
      expect(hasNonZeroData).toBe(true);
    });

    it('should maintain data consistency after multiple operations', () => {
      // Add several reactions
      const reactions = [
        new Reaction(Tile.MUD, -1),
        new Reaction(Tile.WATER, 0),
        new Reaction(Tile.LAVA, 1),
      ];
      
      reactions.forEach((reaction, index) => {
        reaction.add_condition(tileAt(Tile.GRASS, Dir.N), index);
        rules.add_reaction(Tile.GRASS, reaction);
      });
      
      const ruleData1 = rules.getData();
      const ruleData2 = rules.getData();
      
      // Multiple calls should return identical data
      expect(ruleData1).toEqual(ruleData2);
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle large maps efficiently', () => {
      const startTime = performance.now();
      
      // Generate a large map
      const largeMap = MapGenerator.generateRandomMap(512, 512);
      
      const mapTime = performance.now() - startTime;
      expect(mapTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(largeMap.length).toBe(512 * 512);
    });

    it('should handle complex rule sets efficiently', () => {
      const startTime = performance.now();
      
      // Create multiple complex rules
      for (let tileType = 0; tileType < 6; tileType++) {
        for (let reactionIndex = 0; reactionIndex < 4; reactionIndex++) {
          const reaction = new Reaction((tileType + 1) % 6, reactionIndex - 2);
          
          // Add multiple conditions
          for (let condIndex = 0; condIndex < 8; condIndex++) {
            const condition = and(
              tileAt(tileType, condIndex % 8),
              or(
                tileAt((tileType + 1) % 6, (condIndex + 1) % 8),
                tileAt((tileType + 2) % 6, (condIndex + 2) % 8)
              )
            );
            reaction.add_condition(condition, condIndex);
          }
          
          rules.add_reaction(tileType, reaction);
        }
      }
      
      const rulesTime = performance.now() - startTime;
      expect(rulesTime).toBeLessThan(1000); // Should complete in under 1 second
      
      const ruleData = rules.getData();
      expect(ruleData).toBeDefined();
    });
  });
});