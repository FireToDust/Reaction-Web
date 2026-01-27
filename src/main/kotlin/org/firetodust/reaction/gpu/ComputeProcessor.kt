package org.firetodust.reaction.gpu

import org.firetodust.reaction.gpu.pipeline.BufferNode
import org.firetodust.reaction.gpu.pipeline.ProcessorNode
import org.lwjgl.bgfx.BGFX.*
import java.nio.ByteBuffer

/**
 * Compute shader processor with universal execution.
 * Stores shader and binding information for pipeline to execute.
 */
class ComputeProcessor(
    shaderCode: ByteBuffer,
    override val inputs: List<BufferNode<*>>,
    override val outputs: List<BufferNode<*>>,
    val dispatchSize: Triple<Int, Int, Int> = Triple(1, 1, 1)
) : ProcessorNode, AutoCloseable {

    val shaderHandle: Short

    init {
        val shaderMem = bgfx_copy(shaderCode)
            ?: throw RuntimeException("Failed to create shader memory reference")

        val shader = bgfx_create_shader(shaderMem)
        shaderHandle = bgfx_create_program(shader, true)

        if (shaderHandle == BGFX_INVALID_HANDLE) {
            throw RuntimeException("Failed to create compute shader program")
        }
    }

    /**
     * Executes the compute shader.
     * Binds inputs to buffers 0..N, outputs to buffers N+1..M, then dispatches.
     */
    override fun dispatch() {
        var bindingIndex = 0.toByte()

        // Bind input buffers
        inputs.forEach { buffer ->
            bgfx_set_buffer(bindingIndex++, buffer.handle, BGFX_ACCESS_READ)
        }

        // Bind output buffers
        outputs.forEach { buffer ->
            bgfx_set_buffer(bindingIndex++, buffer.handle, BGFX_ACCESS_WRITE)
        }

        // Dispatch compute work
        val (x, y, z) = dispatchSize
        bgfx_dispatch(0, shaderHandle, x, y, z)
    }

    override fun close() {
        bgfx_destroy_program(shaderHandle)
    }
}
