package org.example
import org.lwjgl.glfw.GLFW.*
import org.lwjgl.opengl.GL
import org.lwjgl.opengl.GL11.*

fun main() {
    // Initialize GLFW
    if (!glfwInit()) {
        throw IllegalStateException("Unable to initialize GLFW")
    }

    // Configure GLFW
    glfwDefaultWindowHints()
    glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE)
    glfwWindowHint(GLFW_RESIZABLE, GLFW_TRUE)

    // Create the window
    val width = 800
    val height = 600
    val window = glfwCreateWindow(width, height, "LWJGL Kotlin Window", 0, 0)
    if (window == 0L) {
        throw RuntimeException("Failed to create the GLFW window")
    }

    glfwMakeContextCurrent(window)
    glfwShowWindow(window)

    // Initialize OpenGL capabilities
    GL.createCapabilities()

    // Render loop
    while (!glfwWindowShouldClose(window)) {
        glClear(GL_COLOR_BUFFER_BIT or GL_DEPTH_BUFFER_BIT)

        // Draw something simple
        glBegin(GL_TRIANGLES)
        glColor3f(1f, 0f, 0f)
        glVertex2f(-0.5f, -0.5f)
        glColor3f(0f, 1f, 0f)
        glVertex2f(0.5f, -0.5f)
        glColor3f(0f, 0f, 1f)
        glVertex2f(0f, 0.5f)
        glEnd()

        glfwSwapBuffers(window)
        glfwPollEvents()
    }

    // Cleanup
    glfwDestroyWindow(window)
    glfwTerminate()
}