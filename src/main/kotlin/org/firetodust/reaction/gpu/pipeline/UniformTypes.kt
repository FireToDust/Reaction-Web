package org.firetodust.reaction.gpu.pipeline

/**
 * Uniform wrapper types for shader parameters.
 *
 * These classes wrap the raw FloatArray data that BGFX accepts.
 * They are open to allow users to create custom typed uniforms with stricter type safety.
 *
 * Example:
 * ```kotlin
 * // Custom color type
 * class MyColor(r: Float, g: Float, b: Float, a: Float)
 *     : Vec4Uniform(floatArrayOf(r, g, b, a))
 *
 * // In shader node:
 * val colorPort = uniform<MyColor>("u_myColor")
 *
 * // Only accepts MyColor instances
 * colorPort.setValue(MyColor(1f, 0f, 0f, 1f))
 * ```
 */

/**
 * 4-component vector uniform (vec4 in GLSL).
 *
 * Wraps a FloatArray of size 4 for BGFX upload.
 * Used for colors (RGBA), positions (XYZW), etc.
 *
 * @property data FloatArray of size 4 containing the uniform data
 */
open class Vec4Uniform(val data: FloatArray) {
    init {
        require(data.size == 4) {
            "Vec4Uniform requires FloatArray of size 4, got ${data.size}"
        }
        require(data.all { it.isFinite() }) {
            "Vec4Uniform components must be finite"
        }
    }
}

/**
 * 3x3 matrix uniform (mat3 in GLSL).
 *
 * Wraps a FloatArray of size 9 for BGFX upload (row-major order).
 * Commonly used for normal transformations.
 *
 * @property data FloatArray of size 9 containing the uniform data (row-major)
 */
open class Mat3Uniform(val data: FloatArray) {
    init {
        require(data.size == 9) {
            "Mat3Uniform requires FloatArray of size 9, got ${data.size}"
        }
        require(data.all { it.isFinite() }) {
            "Mat3Uniform components must be finite"
        }
    }
}

/**
 * 4x4 matrix uniform (mat4 in GLSL).
 *
 * Wraps a FloatArray of size 16 for BGFX upload (row-major order).
 * Commonly used for model-view-projection transformations.
 *
 * @property data FloatArray of size 16 containing the uniform data (row-major)
 */
open class Mat4Uniform(val data: FloatArray) {
    init {
        require(data.size == 16) {
            "Mat4Uniform requires FloatArray of size 16, got ${data.size}"
        }
        require(data.all { it.isFinite() }) {
            "Mat4Uniform components must be finite"
        }
    }
}
