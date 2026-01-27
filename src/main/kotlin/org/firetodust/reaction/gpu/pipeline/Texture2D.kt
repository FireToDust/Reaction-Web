package org.firetodust.reaction.gpu.pipeline

import org.lwjgl.bgfx.BGFX.*

/**
 * GPU 2D texture with typed pixel format.
 * Type parameter T represents the pixel data type on CPU side.
 */
class Texture2D<T>(
    val width: Int,
    val height: Int,
    val format: TextureFormat<T>
) : BufferNode<T>, AutoCloseable {

    override var input: PipelineNode? = null

    override val handle: Short = bgfx_create_texture_2d(
        width,
        height,
        false,  // hasMips
        1,      // numLayers
        format.bgfxFormat,
        format.flags or BGFX_TEXTURE_COMPUTE_WRITE,
        null    // mem (no initial data)
    ).toShort()

    init {
        if (handle == BGFX_INVALID_HANDLE) {
            throw RuntimeException("Failed to create texture 2D")
        }
    }

    override fun close() {
        bgfx_destroy_texture(handle)
    }
}
