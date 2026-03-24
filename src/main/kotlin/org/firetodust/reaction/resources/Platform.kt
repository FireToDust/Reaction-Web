package org.firetodust.reaction.resources

import org.lwjgl.bgfx.BGFX.*

/**
 * Graphics platform/renderer type for loading platform-specific resources.
 *
 * BGFX uses different binary formats for each renderer backend.
 * Shaders must be compiled offline using shaderc tool for each target platform.
 *
 * Maps BGFX renderer types to file extensions for resource loading.
 *
 * @property bgfxType BGFX renderer type constant
 * @property fileExtension File extension for platform-specific shaders (e.g., "opengl", "metal")
 */
enum class Platform(val bgfxType: Int, val fileExtension: String) {
    /** NOOP renderer - no actual rendering (headless) */
    NOOP(BGFX_RENDERER_TYPE_NOOP, "noop"),

    /** Direct3D 11 (Windows) */
    DIRECT3D11(BGFX_RENDERER_TYPE_DIRECT3D11, "dx11"),

    /** Direct3D 12 (Windows modern) */
    DIRECT3D12(BGFX_RENDERER_TYPE_DIRECT3D12, "dx12"),

    /** Metal (macOS/iOS) */
    METAL(BGFX_RENDERER_TYPE_METAL, "metal"),

    /** OpenGL (desktop and cross-platform) */
    OPENGL(BGFX_RENDERER_TYPE_OPENGL, "opengl"),

    /** Vulkan (modern cross-platform) */
    VULKAN(BGFX_RENDERER_TYPE_VULKAN, "vulkan");

    companion object {
        /**
         * Detect current platform from BGFX renderer type.
         *
         * Must be called after BGFX initialization.
         *
         * @return Platform enum for the active renderer
         * @throws IllegalStateException if BGFX not initialized or unknown renderer
         */
        fun detect(): Platform {
            val rendererType = bgfx_get_renderer_type()

            return entries.find { it.bgfxType == rendererType }
                ?: throw IllegalStateException(
                    "Unknown BGFX renderer type: $rendererType. " +
                    "Ensure BGFX is initialized before calling Platform.detect()"
                )
        }

        /**
         * Get platform by BGFX renderer type constant.
         *
         * @param bgfxType BGFX_RENDERER_TYPE_* constant
         * @return Platform enum or null if not found
         */
        fun fromBgfxType(bgfxType: Int): Platform? {
            return entries.find { it.bgfxType == bgfxType }
        }
    }
}
