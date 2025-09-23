import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IRenderer, RenderScene, Camera, Viewport, UIElement, UIElementType } from '../../../src/renderer/types.js';
import { createMockRenderer } from '../../mocks/mock-implementations.js';
import { createMockCanvas, createMockGPUDevice } from '../../utils/test-helpers.js';

describe('IRenderer Interface', () => {
  let renderer: IRenderer;
  let mockCanvas: HTMLCanvasElement;
  let mockDevice: GPUDevice;

  beforeEach(() => {
    renderer = createMockRenderer();
    mockCanvas = createMockCanvas();
    mockDevice = createMockGPUDevice();
  });

  describe('System Lifecycle', () => {
    it('should initialize with canvas and GPU device', async () => {
      await renderer.initialize(mockCanvas, mockDevice);
      
      expect(renderer.initialize).toHaveBeenCalledWith(mockCanvas, mockDevice);
    });

    it('should shutdown gracefully', async () => {
      await renderer.shutdown();
      
      expect(renderer.shutdown).toHaveBeenCalled();
    });

    it('should handle initialization failure', async () => {
      vi.mocked(renderer.initialize).mockRejectedValue(new Error('WebGPU not supported'));
      
      await expect(renderer.initialize(mockCanvas, mockDevice))
        .rejects.toThrow('WebGPU not supported');
    });
  });

  describe('Scene Rendering', () => {
    it('should render complete scene', async () => {
      const camera: Camera = {
        position: { x: 100, y: 100 },
        zoom: 1.0,
        rotation: 0,
        smoothing: 0.1,
      };

      const viewport: Viewport = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
      };

      const scene: RenderScene = {
        camera,
        viewport,
        layers: [],
        uiElements: [],
        effects: {
          particles: [],
          spellEffects: [],
          runes: [],
          forceFields: [],
        },
        lighting: {
          ambientLight: { r: 0.2, g: 0.2, b: 0.2 },
          directionalLights: [],
          pointLights: [],
          runeGlow: true,
          spellGlow: true,
        },
      };

      await renderer.render(scene);
      
      expect(renderer.render).toHaveBeenCalledWith(scene);
    });

    it('should handle empty scene', async () => {
      const emptyScene: RenderScene = {
        camera: { position: { x: 0, y: 0 }, zoom: 1, rotation: 0, smoothing: 0 },
        viewport: { x: 0, y: 0, width: 800, height: 600 },
        layers: [],
        uiElements: [],
        effects: { particles: [], spellEffects: [], runes: [], forceFields: [] },
        lighting: {
          ambientLight: { r: 0.1, g: 0.1, b: 0.1 },
          directionalLights: [],
          pointLights: [],
          runeGlow: false,
          spellGlow: false,
        },
      };

      await renderer.render(emptyScene);
      
      expect(renderer.render).toHaveBeenCalledWith(emptyScene);
    });

    it('should handle complex scene with many elements', async () => {
      const complexCamera: Camera = {
        position: { x: 500, y: 300 },
        zoom: 2.5,
        rotation: Math.PI / 4,
        target: { x: 600, y: 400 },
        smoothing: 0.05,
      };

      const uiElements: UIElement[] = [
        {
          id: 'mana-flower-1',
          type: UIElementType.ManaFlower,
          position: { x: 50, y: 50 },
          size: { x: 32, y: 32 },
          visible: true,
          opacity: 1.0,
          interactive: false,
          data: { manaType: 0, currentMana: 75, maxMana: 100 },
        },
        {
          id: 'spell-button-1',
          type: UIElementType.SpellButton,
          position: { x: 100, y: 50 },
          size: { x: 48, y: 48 },
          visible: true,
          opacity: 0.8,
          interactive: true,
          data: { spellId: 'fireball', available: true },
        },
      ];

      const complexScene: RenderScene = {
        camera: complexCamera,
        viewport: { x: 0, y: 0, width: 1920, height: 1080 },
        layers: [],
        uiElements,
        effects: { particles: [], spellEffects: [], runes: [], forceFields: [] },
        lighting: {
          ambientLight: { r: 0.3, g: 0.3, b: 0.4 },
          directionalLights: [
            {
              direction: { x: 1, y: -1 },
              color: { r: 1, g: 0.9, b: 0.7 },
              intensity: 0.8,
            },
          ],
          pointLights: [
            {
              position: { x: 400, y: 300 },
              color: { r: 1, g: 0.5, b: 0.2 },
              intensity: 1.0,
              radius: 100,
              falloff: 2.0,
            },
          ],
          runeGlow: true,
          spellGlow: true,
        },
        postProcessing: {
          bloom: {
            enabled: true,
            threshold: 0.7,
            intensity: 1.2,
            radius: 3,
          },
          colorGrading: {
            enabled: true,
            brightness: 1.1,
            contrast: 1.0,
            saturation: 1.1,
            hue: 0,
          },
          screenShake: {
            enabled: false,
            intensity: 0,
            duration: 0,
            frequency: 0,
          },
          fxaa: true,
        },
      };

      await renderer.render(complexScene);
      
      expect(renderer.render).toHaveBeenCalledWith(complexScene);
    });
  });

  describe('Camera Management', () => {
    it('should set camera position and properties', () => {
      const camera: Camera = {
        position: { x: 250, y: 180 },
        zoom: 1.5,
        rotation: Math.PI / 6,
        smoothing: 0.08,
      };

      renderer.setCamera(camera);
      
      expect(renderer.setCamera).toHaveBeenCalledWith(camera);
    });

    it('should handle camera with target', () => {
      const cameraWithTarget: Camera = {
        position: { x: 0, y: 0 },
        zoom: 1.0,
        rotation: 0,
        target: { x: 500, y: 300 },
        smoothing: 0.1,
      };

      renderer.setCamera(cameraWithTarget);
      
      expect(renderer.setCamera).toHaveBeenCalledWith(cameraWithTarget);
    });

    it('should handle extreme camera values', () => {
      const extremeCamera: Camera = {
        position: { x: -99999, y: 99999 },
        zoom: 0.001,
        rotation: Math.PI * 4, // Multiple rotations
        smoothing: 0,
      };

      renderer.setCamera(extremeCamera);
      
      expect(renderer.setCamera).toHaveBeenCalledWith(extremeCamera);
    });
  });

  describe('Viewport Management', () => {
    it('should set viewport dimensions', () => {
      const viewport: Viewport = {
        x: 100,
        y: 50,
        width: 640,
        height: 480,
      };

      renderer.setViewport(viewport);
      
      expect(renderer.setViewport).toHaveBeenCalledWith(viewport);
    });

    it('should handle full screen viewport', () => {
      const fullScreenViewport: Viewport = {
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
      };

      renderer.setViewport(fullScreenViewport);
      
      expect(renderer.setViewport).toHaveBeenCalledWith(fullScreenViewport);
    });

    it('should handle small viewport', () => {
      const smallViewport: Viewport = {
        x: 0,
        y: 0,
        width: 320,
        height: 240,
      };

      renderer.setViewport(smallViewport);
      
      expect(renderer.setViewport).toHaveBeenCalledWith(smallViewport);
    });
  });

  describe('UI Element Management', () => {
    it('should add UI element', () => {
      const uiElement: UIElement = {
        id: 'health-bar',
        type: UIElementType.HealthBar,
        position: { x: 10, y: 10 },
        size: { x: 200, y: 20 },
        visible: true,
        opacity: 0.9,
        interactive: false,
        data: { currentHealth: 80, maxHealth: 100 },
      };

      renderer.addUIElement(uiElement);
      
      expect(renderer.addUIElement).toHaveBeenCalledWith(uiElement);
    });

    it('should remove UI element by ID', () => {
      const elementId = 'health-bar';

      renderer.removeUIElement(elementId);
      
      expect(renderer.removeUIElement).toHaveBeenCalledWith(elementId);
    });

    it('should update UI element', () => {
      const elementId = 'mana-bar';
      const updates = {
        position: { x: 50, y: 50 },
        opacity: 0.7,
        data: { currentMana: 30, maxMana: 100 },
      };

      renderer.updateUIElement(elementId, updates);
      
      expect(renderer.updateUIElement).toHaveBeenCalledWith(elementId, updates);
    });

    it('should handle all UI element types', () => {
      const elementTypes = [
        UIElementType.ManaFlower,
        UIElementType.SpellButton,
        UIElementType.HealthBar,
        UIElementType.Text,
        UIElementType.Panel,
        UIElementType.Button,
        UIElementType.DebugText,
      ];

      elementTypes.forEach((type, index) => {
        const element: UIElement = {
          id: `element-${index}`,
          type,
          position: { x: index * 50, y: 10 },
          size: { x: 40, y: 40 },
          visible: true,
          opacity: 1.0,
          interactive: type === UIElementType.Button || type === UIElementType.SpellButton,
          data: {},
        };

        renderer.addUIElement(element);
      });

      expect(renderer.addUIElement).toHaveBeenCalledTimes(elementTypes.length);
    });

    it('should handle invisible UI elements', () => {
      const invisibleElement: UIElement = {
        id: 'hidden-panel',
        type: UIElementType.Panel,
        position: { x: 0, y: 0 },
        size: { x: 100, y: 100 },
        visible: false,
        opacity: 0.0,
        interactive: false,
        data: {},
      };

      renderer.addUIElement(invisibleElement);
      
      expect(renderer.addUIElement).toHaveBeenCalledWith(invisibleElement);
    });

    it('should handle UI elements with zero size', () => {
      const zeroSizeElement: UIElement = {
        id: 'point-element',
        type: UIElementType.Text,
        position: { x: 100, y: 100 },
        size: { x: 0, y: 0 },
        visible: true,
        opacity: 1.0,
        interactive: false,
        data: { text: 'Point' },
      };

      renderer.addUIElement(zeroSizeElement);
      
      expect(renderer.addUIElement).toHaveBeenCalledWith(zeroSizeElement);
    });
  });

  describe('Performance Considerations', () => {
    it('should handle many UI elements efficiently', () => {
      const manyElements = Array.from({ length: 100 }, (_, i) => ({
        id: `element-${i}`,
        type: UIElementType.Text,
        position: { x: i % 10 * 50, y: Math.floor(i / 10) * 30 },
        size: { x: 40, y: 20 },
        visible: true,
        opacity: 1.0,
        interactive: false,
        data: { text: `Element ${i}` },
      }));

      manyElements.forEach(element => {
        renderer.addUIElement(element);
      });

      expect(renderer.addUIElement).toHaveBeenCalledTimes(100);
    });

    it('should handle rapid camera updates', () => {
      const updateCount = 60; // Simulate 1 second at 60 FPS

      for (let i = 0; i < updateCount; i++) {
        const camera: Camera = {
          position: { x: i * 2, y: i },
          zoom: 1.0 + i * 0.01,
          rotation: i * 0.1,
          smoothing: 0.1,
        };
        renderer.setCamera(camera);
      }

      expect(renderer.setCamera).toHaveBeenCalledTimes(updateCount);
    });

    it('should handle frequent viewport changes', () => {
      const resolutions = [
        { width: 800, height: 600 },
        { width: 1024, height: 768 },
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
        { width: 2560, height: 1440 },
      ];

      resolutions.forEach(resolution => {
        const viewport: Viewport = {
          x: 0,
          y: 0,
          width: resolution.width,
          height: resolution.height,
        };
        renderer.setViewport(viewport);
      });

      expect(renderer.setViewport).toHaveBeenCalledTimes(resolutions.length);
    });
  });

  describe('Error Handling', () => {
    it('should handle render failure gracefully', async () => {
      const scene: RenderScene = {
        camera: { position: { x: 0, y: 0 }, zoom: 1, rotation: 0, smoothing: 0 },
        viewport: { x: 0, y: 0, width: 800, height: 600 },
        layers: [],
        uiElements: [],
        effects: { particles: [], spellEffects: [], runes: [], forceFields: [] },
        lighting: {
          ambientLight: { r: 0.1, g: 0.1, b: 0.1 },
          directionalLights: [],
          pointLights: [],
          runeGlow: false,
          spellGlow: false,
        },
      };

      vi.mocked(renderer.render).mockRejectedValue(new Error('Render pipeline failed'));

      await expect(renderer.render(scene)).rejects.toThrow('Render pipeline failed');
    });

    it('should handle invalid UI element updates', () => {
      const invalidElementId = 'non-existent-element';
      const updates = { opacity: 0.5 };

      // Should not throw, but handle gracefully
      renderer.updateUIElement(invalidElementId, updates);
      
      expect(renderer.updateUIElement).toHaveBeenCalledWith(invalidElementId, updates);
    });

    it('should handle removing non-existent elements', () => {
      const nonExistentId = 'ghost-element';

      // Should not throw, but handle gracefully
      renderer.removeUIElement(nonExistentId);
      
      expect(renderer.removeUIElement).toHaveBeenCalledWith(nonExistentId);
    });

    it('should handle invalid camera values', () => {
      const invalidCamera: Camera = {
        position: { x: NaN, y: Infinity },
        zoom: -1, // Invalid negative zoom
        rotation: NaN,
        smoothing: -0.5, // Invalid negative smoothing
      };

      // Should not throw, but handle gracefully
      renderer.setCamera(invalidCamera);
      
      expect(renderer.setCamera).toHaveBeenCalledWith(invalidCamera);
    });
  });
});