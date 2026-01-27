package org.firetodust.reaction.gpu.pipeline

import org.firetodust.reaction.gpu.IndexBuffer
import org.lwjgl.bgfx.BGFX.*
import java.nio.ByteBuffer

/**
 * CPU data source that uploads to GPU buffer.
 * Provides data input to the pipeline.
 */
class Source(
    override val output: BufferNode<T>
) : SourceNode<T> {

    /**
     * Uploads data to the GPU buffer.
     * Data should be a ByteBuffer containing the properly formatted binary data.
     */
    override fun upload(data: T) {
        if (data !is ByteBuffer) {
            throw IllegalArgumentException("Data must be ByteBuffer for GPU upload")
        }

        val mem = bgfx_make_ref(data)
            ?: throw RuntimeException("Failed to create buffer memory reference")

        when (output) {
            is VertexBuffer<*> -> {
                bgfx_update_dynamic_vertex_buffer(output.handle, 0, mem)
            }
            is IndexBuffer -> {
                bgfx_update_dynamic_index_buffer(output.handle, 0, mem)
            }
            is Texture2D<*> -> {
                bgfx_update_texture_2d(
                    output.handle,
                    0,  // layer
                    0,  // mip
                    0, 0,  // x, y
                    output.width,
                    output.height,
                    mem,
                    0xFFFF  // pitch (auto)
                )
            }
            else -> throw IllegalArgumentException("Unsupported buffer type for upload")
        }
    }
}
