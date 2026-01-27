package org.firetodust.reaction.gpu.pipeline

import org.firetodust.reaction.gpu.pipeline.builder.PipelineNodeInitKey

/**
 * Manages GPU pipeline execution.
 * Coordinates node execution, deduplication, and resource management.
 */


class Pipeline(
    private val pathPlans: Map<String, PathPlan>,
    private val allNodes: List<PipelineNode>
) {
    fun run(pathName: String, block: PathPlan.ExecutionScope.() -> Unit) {

        val plan = pathPlans[pathName] ?: error("Path $pathName not found")
        val bindings = mutableMapOf<PipelineNodeInitKey.Source<*>, GPUData<*>>()
        val scope = plan.ExecutionScope(bindings)
        scope.block()


        plan.activeSources.forEach { source ->
            if (bindings.none{source == it.key.built}) {
                throw IllegalStateException("Missing input for source: $source")
            }
        }

        plan.executionOrder.forEach{it.execute()}
    }

    data class PathPlan(val name: String, val executionOrder: List<PipelineNode>, val activeSources: List<SourceNode<*>>, val targets: List<TargetNode<*>>){
        //Allows typed bindings to inputs inside code block: A scope with access to a binding function to call the block in.
        inner class ExecutionScope(val inputBindings: MutableMap<PipelineNodeInitKey.Source<*>, GPUData<*>>) {
            infix fun <T : Format> PipelineNodeInitKey.Source<T>.bind(value: GPUData<T>) {
                check(activeSources.none{it == this.built}) { "Node $this does not belong to path ${this@PathPlan}." }
                inputBindings[this] = value
            }
        }
    }
}