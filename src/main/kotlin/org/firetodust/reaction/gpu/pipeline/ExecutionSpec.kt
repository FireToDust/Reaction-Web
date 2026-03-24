package org.firetodust.reaction.gpu.pipeline

/**
 * Runtime allocation parameters for resources.
 * Different resource types can have different execution contexts.
 */
interface IExecutionContext<R, F: IFormat<R>>

/**
 * Default execution context with no additional parameters.
 * Used when no specific execution context is required.
 */
class DefaultExecutionContext<R, F: IFormat<R>> : IExecutionContext<R, F> {
    companion object {
        private val instance = DefaultExecutionContext<Any, IFormat<Any>>()

        @Suppress("UNCHECKED_CAST")
        fun <R, F: IFormat<R>> get(): DefaultExecutionContext<R, F> = instance as DefaultExecutionContext<R, F>
    }
}

/**
 * GPU-specific execution context containing BGFX buffer/texture flags.
 */
data class GPUExecutionContext<R, F: IFormat<R>>(val flags: Int) : IExecutionContext<R, F>

/**
 * Specification for buffer allocation combining format and runtime parameters.
 * Used as pooling key to ensure resources with different allocation requirements
 * are not incorrectly shared.
 *
 * @param format The data format/layout
 * @param context Runtime allocation parameters (flags, etc.)
 */
data class ExecutionSpec<R, F: IFormat<R>>(
    val format: F,
    val context: IExecutionContext<R, F>
)