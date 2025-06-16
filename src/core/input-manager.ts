import { GameData } from './types';
import { GAME_CONFIG } from './game-config';

/**
 * Manages keyboard and mouse input for the game
 */
export class InputManager {
  private gameData: GameData;

  constructor(gameData: GameData) {
    this.gameData = gameData;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    document.addEventListener("wheel", (e) => this.handleWheel(e));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const speed = GAME_CONFIG.CAMERA_SPEED;
    
    switch (e.key) {
      case "ArrowUp":
        this.gameData.cameraY += speed / this.gameData.zoomY;
        break;
      case "ArrowDown":
        this.gameData.cameraY -= speed / this.gameData.zoomY;
        break;
      case "ArrowLeft":
        this.gameData.cameraX -= speed / this.gameData.zoomX;
        break;
      case "ArrowRight":
        this.gameData.cameraX += speed / this.gameData.zoomX;
        break;
    }
  }

  private handleWheel(e: WheelEvent): void {
    const zoomFactor = e.deltaY > 0 ? GAME_CONFIG.ZOOM_FACTOR : 1 / GAME_CONFIG.ZOOM_FACTOR;
    this.gameData.zoomX *= zoomFactor;
    this.gameData.zoomY *= zoomFactor;
  }

  /**
   * Clean up event listeners
   */
  dispose(): void {
    // In a real implementation, we'd store the bound functions to remove them
    // For now, this is a placeholder for cleanup logic
  }
}