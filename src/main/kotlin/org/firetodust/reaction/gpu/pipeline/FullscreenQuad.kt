package org.firetodust.reaction.gpu.pipeline

import org.lwjgl.bgfx.BGFX.*
import org.lwjgl.bgfx.BGFXVertexLayout
import org.lwjgl.system.MemoryUtil
import java.nio.ByteBuffer

/**
 * BGFX invalid handle constant.
 */
private const val BGFX_INVALID_HANDLE: Short = -1

/**
 * Reusable fullscreen quad geometry for shader-based image processing.
 *
 * Uses a screen-space triangle instead of a quad for better efficiency.
 * The triangle covers the entire NDC space (-1 to 1) with proper UV coordinates.
 *
 * This is a singleton - only one instance is created and shared across all shader nodes.
 * Must call init() before use and destroy() when done.
 *
 * Vertex format:
 * - Position: vec2 (x, y in NDC space)
 * - TexCoord0: vec2 (u, v for texture sampling)
 */
object FullscreenQuad : GPUResource {
    private var vertexBuffer: Short = BGFX_INVALID_HANDLE
    private var layout: BGFXVertexLayout? = null
    private var initialized = false
    private var destroyed = false

    /**
     * Initialize the fullscreen quad geometry.
     * Must be called after BGFX initialization.
     *
     * @throws RuntimeException if BGFX buffer creation fails
     * @throws IllegalStateException if already initialized
     */
    fun init() {
        check(!initialized) { "FullscreenQuad already initialized" }
        check(!destroyed) { "FullscreenQuad has been destroyed" }

        // Create vertex layout: position (vec2) + texcoord0 (vec2)
        val layoutStruct = BGFXVertexLayout.calloc()
        bgfx_vertex_layout_begin(layoutStruct, BGFX_RENDERER_TYPE_NOOP)
        bgfx_vertex_layout_add(layoutStruct, BGFX_ATTRIB_POSITION, 2, BGFX_ATTRIB_TYPE_FLOAT, false, false)
        bgfx_vertex_layout_add(layoutStruct, BGFX_ATTRIB_TEXCOORD0, 2, BGFX_ATTRIB_TYPE_FLOAT, false, false)
        bgfx_vertex_layout_end(layoutStruct)
        layout = layoutStruct

        // Create screen-space triangle vertices
        // Triangle covers entire screen: (-1,-1) to (1,1) in NDC space
        // Extends beyond screen to simplify rasterization
        val vertices = floatArrayOf(
            // Position (x, y)  |  TexCoord (u, v)
            -1f, -1f,           0f, 0f,  // Bottom-left
             3f, -1f,           2f, 0f,  // Extends right (clipped by GPU)
            -1f,  3f,           0f, 2f   // Extends up (clipped by GPU)
        )

        // Convert to ByteBuffer for BGFX
        val vertexData: ByteBuffer = MemoryUtil.memAlloc(vertices.size * 4)  // 4 bytes per float
        try {
            vertices.forEach { vertexData.putFloat(it) }
            vertexData.flip()

            // Create static vertex buffer (data won't change)
            val memory = bgfx_make_ref(vertexData)
                ?: throw RuntimeException("Failed to create memory reference for FullscreenQuad vertices")

            vertexBuffer = bgfx_create_vertex_buffer(memory, layout!!, BGFX_BUFFER_NONE)

            if (vertexBuffer == BGFX_INVALID_HANDLE) {
                throw RuntimeException(
                    "Failed to create vertex buffer for FullscreenQuad. " +
                    "This may be due to:\n" +
                    "  - BGFX not initialized\n" +
                    "  - Out of GPU memory\n" +
                    "  - Invalid vertex layout"
                )
            }

            initialized = true
        } finally {
            MemoryUtil.memFree(vertexData)
        }
    }

    /**
     * Bind the fullscreen quad for rendering.
     * Sets the vertex buffer for the next draw call.
     *
     * Must be called before bgfx_submit() in shader nodes.
     *
     * @throws IllegalStateException if not initialized
     */
    fun bind() {
        check(initialized) { "FullscreenQuad not initialized. Call init() first." }
        check(!destroyed) { "FullscreenQuad has been destroyed" }

        // Bind vertex buffer: stream 0, all 3 vertices
        bgfx_set_vertex_buffer(0, vertexBuffer, 0, 3)
    }

    /**
     * Destroy the fullscreen quad and release GPU resources.
     * Should be called when shutting down the application.
     */
    override fun destroy() {
        if (!destroyed && initialized) {
            if (vertexBuffer != BGFX_INVALID_HANDLE) {
                bgfx_destroy_vertex_buffer(vertexBuffer)
                vertexBuffer = BGFX_INVALID_HANDLE
            }

            layout?.free()
            layout = null

            destroyed = true
            initialized = false
        }
    }

    override fun isDestroyed(): Boolean = destroyed

    /**
     * Check if the fullscreen quad has been initialized.
     */
    fun isInitialized(): Boolean = initialized
}
