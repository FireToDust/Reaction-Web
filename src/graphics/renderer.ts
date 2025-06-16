import { GameData, GameDataBufferGroup } from "../core/types";
import renderShader from "./shaders/render.wgsl"
import reactionShader from "./shaders/reaction.wgsl"

const cameraData = new Float32Array([0.0, 0.0, 0.0, 0.0]);
const timeData = new Float32Array([0.0]);  

var swapTextures = false


export async function init(device: GPUDevice, canvasContext: GPUCanvasContext, gameData: GameData)
{
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    canvasContext.configure({
        device,
        format: presentationFormat,
        alphaMode: 'opaque',
    });


    let buffers = await buildBuffers(device, gameData)
    let renderFunctions = buildRenderFunctions(device, buffers, presentationFormat, canvasContext)

    
    return {renderFunctions, buffers}
    
}



async function buildBuffers(device: GPUDevice, gameData: GameData): Promise<GameDataBufferGroup> {

    const map1 = device.createTexture({
        label: "Map",
        size: [gameData.mapW, gameData.mapH, 1],
        format: 'r32uint',
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
      })

    const map2 = device.createTexture({
        label: "Map (swapped)",
        size: [gameData.mapW, gameData.mapH, 1],
        format: 'r32uint',
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    })
    let buffers = {
        map1: map1,
        map2: map2,
        map1view: map1.createView(),
        map2view: map2.createView(),
        camera: device.createBuffer({
            label: "Camera",
            size: 16,  // 4 floats (16 bytes)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        }),
        time: device.createBuffer({
            label: "Time",
            size: 4,  // 1 float (4 bytes)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        }),
        reactionRules: device.createTexture({
            label: "Reaction Map",
            size: [128, 128, 1],
            format: 'r32uint',
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        })
        
    }
    updateBuffers(device, buffers, gameData)
    initMap(device, buffers, gameData)
    initRules(device, buffers, gameData)
    return buffers
}

function buildRenderFunctions(device: GPUDevice, buffers: GameDataBufferGroup, presentationFormat: GPUTextureFormat, canvasContext: GPUCanvasContext){
    
    return{
        render: buildRenderFunc(device, buffers, presentationFormat, canvasContext),
        react: buildReactionFunc(device, buffers)
    }
}

async function buildReactionFunc(device:GPUDevice, buffers: GameDataBufferGroup) {
    const module = device.createShaderModule({code: reactionShader});
    const bindGroupLayout = device.createBindGroupLayout({
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            storageTexture: {
              access: "read-only",  // Input texture is read-only
              format: "r32uint",    // Format matches the shader input texture
            },
          },
          {
            binding: 1,
            visibility: GPUShaderStage.COMPUTE,
            storageTexture: {
              access: "write-only", // Output texture is write-only
              format: "r32uint",    // Format matches the shader output texture
            },
          },
          {
            binding: 2,
            visibility: GPUShaderStage.COMPUTE,
            storageTexture: {
                access: "read-only",  // The rules texture is read-only
                format: "r32uint",    // Format of the rules texture
            },
          },
        ],
    });

    const pipeline = device.createComputePipeline({
        compute: {
          module: module,
          entryPoint: "main",
        },
        layout: device.createPipelineLayout({
          bindGroupLayouts: [bindGroupLayout],
        }),
      });

    

    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            { binding: 0, resource: buffers.map2view },
            { binding: 1, resource: buffers.map1view },
            { binding: 2, resource: buffers.reactionRules.createView()}
        ]
    })

    const swapBindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            { binding: 0, resource: buffers.map1view },
            { binding: 1, resource: buffers.map2view },
            { binding: 2, resource: buffers.reactionRules.createView() }
        ]
    })
    
    return async function compute(commandEncoder: GPUCommandEncoder) {
        const computePass = commandEncoder.beginComputePass()
        computePass.setPipeline(pipeline)
        computePass.setBindGroup(0, swapTextures? swapBindGroup: bindGroup)
        
        computePass.dispatchWorkgroups(buffers.map1.width/8, buffers.map1.height/8)
        computePass.end()

        swapTextures = !swapTextures
    }
}

