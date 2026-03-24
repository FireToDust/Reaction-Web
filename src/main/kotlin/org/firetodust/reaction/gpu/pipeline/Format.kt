package org.firetodust.reaction.gpu.pipeline

import org.lwjgl.bgfx.BGFX.*
import org.lwjgl.bgfx.BGFXVertexLayout
import java.nio.ByteBuffer

// CPU Data - just ByteBuffer + Format
data class CPUData<R, F: IFormat<R>>(
    val format: F,
    val byteBuffer: ByteBuffer
)

/**
 * Interface for GPU resources that must be explicitly destroyed.
 * All BGFX handles (textures, buffers, etc.) must be destroyed to prevent GPU memory leaks.
 */
interface GPUResource {
    /**
     * Destroy this GPU resource and free GPU memory.
     * Must be called when the resource is no longer needed.
     * Calling destroy() multiple times is safe (no-op after first call).
     */
    fun destroy()

    /**
     * Check if this resource has been destroyed.
     */
    fun isDestroyed(): Boolean
}

// GPU Data - inheritance for type conversion
interface IBufferData : GPUResource {
    val handle: Short
}

interface ITextureData : GPUResource {
    val handle: Short
}

data class VertexBufferData(override val handle: Short) : IBufferData {
    private var destroyed = false

    override fun destroy() {
        if (!destroyed) {
            bgfx_destroy_dynamic_vertex_buffer(handle)
            destroyed = true
        }
    }

    override fun isDestroyed() = destroyed
}

data class IndexBufferData(override val handle: Short) : IBufferData {
    private var destroyed = false

    override fun destroy() {
        if (!destroyed) {
            bgfx_destroy_dynamic_index_buffer(handle)
            destroyed = true
        }
    }

    override fun isDestroyed() = destroyed
}

data class TextureData(override val handle: Short) : ITextureData {
    private var destroyed = false

    override fun destroy() {
        if (!destroyed) {
            bgfx_destroy_texture(handle)
            destroyed = true
        }
    }

    override fun isDestroyed() = destroyed
}

data class FrameBufferData(val handle: Short)
data class UniformData(val byteBuffer: ByteBuffer)

/**
 * Format interface that describes the structure and metadata of a resource.
 *
 * @param R The resource type - the underlying data representation (e.g., TextureData, VertexBufferData, UniformData).
 *          This represents the actual system-level resource that the format describes.
 */
interface IFormat<R>

sealed interface IUniformFormat<R> : IFormat<R> {
    val name: String
    val count: Int
}

data class Vec4Format(override val name: String, override val count: Int) : IUniformFormat<UniformData>
data class Mat3Format(override val name: String, override val count: Int) : IUniformFormat<UniformData>
data class Mat4Format(override val name: String, override val count: Int) : IUniformFormat<UniformData>

data class SamplerFormat(override val name: String, override val count: Int) : IUniformFormat<TextureData>

interface IVertexBufferFormat: IFormat<VertexBufferData>{
    val layout: BGFXVertexLayout
}

enum class BGFXTextureFormat(val bgfxConstant: Int, val bytesPerPixel: Int) {
    RGBA8(BGFX_TEXTURE_FORMAT_RGBA8, 4);

    companion object {
        /**
         * Get bytes per pixel for a texture format.
         */
        fun getBytesPerPixel(format: BGFXTextureFormat): Int = format.bytesPerPixel

        /**
         * Get BGFX constant for a texture format.
         */
        fun getBGFXConstant(format: BGFXTextureFormat): Int = format.bgfxConstant
    }
}

enum class IndexType { UINT16, UINT32 }

interface IIndexBufferFormat : IFormat<IndexBufferData> {
    val type: IndexType
    val count: Int
}

interface ITextureFormat : IFormat<TextureData> {
    val width: Int
    val height: Int
    val format: BGFXTextureFormat
    val hasMips: Boolean
    val layers: Int
}