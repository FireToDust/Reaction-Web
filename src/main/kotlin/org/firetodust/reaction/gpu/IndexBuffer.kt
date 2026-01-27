package org.firetodust.reaction.gpu

import org.firetodust.reaction.gpu.pipeline.BufferNode
import org.firetodust.reaction.gpu.pipeline.IndexFormat
import org.firetodust.reaction.gpu.pipeline.PipelineNode
import org.lwjgl.bgfx.BGFX.*

/**
 * GPU index buffer for indexed drawing.
 * Type is always ShortArray (16-bit indices).
 */
class IndexBuffer(
    val indexCount: Int
) : BufferNode<ShortArray>, AutoCloseable {

    override var input: PipelineNode? = null

    override val handle: Short = bgfx_create_dynamic_index_buffer(
        indexCount,
        IndexFormat.flags
    )

    init {
        if (handle == BGFX_INVALID_HANDLE) {
            throw RuntimeException("Failed to create index buffer")
        }
    }

    override fun close() {
        bgfx_destroy_dynamic_index_buffer(handle)
    }
}
