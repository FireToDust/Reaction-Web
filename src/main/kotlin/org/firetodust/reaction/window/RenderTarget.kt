package org.firetodust.reaction.window

/**
 * Abstraction for a render target (framebuffer) that nodes can render to.
 *
 * This interface allows DisplayNodes to render to various targets:
 * - Window's default framebuffer (renders to screen)
 * - Offscreen framebuffers (for post-processing, shadows, etc.)
 * - Custom render targets (for modding support)
 *
 * By depending on this interface rather than Window directly, DisplayNodes
 * and mods can work with any render target without knowing implementation details.
 */
interface RenderTarget {
    /**
     * Width of the render target in pixels
     */
    val width: Int

    /**
     * Height of the render target in pixels
     */
    val height: Int

    /**
     * BGFX framebuffer handle.
     * Use BGFX_INVALID_HANDLE (0xFFFF) for the default backbuffer.
     */
    val handle: Short
}

/**
 * Default window framebuffer that renders to the screen.
 * Uses BGFX's default backbuffer (handle = BGFX_INVALID_HANDLE).
 */
class WindowFramebuffer(
    override val width: Int,
    override val height: Int
) : RenderTarget {
    override val handle: Short = 0xFFFF.toShort() // BGFX_INVALID_HANDLE
}

/**
 * Offscreen framebuffer for render-to-texture operations.
 *
 * @property handle BGFX framebuffer handle created via bgfx_create_frame_buffer
 */
class OffscreenFramebuffer(
    override val width: Int,
    override val height: Int,
    override val handle: Short
) : RenderTarget
