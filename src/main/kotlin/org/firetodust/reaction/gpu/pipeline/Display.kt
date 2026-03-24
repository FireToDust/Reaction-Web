package org.firetodust.reaction.gpu.pipeline

import org.firetodust.reaction.resources.ShaderProgram
import org.firetodust.reaction.window.RenderTarget
import org.lwjgl.bgfx.BGFX.*

/**
 * DisplayNode that renders pipeline output to a window or render target.
 *
 * Uses a fullscreen quad and display shader to blit the input texture to the target framebuffer.
 * Requires a simple blit shader that samples a texture and outputs it directly.
 *
 * Example blit fragment shader:
 * ```glsl
 * uniform sampler2D s_texColor;
 * varying vec2 v_texcoord0;
 *
 * void main() {
 *     gl_FragColor = texture2D(s_texColor, v_texcoord0);
 * }
 * ```
 *
 * Example usage:
 * ```
 * val window = Window(WindowConfig())
 * val loader = ResourceLoader.default()
 * val blitShader = ShaderProgram.create(
 *     loader.load("shaders/blit.vert"),
 *     loader.load("shaders/blit.frag")
 * )
 *
 * val displayNode = WindowDisplayNode(
 *     renderTarget = window.defaultFramebuffer,
 *     shaderProgram = blitShader,
 *     viewId = 0,
 *     format = TestTextureFormat(800, 600)
 * )
 *
 * val pipeline = PipelineBuilder(window.context) {
 *     has Path("render") with textureInputNode with displayNode
 * }.build()
 * ```
 *
 * @property renderTarget The target framebuffer to render to (window or offscreen)
 * @property shaderProgram Shader program for blitting texture to screen
 * @property viewId BGFX view ID (must be unique per frame, typically 0 for main display)
 * @property format Texture format for input
 */
class WindowDisplayNode(
    private val renderTarget: RenderTarget,
    private val shaderProgram: ShaderProgram,
    private val viewId: Int = 0,
    private val format: ITextureFormat
) : DisplayNode, TerminalNode<TextureData, ITextureFormat>, GPUResource {

    override var inputs: List<PipelineEdge<TextureData, ITextureFormat>> = emptyList()
    override val edges: List<PipelineEdge<*, *>> get() = inputs
    override val inputSource = this

    private var textureSampler: Short = -1
    private var destroyed = false

    init {
        // Create uniform for texture sampler (s_texColor matches ShaderNode convention)
        textureSampler = bgfx_create_uniform("s_texColor", BGFX_UNIFORM_TYPE_SAMPLER, 1)

        // Initialize FullscreenQuad if not already done
        if (!FullscreenQuad.isInitialized()) {
            FullscreenQuad.init()
        }
    }

    override fun execute() {
        // Get the input texture from the edge
        val inputEdge = inputs.firstOrNull()
            ?: throw IllegalStateException("No input edge for WindowDisplayNode")

        val inputTexture = inputEdge.allocatedResource
            ?: throw IllegalStateException("No texture allocated for WindowDisplayNode input")

        // Configure view rectangle (matches render target dimensions)
        bgfx_set_view_rect(viewId, 0, 0, renderTarget.width, renderTarget.height)

        // Set framebuffer for this view (BGFX_INVALID_HANDLE means default backbuffer)
        bgfx_set_view_frame_buffer(viewId, renderTarget.handle)

        // Set render state (no depth test, no culling, simple alpha blend)
        val state = (BGFX_STATE_WRITE_RGB or
                     BGFX_STATE_WRITE_A or
                     BGFX_STATE_BLEND_ALPHA).toLong()
        bgfx_set_state(state, 0)

        // Bind the input texture
        bgfx_set_texture(0, textureSampler, inputTexture.handle, BGFX_SAMPLER_NONE)

        // Bind fullscreen quad geometry
        FullscreenQuad.bind()

        // Submit draw call
        bgfx_submit(viewId, shaderProgram.handle, 0, BGFX_DISCARD_ALL.toInt())
    }

    override fun destroy() {
        if (!destroyed) {
            if (textureSampler != (-1).toShort()) {
                bgfx_destroy_uniform(textureSampler)
                textureSampler = -1
            }
            destroyed = true
        }
    }

    override fun isDestroyed(): Boolean = destroyed
}
