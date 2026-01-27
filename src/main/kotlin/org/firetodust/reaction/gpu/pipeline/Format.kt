package org.firetodust.reaction.gpu.pipeline

import org.lwjgl.bgfx.BGFX.*
import java.nio.ByteBuffer

/**
 * Sealed class that couples GPU format/layout with compile-time type.
 * Ensures type safety when connecting pipeline nodes.
 */

interface GPUData<T: Format>{
    val format: T
    fun pack(): ByteBuffer {return format.pack(this)}
    val size: Int
}

interface Format {
    val bytesPerElement: Int

    // Packs CPU data into a ByteBuffer for the GPU
    fun <T: Format> pack (data: GPUData<T>): ByteBuffer

    // BGFX flags (e.g., BGFX_BUFFER_COMPUTE_WRITE, BGFX_TEXTURE_UAV_FLAG)
    fun getBfxFlags(): Long = 0L
}

// Example: A format for a 4x4 Matrix (Uniform)
object Mat4Format : Format {
    override val bytesPerElement = 64
    override fun pack(data: Any): ByteBuffer {
        return data as? ByteBuffer ?: error("Mat4Format requires a ByteBuffer")
    }
}