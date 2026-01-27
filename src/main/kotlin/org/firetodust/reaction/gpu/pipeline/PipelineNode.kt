package org.firetodust.reaction.gpu.pipeline

/**
 * Base type for all nodes in the GPU compute pipeline.
 * Nodes can be connected together to form a computation graph.
 */
sealed interface PipelineNode{
    fun execute()
}

/**
 * Buffer node - acts as a single input, single output conveyor.
 * Wraps a GPU buffer handle and tracks pipeline dependencies.
 * Type parameter T represents the logical data type (used for type safety at compile time).
 */
interface BufferNode<T> : PipelineNode {
    var input: PipelineNode?
    val handle: Short  // BGFX buffer handle
}

/**
 * Processor node - multi input, multi output shader/compute operation.
 * Emits GPU compute commands to transform input buffers into output buffers.
 */
interface ProcessorNode : PipelineNode {
    val inputs: List<BufferNode<*>>
    val outputs: List<BufferNode<*>>

    /**
     * Emits BGFX compute dispatch commands.
     */
    fun dispatch()
}

/**
 * Source node - CPU input that uploads data to GPU.
 * Single output buffer.
 */
interface SourceNode<T: Format> : PipelineNode {
    val output: BufferNode<T>
    /**
     * Uploads data to GPU buffer.
     */
    fun upload(data: T)
}

interface TerminalNode: PipelineNode

/**
 * Target node - reads GPU computation results back to CPU.
 * Single input. Triggers pipeline execution to compute result.
 */
interface TargetNode<T: Format> : TerminalNode {

}

/**
 * Display node - renders to screen.
 * Takes inputs (vertex buffers, textures, etc.) and renders visual output.
 * Triggers pipeline execution for rendering.
 */
interface DisplayNode : TerminalNode {
    val inputs: List<BufferNode<*>>

    /**
     * Triggers pipeline execution and renders to screen.
     */
    fun display()
}
