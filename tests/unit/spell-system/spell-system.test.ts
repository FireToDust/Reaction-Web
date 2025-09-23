import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ISpellSystem, IPlayer, PlayerAction, ManaType } from '../../../src/spell-system/types.js';
import { LayerType } from '../../../src/shared/types.js';
import { createMockSpellSystem, createMockPlayer } from '../../mocks/mock-implementations.js';
import { createTestTilePosition } from '../../utils/test-helpers.js';

describe('ISpellSystem Interface', () => {
  let spellSystem: ISpellSystem;
  let mockPlayer: IPlayer;

  beforeEach(() => {
    spellSystem = createMockSpellSystem();
    mockPlayer = createMockPlayer();
  });

  describe('System Lifecycle', () => {
    it('should initialize successfully', async () => {
      await spellSystem.initialize();
      
      expect(spellSystem.initialize).toHaveBeenCalled();
    });

    it('should shutdown gracefully', async () => {
      await spellSystem.shutdown();
      
      expect(spellSystem.shutdown).toHaveBeenCalled();
    });
  });

  describe('Player Management', () => {
    it('should add player to system', () => {
      spellSystem.addPlayer(mockPlayer);
      
      expect(spellSystem.addPlayer).toHaveBeenCalledWith(mockPlayer);
    });

    it('should remove player from system', () => {
      const playerId = 'player1';
      
      spellSystem.removePlayer(playerId);
      
      expect(spellSystem.removePlayer).toHaveBeenCalledWith(playerId);
    });

    it('should maintain player collection', () => {
      expect(spellSystem.players).toBeInstanceOf(Map);
      expect(spellSystem.players.has('player1')).toBe(true);
    });

    it('should handle multiple players', () => {
      const player2 = createMockPlayer();
      player2.id = 'player2';
      
      spellSystem.addPlayer(player2);
      
      expect(spellSystem.addPlayer).toHaveBeenCalledWith(player2);
    });
  });

  describe('Player Actions Processing', () => {
    it('should process spell casting action', async () => {
      const playerId = 'player1';
      const actions: PlayerAction[] = [{
        type: 'cast_spell',
        spellId: 'fireball',
        targetPosition: createTestTilePosition(10, 15, LayerType.Ground),
      }];
      
      const mockResults = [{
        success: true,
        runeId: 'rune-123',
        manaCost: new Map([[ManaType.Fire, 50]]),
      }];
      
      vi.mocked(spellSystem.processPlayerActions).mockResolvedValue(mockResults);
      
      const results = await spellSystem.processPlayerActions(playerId, actions);
      
      expect(spellSystem.processPlayerActions).toHaveBeenCalledWith(playerId, actions);
      expect(results).toEqual(mockResults);
      expect(results[0].success).toBe(true);
    });

    it('should process movement action', async () => {
      const playerId = 'player1';
      const actions: PlayerAction[] = [{
        type: 'move',
        moveDirection: { x: 1, y: 0 },
      }];
      
      vi.mocked(spellSystem.processPlayerActions).mockResolvedValue([{
        success: true,
      }]);
      
      const results = await spellSystem.processPlayerActions(playerId, actions);
      
      expect(results[0].success).toBe(true);
    });

    it('should process cancel cast action', async () => {
      const playerId = 'player1';
      const actions: PlayerAction[] = [{
        type: 'cancel_cast',
      }];
      
      vi.mocked(spellSystem.processPlayerActions).mockResolvedValue([{
        success: true,
      }]);
      
      const results = await spellSystem.processPlayerActions(playerId, actions);
      
      expect(results[0].success).toBe(true);
    });

    it('should handle failed actions', async () => {
      const playerId = 'player1';
      const actions: PlayerAction[] = [{
        type: 'cast_spell',
        spellId: 'invalid-spell',
        targetPosition: createTestTilePosition(0, 0, LayerType.Ground),
      }];
      
      vi.mocked(spellSystem.processPlayerActions).mockResolvedValue([{
        success: false,
        error: 'Spell not found',
      }]);
      
      const results = await spellSystem.processPlayerActions(playerId, actions);
      
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Spell not found');
    });

    it('should handle multiple actions in sequence', async () => {
      const playerId = 'player1';
      const actions: PlayerAction[] = [
        { type: 'move', moveDirection: { x: 1, y: 0 } },
        { type: 'cast_spell', spellId: 'heal', targetPosition: createTestTilePosition(5, 5, LayerType.Ground) },
        { type: 'move', moveDirection: { x: 0, y: 1 } },
      ];
      
      vi.mocked(spellSystem.processPlayerActions).mockResolvedValue([
        { success: true },
        { success: true, runeId: 'heal-rune' },
        { success: true },
      ]);
      
      const results = await spellSystem.processPlayerActions(playerId, actions);
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('Mana Management', () => {
    it('should update mana recharge', () => {
      const deltaTime = 16.67; // ~60 FPS
      
      spellSystem.updateManaRecharge(deltaTime);
      
      expect(spellSystem.updateManaRecharge).toHaveBeenCalledWith(deltaTime);
    });

    it('should handle variable frame rates', () => {
      const frameTimes = [16.67, 8.33, 33.33, 50]; // Various frame rates
      
      frameTimes.forEach(deltaTime => {
        spellSystem.updateManaRecharge(deltaTime);
      });
      
      expect(spellSystem.updateManaRecharge).toHaveBeenCalledTimes(frameTimes.length);
    });
  });

  describe('Rune Management', () => {
    it('should process rune triggers', async () => {
      await spellSystem.processRuneTriggers();
      
      expect(spellSystem.processRuneTriggers).toHaveBeenCalled();
    });

    it('should handle multiple rune triggers per frame', async () => {
      const triggerCount = 5;
      
      for (let i = 0; i < triggerCount; i++) {
        await spellSystem.processRuneTriggers();
      }
      
      expect(spellSystem.processRuneTriggers).toHaveBeenCalledTimes(triggerCount);
    });
  });

  describe('Spell Validation', () => {
    it('should validate successful spell cast', () => {
      const playerId = 'player1';
      const spellId = 'fireball';
      const target = createTestTilePosition(20, 25, LayerType.Ground);
      
      vi.mocked(spellSystem.validateSpellCast).mockReturnValue({
        valid: true,
        requiredMana: new Map([[ManaType.Fire, 50]]),
      });
      
      const result = spellSystem.validateSpellCast(playerId, spellId, target);
      
      expect(spellSystem.validateSpellCast).toHaveBeenCalledWith(playerId, spellId, target);
      expect(result.valid).toBe(true);
      expect(result.requiredMana?.get(ManaType.Fire)).toBe(50);
    });

    it('should validate failed spell cast due to insufficient mana', () => {
      const playerId = 'player1';
      const spellId = 'meteor';
      const target = createTestTilePosition(30, 30, LayerType.Ground);
      
      vi.mocked(spellSystem.validateSpellCast).mockReturnValue({
        valid: false,
        error: 'Insufficient mana',
        requiredMana: new Map([[ManaType.Fire, 200]]),
      });
      
      const result = spellSystem.validateSpellCast(playerId, spellId, target);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Insufficient mana');
    });

    it('should validate failed spell cast due to invalid target', () => {
      const playerId = 'player1';
      const spellId = 'teleport';
      const invalidTarget = createTestTilePosition(-1, -1, LayerType.Ground);
      
      vi.mocked(spellSystem.validateSpellCast).mockReturnValue({
        valid: false,
        error: 'Invalid target position',
      });
      
      const result = spellSystem.validateSpellCast(playerId, spellId, invalidTarget);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid target position');
    });

    it('should validate spell cast with multiple mana types', () => {
      const playerId = 'player1';
      const spellId = 'lightning_storm';
      const target = createTestTilePosition(15, 15, LayerType.Air);
      
      vi.mocked(spellSystem.validateSpellCast).mockReturnValue({
        valid: true,
        requiredMana: new Map([
          [ManaType.Air, 75],
          [ManaType.Chaos, 25],
        ]),
      });
      
      const result = spellSystem.validateSpellCast(playerId, spellId, target);
      
      expect(result.valid).toBe(true);
      expect(result.requiredMana?.get(ManaType.Air)).toBe(75);
      expect(result.requiredMana?.get(ManaType.Chaos)).toBe(25);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid player ID', async () => {
      const invalidPlayerId = 'nonexistent-player';
      const actions: PlayerAction[] = [{ type: 'move', moveDirection: { x: 1, y: 0 } }];
      
      vi.mocked(spellSystem.processPlayerActions).mockResolvedValue([{
        success: false,
        error: 'Player not found',
      }]);
      
      const results = await spellSystem.processPlayerActions(invalidPlayerId, actions);
      
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Player not found');
    });

    it('should handle empty actions array', async () => {
      const playerId = 'player1';
      const emptyActions: PlayerAction[] = [];
      
      vi.mocked(spellSystem.processPlayerActions).mockResolvedValue([]);
      
      const results = await spellSystem.processPlayerActions(playerId, emptyActions);
      
      expect(results).toEqual([]);
    });

    it('should handle system initialization failure', async () => {
      vi.mocked(spellSystem.initialize).mockRejectedValue(new Error('GPU not available'));
      
      await expect(spellSystem.initialize()).rejects.toThrow('GPU not available');
    });
  });
});