import { describe, it, expect } from 'vitest';
import { Rules, Reaction, Tile, Dir, tileAt, and, or, not } from '../rules/rules';

describe('Rules System', () => {
  describe('Tile enum', () => {
    it('should have expected tile types', () => {
      expect(Tile.VOID).toBe(0);
      expect(Tile.WATER).toBe(1);
      expect(Tile.LAVA).toBe(2);
      expect(Tile.MAGIC).toBe(3);
      expect(Tile.GRASS).toBe(4);
      expect(Tile.MUD).toBe(5);
    });
  });

  describe('Dir enum', () => {
    it('should have 8 directions', () => {
      expect(Dir.N).toBe(0);
      expect(Dir.NE).toBe(1);
      expect(Dir.E).toBe(2);
      expect(Dir.SE).toBe(3);
      expect(Dir.S).toBe(4);
      expect(Dir.SW).toBe(5);
      expect(Dir.W).toBe(6);
      expect(Dir.NW).toBe(7);
    });
  });

  describe('tileAt', () => {
    it('should create TileAt condition with default distance', () => {
      const condition = tileAt(Tile.WATER, Dir.N);
      expect(condition).toBeDefined();
      expect(condition.getData()).toBeGreaterThan(0);
    });

    it('should create TileAt condition with custom distance', () => {
      const condition = tileAt(Tile.WATER, Dir.N, 2);
      expect(condition).toBeDefined();
      expect(condition.getData()).toBeGreaterThan(0);
    });
  });

  describe('logical operators', () => {
    it('should create AND condition', () => {
      const cond1 = tileAt(Tile.WATER, Dir.N);
      const cond2 = tileAt(Tile.GRASS, Dir.S);
      const andCondition = and(cond1, cond2);
      expect(andCondition).toBeDefined();
    });

    it('should create OR condition', () => {
      const cond1 = tileAt(Tile.WATER, Dir.N);
      const cond2 = tileAt(Tile.GRASS, Dir.S);
      const orCondition = or(cond1, cond2);
      expect(orCondition).toBeDefined();
    });

    it('should create NOT condition', () => {
      const cond = tileAt(Tile.WATER, Dir.N);
      const notCondition = not(cond);
      expect(notCondition).toBeDefined();
    });
  });

  describe('Reaction', () => {
    it('should create reaction with result tile and bias', () => {
      const reaction = new Reaction(Tile.MUD, -3);
      expect(reaction).toBeDefined();
      expect(reaction.getData()).toBeInstanceOf(Uint32Array);
    });

    it('should add conditions to reaction', () => {
      const reaction = new Reaction(Tile.MUD, -3);
      const condition = tileAt(Tile.WATER, Dir.N);
      
      expect(() => reaction.add_condition(condition, 2)).not.toThrow();
    });
  });

  describe('Rules', () => {
    it('should create rules with default initialization', () => {
      const rules = new Rules();
      expect(rules).toBeDefined();
      expect(rules.getData()).toBeInstanceOf(Uint32Array);
    });

    it('should add reactions for tile types', () => {
      const rules = new Rules();
      const reaction = new Reaction(Tile.MUD, -3);
      
      expect(() => rules.add_reaction(Tile.GRASS, reaction)).not.toThrow();
    });

    it('should throw error for invalid tile type', () => {
      const rules = new Rules();
      const reaction = new Reaction(Tile.MUD, -3);
      
      expect(() => rules.add_reaction(999, reaction)).toThrow('Tile type out of range');
    });
  });
});