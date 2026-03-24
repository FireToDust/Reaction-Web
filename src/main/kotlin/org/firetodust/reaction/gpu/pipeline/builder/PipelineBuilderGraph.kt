package org.firetodust.reaction.gpu.pipeline.builder

import org.firetodust.reaction.gpu.pipeline.DefaultPipelineEdge
import org.firetodust.reaction.gpu.pipeline.IFormat
import org.firetodust.reaction.gpu.pipeline.PipelineEdge
import org.firetodust.reaction.gpu.pipeline.PipelineInput as RuntimePipelineInput
import org.firetodust.reaction.gpu.pipeline.PipelineOutput as RuntimePipelineOutput
import org.firetodust.reaction.utility.InitKey

interface PipelineOutput<R, F: IFormat<R>> {
    val outputFormat: F
    val outputSource: PipelineNodeInitKey.WithOutputs

    fun _setOutput(output: PipelineEdgeInitKey<R, F>) {
        outputSource.outputs += output
    }

    infix fun <T : PipelineInput<R, F>> into(input: T): T {
        require(input.inputFormat == this.outputFormat) {
            "Format mismatch: Cannot connect output with format ${this.outputFormat} " +
            "to input with format ${input.inputFormat}"
        }

        PipelineEdgeInitKey(this, input, outputFormat)
        return input
    }
}

interface PipelineInput<R, F: IFormat<R>> {
    val inputFormat: F
    val inputSource: PipelineNodeInitKey.WithInputs

    fun _setInput(input: PipelineEdgeInitKey<R, F>) {
        inputSource.inputs += input
    }

    infix fun <T : PipelineOutput<R, F>> from(output: T): T {
        require(output.outputFormat == this.inputFormat) {
            "Format mismatch: Cannot connect input with format ${this.inputFormat} " +
            "to output with format ${output.outputFormat}"
        }

        PipelineEdgeInitKey(output, this, inputFormat)
        return output
    }
}

class PipelineEdgeInitKey<R, F: IFormat<R>>(
    val sourceInit: PipelineOutput<R, F>,
    val targetInit: PipelineInput<R, F>,
    val format: F
): InitKey<PipelineEdge<R, F>> {

    override val built: PipelineEdge<R, F> by lazy {
        // The source and target are on nodes that implement InitKey
        // Get the built nodes and cast to runtime interfaces
        val builtSourceNode = sourceInit.outputSource.built as RuntimePipelineOutput<R, F>
        val builtTargetNode = targetInit.inputSource.built as RuntimePipelineInput<R, F>

        DefaultPipelineEdge(builtSourceNode, builtTargetNode, format)
    }

    init {
        sourceInit._setOutput(this)
        targetInit._setInput(this)
    }
}