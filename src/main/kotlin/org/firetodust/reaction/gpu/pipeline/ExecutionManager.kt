package org.firetodust.reaction.gpu.pipeline

import org.firetodust.reaction.window.BGFXContext

interface ExecutionManager {
    fun execute(executionOrder: List<PipelineNode>, inputBindings: Map<InputNode<*, *>, () -> Unit>)

    /**
     * Cleanup all GPU resources managed by this execution manager.
     * Destroys all resources in the resource pool.
     * Must be called when the pipeline is no longer needed to prevent GPU memory leaks.
     */
    fun cleanup()
}

class DefaultExecutionManager(
    private val context: BGFXContext,
    private val resourceAllocator: ResourceAllocator = ResourceAllocator.default(context)
): ExecutionManager {
    private val resourcePool = mutableMapOf<ExecutionSpec<*, *>, MutableList<*>>()

    override fun execute(
        executionOrder: List<PipelineNode>,
        inputBindings: Map<InputNode<*, *>, () -> Unit>
    ) {
        val referenceCounts = calculateReferenceCounts(executionOrder)



        try {
            executionOrder.forEach { node ->

                if (node is InputNode<*, *>){
                    inputBindings[node]?.invoke()
                        ?: throw IllegalStateException("Missing binding for input node: $node")
                }

                if (node is PipelineNode.WithOutputs<*, *>) {
                    node.outputs.forEach { edge ->
                        val spec = edge.getResourceSpec()
                        val resource = acquireResource(spec)
                        setEdgeResource(edge, resource)
                    }
                }

                node.execute()

                if (node is PipelineNode.WithInputs<*, *>) {
                    node.inputs.forEach { edge ->
                        val currentCount = referenceCounts[edge] ?: 0
                        val newCount = currentCount - 1
                        referenceCounts[edge] = newCount

                        if (newCount == 0) {
                            releaseEdgeResource(edge)
                            setEdgeResource(edge, null)
                        }
                    }
                }
            }
        } finally {
            executionOrder.forEach { node ->
                if (node is PipelineNode.WithOutputs<*, *>) {
                    node.outputs.forEach { edge ->
                        releaseEdgeResource(edge)
                        setEdgeResource(edge, null)
                    }
                }
            }
        }
    }

    private fun calculateReferenceCounts(executionOrder: List<PipelineNode>): MutableMap<PipelineEdge<*, *>, Int> {
        val counts = mutableMapOf<PipelineEdge<*, *>, Int>()

        executionOrder.forEach { node ->
            if (node is PipelineNode.WithInputs<*, *>) {
                node.inputs.forEach { edge ->
                    counts[edge] = counts.getOrDefault(edge, 0) + 1
                }
            }
        }

        return counts
    }

    private fun setEdgeResource(edge: PipelineEdge<*, *>, resource: Any?) {
        @Suppress("UNCHECKED_CAST")
        (edge as PipelineEdge<Any?, *>).allocatedResource = resource
    }

    private fun releaseEdgeResource(edge: PipelineEdge<*, *>) {
        val resource = edge.allocatedResource
        if (resource != null) {
            val spec = edge.getResourceSpec()
            @Suppress("UNCHECKED_CAST")
            releaseResource(spec as ExecutionSpec<Any?, IFormat<Any?>>, resource)
        }
    }

    private fun <R, F : IFormat<R>> acquireResource(spec: ExecutionSpec<R, F>): R {
        val poolEntry = resourcePool[spec]
        if (poolEntry != null && poolEntry.isNotEmpty()) {
            @Suppress("UNCHECKED_CAST")
            val typedList = poolEntry as MutableList<R>
            return typedList.removeAt(typedList.size - 1)
        }

        return allocateNewResource(spec)
    }

    private fun <R, F : IFormat<R>> releaseResource(spec: ExecutionSpec<R, F>, resource: R) {
        @Suppress("UNCHECKED_CAST")
        val poolEntry = resourcePool.getOrPut(spec) { mutableListOf<R>() } as MutableList<R>
        poolEntry.add(resource)
    }

    private fun <R, F : IFormat<R>> allocateNewResource(spec: ExecutionSpec<R, F>): R {
        return resourceAllocator.allocate(spec)
    }

    /**
     * Cleanup all GPU resources in the resource pool.
     * Destroys all allocated resources and clears the pool.
     */
    override fun cleanup() {
        resourcePool.values.forEach { resourceList ->
            resourceList.forEach { resource ->
                (resource as? GPUResource)?.destroy()
            }
        }
        resourcePool.clear()
    }
}