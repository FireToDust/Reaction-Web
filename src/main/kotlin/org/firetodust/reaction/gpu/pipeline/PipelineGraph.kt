package org.firetodust.reaction.gpu.pipeline

import kotlin.collections.plus

/**
 * Pipeline-specific graph types with proper Resource and Format typing.
 * These are duplicates of the generic graph types but with both type parameters preserved.
 */

interface PipelineOutput<R, F: IFormat<R>> {
    val outputSource: PipelineNode.WithOutputs<R, F>

    fun _setOutput(output: PipelineEdge<R, F>)

    infix fun <T : PipelineInput<R, F>> into(input: T): T {
        PipelineConnection(this, input)
        return input
    }
}

interface PipelineInput<R, F: IFormat<R>> {
    val inputSource: PipelineNode.WithInputs<R, F>

    fun _setInput(input: PipelineEdge<R, F>)

    infix fun <InputType : PipelineOutput<R, F>> from(output: InputType): InputType {
        PipelineConnection(output, this)
        return output
    }
}

class PipelineConnection<R, F: IFormat<R>>(
    var source: PipelineOutput<R, F>,
    var target: PipelineInput<R, F>
) {
    init {
        // Get formats from both sides if available
        val sourceFormat = if (source is PipelinePortWithFormat<*, *>) {
            @Suppress("UNCHECKED_CAST")
            (source as PipelinePortWithFormat<R, F>).format
        } else null

        val targetFormat = if (target is PipelinePortWithFormat<*, *>) {
            @Suppress("UNCHECKED_CAST")
            (target as PipelinePortWithFormat<R, F>).format
        } else null

        // Validate format compatibility if both sides have formats
        if (sourceFormat != null && targetFormat != null) {
            validateFormatCompatibility(sourceFormat, targetFormat)
        }

        // Create the edge
        val format = sourceFormat ?: targetFormat
            ?: throw IllegalStateException("Cannot determine format for pipeline connection")

        val edge = DefaultPipelineEdge(source, target, format)
        source._setOutput(edge)
        target._setInput(edge)
    }

    /**
     * Validate that source and target formats are compatible.
     *
     * For formats to be compatible, they must have the same structure:
     * - Same width/height for textures
     * - Same buffer layout for vertex buffers
     * - Same index type for index buffers
     *
     * @throws IllegalArgumentException if formats are incompatible
     */
    private fun validateFormatCompatibility(sourceFormat: F, targetFormat: F) {
        // For now, check if they're reference-equal or structurally equal
        if (sourceFormat != targetFormat) {
            // If not equal, check for specific format types and their properties
            when {
                sourceFormat is ITextureFormat && targetFormat is ITextureFormat -> {
                    require(sourceFormat.width == targetFormat.width &&
                            sourceFormat.height == targetFormat.height &&
                            sourceFormat.format == targetFormat.format) {
                        "Texture format mismatch: " +
                        "source ${sourceFormat.width}x${sourceFormat.height} ${sourceFormat.format} != " +
                        "target ${targetFormat.width}x${targetFormat.height} ${targetFormat.format}"
                    }
                }
                sourceFormat is IVertexBufferFormat && targetFormat is IVertexBufferFormat -> {
                    // Vertex buffer layouts are complex - for now just warn if different instances
                    // TODO: Deep comparison of BGFXVertexLayout if needed
                    if (sourceFormat !== targetFormat) {
                        println("WARNING: Connecting different vertex buffer format instances. " +
                                "Ensure layouts are compatible.")
                    }
                }
                sourceFormat is IIndexBufferFormat && targetFormat is IIndexBufferFormat -> {
                    require(sourceFormat.type == targetFormat.type) {
                        "Index buffer type mismatch: " +
                        "source ${sourceFormat.type} != target ${targetFormat.type}"
                    }
                }
                else -> {
                    // For unknown format types, require reference equality
                    require(sourceFormat === targetFormat) {
                        "Format mismatch: source and target formats must be the same instance " +
                        "for format type ${sourceFormat::class.simpleName}"
                    }
                }
            }
        }
    }
}

// Helper interface to get format from ports
interface PipelinePortWithFormat<R, F: IFormat<R>> {
    val format: F
}

class PipelineInputPort<R, F: IFormat<R>>(
    override val inputSource: PipelineNode.WithInputs<R, F>,
    override val format: F
) : PipelineInput<R, F>, PipelinePortWithFormat<R, F> {
    override fun _setInput(input: PipelineEdge<R, F>) {
        inputSource.inputs += input
    }
}

class PipelineOutputPort<R, F: IFormat<R>>(
    override val outputSource: PipelineNode.WithOutputs<R, F>,
    override val format: F
) : PipelineOutput<R, F>, PipelinePortWithFormat<R, F> {
    override fun _setOutput(output: PipelineEdge<R, F>) {
        outputSource.outputs += output
    }
}
