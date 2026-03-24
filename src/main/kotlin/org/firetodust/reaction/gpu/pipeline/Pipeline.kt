package org.firetodust.reaction.gpu.pipeline

import kotlinx.coroutines.Deferred
import org.firetodust.reaction.gpu.pipeline.builder.PipelineNodeInitKey
import org.firetodust.reaction.window.BGFXContext

/**
 * GPU pipeline that executes graph-based rendering operations.
 *
 * IMPORTANT: Must call close() when done to release GPU resources and prevent memory leaks.
 * Pipelines implement AutoCloseable, so you can use them in a use {} block:
 *
 * ```kotlin
 * Pipeline(...).use { pipeline ->
 *     pipeline.run("render") { ... }
 * }
 * ```
 *
 * Lifecycle:
 * 1. Create pipeline via PipelineBuilder
 * 2. Run pipeline one or more times
 * 3. Call close() to release GPU resources
 * 4. Pipeline must be closed BEFORE closing the Window
 */
class Pipeline(
    private val pathPlans: Map<String, PathPlan>,
    private val allNodes: List<PipelineNode>,
    private val context: BGFXContext,
    private val executionManager: ExecutionManager = DefaultExecutionManager(context)
) : AutoCloseable {
    fun run(pathName: String, block: PathPlan.ExecutionScope.() -> Unit): ExecutionResult {

        val plan = pathPlans[pathName] ?: error("Path $pathName not found")
        val bindings = mutableMapOf<InputNode<*, *>, () -> Unit>()
        val scope = plan.ExecutionScope(bindings)
        scope.block()
        plan.inputNodes.forEach { inputNode ->
            if (!bindings.containsKey(inputNode)) {
                throw IllegalStateException("Missing input binding for source: $inputNode")
            }
        }

        executionManager.execute(plan.executionOrder, bindings)

        // Collect output Deferreds
        val outputs = plan.outputNodes.associateWith { it.getOutputDeferred() }
        return ExecutionResult(outputs)
    }

    /**
     * Close this pipeline and release all GPU resources.
     * After calling close(), the pipeline cannot be used again.
     * Must be called to prevent GPU memory leaks.
     *
     * Destroys:
     * - All nodes that implement GPUResource (ShaderNode, DisplayNode, etc.)
     * - ExecutionManager's buffer pool
     */
    override fun close() {
        // Destroy all GPU resource nodes
        allNodes.forEach { node ->
            if (node is GPUResource) {
                node.destroy()
            }
        }

        // Cleanup execution manager's buffer pool
        executionManager.cleanup()
    }

    data class ExecutionResult(
        private val outputs: Map<OutputNode<*, *>, Deferred<CPUData<*, *>>>
    ) {
        fun <R, F : IFormat<R>> getOutput(node: OutputNode<R, F>): Deferred<CPUData<R, F>> {
            @Suppress("UNCHECKED_CAST")
            return outputs[node] as? Deferred<CPUData<R, F>>
                ?: throw IllegalArgumentException("Output node not found in execution results")
        }

        fun getAllOutputs(): List<Deferred<CPUData<*, *>>> {
            return outputs.values.toList()
        }
    }

    /**
     * Execution plan for a named pipeline path.
     *
     * A path represents a complete execution flow through the pipeline graph,
     * from source nodes (inputs/storage) to target nodes (outputs/displays/storage).
     *
     * ## Path Execution Semantics
     *
     * When a path executes:
     * 1. **Input Binding**: User binds CPU data to InputNodes via ExecutionScope
     * 2. **Validation**: Pipeline validates all required inputs are bound
     * 3. **Buffer Allocation**: ExecutionManager allocates GPU buffers for edges
     * 4. **Topological Execution**: Nodes execute in dependency order (sources first)
     * 5. **Output Collection**: OutputNodes provide Deferred<CPUData> for results
     *
     * ## Node Types in Paths
     *
     * - **Source Nodes**: Provide data to the pipeline
     *   - InputNode: Accepts CPU data and uploads to GPU
     *   - StorageNode: Provides stored data from previous execution
     *
     * - **Target Nodes**: Consume data from the pipeline
     *   - OutputNode: Downloads GPU data to CPU
     *   - DisplayNode: Renders to screen/framebuffer
     *   - StorageNode: Stores data for next execution
     *
     * - **Transformation Nodes**: Process data in between
     *   - ShaderNode: GPU compute or rendering operation
     *   - Other custom processing nodes
     *
     * ## Multiple Paths
     *
     * A pipeline can have multiple paths for different rendering passes:
     * ```kotlin
     * pipeline.run("shadowPass") { ... }
     * pipeline.run("mainRender") { ... }
     * pipeline.run("postProcess") { ... }
     * ```
     *
     * Each path can share nodes with other paths, but executes independently.
     *
     * ## StorageNode Behavior
     *
     * StorageNodes appear in both sources and targets:
     * - In sources: Acts as data provider (uses stored data from previous frame)
     * - In targets: Acts as data consumer (stores data for next frame)
     *
     * This enables temporal effects like motion blur, temporal anti-aliasing, etc.
     *
     * @property name Path identifier (used in pipeline.run(name))
     * @property executionOrder Nodes sorted topologically for execution
     * @property sources Nodes that provide data (InputNode, StorageNode)
     * @property targets Nodes that consume data (OutputNode, DisplayNode, StorageNode)
     */
    data class PathPlan(
        val name: String,
        val executionOrder: List<PipelineNode>,
        val sources: List<PipelineNode>,
        val targets: List<PipelineNode>
    ){
        val inputNodes: List<InputNode<*, *>> = sources.filterIsInstance<InputNode<*, *>>()
        val outputNodes: List<OutputNode<*, *>> = targets.filterIsInstance<OutputNode<*, *>>()
        val displayNodes: List<DisplayNode> = targets.filterIsInstance<DisplayNode>()
        val storageNodesAsSource: List<StorageNode> = sources.filterIsInstance<StorageNode>()
        val storageNodesAsTarget: List<StorageNode> = targets.filterIsInstance<StorageNode>()

        inner class ExecutionScope(val inputBindings: MutableMap<InputNode<*, *>, () -> Unit>) {
            infix fun <R, F : IFormat<R>> PipelineNodeInitKey.Source<R, F>.bind(value: CPUData<R, F>) {
                val builtNode = this.built
                val isSourceInPlan = sources.any { it == builtNode }
                check(isSourceInPlan) { "Node $this does not belong to path $name." }

                @Suppress("UNCHECKED_CAST")
                val typedNode = builtNode as InputNode<R, F>
                inputBindings[typedNode] = { typedNode.setInput(value) }
            }
        }
    }
}