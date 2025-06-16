/**
 * Base class for all game-related errors
 */
export class GameError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'GameError';
  }
}

/**
 * Error thrown when WebGPU initialization fails
 */
export class WebGPUError extends GameError {
  constructor(message: string) {
    super(message, 'WEBGPU_ERROR');
    this.name = 'WebGPUError';
  }
}

/**
 * Error thrown when shader compilation fails
 */
export class ShaderError extends GameError {
  constructor(message: string) {
    super(message, 'SHADER_ERROR');
    this.name = 'ShaderError';
  }
}

/**
 * Error thrown when rule validation fails
 */
export class RuleError extends GameError {
  constructor(message: string) {
    super(message, 'RULE_ERROR');
    this.name = 'RuleError';
  }
}

/**
 * Error thrown when buffer operations fail
 */
export class BufferError extends GameError {
  constructor(message: string) {
    super(message, 'BUFFER_ERROR');
    this.name = 'BufferError';
  }
}