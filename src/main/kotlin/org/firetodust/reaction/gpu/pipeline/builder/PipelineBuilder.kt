package org.firetodust.reaction.gpu.pipeline.builder

import org.firetodust.reaction.gpu.pipeline.Pipeline
import org.firetodust.reaction.gpu.pipeline.PipelineNode
import org.firetodust.reaction.gpu.pipeline.IFormat
import org.firetodust.reaction.utility.InitKey
import org.firetodust.reaction.utility.Invokable
import org.firetodust.reaction.window.BGFXContext


interface PipelineNodelike


interface PipelineNodeInitKey: InitKey<PipelineNode>, PipelineNodelike{
    /**
     * Source node - outputs data to the pipeline (InputNode, StorageNode as source).
     * Stops backtracking during path analysis.
     * R is the resource data type, F is the IFormat<R> type it produces.
     */
    interface Source<R, F: IFormat<R>>: PipelineNodeInitKey

    /**
     * Target node - receives data from the pipeline (OutputNode, DisplayNode, StorageNode as sink).
     * Starting point for backtracking during path analysis.
     * R is the resource data type, F is the IFormat<R> type it consumes.
     */
    interface Target<R, F: IFormat<R>>: PipelineNodeInitKey

    /**
     * Storage node marker - allows cycles through this node.
     * StorageNodes can act as both Source and Target, storing data between frames.
     */
    interface Storage<R, F: IFormat<R>>: PipelineNodeInitKey

    /**
     * Builder-level node with inputs (for graph traversal during build)
     */
    interface WithInputs: PipelineNodeInitKey {
        var inputs: List<PipelineEdgeInitKey<*, *>>
    }

    /**
     * Builder-level node with outputs (for graph traversal during build)
     */
    interface WithOutputs: PipelineNodeInitKey {
        var outputs: List<PipelineEdgeInitKey<*, *>>
    }
}

// 1. The Path identity object
class Path(val name: String)

open class PipelineBuilder(private val context: BGFXContext): Invokable<PipelineBuilder>{
    private val pathSeeds = mutableMapOf<String, PathDefinition>()
    private val globalSeeds = mutableListOf<PipelineNodeInitKey>()

    // Register a node in the global pool for discovery
    fun registerGlobalSeed(node: PipelineNodeInitKey) {
        globalSeeds.add(node)
    }

    // Infix "has" to start path definition
    // builder has path("Physics") ...
    infix fun has(path: Path): PathDefinition {
        val pathObj = PathDefinition(path.name, this)
        pathSeeds[path.name] = pathObj
        return pathObj
    }

    class PathDefinition(val name: String, val builder: PipelineBuilder): Invokable<PathDefinition> {
        val seeds = mutableListOf<PipelineNodeInitKey>()

        infix fun with(node: PipelineNodeInitKey): PipelineNodeInitKey {
            seeds.add(node)
            builder.registerGlobalSeed(node) // Ensure the main builder knows this node exists
            return node
        }
    }

    fun build(): Pipeline {

        // 1. Discovery Pass (Global)
        // Find every node connected to ANY seed in ANY path
        val allConnected = findAllConnected(globalSeeds)

        // 2. Collect all edge InitKeys before building
        val edgesBeforeBuild = collectAllEdges(allConnected)

        // 3. Build all nodes (they build their edges lazily via InitKey.built)
        val builtNodes = allConnected.map { it.built }

        // TODO: When testing is set up, add togglable verification check:
        //   - Collect edges from built nodes
        //   - Verify they match edgesBeforeBuild
        //   - This ensures nodes don't accidentally create different edges during build

        // TODO: Future feature - Node self-rerouting:
        //   - Optionally do second pass after node building
        //   - Use edges from built nodes instead of InitKey edges
        //   - This would allow nodes to modify their connections during build
        //   - Requires: system for optional features (not yet designed)
        //   - Use case: nodes could dynamically adjust topology based on config

        // 4. Path Liveness & Sorting
        val pathPlans = pathSeeds.mapValues { (_, path) ->
            // For this specific path, find what's active
            val pathTargets = findAllConnected(path.seeds).filter { it is PipelineNodeInitKey.Target<*, *> }
            val activeNodes = findActiveBackwards(pathTargets)
            val sorted = sortTopologically(activeNodes)

            // Collect source and target nodes (let Pipeline figure out types)
            val builtSources = activeNodes.filter { it is PipelineNodeInitKey.Source<*, *> }
                .map { it.built }
            val builtTargets = pathTargets.map { it.built }

            Pipeline.PathPlan(
                name = path.name,
                executionOrder = sorted.map { it.built },
                sources = builtSources,
                targets = builtTargets
            )
        }

        return Pipeline(pathPlans, builtNodes, context)
    }

