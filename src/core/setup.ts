import { assert } from "../utils/util";
import { WebGPUError } from "./errors";

export default async function setup(): Promise<{device: GPUDevice, context: GPUCanvasContext}>{
    if (navigator.gpu === undefined) {
        const h = document.querySelector('#title') as HTMLElement;
        if (h) h.innerText = 'WebGPU is not supported in this browser.';
        throw new WebGPUError('WebGPU is not supported in this browser.');
      }
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter === null) {
        const h = document.querySelector('#title') as HTMLElement;
        if (h) h.innerText = 'No adapter is available for WebGPU.';
        throw new WebGPUError('No adapter is available for WebGPU.');
      }
      const device = await adapter.requestDevice();
    
      const canvas = document.querySelector<HTMLCanvasElement>('#webgpu-canvas');
      if (!canvas) {
        throw new WebGPUError('Canvas element not found');
      }
      
      const observer = new ResizeObserver(() => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    
        // Note: You might want to add logic to resize your render target textures here.
      });
      observer.observe(canvas);
      
      const context = canvas.getContext('webgpu');
      if (!context) {
        throw new WebGPUError('Failed to get WebGPU context from canvas');
      }

      return {device, context}
}