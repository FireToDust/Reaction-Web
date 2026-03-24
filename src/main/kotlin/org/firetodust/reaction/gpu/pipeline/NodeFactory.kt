package org.firetodust.reaction.gpu.pipeline

import java.nio.ByteBuffer

/**
 * Factory for creating pipeline input nodes from format specifications.
 *
 * Follows the chainable factory pattern - users can extend with custom factories.
 *
 * Example usage:
 * ```kotlin
 * val factory = NodeFactory.Default
 *     .with(MyCustomNodeFactory())
 *
 * val inputNode = factory.createNode(TestTextureFormat(64, 64))
 * ```
 */
interface NodeFactory {
    /**
     * Create an input node for the given format.
     *
     * @param format Format specification for the node
     * @return InputNode for the specified format
     * @throws UnsupportedOperationException if this factory doesn't support the format
     */
    fun <R, F: IFormat<R>> createNode(format: F): InputNode<R, F>

    /**
     * Create a new factory with an additional custom factory prepended.
     *
     * Custom factory is tried before this factory.
     *
     * @param factory Custom node factory
     * @return New composite factory with custom factory added
     */
    fun with(factory: NodeFactory): NodeFactory {
        return CompositeNodeFactory(listOf(factory, this))
    }

    companion object {
        /**
         * Default node factory with standard input nodes.
         *
         * Supports:
         * - ITextureFormat → TextureInputNode
         * - IVertexBufferFormat → VertexBufferInputNode
         * - IIndexBufferFormat → IndexBufferInputNode
         */
        val Default: NodeFactory = CompositeNodeFactory(
            listOf(
                DefaultNodeFactory()
            )
        )
    }
}

/**
 * Default factory for standard pipeline input nodes.
 *
 * Creates input nodes for common GPU resource types.
 */
private class DefaultNodeFactory : NodeFactory {
    @Suppress("UNCHECKED_CAST")
    override fun <R, F : IFormat<R>> createNode(format: F): InputNode<R, F> {
        return when (format) {
            is ITextureFormat -> TextureInputNode(format) as InputNode<R, F>
            is IVertexBufferFormat -> VertexBufferInputNode(format) as InputNode<R, F>
            is IIndexBufferFormat -> IndexBufferInputNode(format) as InputNode<R, F>
            else -> throw UnsupportedOperationException(
                "DefaultNodeFactory does not support format: ${format::class.simpleName}. " +
                "Supported formats: ITextureFormat, IVertexBufferFormat, IIndexBufferFormat. " +
                "Add a custom factory via NodeFactory.Default.with(yourFactory)"
            )
        }
    }
}

private class CompositeNodeFactory(
    private val factories: List<NodeFactory>
) : NodeFactory {

    override fun <R, F: IFormat<R>> createNode(format: F): InputNode<R, F> {
        factories.forEach { factory ->
            try {
                return factory.createNode(format)
            } catch (e: UnsupportedOperationException) {
            }
        }
        throw UnsupportedOperationException(
            "No factory supports creating InputNode for format: ${format::class.simpleName}. " +
            "Add a custom factory via NodeFactory.default().with(yourFactory)"
        )
    }


    override fun with(factory: NodeFactory): NodeFactory {
        return CompositeNodeFactory(listOf(factory) + factories)
    }
}