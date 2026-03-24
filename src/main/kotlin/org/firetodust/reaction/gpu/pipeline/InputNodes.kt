package org.firetodust.reaction.gpu.pipeline

import org.lwjgl.bgfx.BGFX.*

class VertexBufferInputNode(
    private val format: IVertexBufferFormat
) : InputNode<VertexBufferData, IVertexBufferFormat> {
    private var cpuData: CPUData<VertexBufferData, IVertexBufferFormat>? = null
    override var outputs: List<PipelineEdge<VertexBufferData, IVertexBufferFormat>> = emptyList()
    override val edges: List<PipelineEdge<*, *>> get() = outputs
    override val outputSource = this

    override fun setInput(input: CPUData<VertexBufferData, IVertexBufferFormat>) {
        cpuData = input
    }

    override fun execute() {
        val data = cpuData ?: throw IllegalStateException("No input data set for VertexBufferInputNode")

        // Get the already-allocated buffer from the edge and upload data to it
        outputs.forEach { edge ->
            val buffer = edge.allocatedResource
                ?: throw IllegalStateException("No buffer allocated for VertexBufferInputNode output")

            val memory = bgfx_make_ref(data.byteBuffer)
                ?: throw RuntimeException("Failed to create buffer memory reference")
            bgfx_update_dynamic_vertex_buffer(buffer.handle, 0, memory)
        }
    }
}

class IndexBufferInputNode(
    private val format: IIndexBufferFormat
) : InputNode<IndexBufferData, IIndexBufferFormat> {
    private var cpuData: CPUData<IndexBufferData, IIndexBufferFormat>? = null
    override var outputs: List<PipelineEdge<IndexBufferData, IIndexBufferFormat>> = emptyList()
    override val edges: List<PipelineEdge<*, *>> get() = outputs
    override val outputSource = this

    override fun setInput(input: CPUData<IndexBufferData, IIndexBufferFormat>) {
        cpuData = input
    }

    override fun execute() {
        val data = cpuData ?: throw IllegalStateException("No input data set for IndexBufferInputNode")

         // Get the already-allocated buffer from the edge and upload data to it
        outputs.forEach { edge ->
            val buffer = edge.allocatedResource
                ?: throw IllegalStateException("No buffer allocated for IndexBufferInputNode output")

            val memory = bgfx_make_ref(data.byteBuffer)
                ?: throw RuntimeException("Failed to create buffer memory reference")
            bgfx_update_dynamic_index_buffer(buffer.handle, 0, memory)
        }
    }
}

class TextureInputNode(
    private val format: ITextureFormat
) : InputNode<TextureData, ITextureFormat> {
    private var cpuData: CPUData<TextureData, ITextureFormat>? = null
    override var outputs: List<PipelineEdge<TextureData, ITextureFormat>> = emptyList()
    override val edges: List<PipelineEdge<*, *>> get() = outputs
    override val outputSource = this

    override fun setInput(input: CPUData<TextureData, ITextureFormat>) {
        cpuData = input
    }

    override fun execute() {
        val data = cpuData ?: throw IllegalStateException("No input data set for TextureInputNode")

        // Validate buffer size matches format
        val bytesPerPixel = format.format.bytesPerPixel
        val expectedSize = format.width * format.height * bytesPerPixel
        val actualSize = data.byteBuffer.capacity()
        require(actualSize >= expectedSize) {
            "ByteBuffer size mismatch: expected at least $expectedSize bytes " +
            "for ${format.width}x${format.height} ${format.format} texture " +
            "($bytesPerPixel bytes/pixel), but got $actualSize bytes"
        }

        // Get the already-allocated buffer from the edge and upload data to it
        outputs.forEach { edge ->
            val buffer = edge.allocatedResource
                ?: throw IllegalStateException("No buffer allocated for TextureInputNode output")

            val memory = bgfx_make_ref(data.byteBuffer)
                ?: throw RuntimeException("Failed to create buffer memory reference")
            bgfx_update_texture_2d(
                buffer.handle,
                0,  // layer
                0,  // mip level
                0, 0,  // x, y offset
                format.width,
                format.height,
                memory,
                0xFFFF  // pitch
            )
        }
    }
}