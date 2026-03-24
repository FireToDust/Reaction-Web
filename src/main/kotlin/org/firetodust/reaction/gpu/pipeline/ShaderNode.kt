package org.firetodust.reaction.gpu.pipeline

import org.firetodust.reaction.resources.ShaderProgram
import org.lwjgl.bgfx.BGFX.*

/**
 * BGFX invalid handle constant.
 */
private const val BGFX_INVALID_HANDLE: Short = -1

/**
 * Pipeline node that applies a shader transformation to textures.
 *
 * ShaderNode reads a texture from its input edge, renders it through a shader program
 * to produce a transformed texture on its output edge.
 *
 * Rendering approach:
 * - Creates temporary framebuffer from output texture
 * - Renders fullscreen quad with shader
 * - Input texture bound as sampler uniform "s_texColor"
 * - Output written to framebuffer (output texture)
 *
 * ## Custom Shader Nodes with Uniforms
 *
 * Subclass ShaderNode to create typed shader nodes with custom uniforms:
 *
 * ```kotlin
 * class MyShader(
 *     shaderProgram: ShaderProgram,
 *     inputFormat: ITextureFormat,
 *     outputFormat: ITextureFormat,
 *     viewId: Int = 0
 * ) : ShaderNode(shaderProgram, inputFormat, outputFormat, viewId) {
 *     val color = uniform<Vec4Uniform>("u_color")
 *     val mvp = uniform<Mat4Uniform>("u_mvp")
 * }
 *
 * // Usage in pipeline
 * pipeline.run("render") {
 *     myShader.color bind Vec4Uniform(floatArrayOf(1f, 0f, 0f, 1f))
 *     myShader.mvp bind Mat4Uniform(floatArrayOf(...))
 * }
 * ```
 *
 * ## Custom Typed Uniforms
 *
 * Create custom uniform types for stronger type safety:
 *
 * ```kotlin
 * // Define custom types
 * class Color(r: Float, g: Float, b: Float, a: Float = 1f)
 *     : Vec4Uniform(floatArrayOf(r, g, b, a))
 *
 * class MVP(data: FloatArray) : Mat4Uniform(data)
 *
 * // Use in shader node
 * class MyShader(...) : ShaderNode(...) {
 *     val color = uniform<Color>("u_color")      // only accepts Color
 *     val mvp = uniform<MVP>("u_mvp")            // only accepts MVP
 * }
 *
 * // Binding with type safety
 * pipeline.run("render") {
 *     myShader.color bind Color(1f, 0f, 0f)      // compile-time type checked
 *     myShader.mvp bind MVP(calculateMVP())
 * }
 * ```
 *
 * IMPORTANT:
 * - Output texture must have BGFX_TEXTURE_RT flag (render target)
 * - FullscreenQuad.init() must be called before first use
 * - Each ShaderNode should use a unique viewId
 * - Must call destroy() when done to release GPU resources
 *
 * @property shaderProgram Compiled shader program (vertex + fragment)
 * @property inputFormat Expected input texture format
 * @property outputFormat Expected output texture format
 * @property viewId BGFX view ID for rendering (0-255, must be unique per node)
 */
