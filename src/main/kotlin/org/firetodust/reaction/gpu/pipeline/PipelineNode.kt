package org.firetodust.reaction.gpu.pipeline

import kotlinx.coroutines.Deferred
import org.firetodust.reaction.gpu.pipeline.builder.PipelineNodelike


interface PipelineNode: PipelineNodelike {
    fun execute()
    val edges: List<PipelineEdge<*, *>>

    interface WithInputs<R, F: IFormat<R>>: PipelineNode {
        var inputs: List<PipelineEdge<R, F>>
    }

    interface WithSingleInput<R, F: IFormat<R>>: WithInputs<R, F>, PipelineInput<R, F> {
        override fun _setInput(input: PipelineEdge<R, F>) {
            this.inputs = listOf(input)
        }
    }

    interface WithOutputs<R, F: IFormat<R>>: PipelineNode {
        var outputs: List<PipelineEdge<R, F>>
    }

    interface WithSingleOutput<R, F: IFormat<R>>: WithOutputs<R, F>, PipelineOutput<R, F> {
        override fun _setOutput(output: PipelineEdge<R, F>) {
            this.outputs = listOf(output)
        }
    }
}

interface InputNode<R, F: IFormat<R>>: PipelineNode.WithSingleOutput<R, F> {
    fun setInput(input: CPUData<R, F>)
}

interface OutputNode<R, F: IFormat<R>>: PipelineNode.WithSingleInput<R, F> {
    fun getOutputDeferred(): Deferred<CPUData<R, F>>
}

interface TransformationNode<R, F: IFormat<R>> : PipelineNode.WithOutputs<R, F>, PipelineNode.WithInputs<R, F>

interface TerminalNode<R, F: IFormat<R>>: PipelineNode.WithInputs<R, F>, PipelineInput<R, F> {
    override fun _setInput(input: PipelineEdge<R, F>) {
        inputs += input
    }
}

/**
 * Marker interface for storage nodes that persist data across pipeline executions.
 *
 * StorageNodes are special nodes that break execution cycles by storing data from
 * frame N and providing it to frame N+1. They act as both Source and Target nodes:
 * - As a Target: Receive and store data at the end of a pipeline execution
 * - As a Source: Provide stored data at the start of the next pipeline execution
 *
 * ## Cycle Behavior
 *
 * Cycles are only allowed through StorageNodes. For example:
 * ```
 * Valid cycle (through StorageNode):
 *   ShaderA -> StorageNode -> ShaderB -> ShaderA
 *   └─────────────────────────┘
 *   (Data flows from frame N to frame N+1)
 *
 * Invalid cycle (no StorageNode):
 *   ShaderA -> ShaderB -> ShaderA
 *   └──────────────────┘
 *   (Would cause infinite loop within same frame)
 * ```
 *
 * During pipeline construction, the topological sort allows cycles if they contain
 * at least one StorageNode. Cycles without a StorageNode will throw an exception.
 *
 * ## Execution Semantics
 *
 * When a path executes:
 * 1. StorageNodes provide their stored data from the previous frame (or initial data)
 * 2. Pipeline processes all nodes in topological order
 * 3. StorageNodes receive and store new data for the next frame
 * 4. Next execution uses the updated storage
 *
 * ## Example Usage
 *
 * ```kotlin
 * class TemporalBlurNode(format: ITextureFormat) : StorageNode,
 *     TransformationNode<TextureData, ITextureFormat> {
 *     private var previousFrame: TextureData? = null
 *
 *     override fun execute() {
 *         val currentFrame = inputs[0].allocatedResource
 *         val blended = blendFrames(currentFrame, previousFrame)
 *         outputs[0].allocatedResource = blended
 *         previousFrame = currentFrame  // Store for next frame
 *     }
 * }
 * ```
 */
interface StorageNode

/**
 * Marker interface for display nodes that render pipeline output to a screen or framebuffer.
 *
 * DisplayNodes are terminal nodes - they consume data but don't produce outputs for
 * other nodes. They typically render textures to a window or offscreen framebuffer.
 *
 * Example: WindowDisplayNode renders a texture to the screen using a fullscreen quad.
 */
interface DisplayNode
