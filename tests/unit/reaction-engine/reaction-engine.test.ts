import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  IReactionEngine, 
  ReactionRule, 
  CompiledRuleSet, 
  ReactionValidationResult 
} from '../../../src/reaction-engine/types.js';
import { LayerType } from '../../../src/shared/types.js';
import { createMockReactionEngine } from '../../mocks/mock-implementations.js';
import { createMockGPUDevice, createTestChunkCoords } from '../../utils/test-helpers.js';

describe('IReactionEngine Interface', () => {
  let reactionEngine: IReactionEngine;
  let mockDevice: GPUDevice;

  beforeEach(() => {
    reactionEngine = createMockReactionEngine();
    mockDevice = createMockGPUDevice();
  });

  describe('System Lifecycle', () => {
    it('should initialize with GPU device', async () => {
      await reactionEngine.initialize(mockDevice);
      
      expect(reactionEngine.initialize).toHaveBeenCalledWith(mockDevice);
    });

    it('should shutdown gracefully', async () => {
      await reactionEngine.shutdown();
      
      expect(reactionEngine.shutdown).toHaveBeenCalled();
    });

    it('should handle initialization failure', async () => {
      vi.mocked(reactionEngine.initialize).mockRejectedValue(new Error('Shader compilation failed'));
      
      await expect(reactionEngine.initialize(mockDevice)).rejects.toThrow('Shader compilation failed');
    });
  });

  describe('Reaction Processing', () => {
    it('should process reactions for active chunks', async () => {
      const activeChunks = [
        createTestChunkCoords(0, 0),
        createTestChunkCoords(1, 1),
        createTestChunkCoords(2, 2),
      ];
      
      await reactionEngine.processReactions(activeChunks);
      
      expect(reactionEngine.processReactions).toHaveBeenCalledWith(activeChunks);
    });

    it('should handle empty chunks', async () => {
      const emptyChunks = [];
      
      await reactionEngine.processReactions(emptyChunks);
      
      expect(reactionEngine.processReactions).toHaveBeenCalledWith(emptyChunks);
    });

    it('should handle many active chunks', async () => {
      const manyChunks = Array.from({ length: 64 }, (_, i) => 
        createTestChunkCoords(i % 8, Math.floor(i / 8))
      );
      
      await reactionEngine.processReactions(manyChunks);
      
      expect(reactionEngine.processReactions).toHaveBeenCalledWith(manyChunks);
    });
  });

  describe('Rule Compilation', () => {
    it('should compile single rule set', async () => {
      const rules: ReactionRule[] = [
        {
          id: 'fire_spread',
          name: 'Fire Spreads to Flammable Materials',
          description: 'Fire tiles spread to adjacent flammable tiles',
          priority: 100,
          conditions: [
            {
              type: 'tile_type',
              operator: '==',
              value: 5, // Fire tile type
              position: { x: 0, y: 0 },
              layer: LayerType.Air,
            },
            {
              type: 'neighbor_count',
              operator: '>',
              value: 0,
              position: { x: 1, y: 0 },
              layer: LayerType.Object,
            },
          ],
          actions: [
            {
              type: 'transform',
              targetPosition: { x: 1, y: 0 },
              targetLayer: LayerType.Air,
              newTileType: 5, // Transform to fire
              probability: 0.3,
            },
          ],
          requiredLayers: [LayerType.Air, LayerType.Object],
        },
      ];
      
      const mockCompiledRuleSet: CompiledRuleSet = {
        rules: [{
          id: 'fire_spread',
          priority: 100,
          shaderCode: 'fire_spread_shader_code',
          conditions: [],
          actions: [],
          pattern: { positions: [], rotations: [], reflections: false },
          cooldownFrames: 0,
          triggerLimit: 0,
        }],
        shaderCode: 'compiled_shader_code',
        uniformData: new Float32Array([1, 2, 3, 4]),
        optimizations: {
          rulesOptimized: 1,
          conditionsReduced: 0,
          duplicatesRemoved: 0,
          compilationTimeMs: 150,
        },
        version: '1.0.0',
      };
      
      vi.mocked(reactionEngine.compileRules).mockResolvedValue(mockCompiledRuleSet);
      
      const result = await reactionEngine.compileRules(rules);
      
      expect(reactionEngine.compileRules).toHaveBeenCalledWith(rules);
      expect(result).toEqual(mockCompiledRuleSet);
      expect(result.rules).toHaveLength(1);
      expect(result.optimizations.rulesOptimized).toBe(1);
    });

    it('should compile complex rule set', async () => {
      const complexRules: ReactionRule[] = [
        {
          id: 'water_extinguish_fire',
          name: 'Water Extinguishes Fire',
          description: 'Water tiles extinguish adjacent fire',
          priority: 200,
          conditions: [
            { type: 'tile_type', operator: '==', value: 3, layer: LayerType.Air },
            { type: 'neighbor_count', operator: '>', value: 0, layer: LayerType.Air },
          ],
          actions: [
            { type: 'destroy', targetLayer: LayerType.Air },
            { type: 'create', newTileType: 6, targetLayer: LayerType.Air }, // Steam
          ],
          requiredLayers: [LayerType.Air],
        },
        {
          id: 'rock_fall',
          name: 'Rocks Fall Due to Gravity',
          description: 'Rock tiles fall when unsupported',
          priority: 50,
          conditions: [
            { type: 'tile_type', operator: '==', value: 10, layer: LayerType.Object },
            { type: 'tile_type', operator: '==', value: 0, position: { x: 0, y: 1 }, layer: LayerType.Ground },
          ],
          actions: [
            { type: 'set_velocity', velocity: { x: 0, y: 5 } },
          ],
          requiredLayers: [LayerType.Object, LayerType.Ground],
        },
      ];
      
      const mockComplexRuleSet: CompiledRuleSet = {
        rules: complexRules.map(rule => ({
          id: rule.id,
          priority: rule.priority,
          shaderCode: `${rule.id}_shader`,
          conditions: [],
          actions: [],
          pattern: { positions: [], rotations: [], reflections: false },
          cooldownFrames: 0,
          triggerLimit: 0,
        })),
        shaderCode: 'complex_compiled_shader',
        uniformData: new Float32Array(16),
        optimizations: {
          rulesOptimized: 2,
          conditionsReduced: 1,
          duplicatesRemoved: 0,
          compilationTimeMs: 300,
        },
        version: '1.0.0',
      };
      
      vi.mocked(reactionEngine.compileRules).mockResolvedValue(mockComplexRuleSet);
      
      const result = await reactionEngine.compileRules(complexRules);
      
      expect(result.rules).toHaveLength(2);
      expect(result.optimizations.rulesOptimized).toBe(2);
    });

    it('should handle empty rule set', async () => {
      const emptyRules: ReactionRule[] = [];
      
      const emptyRuleSet: CompiledRuleSet = {
        rules: [],
        shaderCode: '',
        uniformData: new Float32Array(),
        optimizations: {
          rulesOptimized: 0,
          conditionsReduced: 0,
          duplicatesRemoved: 0,
          compilationTimeMs: 0,
        },
        version: '1.0.0',
      };
      
      vi.mocked(reactionEngine.compileRules).mockResolvedValue(emptyRuleSet);
      
      const result = await reactionEngine.compileRules(emptyRules);
      
      expect(result.rules).toHaveLength(0);
    });
  });

  describe('Rule Management', () => {
    it('should load compiled rule set', () => {
      const ruleSet: CompiledRuleSet = {
        rules: [],
        shaderCode: 'test_shader',
        uniformData: new Float32Array([1, 2, 3]),
        optimizations: {
          rulesOptimized: 0,
          conditionsReduced: 0,
          duplicatesRemoved: 0,
          compilationTimeMs: 100,
        },
        version: '1.0.0',
      };
      
      reactionEngine.loadCompiledRules(ruleSet);
      
      expect(reactionEngine.loadCompiledRules).toHaveBeenCalledWith(ruleSet);
    });

    it('should add individual rule', async () => {
      const newRule: ReactionRule = {
        id: 'ice_melt',
        name: 'Ice Melts Near Heat',
        description: 'Ice transforms to water when near fire',
        priority: 150,
        conditions: [
          { type: 'tile_type', operator: '==', value: 8, layer: LayerType.Ground }, // Ice
          { type: 'neighbor_count', operator: '>', value: 0, layer: LayerType.Air }, // Fire nearby
        ],
        actions: [
          { type: 'transform', newTileType: 3, targetLayer: LayerType.Ground }, // Water
        ],
        requiredLayers: [LayerType.Ground, LayerType.Air],
      };
      
      await reactionEngine.addRule(newRule);
      
      expect(reactionEngine.addRule).toHaveBeenCalledWith(newRule);
    });

    it('should remove rule by ID', () => {
      const ruleId = 'fire_spread';
      
      reactionEngine.removeRule(ruleId);
      
      expect(reactionEngine.removeRule).toHaveBeenCalledWith(ruleId);
    });

    it('should handle removing non-existent rule', () => {
      const nonExistentId = 'non_existent_rule';
      
      reactionEngine.removeRule(nonExistentId);
      
      expect(reactionEngine.removeRule).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('Rule Validation', () => {
    it('should validate correct rule', () => {
      const validRule: ReactionRule = {
        id: 'valid_rule',
        name: 'Valid Test Rule',
        description: 'A properly formed rule',
        priority: 100,
        conditions: [
          { type: 'tile_type', operator: '==', value: 1, layer: LayerType.Ground },
        ],
        actions: [
          { type: 'transform', newTileType: 2, targetLayer: LayerType.Ground },
        ],
        requiredLayers: [LayerType.Ground],
      };
      
      const validResult: ReactionValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        compilationTime: 50,
      };
      
      vi.mocked(reactionEngine.validateRule).mockReturnValue(validResult);
      
      const result = reactionEngine.validateRule(validRule);
      
      expect(reactionEngine.validateRule).toHaveBeenCalledWith(validRule);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid rule conditions', () => {
      const invalidRule: ReactionRule = {
        id: 'invalid_rule',
        name: 'Invalid Test Rule',
        description: 'A rule with invalid conditions',
        priority: -1, // Invalid priority
        conditions: [
          { type: 'tile_type', operator: '===', value: 'invalid', layer: LayerType.Ground }, // Invalid operator and value
        ],
        actions: [],
        requiredLayers: [],
      };
      
      const invalidResult: ReactionValidationResult = {
        valid: false,
        errors: [
          'Invalid priority: must be >= 0',
          'Invalid operator: ===',
          'Invalid value type: expected number',
          'No actions specified',
        ],
        warnings: [
          'No required layers specified',
        ],
      };
      
      vi.mocked(reactionEngine.validateRule).mockReturnValue(invalidResult);
      
      const result = reactionEngine.validateRule(invalidRule);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(4);
      expect(result.warnings).toHaveLength(1);
    });

    it('should detect rule warnings', () => {
      const warningRule: ReactionRule = {
        id: 'warning_rule',
        name: 'Rule with Warnings',
        description: 'A valid rule but with potential issues',
        priority: 1000, // Very high priority
        conditions: [
          { type: 'random', operator: '>', value: 0.99, layer: LayerType.Ground }, // Very rare condition
        ],
        actions: [
          { type: 'transform', newTileType: 999, targetLayer: LayerType.Ground }, // Unusual tile type
        ],
        requiredLayers: [LayerType.Ground],
        maxTriggers: 1, // Limited triggers
      };
      
      const warningResult: ReactionValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          'Very high priority (1000) may interfere with other rules',
          'Random condition probability (0.99) is very high',
          'Tile type 999 may not exist in tile atlas',
          'Rule limited to 1 trigger, may not be reusable',
        ],
        compilationTime: 75,
      };
      
      vi.mocked(reactionEngine.validateRule).mockReturnValue(warningResult);
      
      const result = reactionEngine.validateRule(warningRule);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(4);
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle compilation failure', async () => {
      const problematicRules: ReactionRule[] = [
        {
          id: 'problematic_rule',
          name: 'Problematic Rule',
          description: 'A rule that causes compilation issues',
          priority: 100,
          conditions: [],
          actions: [],
          requiredLayers: [],
        },
      ];
      
      vi.mocked(reactionEngine.compileRules).mockRejectedValue(new Error('Shader compilation failed'));
      
      await expect(reactionEngine.compileRules(problematicRules))
        .rejects.toThrow('Shader compilation failed');
    });

    it('should handle large rule sets efficiently', async () => {
      const largeRuleSet: ReactionRule[] = Array.from({ length: 100 }, (_, i) => ({
        id: `rule_${i}`,
        name: `Rule ${i}`,
        description: `Generated rule ${i}`,
        priority: i,
        conditions: [
          { type: 'tile_type', operator: '==', value: i % 10, layer: LayerType.Ground },
        ],
        actions: [
          { type: 'transform', newTileType: (i + 1) % 10, targetLayer: LayerType.Ground },
        ],
        requiredLayers: [LayerType.Ground],
      }));
      
      const largeCompiledSet: CompiledRuleSet = {
        rules: largeRuleSet.map(rule => ({
          id: rule.id,
          priority: rule.priority,
          shaderCode: `${rule.id}_shader`,
          conditions: [],
          actions: [],
          pattern: { positions: [], rotations: [], reflections: false },
          cooldownFrames: 0,
          triggerLimit: 0,
        })),
        shaderCode: 'large_compiled_shader',
        uniformData: new Float32Array(400), // 4 floats per rule
        optimizations: {
          rulesOptimized: 100,
          conditionsReduced: 25,
          duplicatesRemoved: 10,
          compilationTimeMs: 2000,
        },
        version: '1.0.0',
      };
      
      vi.mocked(reactionEngine.compileRules).mockResolvedValue(largeCompiledSet);
      
      const result = await reactionEngine.compileRules(largeRuleSet);
      
      expect(result.rules).toHaveLength(100);
      expect(result.optimizations.rulesOptimized).toBe(100);
      expect(result.optimizations.duplicatesRemoved).toBe(10);
    });

    it('should handle frequent reaction processing', async () => {
      const chunks = [createTestChunkCoords(0, 0)];
      const processCount = 120; // 2 seconds at 60 FPS
      
      for (let i = 0; i < processCount; i++) {
        await reactionEngine.processReactions(chunks);
      }
      
      expect(reactionEngine.processReactions).toHaveBeenCalledTimes(processCount);
    });
  });
});