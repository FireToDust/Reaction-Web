import { assert } from "./utils/util";

export default async function setup(): Promise<{device: GPUDevice, context: GPUCanvasContext}>{
    if (navigator.gpu === undefined) {
        const h = document.querySelector('#title') as HTMLElement;
        h.innerText = 'WebGPU is not supported in this browser.';
        return;
      }
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter === null) {
        const h = document.querySelector('#title') as HTMLElement;
        h.innerText = 'No adapter is available for WebGPU.';
        return;
      }
      const device = await adapter.requestDevice();
    
      const canvas = document.querySelector<HTMLCanvasElement>('#webgpu-canvas');
      assert(canvas !== null);
      const observer = new ResizeObserver(() => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    
        // Note: You might want to add logic to resize your render target textures here.
    
      });
      observer.observe(canvas);
      const context = canvas.getContext('webgpu') as GPUCanvasContext;

      return {device, context}
}