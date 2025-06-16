# Graphics System Documentation

The graphics system handles all WebGPU operations for rendering and compute operations.

## Architecture Overview

The graphics system consists of:
- **Renderer**: Main rendering and compute pipeline management
- **Shaders**: WGSL compute and render shaders
- **Buffer Management**: GPU memory and texture handling

## Files Overview

### `renderer.ts`
Main graphics interface providing:
- WebGPU pipeline initialization
- Texture and buffer management
- Render and compute function factories
- Double-buffered texture swapping

### `shaders/reaction.wgsl`
Compute shader for cellular automata processing:
- Workgroup-based parallel processing
- Shared memory optimization
- Binary tree condition evaluation
- 8-way symmetry support

### `shaders/render.wgsl`
Vertex and fragment shaders for visualization:
- Fullscreen quad rendering
- Texture sampling and display
- Camera transformation

## Rendering Pipeline

### Initialization
```typescript
const { device, context } = await setup();
const { renderFunctions, buffers } = await Renderer.init(device, context, gameData);
```

### Frame Loop
```typescript
async function frame() {
  const commandEncoder = device.createCommandEncoder();
  
  // Update game state
  await Renderer.updateBuffers(device, buffers, gameData);
  
  // Run reaction simulation (if time)
  if (shouldUpdate) {
    await renderFunctions.react(commandEncoder);
  }
  
  // Render to screen
  renderFunctions.render(commandEncoder);
  
  // Submit commands
  device.queue.submit([commandEncoder.finish()]);
  requestAnimationFrame(frame);
}
```

## Compute Pipeline (Reactions)

### Workgroup Organization
- **Workgroup Size**: 8x8 threads
- **Shared Memory**: 12x12 tile cache (includes 2-pixel border)
- **Cache Loading**: Distributed across workgroup threads

### Memory Access Pattern
1. **Cache Population**: Each thread loads multiple tiles into shared memory
2. **Synchronization**: Workgroup barrier ensures cache is ready
3. **Condition Evaluation**: Threads read from cache instead of global memory
4. **Result Writing**: Each thread writes one output tile

### Optimization Features
- **Torus Wrapping**: Seamless world boundaries
- **Symmetry Evaluation**: Single rule covers 8 orientations
- **Early Exit**: Condition evaluation stops on first true symmetry
- **Packed Data**: Efficient binary tree encoding

## Render Pipeline

### Fullscreen Rendering
- **Vertex Stage**: Generates fullscreen quad without vertex buffer
- **Fragment Stage**: Samples from game texture and applies camera transform

### Camera System
- **Position**: World-space camera coordinates
- **Zoom**: Independent X/Y zoom factors
- **Real-time Updates**: Camera buffer updated each frame

## Buffer Management

### Texture Swapping
```typescript
// Double-buffered textures for ping-pong operations
const buffers = {
  map1: GPUTexture,        // Current state
  map2: GPUTexture,        // Next state
  reactionRules: GPUTexture, // Rule data
  camera: GPUBuffer,       // Camera parameters
  time: GPUBuffer,         // Game timing
};
```

### Data Upload
- **Initial Upload**: Map and rule data uploaded once at startup
- **Per-Frame Updates**: Camera and timing data updated each frame
- **Efficient Transfer**: Staged uploads through mapping buffers

## Shader Communication

### Bind Groups
- **Group 0**: Textures and buffers for compute/render operations
- **Binding Points**: Consistent layout across compute and render shaders

### Data Flow
```
Game Logic → CPU Buffers → GPU Upload → Compute Shader → Render Shader → Display
```

## Performance Considerations

### Compute Optimization
- **Shared Memory**: Reduces global memory bandwidth by ~8x
- **Workgroup Barriers**: Minimizes synchronization overhead
- **Condition Trees**: Parallel evaluation across symmetries

### Render Optimization
- **No Vertex Buffer**: Fullscreen quad generated in vertex shader
- **Direct Sampling**: Minimal fragment shader operations
- **Camera Transform**: Simple 2D transformation in shader

### Memory Efficiency
- **Compact Encoding**: Rules packed into 32-bit values
- **Texture Storage**: Random access patterns optimized for GPU cache
- **Double Buffering**: Prevents read/write hazards

## Error Handling

The graphics system includes robust error handling:
- **Shader Compilation**: Detailed error reporting for WGSL issues
- **Resource Creation**: Validation of texture and buffer parameters
- **Command Encoding**: Proper pipeline state management

Example:
```typescript
try {
  const pipeline = device.createComputePipeline({
    compute: { module, entryPoint: "main" },
    layout: device.createPipelineLayout({ bindGroupLayouts: [layout] }),
  });
} catch (error) {
  throw new ShaderError(`Failed to create compute pipeline: ${error.message}`);
}
```