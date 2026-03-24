package org.firetodust.reaction.window

import org.lwjgl.bgfx.BGFX.*
import org.lwjgl.bgfx.BGFXInit
import org.lwjgl.glfw.GLFW.*
import org.lwjgl.glfw.GLFWNativeCocoa
import org.lwjgl.glfw.GLFWNativeWin32
import org.lwjgl.glfw.GLFWNativeX11
import org.lwjgl.glfw.GLFWNativeWayland
import org.lwjgl.system.Platform

/**
 * Manages BGFX lifecycle and provides GPU context.
 *
 * On macOS, works with glfw_async library which handles Cocoa threading automatically.
 * This allows BGFX to run on the main thread with proper NSApplication main loop.
 *
 * Must be initialized before any GPU operations.
 * Prevents multiple initialization via singleton pattern.
 */
class BGFXContext private constructor() {

    /**
     * Submit a frame to BGFX, completing all GPU operations.
     * Must be called after pipeline execution and before reading back results.
     */
    fun frame(capture: Boolean = false) {
        bgfx_frame(capture)
    }

    /**
     * Shutdown BGFX and release all GPU resources.
     * Should be called when closing the application.
     *
     * Important: Close all pipelines BEFORE calling shutdown().
     * Pipelines must release their resources while BGFX is still active.
     */
    fun shutdown() {
        check(instance == this) { "Attempting to shutdown non-active context" }

        println("[BGFXContext] Shutting down BGFX...")

        // Destroy global GPU resources
        destroyGlobalResources()

        bgfx_shutdown()
        println("[BGFXContext] BGFX shutdown complete")

        instance = null
    }

    /**
     * Destroy global GPU resources that are shared across the application.
     * Called automatically during shutdown().
     */
    private fun destroyGlobalResources() {
        // Destroy FullscreenQuad if initialized
        if (org.firetodust.reaction.gpu.pipeline.FullscreenQuad.isInitialized()) {
            println("[BGFXContext] Destroying FullscreenQuad...")
            org.firetodust.reaction.gpu.pipeline.FullscreenQuad.destroy()
        }
    }

    companion object {
        private var instance: BGFXContext? = null

        /**
         * Initialize BGFX with the specified configuration.
         * Can only be called once - subsequent calls will throw an exception.
         *
         * @param config Window configuration including render mode
         * @param glfwWindowHandle GLFW window handle (or 0 for headless/NOOP)
         * @return BGFXContext instance
         * @throws IllegalStateException if BGFX is already initialized
         * @throws RuntimeException if BGFX initialization fails
         */
        fun initialize(config: WindowConfig, glfwWindowHandle: Long): BGFXContext {
            check(instance == null) {
                "BGFX already initialized! Only one BGFXContext can exist at a time."
            }

            println("[BGFXContext] Initializing BGFX...")

            // Create context instance first to claim the singleton slot
            val context = BGFXContext()
            instance = context

            val init = BGFXInit.calloc()
            try {
                bgfx_init_ctor(init)

                // Set renderer type based on config
                init.type(config.renderMode.bgfxType)

                // Configure resolution
                init.resolution { resolution ->
                    resolution.width(config.width)
                    resolution.height(config.height)

                    val resetFlags = buildResetFlags(config)
                    resolution.reset(resetFlags)
                }

                // Set platform data (GLFW window handle)
                // Pattern from official LWJGL BGFX examples (HelloBGFX.java)
                if (glfwWindowHandle != 0L && config.renderMode != RenderMode.NOOP) {
                    when (Platform.get()) {
                        Platform.FREEBSD, Platform.LINUX -> {
                            if (glfwGetPlatform() == GLFW_PLATFORM_WAYLAND) {
                                init.platformData()
                                    .ndt(GLFWNativeWayland.glfwGetWaylandDisplay())
                                    .nwh(GLFWNativeWayland.glfwGetWaylandWindow(glfwWindowHandle))
                                    .type(BGFX_NATIVE_WINDOW_HANDLE_TYPE_WAYLAND)
                            } else {
                                init.platformData()
                                    .ndt(GLFWNativeX11.glfwGetX11Display())
                                    .nwh(GLFWNativeX11.glfwGetX11Window(glfwWindowHandle))
                            }
                        }
                        Platform.MACOSX -> {
                            init.platformData()
                                .nwh(GLFWNativeCocoa.glfwGetCocoaWindow(glfwWindowHandle))
                        }
                        Platform.WINDOWS -> {
                            init.platformData()
                                .nwh(GLFWNativeWin32.glfwGetWin32Window(glfwWindowHandle))
                        }
                        else -> {
                            throw UnsupportedOperationException("Unsupported platform: ${Platform.get()}")
                        }
                    }
                }

                // Initialize BGFX
                println("[BGFXContext] Calling bgfx_init()...")
                if (!bgfx_init(init)) {
                    // Reset singleton instance on failure so retry is possible
                    instance = null
                    throw RuntimeException(
                        "Failed to initialize BGFX with renderer: ${config.renderMode}. " +
                        "This may be due to:\n" +
                        "  - Unsupported graphics hardware or drivers\n" +
                        "  - Incompatible renderer for this platform\n" +
                        "  - Missing GPU drivers\n" +
                        "Try a different RenderMode or update your graphics drivers."
                    )
                }
                println("[BGFXContext] BGFX initialized successfully!")

            } catch (e: Exception) {
                // Reset singleton instance on any error so retry is possible
                instance = null
                throw e
            } finally {
                init.free()
            }

            return context
        }

        /**
         * Check if BGFX has been initialized.
         */
        fun isInitialized(): Boolean = instance != null

        /**
         * Get the current context instance.
         * @throws IllegalStateException if not initialized
         */
        fun current(): BGFXContext {
            return instance ?: throw IllegalStateException(
                "BGFX not initialized! Create a Window before accessing GPU resources.\n" +
                "Correct order:\n" +
                "  val window = Window(WindowConfig(...))\n" +
                "  val pipeline = PipelineBuilder(window.context) { ... }.build()"
            )
        }

        private fun buildResetFlags(config: WindowConfig): Int {
            var flags = BGFX_RESET_NONE
            if (config.vsync) {
                flags = flags or BGFX_RESET_VSYNC
            }
            return flags
        }
    }
}