open class ShaderNode(
    private val shaderProgram: ShaderProgram,
    private val inputFormat: ITextureFormat,
    private val outputFormat: ITextureFormat,
    private val viewId: Int = 0
) : TransformationNode<TextureData, ITextureFormat>, GPUResource {

    override var inputs: List<PipelineEdge<TextureData, ITextureFormat>> = emptyList()
    override var outputs: List<PipelineEdge<TextureData, ITextureFormat>> = emptyList()

    override val edges: List<PipelineEdge<*, *>>
        get() = inputs + outputs

    // Texture sampler uniform for binding input texture
    private val textureSampler: Short

    // Custom uniforms created by subclasses
    // Protected to allow access from inline uniform<T>() function
    protected val customUniforms = mutableListOf<Uniform<*>>()

    private var destroyed = false

    init {
        // Validate viewId is in valid range
        require(viewId in 0..255) {
            "BGFX viewId must be in range 0-255, got $viewId"
        }

        // Validate FullscreenQuad is initialized
        require(FullscreenQuad.isInitialized()) {
            "FullscreenQuad must be initialized before creating ShaderNode. " +
            "Call FullscreenQuad.init() after BGFX initialization."
        }

        // Create texture sampler uniform for input texture
        // Shader must have "SAMPLER2D(s_texColor, 0);" declaration
        textureSampler = bgfx_create_uniform("s_texColor", BGFX_UNIFORM_TYPE_SAMPLER, 1)

        if (textureSampler == BGFX_INVALID_HANDLE) {
            throw RuntimeException(
                "Failed to create texture sampler uniform for ShaderNode. " +
                "This may be due to:\n" +
                "  - BGFX not initialized\n" +
                "  - Uniform name conflict\n" +
                "  - Out of uniform slots"
            )
        }
    }

    /**
     * Create a typed uniform port.
     * Call from subclass constructor to declare shader uniforms.
     *
     * Supports any subclass of the base uniform types (Vec4Uniform, Mat3Uniform, Mat4Uniform).
     * This enables custom typed uniforms with strict type safety and polymorphism.
     *
     * Example:
     * ```kotlin
     * // Custom color type
     * class MyColor(r: Float, g: Float, b: Float, a: Float)
     *     : Vec4Uniform(floatArrayOf(r, g, b, a))
     *
     * // In shader node subclass:
     * val genericColor = uniform<Vec4Uniform>("u_color")  // accepts any Vec4Uniform subclass
     * val specificColor = uniform<MyColor>("u_myColor")   // only accepts MyColor
     *
     * // Binding:
     * pipeline.run("path") {
     *     shader.genericColor bind Vec4Uniform(floatArrayOf(1f, 0f, 0f, 1f))
     *     shader.genericColor bind MyColor(1f, 0f, 0f, 1f)  // also works (polymorphism)
     *     shader.specificColor bind MyColor(1f, 0f, 0f, 1f)  // only MyColor accepted
     * }
     * ```
     *
     * @param T Uniform type (must extend Vec4Uniform, Mat3Uniform, or Mat4Uniform)
     * @param name Uniform name in shader (e.g., "u_time", "u_color", "u_mvp")
     * @return BindablePort for binding values of type T
     * @throws IllegalArgumentException if T is not a supported uniform type
     */
    protected inline fun <reified T : Any> uniform(name: String): Uniform<T> {
        val handler: UniformHandler<*> = when {
            Vec4Uniform::class.java.isAssignableFrom(T::class.java) -> UniformHandler.Vec4Handler
            Mat3Uniform::class.java.isAssignableFrom(T::class.java) -> UniformHandler.Mat3Handler
            Mat4Uniform::class.java.isAssignableFrom(T::class.java) -> UniformHandler.Mat4Handler
            else -> throw IllegalArgumentException(
                "Unsupported uniform type: ${T::class.java.name}. " +
                "Uniform type must extend Vec4Uniform, Mat3Uniform, or Mat4Uniform."
            )
        }

        @Suppress("UNCHECKED_CAST")
        return Uniform(name, handler as UniformHandler<T>).also { customUniforms.add(it) }
    }

    override fun execute() {
        check(!destroyed) { "Cannot execute destroyed ShaderNode" }

        // Get input texture from input edge (allocated by ExecutionManager)
        val inputEdge = inputs.firstOrNull()
            ?: throw IllegalStateException("ShaderNode has no input edge")

        val inputTexture = inputEdge.allocatedResource
            ?: throw IllegalStateException(
                "No input texture allocated for ShaderNode. " +
                "Ensure ExecutionManager has allocated resources before execution."
            )

        // Get output texture from output edge (allocated by ExecutionManager)
        val outputEdge = outputs.firstOrNull()
            ?: throw IllegalStateException("ShaderNode has no output edge")

        val outputTexture = outputEdge.allocatedResource
            ?: throw IllegalStateException(
                "No output texture allocated for ShaderNode. " +
                "Ensure ExecutionManager has allocated resources before execution."
            )

        // Create temporary framebuffer from output texture
        // This allows rendering to the texture instead of screen
        val framebuffer = bgfx_create_frame_buffer_from_handles(
            shortArrayOf(outputTexture.handle),  // texture handles
            false  // destroyTextures = false (we manage texture lifecycle)
        )

        if (framebuffer == BGFX_INVALID_HANDLE) {
            throw RuntimeException(
                "Failed to create framebuffer for ShaderNode output texture. " +
                "This may be due to:\n" +
                "  - Output texture missing BGFX_TEXTURE_RT flag\n" +
                "  - Invalid texture dimensions\n" +
                "  - Out of framebuffer slots\n" +
                "Ensure TextureAllocator creates textures with BGFX_TEXTURE_RT flag."
            )
        }

        try {
            // Configure view (render pass)
            bgfx_set_view_frame_buffer(viewId, framebuffer)
            bgfx_set_view_rect(viewId, 0, 0, outputFormat.width, outputFormat.height)

            // Clear framebuffer (optional, shader will overwrite entire image)
            bgfx_set_view_clear(
                viewId,
                BGFX_CLEAR_COLOR or BGFX_CLEAR_DEPTH,
                0x000000ff,  // black with full alpha
                1.0f,  // depth
                0   // stencil
            )

            // Bind input texture to sampler slot 0
            // Shader accesses this via "SAMPLER2D(s_texColor, 0);"
            bgfx_set_texture(
                0,  // stage (matches shader SAMPLER2D second parameter)
                textureSampler,  // uniform handle
                inputTexture.handle,  // texture handle
                BGFX_SAMPLER_NONE  // default sampling (no special flags)
            )

            // Upload custom uniforms to GPU
            customUniforms.forEach { uniform ->
                uniform.applyToGPU()
            }

            // Set rendering state
            // Write to RGB and Alpha channels, no depth/stencil testing
            val state = BGFX_STATE_WRITE_RGB or BGFX_STATE_WRITE_A
            bgfx_set_state(state.toLong(), 0)

            // Bind fullscreen quad geometry
            FullscreenQuad.bind()

            // Submit draw call
            // This executes the shader on the fullscreen quad
            bgfx_submit(viewId, shaderProgram.handle, 0, BGFX_DISCARD_ALL.toInt())

        } finally {
            // Always destroy temporary framebuffer, even if rendering fails
            // Texture itself is managed by ExecutionManager buffer pool
            bgfx_destroy_frame_buffer(framebuffer)
        }
    }

    override fun destroy() {
        if (!destroyed) {
            // Destroy texture sampler uniform
            if (textureSampler != BGFX_INVALID_HANDLE) {
                bgfx_destroy_uniform(textureSampler)
            }

            destroyed = true
        }
    }

    override fun isDestroyed(): Boolean = destroyed
}
