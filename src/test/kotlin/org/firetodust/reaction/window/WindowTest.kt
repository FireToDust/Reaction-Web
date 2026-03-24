package org.firetodust.reaction.window

import kotlin.test.Test
import kotlin.test.assertTrue
import kotlin.test.assertEquals

/**
 * Tests for Window creation in NOOP mode (headless).
 * This demonstrates that windows can be created for testing without requiring a GPU or display.
 *
 * NOTE: Even NOOP mode requires GLFW initialization.
 */
class WindowTest {

    @Test
    fun testWindowCreation() {
        println("Testing Window creation in NOOP mode...")

        // Create window in NOOP mode (headless, no visible window)
        val window = Window(WindowConfig(
            width = 1920,
            height = 1080,
            title = "Window Test (Headless)",
            renderMode = RenderMode.NOOP
        ))

        println("Window created successfully!")
        println("  Size: ${window.getWidth()}x${window.getHeight()}")
        println("  Render mode: ${RenderMode.NOOP}")
        println("  BGFX initialized: ${BGFXContext.isInitialized()}")
        println("  Default framebuffer handle: ${window.defaultFramebuffer.handle}")

        // Verify window properties
        assertEquals(1920, window.getWidth())
        assertEquals(1080, window.getHeight())
        assertTrue(BGFXContext.isInitialized())

        // Verify context is available
        val context = window.context
        val frame1 = context.frame(false)
        println("  Context frame count: $frame1")

        // Test that we can create another frame
        val frame2 = context.frame(false)
        println("  Second frame count: $frame2")

        println("\nWindow test completed successfully!")

        // Cleanup
        window.close()
        println("Window closed and cleaned up.")
    }
}

/**
 * Manual test for Window creation in real OpenGL mode.
 * Run this separately to test actual window display.
 *
 * Uncomment and run manually:
 */
/*
fun testRealWindow() {
    println("Testing Window creation in OpenGL mode...")

    val window = Window(WindowConfig(
        width = 800,
        height = 600,
        title = "Window Test (OpenGL)",
        renderMode = RenderMode.OpenGL
    ))

    window.show()  // Make window visible

    println("Window shown! Press ESC or close button to exit.")

    // Simple event loop
    while (!window.shouldClose()) {
        window.context.frame(false)
        window.swapBuffers()
        window.pollEvents()

        // Small sleep to prevent busy loop
        Thread.sleep(16)  // ~60 FPS
    }

    window.close()
    println("Window closed.")
}
*/
