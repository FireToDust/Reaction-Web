package org.firetodust.reaction.gpu.pipeline

/**
 * Universal interface for bindable parameters in pipeline nodes.
 *
 * Nodes can expose multiple Bindable Ports for different parameters (uniforms, settings, etc.)
 * or implement Bindable directly for single-value nodes.
 *
 * Type parameter T represents the value type that can be bound to this port.
 *
 * Example usage:
 * ```kotlin
 * // Custom shader with typed uniform ports
 * class MyShader : ShaderNode(...) {
 *     val uniformColor = uniform<Vec4Uniform>("u_color")
 * }
 *
 * // Custom typed uniform
 * class MyColor(r: Float, g: Float, b: Float, a: Float)
 *     : Vec4Uniform(floatArrayOf(r, g, b, a))
 *
 * class MyShaderWithCustomType : ShaderNode(...) {
 *     val uniformColor = uniform<MyColor>("u_color")  // only accepts MyColor
 * }
 *
 * // Binding in pipeline execution
 * pipeline.run("render") {
 *     myShader.uniformColor bind Vec4Uniform(floatArrayOf(1f, 0f, 0f, 1f))
 *     myShaderWithCustomType.uniformColor bind MyColor(1f, 0f, 0f, 1f)
 * }
 * ```
 *
 * Validation:
 * - Bind-time: setValue() can throw if value is invalid (wrong type, out of range, etc.)
 * - Execution-time: Nodes check if required ports are bound before executing
 *
 * @param T Type of value this port accepts
 */
interface Bindable<T> {
    /**
     * Set the value for this port.
     *
     * Called during pipeline execution scope (inside pipeline.run { ... } block).
     * Should validate the value and store it for use during node execution.
     *
     * @param value The value to bind to this port
     * @throws IllegalArgumentException if value is invalid for this port
     */
    fun setValue(value: T)

    /**
     * Check if this port has been bound with a value.
     *
     * Used for execution-time validation to ensure required ports are set.
     *
     * @return true if setValue has been called with a valid value
     */
    fun isBound(): Boolean
}
