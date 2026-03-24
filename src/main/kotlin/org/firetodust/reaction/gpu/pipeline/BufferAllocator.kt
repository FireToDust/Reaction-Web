package org.firetodust.reaction.gpu.pipeline

import org.firetodust.reaction.window.BGFXContext
import org.lwjgl.bgfx.BGFX.*

/**
 * BGFX invalid handle constant.
 * BGFX returns 0xFFFF (65535 unsigned, -1 signed) for failed handle creation.
 */
private const val BGFX_INVALID_HANDLE: Short = -1

/**
 * Validate a BGFX handle and throw if invalid.
 * @throws RuntimeException if handle is invalid
 */
private fun validateHandle(handle: Short, resourceType: String, details: String) {
    if (handle == BGFX_INVALID_HANDLE) {
        throw RuntimeException(
            "Failed to create $resourceType. " +
            "Details: $details\n" +
            "This may be due to:\n" +
            "  - Out of GPU memory\n" +
            "  - Invalid resource parameters\n" +
            "  - GPU driver limits exceeded\n" +
            "  - BGFX not properly initialized"
        )
    }
}

interface ResourceAllocator {
    fun <R, F : IFormat<R>> allocate(spec: ExecutionSpec<R, F>): R

    fun with(allocator: ResourceAllocator): ResourceAllocator {
        return CompositeResourceAllocator(listOf(allocator, this))
    }

    companion object {
        fun default(context: BGFXContext): ResourceAllocator {
            // Verify context is valid
            require(BGFXContext.isInitialized()) {
                "BGFXContext must be initialized before creating ResourceAllocator.\n" +
                "Create a Window first: val window = Window(WindowConfig(...))"
            }

            return CompositeResourceAllocator(
                listOf(
                    VertexBufferAllocator(),
                    IndexBufferAllocator(),
                    TextureAllocator()
                )
            )
        }
    }
}

private class CompositeResourceAllocator(
    private val allocators: List<ResourceAllocator>
) : ResourceAllocator {

    override fun <R, F : IFormat<R>> allocate(spec: ExecutionSpec<R, F>): R {
        allocators.forEach { allocator ->
            try {
                return allocator.allocate(spec)
            } catch (e: UnsupportedOperationException) {
            }
        }
        throw UnsupportedOperationException(
            "No allocator supports format: ${spec.format::class.simpleName}. " +
            "Add a custom allocator via ResourceAllocator.default().with(yourAllocator)"
        )
    }

    override fun with(allocator: ResourceAllocator): ResourceAllocator {
        return CompositeResourceAllocator(listOf(allocator) + allocators)
    }
}

private class VertexBufferAllocator : ResourceAllocator {
    override fun <R, F : IFormat<R>> allocate(spec: ExecutionSpec<R, F>): R {
        val format = spec.format
        if (format !is IVertexBufferFormat) {
            throw UnsupportedOperationException("VertexBufferAllocator only supports IVertexBufferFormat")
        }

        val result = allocateVertexBuffer(format, spec.context)

        @Suppress("UNCHECKED_CAST")
        return result as R
    }

    private fun allocateVertexBuffer(format: IVertexBufferFormat, context: IExecutionContext<*, *>): VertexBufferData {
        // Get flags from context, or use default
        val contextFlags = (context as? GPUExecutionContext<*, *>)?.flags ?: 0
        val flags = contextFlags or BGFX_BUFFER_ALLOW_RESIZE

        val handle = bgfx_create_dynamic_vertex_buffer(
            1,  // Initial vertex count - will be updated when data is uploaded
            format.layout,
            flags
        )

        validateHandle(handle, "Vertex Buffer", "Dynamic vertex buffer with layout ${format.layout}")

        return VertexBufferData(handle)
    }
}

private class IndexBufferAllocator : ResourceAllocator {
    override fun <R, F : IFormat<R>> allocate(spec: ExecutionSpec<R, F>): R {
        val format = spec.format
        if (format !is IIndexBufferFormat) {
            throw UnsupportedOperationException("IndexBufferAllocator only supports IIndexBufferFormat")
        }

        val result = allocateIndexBuffer(format, spec.context)

        @Suppress("UNCHECKED_CAST")
        return result as R
    }

    private fun allocateIndexBuffer(format: IIndexBufferFormat, context: IExecutionContext<*, *>): IndexBufferData {
        // Get flags from context
        val contextFlags = (context as? GPUExecutionContext<*, *>)?.flags ?: 0

        // Add format-derived flags (INDEX32 based on type)
        val formatFlags = when (format.type) {
            IndexType.UINT16 -> 0
            IndexType.UINT32 -> BGFX_BUFFER_INDEX32
        }

        // Combine with allocator-internal flag (ALLOW_RESIZE always set for dynamic buffers)
        val bufferFlags = contextFlags or formatFlags or BGFX_BUFFER_ALLOW_RESIZE

        val handle = bgfx_create_dynamic_index_buffer(
            1,  // Initial index count - will be updated when data is uploaded
            bufferFlags
        )

        validateHandle(handle, "Index Buffer", "Dynamic ${format.type} index buffer")

        return IndexBufferData(handle)
    }
}

private class TextureAllocator : ResourceAllocator {
    override fun <R, F : IFormat<R>> allocate(spec: ExecutionSpec<R, F>): R {
        val format = spec.format
        if (format !is ITextureFormat) {
            throw UnsupportedOperationException("TextureAllocator only supports ITextureFormat")
        }

        val result = allocateTexture(format, spec.context)

        @Suppress("UNCHECKED_CAST")
        return result as R
    }

    private fun allocateTexture(format: ITextureFormat, context: IExecutionContext<*, *>): TextureData {
        // Validate dimensions
        require(format.width > 0 && format.height > 0) {
            "Texture dimensions must be positive: got ${format.width}x${format.height}"
        }
        require(format.layers > 0) {
            "Texture layers must be positive: got ${format.layers}"
        }

        // Get flags from context, or use defaults
        val contextFlags = (context as? GPUExecutionContext<*, *>)?.flags?.toLong()
            ?: (BGFX_TEXTURE_READ_BACK)  // Default: READ_BACK for CPU readback capability

        // Create texture with the specified format
        val handle = bgfx_create_texture_2d(
            format.width,
            format.height,
            format.hasMips,
            format.layers,
            format.format.bgfxConstant,
            contextFlags,
            null  // No initial data - will be uploaded later
        )

        validateHandle(
            handle,
            "Texture2D",
            "${format.width}x${format.height} ${format.format} texture (mips=${format.hasMips}, layers=${format.layers})"
        )

        return TextureData(handle)
    }
}