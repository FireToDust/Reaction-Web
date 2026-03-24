package org.firetodust.reaction.resources

import org.firetodust.reaction.gpu.pipeline.GPUResource
import org.lwjgl.bgfx.BGFX.*

/**
 * Type of shader (vertex or fragment).
 */
enum class ShaderType {
    VERTEX,
    FRAGMENT
}

/**
 * BGFX invalid handle constant.
 * BGFX returns 0xFFFF (65535 unsigned, -1 signed) for failed handle creation.
 */
private const val BGFX_INVALID_HANDLE: Short = -1

/**
 * Compiled shader loaded from disk.
 *
 * BGFX uses pre-compiled binary shaders with platform-specific formats.
 * Shaders must be compiled offline using shaderc tool for each target platform.
 *
 * Implements GPUResource - must call destroy() when done to prevent memory leak.
 *
 * @property handle BGFX shader handle
 * @property type Whether this is a vertex or fragment shader
 * @property path Original file path (for debugging)
 */
data class Shader(
    val handle: Short,
    val type: ShaderType,
    val path: String
) : GPUResource {
    private var destroyed = false

    init {
        require(handle != BGFX_INVALID_HANDLE) {
            "Invalid shader handle for $path"
        }
    }

    override fun destroy() {
        if (!destroyed) {
            bgfx_destroy_shader(handle)
            destroyed = true
        }
    }

    override fun isDestroyed(): Boolean = destroyed
}

/**
 * Shader program combining vertex and fragment shaders.
 *
 * BGFX requires separate vertex and fragment shaders to be combined into a program.
 * The program is what actually gets used for rendering.
 *
 * Implements GPUResource - must call destroy() when done.
 * Does NOT destroy the individual vertex/fragment shaders - those must be destroyed separately.
 *
 * @property handle BGFX program handle
 * @property vertexShader Vertex shader used in this program
 * @property fragmentShader Fragment shader used in this program
 */
data class ShaderProgram(
    val handle: Short,
    val vertexShader: Shader,
    val fragmentShader: Shader
) : GPUResource {
    private var destroyed = false

    init {
        require(handle != BGFX_INVALID_HANDLE) {
            "Invalid shader program handle (vertex: ${vertexShader.path}, fragment: ${fragmentShader.path})"
        }
        require(vertexShader.type == ShaderType.VERTEX) {
            "First shader must be vertex shader, got ${vertexShader.type} (${vertexShader.path})"
        }
        require(fragmentShader.type == ShaderType.FRAGMENT) {
            "Second shader must be fragment shader, got ${fragmentShader.type} (${fragmentShader.path})"
        }
    }

    override fun destroy() {
        if (!destroyed) {
            bgfx_destroy_program(handle)
            destroyed = true
        }
    }

    override fun isDestroyed(): Boolean = destroyed

    companion object {
        /**
         * Create a shader program from vertex and fragment shaders.
         *
         * @param vertexShader Compiled vertex shader
         * @param fragmentShader Compiled fragment shader
         * @return ShaderProgram with valid BGFX handle
         * @throws RuntimeException if program creation fails
         */
        fun create(vertexShader: Shader, fragmentShader: Shader): ShaderProgram {
            val handle = bgfx_create_program(vertexShader.handle, fragmentShader.handle, false)

            if (handle == BGFX_INVALID_HANDLE) {
                throw RuntimeException(
                    "Failed to create shader program.\n" +
                    "Vertex shader: ${vertexShader.path}\n" +
                    "Fragment shader: ${fragmentShader.path}\n" +
                    "This may be due to:\n" +
                    "  - Incompatible shader versions\n" +
                    "  - Mismatched vertex output / fragment input\n" +
                    "  - Corrupted shader binaries\n" +
                    "  - GPU driver issues"
                )
            }

            return ShaderProgram(handle, vertexShader, fragmentShader)
        }
    }
}