    /**
     * Collect all PipelineEdgeInitKeys from connected nodes.
     */
    private fun collectAllEdges(nodes: Set<PipelineNodeInitKey>): Set<PipelineEdgeInitKey<*, *>> {
        val edges = mutableSetOf<PipelineEdgeInitKey<*, *>>()
        nodes.forEach { node ->
            if (node is PipelineNodeInitKey.WithOutputs) {
                edges.addAll(node.outputs)
            }
            if (node is PipelineNodeInitKey.WithInputs) {
                edges.addAll(node.inputs)
            }
        }
        return edges
    }

    // --- Graph Logic ---
    private fun findAllConnected(seeds: List<PipelineNodeInitKey>): Set<PipelineNodeInitKey> {
        val visited = mutableSetOf<PipelineNodeInitKey>()
        val queue = ArrayDeque(seeds)
        while (queue.isNotEmpty()) {
            val current = queue.removeFirst()
            if (visited.add(current)) {
                // Follow output edges to target nodes
                if (current is PipelineNodeInitKey.WithOutputs) {
                    current.outputs.forEach { edge ->
                        val targetNode = edge.targetInit.inputSource
                        queue.add(targetNode)
                    }
                }
                // Follow input edges to source nodes
                if (current is PipelineNodeInitKey.WithInputs) {
                    current.inputs.forEach { edge ->
                        val sourceNode = edge.sourceInit.outputSource
                        queue.add(sourceNode)
                    }
                }
            }
        }
        return visited
    }

    private fun findActiveBackwards(targets: List<PipelineNodeInitKey>): Set<PipelineNodeInitKey> {
        val active = mutableSetOf<PipelineNodeInitKey>()
        val queue = ArrayDeque<PipelineNodeInitKey>(targets)
        while (queue.isNotEmpty()) {
            val current: PipelineNodeInitKey = queue.removeFirst()
            if (active.add(current)) {
                // Stop backtracking at Source nodes (prevents infinite cycles through StorageNodes)
                if (current is PipelineNodeInitKey.Source<*, *>) {
                    continue
                }
                // Follow input edges backwards to upstream nodes
                if (current is PipelineNodeInitKey.WithInputs) {
                    current.inputs.forEach { edge ->
                        val upstreamNode = edge.sourceInit.outputSource
                        queue.add(upstreamNode)
                    }
                }
            }
        }
        return active
    }

    /**
     * Topologically sort nodes, allowing cycles only through StorageNodes.
     *
     * StorageNodes are special - they break cycles by storing data from frame N
     * and providing it in frame N+1. Cycles through other node types would
     * cause infinite loops during execution and are not allowed.
     *
     * @throws IllegalStateException if a cycle exists that doesn't go through a StorageNode
     */
    private fun sortTopologically(nodes: Set<PipelineNodeInitKey>): List<PipelineNodeInitKey> {
        val sorted = mutableListOf<PipelineNodeInitKey>()
        val permanentMarks = mutableSetOf<PipelineNodeInitKey>()
        val temporaryMarks = mutableSetOf<PipelineNodeInitKey>()
        val visitPath = mutableListOf<PipelineNodeInitKey>()  // Track current path for cycle reporting

        fun visit(n: PipelineNodeInitKey) {
            if (n in permanentMarks) return

            if (n in temporaryMarks) {
                // Cycle detected - check if it goes through a StorageNode
                val cycleStart = visitPath.indexOf(n)
                val cycle = visitPath.subList(cycleStart, visitPath.size)
                val hasStorageNode = cycle.any { it is PipelineNodeInitKey.Storage<*, *> }

                if (!hasStorageNode) {
                    val cycleDescription = cycle.joinToString(" -> ") { node ->
                        node::class.simpleName ?: "UnknownNode"
                    }
                    throw IllegalStateException(
                        "Illegal cycle detected in pipeline graph: $cycleDescription -> ...\n" +
                        "Cycles are only allowed through StorageNodes (which store data between frames).\n" +
                        "To fix: Add a StorageNode in the cycle path, or remove the cyclic dependency."
                    )
                }
                // Cycle is valid (goes through StorageNode), don't recurse further
                return
            }

            temporaryMarks.add(n)
            visitPath.add(n)

            // Visit input dependencies (sources must be executed before this node)
            if (n is PipelineNodeInitKey.WithInputs) {
                n.inputs.forEach { edge ->
                    val sourceNode = edge.sourceInit.outputSource
                    if (sourceNode in nodes) {
                        visit(sourceNode)
                    }
                }
            }

            visitPath.removeAt(visitPath.lastIndex)
            temporaryMarks.remove(n)
            permanentMarks.add(n)
            sorted.add(n)
        }

        nodes.forEach { visit(it) }
        return sorted
    }
}
