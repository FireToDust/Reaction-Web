package org.firetodust.reaction.window

import org.lwjgl.bgfx.BGFX.*

/**
 * Configuration for window and rendering context.
 *
 * @property width Window width in pixels
 * @property height Window height in pixels
 * @property title Window title
 * @property renderMode GPU rendering backend to use
 * @property vsync Enable vertical synchronization
 * @property resizable Allow window resizing
 */
data class WindowConfig(
    val width: Int = 800,
    val height: Int = 600,
    val title: String = "Reaction",
    val renderMode: RenderMode = RenderMode.OpenGL,
    val vsync: Boolean = true,
    val resizable: Boolean = true
)

/**
 * GPU rendering backend options.
 *
 * NOOP: Headless mode for testing - accepts GPU commands but doesn't render
 * OpenGL: Cross-platform GPU rendering via OpenGL
 * Vulkan: Modern low-level GPU API (Linux/Windows)
 * Metal: Apple's GPU API (macOS/iOS)
 * DirectX11: Windows DirectX 11
 * DirectX12: Windows DirectX 12
 */
enum class RenderMode(val bgfxType: Int) {
    NOOP(BGFX_RENDERER_TYPE_NOOP),
    OpenGL(BGFX_RENDERER_TYPE_OPENGL),
    Vulkan(BGFX_RENDERER_TYPE_VULKAN),
    Metal(BGFX_RENDERER_TYPE_METAL),
    DirectX11(BGFX_RENDERER_TYPE_DIRECT3D11),
    DirectX12(BGFX_RENDERER_TYPE_DIRECT3D12);

    /**
     * Check if this render mode requires a visible window.
     * NOOP mode can work with hidden/headless windows.
     */
    val requiresWindow: Boolean
        get() = this != NOOP
}
