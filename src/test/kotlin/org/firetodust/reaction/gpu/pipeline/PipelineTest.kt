package org.firetodust.reaction.gpu.pipeline

import kotlinx.coroutines.runBlocking
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import org.firetodust.reaction.window.Window
import org.firetodust.reaction.window.WindowConfig
import org.firetodust.reaction.window.RenderMode
import java.nio.ByteBuffer

class TestTextureFormat(
    override val width: Int = 64,
    override val height: Int = 64,
    override val format: BGFXTextureFormat = BGFXTextureFormat.RGBA8,
    override val hasMips: Boolean = false,
    override val layers: Int = 1
) : ITextureFormat

/**
 * Tests for basic pipeline execution with texture upload/download.
 *
 * Tests:
 * - TextureInputNode and TextureOutputNode
 * - Pipeline execution with GPU texture operations
 * - Asynchronous GPU readback
 */
class PipelineTest {

    @Test
    fun testBasicPipelineExecution() {
        println("Starting pipeline test...")

        // Create window with OpenGL renderer for real GPU testing
        val window = Window(WindowConfig(
            width = 800,
            height = 600,
            title = "Pipeline Test (GPU)",
            renderMode = RenderMode.OpenGL
        ))
        window.show()  // Make window visible for GPU context

        println("Window initialized successfully (OpenGL renderer)")

        // Submit initial frames and poll events to ensure BGFX is fully initialized
        // On macOS with glfw_async, need to process events for GL context to be ready
        println("Initializing GPU context...")
        for (i in 0 until 3) {
            window.pollEvents()  // Process GLFW events
            window.context.frame(false)  // Submit frame
            Thread.sleep(16)  // ~60 FPS
        }
        println("GPU context ready")

        // Simple test format - 64x64 RGBA texture
        val testFormat = TestTextureFormat()

        // Create nodes
        val inputNode = TextureInputNode(testFormat)
        val outputNode = TextureOutputNode(testFormat)

        // Create edge connecting them
        val edge = DefaultPipelineEdge<TextureData, ITextureFormat>(
            source = inputNode,
            target = outputNode,
            format = testFormat
        )

        // Set up node connections
        inputNode.outputs = listOf(edge)
        outputNode.inputs = listOf(edge)

        // Create execution order
        val executionOrder = listOf(inputNode, outputNode)

        // Create PathPlan
        val pathPlan = Pipeline.PathPlan(
            name = "test",
            executionOrder = executionOrder,
            sources = listOf(inputNode),
            targets = listOf(outputNode)
        )

        // Create Pipeline with window context
        val pipeline = Pipeline(
            pathPlans = mapOf("test" to pathPlan),
            allNodes = executionOrder,
            context = window.context
        )

        // Create test CPU data with a pattern we can verify
        val bufferSize = testFormat.width * testFormat.height * 4  // RGBA = 4 bytes per pixel
        val testByteBuffer = ByteBuffer.allocateDirect(bufferSize)

        // Fill with test pattern: alternating red and blue pixels
        for (i in 0 until testFormat.width * testFormat.height) {
            if (i % 2 == 0) {
                testByteBuffer.put(255.toByte())  // R
                testByteBuffer.put(0.toByte())     // G
                testByteBuffer.put(0.toByte())     // B
                testByteBuffer.put(255.toByte())   // A
            } else {
                testByteBuffer.put(0.toByte())     // R
                testByteBuffer.put(0.toByte())     // G
                testByteBuffer.put(255.toByte())   // B
                testByteBuffer.put(255.toByte())   // A
            }
        }
        testByteBuffer.flip()

        val cpuData: CPUData<TextureData, ITextureFormat> = CPUData(testFormat, testByteBuffer)

        println("Running pipeline...")
        println("Input buffer size: ${testByteBuffer.capacity()} bytes")

        // Run pipeline
        val result = pipeline.run("test") {
            inputBindings[inputNode] = { inputNode.setInput(cpuData) }
        }

        println("Pipeline executed successfully!")

        // BGFX readback is asynchronous - need to submit frames for GPU to process
        // Frame submission now happens on the render thread via command queue
        println("Submitting frames for GPU processing...")
        window.context.frame(false)  // First frame: processes upload, queues readback
        Thread.sleep(50)  // Give render thread time to process

        window.context.frame(false)  // Second frame: processes readback request
        Thread.sleep(50)

        window.context.frame(false)  // Third frame: ensures readback complete
        Thread.sleep(50)

        // Get output
        val outputDeferred = result.getOutput(outputNode)

        // Poll GLFW events while waiting for result (keep main thread responsive)
        println("Polling events while waiting for GPU result...")

        runBlocking {
            // Poll GLFW events while waiting for the GPU result
            while (!outputDeferred.isCompleted) {
                window.pollEvents()
                Thread.sleep(16)  // ~60 FPS polling rate
            }

            val outputData = outputDeferred.await()
            println("Got output data with buffer size: ${outputData.byteBuffer.capacity()} bytes")

            assertEquals(bufferSize, outputData.byteBuffer.capacity())

            // Verify first few pixels match input pattern
            val outBuf = outputData.byteBuffer
            outBuf.rewind()

            // First pixel should be red
            val r1 = outBuf.get().toUByte().toInt()
            val g1 = outBuf.get().toUByte().toInt()
            val b1 = outBuf.get().toUByte().toInt()
            val a1 = outBuf.get().toUByte().toInt()
            println("First pixel (should be red): R=$r1 G=$g1 B=$b1 A=$a1")
            assertEquals(255, r1)
            assertEquals(0, g1)
            assertEquals(0, b1)
            assertEquals(255, a1)

            // Second pixel should be blue
            val r2 = outBuf.get().toUByte().toInt()
            val g2 = outBuf.get().toUByte().toInt()
            val b2 = outBuf.get().toUByte().toInt()
            val a2 = outBuf.get().toUByte().toInt()
            println("Second pixel (should be blue): R=$r2 G=$g2 B=$b2 A=$a2")
            assertEquals(0, r2)
            assertEquals(0, g2)
            assertEquals(255, b2)
            assertEquals(255, a2)
        }

        println("Test completed!")

        // Cleanup - IMPORTANT: close pipeline before window
        println("Closing pipeline...")
        pipeline.close()
        println("Closing window...")
        window.close()

        println("All done!")
    }
}