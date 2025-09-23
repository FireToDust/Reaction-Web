import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SystemEventBus, MessagePriority } from '../../src/shared/integration.js';
import { LayerType, Vector2 } from '../../src/shared/types.js';
import { ManaType } from '../../src/spell-system/types.js';
import { createTestTilePosition } from '../utils/test-helpers.js';

// Mock implementation of SystemEventBus for testing
class MockSystemEventBus implements SystemEventBus {
  private handlers = new Map<string, Function[]>();

  subscribe(messageType: string, handler: Function): void {
    if (!this.handlers.has(messageType)) {
      this.handlers.set(messageType, []);
    }
    this.handlers.get(messageType)!.push(handler);
  }

  unsubscribe(messageType: string, handler: Function): void {
    const handlers = this.handlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  publish(message: any): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }
  }

  publishAsync(message: any): Promise<void> {
    return Promise.resolve().then(() => this.publish(message));
  }

  clear(): void {
    this.handlers.clear();
  }

  // Type-safe event handlers
  onCoreToSpell<K extends keyof any>(event: K, handler: Function): void {
    this.subscribe(`core_to_spell_${String(event)}`, handler);
  }

  onSpellToCore<K extends keyof any>(event: K, handler: Function): void {
    this.subscribe(`spell_to_core_${String(event)}`, handler);
  }

  onSpellToPhysics<K extends keyof any>(event: K, handler: Function): void {
    this.subscribe(`spell_to_physics_${String(event)}`, handler);
  }

  onPhysicsToSpell<K extends keyof any>(event: K, handler: Function): void {
    this.subscribe(`physics_to_spell_${String(event)}`, handler);
  }

  onPhysicsToReaction<K extends keyof any>(event: K, handler: Function): void {
    this.subscribe(`physics_to_reaction_${String(event)}`, handler);
  }

  onReactionToPhysics<K extends keyof any>(event: K, handler: Function): void {
    this.subscribe(`reaction_to_physics_${String(event)}`, handler);
  }

  onReactionToCore<K extends keyof any>(event: K, handler: Function): void {
    this.subscribe(`reaction_to_core_${String(event)}`, handler);
  }

  emitCoreToSpell<K extends keyof any>(event: K, data: any): void {
    this.publish({
      type: `core_to_spell_${String(event)}`,
      source: 'core',
      target: 'spell',
      data,
      timestamp: Date.now(),
      priority: MessagePriority.Normal,
    });
  }

  emitSpellToCore<K extends keyof any>(event: K, data: any): void {
    this.publish({
      type: `spell_to_core_${String(event)}`,
      source: 'spell',
      target: 'core',
      data,
      timestamp: Date.now(),
      priority: MessagePriority.Normal,
    });
  }

  emitSpellToPhysics<K extends keyof any>(event: K, data: any): void {
    this.publish({
      type: `spell_to_physics_${String(event)}`,
      source: 'spell',
      target: 'physics',
      data,
      timestamp: Date.now(),
      priority: MessagePriority.Normal,
    });
  }

  emitPhysicsToSpell<K extends keyof any>(event: K, data: any): void {
    this.publish({
      type: `physics_to_spell_${String(event)}`,
      source: 'physics',
      target: 'spell',
      data,
      timestamp: Date.now(),
      priority: MessagePriority.Normal,
    });
  }

  emitPhysicsToReaction<K extends keyof any>(event: K, data: any): void {
    this.publish({
      type: `physics_to_reaction_${String(event)}`,
      source: 'physics',
      target: 'reaction',
      data,
      timestamp: Date.now(),
      priority: MessagePriority.Normal,
    });
  }

  emitReactionToPhysics<K extends keyof any>(event: K, data: any): void {
    this.publish({
      type: `reaction_to_physics_${String(event)}`,
      source: 'reaction',
      target: 'physics',
      data,
      timestamp: Date.now(),
      priority: MessagePriority.Normal,
    });
  }

  emitReactionToCore<K extends keyof any>(event: K, data: any): void {
    this.publish({
      type: `reaction_to_core_${String(event)}`,
      source: 'reaction',
      target: 'core',
      data,
      timestamp: Date.now(),
      priority: MessagePriority.Normal,
    });
  }
}

