export interface GameData {
    time: number; // The time from the start of the game in seconds
    rules: Uint32Array | undefined;
    map: Uint32Array | undefined; // The game map data.
    mapW: number; // The dimensions of the map
    mapH: number; 
    cameraX: number; // The x and y position of the camera.
    cameraY: number;
    zoomX: number;   // The camera zoom level.
    zoomY: number;
}

export interface GameDataBufferGroup {
    map1: GPUTexture;
    map2: GPUTexture;
    map1view: GPUTextureView;
    map2view: GPUTextureView;
    reactionRules: GPUTexture;
    camera: GPUBuffer;
    time: GPUBuffer;
}