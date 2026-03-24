package org.firetodust.reaction.window

import org.lwjgl.glfw.GLFW.*
import org.lwjgl.system.Configuration
import org.lwjgl.system.Platform

/**
 * GLFW window handle wrapper.
 * Manages GLFW window lifecycle and provides window operations.
 *
 * For NOOP render mode, creates a hidden window to provide a valid context
 * without displaying anything on screen.
 */
class GLFWWindowHandle private constructor(
    val handle: Long,
    private val config: WindowConfig
) {

    /**
     * Check if the window should close (user clicked close button or ESC pressed).
     */
    fun shouldClose(): Boolean {
        return glfwWindowShouldClose(handle)
    }

    /**
     * Swap front and back buffers to display rendered content.
     * No-op for NOOP render mode.
     */
    fun swapBuffers() {
        if (config.renderMode.requiresWindow) {
            glfwSwapBuffers(handle)
        }
    }

    /**
     * Poll input events from GLFW.
     */
    fun pollEvents() {
        glfwPollEvents()
    }

    /**
     * Get current window width (may change if resizable).
     */
    fun getWidth(): Int {
        val width = IntArray(1)
        glfwGetWindowSize(handle, width, null)
        return width[0]
    }

    /**
     * Get current window height (may change if resizable).
     */
    fun getHeight(): Int {
        val height = IntArray(1)
        glfwGetWindowSize(handle, null, height)
        return height[0]
    }

    /**
     * Destroy the GLFW window and cleanup resources.
     */
    fun destroy() {
        glfwDestroyWindow(handle)
    }

    companion object {
        /**
         * Create a GLFW window with the specified configuration.
         *
         * For NOOP render mode, creates a hidden window.
         * For real render modes, creates a visible window (initially hidden, call show() to display).
         *
         * @param config Window configuration
         * @return GLFWWindowHandle wrapping the GLFW window
         * @throws RuntimeException if window creation fails
         */
        fun create(config: WindowConfig): GLFWWindowHandle {
            println("[GLFW] Starting GLFW initialization...")

            // On macOS, use glfw_async to work with BGFX without -XstartOnFirstThread
            if (Platform.get() == Platform.MACOSX) {
                Configuration.GLFW_LIBRARY_NAME.set("glfw_async")
                println("[GLFW] Configured glfw_async for macOS")
            }

            // Initialize GLFW if not already initialized
            if (!glfwInit()) {
                throw RuntimeException("Failed to initialize GLFW")
            }

            println("[GLFW] GLFW initialized successfully")

            try {
                // Configure GLFW window hints
                glfwDefaultWindowHints()

                // Start with window hidden (caller can show it later)
                glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE)

                // Set resizable flag
                glfwWindowHint(GLFW_RESIZABLE, if (config.resizable) GLFW_TRUE else GLFW_FALSE)

                // BGFX manages its own rendering context, so we don't want GLFW to create one
                // This is required for ALL render modes (NOOP, OpenGL, Vulkan, Metal, etc.)
                glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API)

                // On macOS, disable retina framebuffer for consistent pixel handling
                // This ensures framebuffer size matches window size
                if (Platform.get() == Platform.MACOSX) {
                    glfwWindowHint(GLFW_COCOA_RETINA_FRAMEBUFFER, GLFW_FALSE)
                }

                println("[GLFW] Window hints configured, creating window...")

                // Create the window
                val windowHandle = glfwCreateWindow(
                    config.width,
                    config.height,
                    config.title,
                    0L, // No monitor (windowed mode)
                    0L  // No context sharing
                )

                println("[GLFW] glfwCreateWindow returned: $windowHandle")

                if (windowHandle == 0L) {
                    throw RuntimeException(
                        "Failed to create GLFW window (${config.width}x${config.height}, ${config.title}). " +
                        "This may be due to:\n" +
                        "  - Invalid window dimensions\n" +
                        "  - Unsupported display configuration\n" +
                        "  - Insufficient system resources"
                    )
                }

                return GLFWWindowHandle(windowHandle, config)
            } catch (e: Exception) {
                // Clean up GLFW on any error during window creation
                println("[GLFW] Window creation failed, terminating GLFW...")
                glfwTerminate()
                throw e
            }
        }
    }

    /**
     * Show the window (make it visible).
     * For NOOP mode, this is a no-op (window stays hidden).
     */
    fun show() {
        if (config.renderMode.requiresWindow) {
            glfwShowWindow(handle)
        }
    }

    /**
     * Hide the window.
     */
    fun hide() {
        glfwHideWindow(handle)
    }
}