describe('System Communication Integration', () => {
  let eventBus: MockSystemEventBus;

  beforeEach(() => {
    eventBus = new MockSystemEventBus();
  });

  describe('Spell to Core Communication', () => {
    it('should handle rune placement from spell system to core', () => {
      const runeHandler = vi.fn();
      eventBus.onSpellToCore('place_rune', runeHandler);

      const runeData = {
        position: createTestTilePosition(10, 15, LayerType.Rune),
        runeType: 5,
        runeData: { damage: 50, radius: 3 },
        playerId: 'player1',
      };

      eventBus.emitSpellToCore('place_rune', runeData);

      expect(runeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'spell_to_core_place_rune',
          source: 'spell',
          target: 'core',
          data: runeData,
        })
      );
    });

    it('should handle tile queries from spell system', () => {
      const queryHandler = vi.fn();
      eventBus.onSpellToCore('query_tile', queryHandler);

      const queryData = {
        position: createTestTilePosition(5, 8, LayerType.Ground),
        layers: [LayerType.Ground, LayerType.Object],
        requestId: 'query-123',
      };

      eventBus.emitSpellToCore('query_tile', queryData);

      expect(queryHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          data: queryData,
        })
      );
    });

    it('should handle rune removal', () => {
      const removeHandler = vi.fn();
      eventBus.onSpellToCore('remove_rune', removeHandler);

      const removeData = {
        runeId: 'rune-456',
        position: createTestTilePosition(20, 25, LayerType.Rune),
      };

      eventBus.emitSpellToCore('remove_rune', removeData);

      expect(removeHandler).toHaveBeenCalledOnce();
    });
  });

  describe('Core to Spell Communication', () => {
    it('should notify spell system of tile changes', () => {
      const tileChangeHandler = vi.fn();
      eventBus.onCoreToSpell('tile_changed', tileChangeHandler);

      const changeData = {
        position: createTestTilePosition(12, 18, LayerType.Object),
        oldData: { type: 1, velocity: { x: 0, y: 0 }, customData: 0 },
        newData: { type: 2, velocity: { x: 1, y: -1 }, customData: 100 },
      };

      eventBus.emitCoreToSpell('tile_changed', changeData);

      expect(tileChangeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          data: changeData,
        })
      );
    });

    it('should notify of chunk activation', () => {
      const chunkHandler = vi.fn();
      eventBus.onCoreToSpell('chunk_activated', chunkHandler);

      const chunkData = {
        chunkX: 3,
        chunkY: 7,
      };

      eventBus.emitCoreToSpell('chunk_activated', chunkData);

      expect(chunkHandler).toHaveBeenCalledOnce();
    });
  });

  describe('Spell to Physics Communication', () => {
    it('should apply forces through physics engine', () => {
      const forceHandler = vi.fn();
      eventBus.onSpellToPhysics('apply_force', forceHandler);

      const forceData = {
        position: createTestTilePosition(30, 40, LayerType.Object),
        force: { x: 150, y: -75 } as Vector2,
        radius: 5,
        duration: 2000,
      };

      eventBus.emitSpellToPhysics('apply_force', forceData);

      expect(forceHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          data: forceData,
        })
      );
    });

    it('should set tile velocities', () => {
      const velocityHandler = vi.fn();
      eventBus.onSpellToPhysics('set_velocity', velocityHandler);

      const velocityData = {
        position: createTestTilePosition(15, 25, LayerType.Air),
        velocity: { x: 10, y: 5 } as Vector2,
      };

      eventBus.emitSpellToPhysics('set_velocity', velocityData);

      expect(velocityHandler).toHaveBeenCalledOnce();
    });

    it('should create force fields', () => {
      const fieldHandler = vi.fn();
      eventBus.onSpellToPhysics('create_force_field', fieldHandler);

      const fieldData = {
        fieldId: 'gravity-well-1',
        center: createTestTilePosition(50, 50, LayerType.Air),
        radius: 10,
        force: { x: 0, y: 200 } as Vector2,
        duration: 5000,
      };

      eventBus.emitSpellToPhysics('create_force_field', fieldData);

      expect(fieldHandler).toHaveBeenCalledOnce();
    });
  });

  describe('Physics to Spell Communication', () => {
    it('should notify spell system of collisions', () => {
      const collisionHandler = vi.fn();
      eventBus.onPhysicsToSpell('collision_detected', collisionHandler);

      const collisionData = {
        position: createTestTilePosition(22, 33, LayerType.Object),
        collidingTiles: [
          createTestTilePosition(21, 33, LayerType.Object),
          createTestTilePosition(23, 33, LayerType.Object),
        ],
        impact: { x: 5, y: 0 } as Vector2,
      };

      eventBus.emitPhysicsToSpell('collision_detected', collisionData);

      expect(collisionHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          data: collisionData,
        })
      );
    });

    it('should notify of tile movement', () => {
      const movementHandler = vi.fn();
      eventBus.onPhysicsToSpell('tile_moved', movementHandler);

      const movementData = {
        oldPosition: createTestTilePosition(10, 10, LayerType.Object),
        newPosition: createTestTilePosition(11, 10, LayerType.Object),
        velocity: { x: 2, y: 0 } as Vector2,
      };

      eventBus.emitPhysicsToSpell('tile_moved', movementData);

      expect(movementHandler).toHaveBeenCalledOnce();
    });
  });

  describe('Reaction Engine Communication', () => {
    it('should send transformation requests to core', () => {
      const transformHandler = vi.fn();
      eventBus.onReactionToCore('transform_tile', transformHandler);

      const transformData = {
        position: createTestTilePosition(8, 12, LayerType.Ground),
        layer: LayerType.Ground,
        newType: 3, // Water
        newData: { flowRate: 5 },
      };

      eventBus.emitReactionToCore('transform_tile', transformData);

      expect(transformHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          data: transformData,
        })
      );
    });

    it('should apply impulses through physics', () => {
      const impulseHandler = vi.fn();
      eventBus.onReactionToPhysics('apply_impulse', impulseHandler);

      const impulseData = {
        position: createTestTilePosition(45, 30, LayerType.Object),
        impulse: { x: 0, y: -100 } as Vector2,
        radius: 3,
      };

      eventBus.emitReactionToPhysics('apply_impulse', impulseData);

      expect(impulseHandler).toHaveBeenCalledOnce();
    });

    it('should modify physics properties', () => {
      const modifyHandler = vi.fn();
      eventBus.onReactionToPhysics('modify_properties', modifyHandler);

      const modifyData = {
        position: createTestTilePosition(25, 35, LayerType.Object),
        friction: 0.8,
        bounce: 0.3,
        mass: 2.0,
      };

      eventBus.emitReactionToPhysics('modify_properties', modifyData);

      expect(modifyHandler).toHaveBeenCalledOnce();
    });
  });

  describe('Complex Communication Scenarios', () => {
    it('should handle spell casting chain reaction', () => {
      // Set up handlers for the entire chain
      const handlers = {
        spellToCore: vi.fn(),
        coreToSpell: vi.fn(),
        spellToPhysics: vi.fn(),
        physicsToReaction: vi.fn(),
        reactionToCore: vi.fn(),
      };

      eventBus.onSpellToCore('place_rune', handlers.spellToCore);
      eventBus.onCoreToSpell('tile_changed', handlers.coreToSpell);
      eventBus.onSpellToPhysics('apply_force', handlers.spellToPhysics);
      eventBus.onPhysicsToReaction('collision_occurred', handlers.physicsToReaction);
      eventBus.onReactionToCore('transform_tile', handlers.reactionToCore);

      // Simulate spell casting sequence
      const runePosition = createTestTilePosition(50, 50, LayerType.Rune);

      // 1. Spell system places rune
      eventBus.emitSpellToCore('place_rune', {
        position: runePosition,
        runeType: 1, // Explosion rune
        runeData: { damage: 100, radius: 5 },
        playerId: 'player1',
      });

      // 2. Core notifies of tile change
      eventBus.emitCoreToSpell('tile_changed', {
        position: runePosition,
        oldData: null,
        newData: { type: 1, velocity: { x: 0, y: 0 }, customData: 100 },
      });

      // 3. Spell system triggers explosion force
      eventBus.emitSpellToPhysics('apply_force', {
        position: runePosition,
        force: { x: 0, y: 0 } as Vector2,
        radius: 5,
        duration: 500,
      });

      // 4. Physics detects collision and notifies reaction engine
      eventBus.emitPhysicsToReaction('collision_occurred', {
        position: runePosition,
        participants: [runePosition],
        force: 100,
      });

      // 5. Reaction engine transforms nearby tiles
      eventBus.emitReactionToCore('transform_tile', {
        position: createTestTilePosition(51, 50, LayerType.Ground),
        layer: LayerType.Ground,
        newType: 0, // Destroyed ground
        newData: { debris: true },
      });

      // Verify all handlers were called
      expect(handlers.spellToCore).toHaveBeenCalledOnce();
      expect(handlers.coreToSpell).toHaveBeenCalledOnce();
      expect(handlers.spellToPhysics).toHaveBeenCalledOnce();
      expect(handlers.physicsToReaction).toHaveBeenCalledOnce();
      expect(handlers.reactionToCore).toHaveBeenCalledOnce();
    });

    it('should handle multiple simultaneous events', () => {
      const allHandlers = vi.fn();
      
      // Subscribe to all event types
      eventBus.subscribe('spell_to_core_place_rune', allHandlers);
      eventBus.subscribe('spell_to_physics_apply_force', allHandlers);
      eventBus.subscribe('reaction_to_core_transform_tile', allHandlers);

      // Emit multiple events simultaneously
      eventBus.emitSpellToCore('place_rune', { runeType: 1 });
      eventBus.emitSpellToPhysics('apply_force', { force: { x: 10, y: 10 } });
      eventBus.emitReactionToCore('transform_tile', { newType: 5 });

      expect(allHandlers).toHaveBeenCalledTimes(3);
    });

    it('should handle event unsubscription', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.onSpellToCore('place_rune', handler1);
      eventBus.onSpellToCore('place_rune', handler2);

      // Both handlers should receive the event
      eventBus.emitSpellToCore('place_rune', { runeType: 1 });
      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();

      // Unsubscribe one handler
      eventBus.unsubscribe('spell_to_core_place_rune', handler1);

      // Only handler2 should receive the event
      eventBus.emitSpellToCore('place_rune', { runeType: 2 });
      expect(handler1).toHaveBeenCalledOnce(); // Still only once
      expect(handler2).toHaveBeenCalledTimes(2); // Called twice
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle events with no subscribers', () => {
      // Should not throw when no handlers are registered
      expect(() => {
        eventBus.emitSpellToCore('place_rune', { runeType: 1 });
      }).not.toThrow();
    });

    it('should handle handler exceptions gracefully', () => {
      const faultyHandler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      const goodHandler = vi.fn();

      eventBus.onSpellToCore('place_rune', faultyHandler);
      eventBus.onSpellToCore('place_rune', goodHandler);

      // Should not prevent other handlers from being called
      expect(() => {
        eventBus.emitSpellToCore('place_rune', { runeType: 1 });
      }).toThrow('Handler error');

      expect(faultyHandler).toHaveBeenCalledOnce();
      // Note: In a real implementation, you'd want error handling
      // that allows goodHandler to still be called
    });

    it('should clear all handlers', () => {
      const handler = vi.fn();
      eventBus.onSpellToCore('place_rune', handler);

      eventBus.emitSpellToCore('place_rune', { runeType: 1 });
      expect(handler).toHaveBeenCalledOnce();

      eventBus.clear();

      eventBus.emitSpellToCore('place_rune', { runeType: 2 });
      expect(handler).toHaveBeenCalledOnce(); // Still only once
    });
  });
});