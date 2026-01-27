package org.firetodust.reaction.gpu.pipeline.builder

import org.firetodust.reaction.gpu.pipeline.Format
import org.firetodust.reaction.gpu.pipeline.Pipeline
import org.firetodust.reaction.gpu.pipeline.PipelineNode
import org.firetodust.reaction.gpu.pipeline.SourceNode
import org.firetodust.reaction.gpu.pipeline.TargetNode



interface Invokable<Self: Invokable<Self>>{
    @Suppress("UNCHECKED_CAST")
    operator fun invoke(block: Self.() -> Unit): Self {
        (this as Self).block()
        return this
    }
}

// An object for use with builders which acts both as a one time initializer, and a key for the object it creates.
interface InitKey{
    interface OfType<Self: OfType<Self>>: InitKey, Invokable<Self>

    interface WhichBuilds<out T>: InitKey{
        val built: T
    }
}

interface Output<dataType: Format>{
    val outputSource: PipelineNodeInitKey.WithOutputs<*>
    fun _setOutput(output: PipelineNodeInitKey<*>)

    infix fun <outputType: Input<dataType>> into(node: outputType): outputType{
        _setOutput(node.inputSource)
        node._setInput(this.outputSource)
        return node
    }
}


interface Input<dataType: Format>{
    val inputSource: PipelineNodeInitKey.WithInputs<*>
    fun _setInput(input: PipelineNodeInitKey<*>)

    infix fun <inputType : Output<dataType>> from(node: inputType): inputType{
        _setInput(node.outputSource)
        node._setOutput(this.inputSource)
        return node
    }
}


interface PipelineNodeInitKey<NodeType: PipelineNode>: InitKey.WhichBuilds<NodeType>{
    interface WithInputs<BuiltNodeType: PipelineNode>: PipelineNodeInitKey<BuiltNodeType>{
        var inputs: MutableList<PipelineNodeInitKey<*>>
    }

    interface WithInput<BuiltNodeType: PipelineNode, InputType: Format>: WithInputs<BuiltNodeType>, Input<InputType>{
        override fun _setInput(input: PipelineNodeInitKey<*>){
            this.inputs = mutableListOf(input)
        }
    }

    interface WithOutputs<BuiltNodeType: PipelineNode>: PipelineNodeInitKey<BuiltNodeType>{
        var outputs: MutableList<PipelineNodeInitKey<*>>
    }

    interface WithOutput<BuiltNodeType: PipelineNode, InputType: Format>: WithOutputs<BuiltNodeType>, Output<InputType>{
        override fun _setOutput(output: PipelineNodeInitKey<*>){
            this.outputs = mutableListOf(output)
        }
    }

    interface Source<T : Format>: PipelineNodeInitKey<SourceNode<T>>
    interface Target<T : Format>: PipelineNodeInitKey<TargetNode<T>>
}


class InputPort<T: Format>(override val inputSource: PipelineNodeInitKey.WithInputs<*>): Input<T>{
    override fun _setInput(input: PipelineNodeInitKey<*>) {
        inputSource.inputs.add(input)
    }
}


class OutputPort<T: Format>(override val outputSource: PipelineNodeInitKey.WithOutputs<*>): Output<T>{
    override fun _setOutput(output: PipelineNodeInitKey<*>) {
        outputSource.outputs.add(output)
    }
}


// 1. The Path identity object
class Path(val name: String)

open class PipelineBuilder: Invokable<PipelineBuilder>{
    private val pathSeeds = mutableMapOf<String, PathDefinition>()
    private val globalSeeds = mutableListOf<PipelineNodeInitKey<*>>()

    // Register a node in the global pool for discovery
    fun registerGlobalSeed(node: PipelineNodeInitKey<*>) {
        globalSeeds.add(node)
    }

    // Infix "has" to start path definition
    // builder has path("Physics") ...
    infix fun has(path: Path): PathDefinition {
        val pathObj = PathDefinition(path.name, this)
        pathSeeds[path.name] = pathObj
        return pathObj
    }

    class PathDefinition(val name: String, val builder: PipelineBuilder): InitKey.OfType<PathDefinition> {
        val seeds = mutableListOf<PipelineNodeInitKey<*>>()

        infix fun with(node: PipelineNodeInitKey<*>): PipelineNodeInitKey<*> {
            seeds.add(node)
            builder.registerGlobalSeed(node) // Ensure the main builder knows this node exists
            return node
        }
    }

    fun build(): Pipeline {

        // 1. Discovery Pass (Global)
        // Find every node connected to ANY seed in ANY path
        val allConnected = findAllConnected(globalSeeds)

        // 3. Path Liveness & Sorting
        val pathPlans = pathSeeds.mapValues { (_, path) ->
            // For this specific path, find what's active
            val pathTargets = findAllConnected(path.seeds).filterIsInstance<PipelineNodeInitKey.Target<*>>()
            val activeNodes = findActiveBackwards(pathTargets)
            val sorted = sortTopologically(activeNodes)

            Pipeline.PathPlan(
                executionOrder = sorted.map {it.built},
                activeSources = activeNodes.filterIsInstance<PipelineNodeInitKey.Source<*>>()
                    .map {it.built},
                targets = pathTargets.map {it.built},
                name = path.name
            )
        }

        return Pipeline(pathPlans, allConnected.map { it.built }.toList())
    }

    // --- Graph Logic ---
    private fun findAllConnected(seeds: List<PipelineNodeInitKey<*>>): Set<PipelineNodeInitKey<*>> {
        val visited = mutableSetOf<PipelineNodeInitKey<*>>()
        val queue = ArrayDeque(seeds)
        while (queue.isNotEmpty()) {
            val current = queue.removeFirst()
            if (visited.add(current)) {
                if (current is PipelineNodeInitKey.WithOutputs<*>) queue.addAll(current.outputs)
                if (current is PipelineNodeInitKey.WithInputs<*>) queue.addAll(current.inputs)
            }
        }
        return visited
    }

    private fun findActiveBackwards(targets: List<PipelineNodeInitKey.Target<*>>): Set<PipelineNodeInitKey<*>> {
        val active = mutableSetOf<PipelineNodeInitKey<*>>()
        val queue = ArrayDeque<PipelineNodeInitKey<*>>(targets)
        while (queue.isNotEmpty()) {
            val current: PipelineNodeInitKey<*> = queue.removeFirst()
            if (active.add(current)) {
                if (current is PipelineNodeInitKey.WithInputs<*>) queue.addAll(current.inputs)
            }
        }
        return active
    }

    private fun sortTopologically(nodes: Set<PipelineNodeInitKey<*>>): List<PipelineNodeInitKey<*>> {
        val sorted = mutableListOf<PipelineNodeInitKey<*>>()
        val permanentMarks = mutableSetOf<PipelineNodeInitKey<*>>()
        val temporaryMarks = mutableSetOf<PipelineNodeInitKey<*>>()

        fun visit(n: PipelineNodeInitKey<*>) {
            if (n in permanentMarks) return
            if (n in temporaryMarks) throw IllegalStateException("Cycle detected at ${n}")
            temporaryMarks.add(n)
            if (n is PipelineNodeInitKey.WithInputs<*>) {
                n.inputs.forEach { if (it in nodes) visit(it) }
            }
            temporaryMarks.remove(n)
            permanentMarks.add(n)
            sorted.add(n)
        }
        nodes.forEach { visit(it) }
        return sorted
    }
}
