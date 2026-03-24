package org.firetodust.reaction.gpu.pipeline

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Deferred
import org.lwjgl.bgfx.BGFX.*
import java.nio.ByteBuffer

/**
 * Output node for vertex buffers using CPU shadow copy approach.
 *
 * BGFX Limitation: Dynamic vertex buffers don't support direct GPU→CPU readback.
 * This node requires the edge to maintain a CPU shadow copy of the data.
 *
 * For GPU-generated vertex data (from compute shaders), use storage buffers or textures instead.
 *
 * TODO: Replace with composite node approach:
 *   1. Add CompositeNode support (nodes containing sub-graphs)
 *   2. Add CPU-side node support (nodes that run on CPU)
 *   3. NodeFactory returns composite: Buffer→Texture shader + TextureOutput + CPU Texture→Buffer
 *   This allows proper GPU readback for all buffer types via texture intermediate.
 */
class VertexBufferOutputNode(
    private val format: IVertexBufferFormat
) : OutputNode<VertexBufferData, IVertexBufferFormat> {
    private val resultDeferred = CompletableDeferred<CPUData<VertexBufferData, IVertexBufferFormat>>()
    override var inputs: List<PipelineEdge<VertexBufferData, IVertexBufferFormat>> = emptyList()
    override val edges: List<PipelineEdge<*, *>> get() = inputs
    override val inputSource = this

    /**
     * CPU shadow copy of the vertex buffer data.
     * This must be set externally when data is uploaded to the GPU buffer.
     */
    var shadowCopy: ByteBuffer? = null

    override fun getOutputDeferred(): Deferred<CPUData<VertexBufferData, IVertexBufferFormat>> {
        return resultDeferred
    }

    override fun execute() {
        // Get the GPU buffer from the input edge
        val inputEdge = inputs.firstOrNull()
            ?: throw IllegalStateException("No input edge for VertexBufferOutputNode")

        val gpuBuffer = inputEdge.allocatedResource
            ?: throw IllegalStateException("No GPU buffer allocated for VertexBufferOutputNode input")

        // Return shadow copy if available
        val cpuData = shadowCopy
            ?: throw IllegalStateException(
                "No CPU shadow copy available for vertex buffer readback. " +
                "BGFX does not support direct vertex buffer download. " +
                "Options:\n" +
                "  1. Set shadowCopy on this node when uploading data\n" +
                "  2. Use TextureOutputNode or storage buffers for GPU-generated data\n" +
                "  3. Process data on CPU instead of GPU"
            )

        // Complete the deferred with CPU data
        resultDeferred.complete(CPUData(format, cpuData))
    }
}

/**
 * Output node for index buffers using CPU shadow copy approach.
 *
 * BGFX Limitation: Dynamic index buffers don't support direct GPU→CPU readback.
 * This node requires the edge to maintain a CPU shadow copy of the data.
 *
 * For GPU-generated index data (from compute shaders), use storage buffers or textures instead.
 *
 * TODO: Replace with composite node approach:
 *   1. Add CompositeNode support (nodes containing sub-graphs)
 *   2. Add CPU-side node support (nodes that run on CPU)
 *   3. NodeFactory returns composite: Buffer→Texture shader + TextureOutput + CPU Texture→Buffer
 *   This allows proper GPU readback for all buffer types via texture intermediate.
 */
class IndexBufferOutputNode(
    private val format: IIndexBufferFormat
) : OutputNode<IndexBufferData, IIndexBufferFormat> {
    private val resultDeferred = CompletableDeferred<CPUData<IndexBufferData, IIndexBufferFormat>>()
    override var inputs: List<PipelineEdge<IndexBufferData, IIndexBufferFormat>> = emptyList()
    override val edges: List<PipelineEdge<*, *>> get() = inputs
    override val inputSource = this

    /**
     * CPU shadow copy of the index buffer data.
     * This must be set externally when data is uploaded to the GPU buffer.
     */
    var shadowCopy: ByteBuffer? = null

    override fun getOutputDeferred(): Deferred<CPUData<IndexBufferData, IIndexBufferFormat>> {
        return resultDeferred
    }

    override fun execute() {
        // Get the GPU buffer from the input edge
        val inputEdge = inputs.firstOrNull()
            ?: throw IllegalStateException("No input edge for IndexBufferOutputNode")

        val gpuBuffer = inputEdge.allocatedResource
            ?: throw IllegalStateException("No GPU buffer allocated for IndexBufferOutputNode input")

        // Return shadow copy if available
        val cpuData = shadowCopy
            ?: throw IllegalStateException(
                "No CPU shadow copy available for index buffer readback. " +
                "BGFX does not support direct index buffer download. " +
                "Options:\n" +
                "  1. Set shadowCopy on this node when uploading data\n" +
                "  2. Use TextureOutputNode or storage buffers for GPU-generated data\n" +
                "  3. Process data on CPU instead of GPU"
            )

        // Complete the deferred with CPU data
        resultDeferred.complete(CPUData(format, cpuData))
    }
}

class TextureOutputNode(
    private val format: ITextureFormat
) : OutputNode<TextureData, ITextureFormat> {
    private val resultDeferred = CompletableDeferred<CPUData<TextureData, ITextureFormat>>()
    override var inputs: List<PipelineEdge<TextureData, ITextureFormat>> = emptyList()
    override val edges: List<PipelineEdge<*, *>> get() = inputs
    override val inputSource = this

    override fun getOutputDeferred(): Deferred<CPUData<TextureData, ITextureFormat>> {
        return resultDeferred
    }

    override fun execute() {
        // Get the GPU texture from the input edge
        val inputEdge = inputs.firstOrNull()
            ?: throw IllegalStateException("No input edge for TextureOutputNode")

        val gpuTexture = inputEdge.allocatedResource
            ?: throw IllegalStateException("No GPU texture allocated for TextureOutputNode input")

        // Allocate buffer to receive texture data (RGBA8 = 4 bytes per pixel)
        val bufferSize = format.width * format.height * 4
        val byteBuffer = ByteBuffer.allocateDirect(bufferSize)

        // Read texture from GPU to CPU
        // bgfx_read_texture requests a readback - the data will be available after bgfx_frame() is called
        bgfx_read_texture(gpuTexture.handle, byteBuffer, 0)

        // Complete the deferred with CPU data
        // Note: In a real rendering loop, you'd need to wait for bgfx_frame() to complete
        // For this test, the pipeline execution should handle frame submission
        resultDeferred.complete(CPUData(format, byteBuffer))
    }
}