package org.firetodust.reaction.gpu.pipeline

import org.firetodust.reaction.gpu.pipeline.builder.PipelineNodeInitKey
import org.lwjgl.bgfx.BGFX.*
import javax.xml.transform.OutputKeys

/**
 * GPU vertex buffer with typed layout.
 * Type parameter T represents the vertex structure on CPU side.
 */
class VertexBuffer<T>: PipelineNodeInitKey.WithInput<>(
    val vertexCount: Int,
    val format: VertexFormat<T>
) : BufferNode<T>, AutoCloseable {

    override var input: PipelineNode? = null

    override val handle: Short = bgfx_create_dynamic_vertex_buffer(
        vertexCount,
        format.layout,
        format.flags
    )

    init {
        if (handle == BGFX_INVALID_HANDLE) {
            throw RuntimeException("Failed to create vertex buffer")
        }
    }

    override fun close() {
        bgfx_destroy_dynamic_vertex_buffer(handle)
    }
}
