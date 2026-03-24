package org.firetodust.reaction.gpu.pipeline

import org.lwjgl.bgfx.BGFX.*
import org.lwjgl.system.MemoryStack

/**
 * BGFX invalid handle constant.
 */
private const val BGFX_INVALID_HANDLE: Short = -1

/**
 * Bindable port for shader uniform parameters.
 *
 * Handles BGFX uniform creation, validation, and GPU upload for a specific uniform type.
 * Use the generic `uniform<T>()` function in ShaderNode to create typed uniform ports.
 *
 * Supported base types:
 * - Vec4Uniform: 4-component vector (color, position, etc.)
 * - Mat3Uniform: 3x3 matrix (normal transformations)
 * - Mat4Uniform: 4x4 matrix (model-view-projection)
 *
 * Custom types can extend these base types for stronger type safety.
 * The type system enforces that only matching types (or subtypes) can be bound.
 *
 * @param T The uniform type this port accepts (Vec4Uniform, Mat3Uniform, Mat4Uniform, or their subtypes)
 * @param name Uniform name in shader (e.g., "u_color", "u_mvp")
 */
class Uniform<T>(
    private val name: String,
    private val handler: UniformHandler<T>
) : Bindable<T>, GPUResource {

    private val uniformHandle: Short = handler.createUniform(name)
    private var value: T? = null
    private var destroyed = false

    init {
        if (uniformHandle == BGFX_INVALID_HANDLE) {
            throw RuntimeException(
                "Failed to create uniform '$name'. " +
                "This may be due to:\n" +
                "  - BGFX not initialized\n" +
                "  - Uniform name conflict\n" +
                "  - Out of uniform slots\n" +
                "  - Invalid uniform name (must match shader declaration)"
            )
        }
    }

    override fun setValue(value: T) {
        handler.validate(value)
        this.value = value
    }

    override fun isBound(): Boolean = value != null

    /**
     * Upload this uniform's value to the GPU.
     * Called during shader node execution.
     *
     * @throws IllegalStateException if uniform is not bound
     */
    fun applyToGPU() {
        check(!destroyed) { "Cannot apply destroyed uniform" }

        val v = value ?: throw IllegalStateException(
            "Uniform '$name' not bound. " +
            "Ensure you bind this uniform in the pipeline execution scope:\n" +
            "  pipeline.run(\"path\") {\n" +
            "    shaderNode.uniformName bind <value>\n" +
            "  }"
        )

        handler.upload(uniformHandle, v)
    }

    override fun destroy() {
        if (!destroyed) {
            if (uniformHandle != BGFX_INVALID_HANDLE) {
                bgfx_destroy_uniform(uniformHandle)
            }
            destroyed = true
        }
    }

    override fun isDestroyed(): Boolean = destroyed
}

/**
 * Handler for type-specific uniform operations.
 *
 * Encapsulates BGFX uniform type and upload logic for each supported uniform wrapper type.
 * Validation is done in the wrapper class constructors.
 *
 * This is public to allow use in inline functions, but should not be used directly.
 * Use the `uniform<T>()` function in ShaderNode instead.
 */
sealed class UniformHandler<T> {
    abstract fun createUniform(name: String): Short
    abstract fun validate(value: T)
    abstract fun upload(handle: Short, value: T)

    object Vec4Handler : UniformHandler<Vec4Uniform>() {
        override fun createUniform(name: String): Short {
            return bgfx_create_uniform(name, BGFX_UNIFORM_TYPE_VEC4, 1)
        }

        override fun validate(value: Vec4Uniform) {
            // Validation happens in Vec4Uniform constructor
        }

        override fun upload(handle: Short, value: Vec4Uniform) {
            MemoryStack.stackPush().use { stack ->
                val buffer = stack.mallocFloat(4)
                buffer.put(value.data)
                buffer.flip()
                bgfx_set_uniform(handle, buffer, 1)
            }
        }
    }

    object Mat3Handler : UniformHandler<Mat3Uniform>() {
        override fun createUniform(name: String): Short {
            return bgfx_create_uniform(name, BGFX_UNIFORM_TYPE_MAT3, 1)
        }

        override fun validate(value: Mat3Uniform) {
            // Validation happens in Mat3Uniform constructor
        }

        override fun upload(handle: Short, value: Mat3Uniform) {
            MemoryStack.stackPush().use { stack ->
                val buffer = stack.mallocFloat(12) // 3 vec4s with padding

                // Row 0
                buffer.put(0, value.data[0])
                buffer.put(1, value.data[1])
                buffer.put(2, value.data[2])
                buffer.put(3, 0f) // padding

                // Row 1
                buffer.put(4, value.data[3])
                buffer.put(5, value.data[4])
                buffer.put(6, value.data[5])
                buffer.put(7, 0f) // padding

                // Row 2
                buffer.put(8, value.data[6])
                buffer.put(9, value.data[7])
                buffer.put(10, value.data[8])
                buffer.put(11, 0f) // padding

                bgfx_set_uniform(handle, buffer, 1)
            }
        }
    }

    object Mat4Handler : UniformHandler<Mat4Uniform>() {
        override fun createUniform(name: String): Short {
            return bgfx_create_uniform(name, BGFX_UNIFORM_TYPE_MAT4, 1)
        }

        override fun validate(value: Mat4Uniform) {
            // Validation happens in Mat4Uniform constructor
        }

        override fun upload(handle: Short, value: Mat4Uniform) {
            MemoryStack.stackPush().use { stack ->
                val buffer = stack.mallocFloat(16)
                buffer.put(value.data)
                buffer.flip()
                bgfx_set_uniform(handle, buffer, 1)
            }
        }
    }
}