async function buildRenderFunc(device: GPUDevice, buffers: GameDataBufferGroup, presentationFormat: GPUTextureFormat, target: GPUCanvasContext){
    const module = device.createShaderModule({code: renderShader});

    const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
        module: module,
        entryPoint: 'vs_main'
        },
        fragment: {
        module: module,
        entryPoint: 'fs_main',
        targets: [
            {
            format: presentationFormat,
            },
        ],
        },
        primitive: {
        topology: 'triangle-strip',
        },
    });

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: buffers.map2view},
            { binding: 1, resource: { buffer: buffers.camera} }, // Camera State
            { binding: 2, resource: { buffer: buffers.time}}
    ]})

    const swapBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: buffers.map1view},
            { binding: 1, resource: { buffer: buffers.camera} }, // Camera State
            { binding: 2, resource: { buffer: buffers.time}}
    ]})

    return async function render(commandEncoder: GPUCommandEncoder) {
        
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
              {
                view: target.getCurrentTexture().createView(),
                clearValue: { r: 0.0, g: 0.0, b: 0.3, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
              },
            ],
        };
    
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        
       
        passEncoder.setBindGroup(0, swapTextures? swapBindGroup: bindGroup);
    
        
        passEncoder.draw(4); // Fullscreen quad
        passEncoder.end();
    }
    
}

export function updateBuffers(device: GPUDevice, buffers: GameDataBufferGroup, gameData: GameData) {
    cameraData.set([gameData.cameraX, gameData.cameraY, gameData.zoomX, gameData.zoomY]);
    timeData.set([gameData.time])
    device.queue.writeBuffer(buffers.camera, 0, cameraData);
    device.queue.writeBuffer(buffers.time, 0, timeData);
}

export function initMap(device: GPUDevice, buffers: GameDataBufferGroup, gameData: GameData) {
    if (!gameData.map) {
        throw new Error('Map data is undefined');
    }

    const uploadBuffer = device.createBuffer({
    size: gameData.map.byteLength,
    usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE,
    mappedAtCreation: true,
    });

    new Uint32Array(uploadBuffer.getMappedRange()).set(gameData.map);
    uploadBuffer.unmap();
    const commandEncoder = device.createCommandEncoder();

    commandEncoder.copyBufferToTexture(
    {
        buffer: uploadBuffer,
        bytesPerRow: gameData.mapW * 4, // 4 bytes per pixel (r32uint)
    },
    {
        texture: buffers.map1,
    },
    [gameData.mapW, gameData.mapH]
    );

    commandEncoder.copyBufferToTexture(
    {
        buffer: uploadBuffer,
        bytesPerRow: gameData.mapW * 4, // 4 bytes per pixel (r32uint)
    },
    {
        texture: buffers.map2,
    },
    [gameData.mapW, gameData.mapH]
    );
    
    device.queue.submit([commandEncoder.finish()]);
}

export function initRules(device: GPUDevice, buffers: GameDataBufferGroup, gameData: GameData) {
    if (!gameData.rules) {
        throw new Error('Rules data is undefined');
    }

    const uploadBuffer = device.createBuffer({
    size: gameData.rules.byteLength,
    usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE,
    mappedAtCreation: true,
    });

    new Uint32Array(uploadBuffer.getMappedRange()).set(gameData.rules);
    uploadBuffer.unmap();
    const commandEncoder = device.createCommandEncoder();

    commandEncoder.copyBufferToTexture(
    {
        buffer: uploadBuffer,
        bytesPerRow: 512, // 4 bytes per pixel (r32uint)
    },
    {
        texture: buffers.reactionRules,
    },
    [128, 128]
    );
    
    device.queue.submit([commandEncoder.finish()]);
}
