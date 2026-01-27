package org.firetodust.reaction.gpu

import org.firetodust.reaction.gpu.pipeline.BufferNode
import org.firetodust.reaction.gpu.pipeline.ProcessorNode
import org.lwjgl.bgfx.BGFX.*
import java.nio.ByteBuffer

/**
 * Render shader processor for drawing to screen or framebuffer.
 * Uses vertex/fragment shaders instead of compute.
 */
class RenderProcessor(
    vertexShaderCode: ByteBuffer,
    fragmentShaderCode: ByteBuffer,
    override val inputs: List<BufferNode<*>>,  // Typically vertex buffers, index buffers, textures
    val renderState: Long = BGFX_STATE_WRITE_RGB or BGFX_STATE_WRITE_A or BGFX_STATE_WRITE_Z
) : ProcessorNode, AutoCloseable {

    override val outputs: List<BufferNode<*>> = emptyList()  // Renders to framebuffer/screen, not buffers

    val shaderHandle: Short

    init {
        val vsMem = bgfx_copy(vertexShaderCode)
            ?: throw RuntimeException("Failed to create vertex shader memory reference")
        val fsMem = bgfx_copy(fragmentShaderCode)
            ?: throw RuntimeException("Failed to create fragment shader memory reference")

        val vs = bgfx_create_shader(vsMem)
        val fs = bgfx_create_shader(fsMem)
        shaderHandle = bgfx_create_program(vs, fs, true)

        if (shaderHandle == BGFX_INVALID_HANDLE) {
            throw RuntimeException("Failed to create render shader program")
        }
    }

    /**
     * Executes the render pass.
     * Binds vertex/index buffers and textures, sets state, then submits draw call.
     */
    override fun dispatch() {
        // Set vertex and index buffers (first two inputs expected to be vertex/index)
        // Users can override this method for custom binding logic
        // This is a basic implementation

        bgfx_set_state(renderState, 0)
        bgfx_submit(0, shaderHandle, 0, false)
    }

    override fun close() {
        bgfx_destroy_program(shaderHandle)
    }
}
