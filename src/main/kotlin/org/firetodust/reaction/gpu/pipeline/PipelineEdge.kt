package org.firetodust.reaction.gpu.pipeline

/**
 * Represents a connection between a pipeline output and input.
 * Manages resource allocation and holds the format and execution context.
 */
interface PipelineEdge<R, F: IFormat<R>> {
    val source: PipelineOutput<R, F>
    val target: PipelineInput<R, F>
    val format: F
    var allocatedResource: R?

    /**
     * Get the ExecutionSpec for this edge, combining format and execution context.
     * Used as the pooling key in ExecutionManager.
     */
    fun getResourceSpec(): ExecutionSpec<R, F>
}

/**
 * Default pipeline edge implementation using DefaultExecutionContext.
 * Used when no specific execution context is required.
 */
class DefaultPipelineEdge<R, F: IFormat<R>>(
    override val source: PipelineOutput<R, F>,
    override val target: PipelineInput<R, F>,
    override val format: F
) : PipelineEdge<R, F> {
    override var allocatedResource: R? = null
    private val context: IExecutionContext<R, F> = DefaultExecutionContext.get()

    override fun getResourceSpec(): ExecutionSpec<R, F> = ExecutionSpec(format, context)
}

/**
 * GPU pipeline edge implementation using GPUExecutionContext.
 * Used for GPU resources that require specific BGFX flags.
 */
class GPUPipelineEdge<R, F: IFormat<R>>(
    override val source: PipelineOutput<R, F>,
    override val target: PipelineInput<R, F>,
    override val format: F,
    val flags: Int = 0
) : PipelineEdge<R, F> {
    override var allocatedResource: R? = null
    private val context: IExecutionContext<R, F> = GPUExecutionContext(flags)

    override fun getResourceSpec(): ExecutionSpec<R, F> = ExecutionSpec(format, context)
}