package org.firetodust.reaction.window

import org.lwjgl.glfw.GLFW.glfwTerminate

/**
 * Main window abstraction that manages window lifecycle and GPU context.
 *
 * Window creates and owns the BGFXContext, ensuring proper initialization order.
 * The context is required for all GPU operations, including Pipeline creation.
 *
 * For NOOP render mode (headless testing), creates a hidden window that doesn't display anything.
 * For real render modes, creates a visible window that can display rendered content.
 *
 * Example usage:
 * ```
 * // Create window (initializes BGFX)
 * val window = Window(WindowConfig(renderMode = RenderMode.OpenGL))
 * window.show()  // Make visible
 *
 * // Create pipeline with context
 * val pipeline = PipelineBuilder(window.context) { ... }.build()
 *
 * // Main loop
 * while (!window.shouldClose()) {
 *     pipeline.run("render")
 *     window.swapBuffers()
 *     window.pollEvents()
 * }
 *
 * window.close()
 * ```
 */
class Window(private val config: WindowConfig) {

    private val glfwWindow: GLFWWindowHandle = GLFWWindowHandle.create(config)

    /**
     * GPU context for BGFX operations.
     * Pass this to Pipeline and other GPU components.
     */
    val context: BGFXContext = BGFXContext.initialize(config, glfwWindow.handle)

    /**
     * Default framebuffer that renders to the window.
     * DisplayNodes can use this as their render target.
     */
    val defaultFramebuffer: RenderTarget = WindowFramebuffer(config.width, config.height)

    /**
     * Check if the window should close.
     * Returns true when user clicks close button or presses ESC.
     */
    fun shouldClose(): Boolean {
        return glfwWindow.shouldClose()
    }

    /**
     * Swap front and back buffers to display rendered content.
     * Call this after pipeline execution to present the frame.
     */
    fun swapBuffers() {
        glfwWindow.swapBuffers()
    }

    /**
     * Poll input events from GLFW.
     * Should be called once per frame in the main loop.
     */
    fun pollEvents() {
        glfwWindow.pollEvents()
    }

    /**
     * Get current window width (may change if resizable).
     */
    fun getWidth(): Int {
        return glfwWindow.getWidth()
    }

    /**
     * Get current window height (may change if resizable).
     */
    fun getHeight(): Int {
        return glfwWindow.getHeight()
    }

    /**
     * Show the window (make it visible).
     * For NOOP mode, this is a no-op.
     */
    fun show() {
        glfwWindow.show()
    }

    /**
     * Hide the window.
     */
    fun hide() {
        glfwWindow.hide()
    }

    /**
     * Close the window and cleanup all resources.
     * Should be called when shutting down the application.
     */
    fun close() {
        context.shutdown()
        glfwWindow.destroy()
        glfwTerminate()
    }
}
