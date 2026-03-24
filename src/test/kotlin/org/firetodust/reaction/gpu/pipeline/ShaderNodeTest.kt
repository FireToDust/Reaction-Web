package org.firetodust.reaction.gpu.pipeline

import kotlinx.coroutines.runBlocking
import kotlin.test.Test
import kotlin.test.assertTrue
import org.firetodust.reaction.resources.ResourceLoader
import org.firetodust.reaction.resources.Shader
import org.firetodust.reaction.resources.ShaderProgram
import org.firetodust.reaction.resources.load
import org.firetodust.reaction.window.Window
import org.firetodust.reaction.window.WindowConfig
import org.firetodust.reaction.window.RenderMode
import java.nio.ByteBuffer

/**
 * Tests for ShaderNode with redshift transformation.
 *
 * Pipeline structure:
 * TextureInputNode -> ShaderNode (redshift) -> TextureOutputNode
 *
 * PREREQUISITES:
 * 1. Shaders must be compiled using shaderc tool
 * 2. Binary files must be present in src/main/resources/shaders/:
 *    - redshift.vert.metal.bin (for macOS/Metal)
 *    - redshift.frag.metal.bin (for macOS/Metal)
 *
 * See src/main/resources/shaders/COMPILE.md for compilation instructions.
 *
 * Expected behavior:
 * - Input: Red=100, Green=100, Blue=100 (gray)
 * - Output: Red=150, Green=100, Blue=50 (reddish)
 */
class ShaderNodeTest {

    @Test
    fun testShaderNodeRedshift() {
        println("=== ShaderNode Test ===\n")

        // Create window with Metal renderer (macOS)
        println("Creating window...")
        val window = Window(WindowConfig(
            width = 800,
            height = 600,
            title = "ShaderNode Test",
            renderMode = RenderMode.Metal
        ))
        println("Window created successfully\n")

        // Initialize FullscreenQuad (required for all shader nodes)
        println("Initializing FullscreenQuad...")
        FullscreenQuad.init()
        println("FullscreenQuad initialized\n")

        // Create resource loader
        println("Creating ResourceLoader...")
        val loader = ResourceLoader.default()
        println("ResourceLoader created\n")

        // Load redshift shaders
        println("Loading shaders...")
        println("  NOTE: If this fails, shaders need to be compiled.")
        println("  See src/main/resources/shaders/COMPILE.md for instructions.\n")

        val vertShader: Shader
        val fragShader: Shader
        val shaderProgram: ShaderProgram

        try {
            vertShader = loader.load("shaders/redshift.vert")
            println("  ✓ Vertex shader loaded: ${vertShader.path}")

            fragShader = loader.load("shaders/redshift.frag")
            println("  ✓ Fragment shader loaded: ${fragShader.path}")

            shaderProgram = ShaderProgram.create(vertShader, fragShader)
            println("  ✓ Shader program created\n")

        } catch (e: RuntimeException) {
            println("  ✗ Failed to load shaders: ${e.message}\n")
            println("Shaders must be compiled before running this test.")
            println("See src/main/resources/shaders/COMPILE.md for instructions.\n")

            FullscreenQuad.destroy()
            window.close()
            return
        }

        // Create test texture format (64x64 RGBA8)
        val testFormat = TestTextureFormat(width = 64, height = 64)

        // Create pipeline nodes
        println("Creating pipeline nodes...")
        val inputNode = TextureInputNode(testFormat)
        val shaderNode = ShaderNode(
            shaderProgram = shaderProgram,
            inputFormat = testFormat,
            outputFormat = testFormat,
            viewId = 0
        )
        val outputNode = TextureOutputNode(testFormat)
        println("  ✓ Nodes created\n")

        // Create edges
        println("Connecting pipeline...")
        // Note: PipelineEdge requires Output/Input types, but TransformationNode uses Any
        // We create the edges and manually assign them to bypass the type system
        val edge1 = DefaultPipelineEdge<TextureData, ITextureFormat>(
            source = inputNode,  // InputNode implements Output<ITextureFormat>
            target = outputNode,  // Placeholder - we'll override this
            format = testFormat
        )
        val edge2 = DefaultPipelineEdge<TextureData, ITextureFormat>(
            source = inputNode,  // Placeholder - we'll override this
            target = outputNode,  // OutputNode implements Input<ITextureFormat>
            format = testFormat
        )

        // Set up node connections
        inputNode.outputs = listOf(edge1)
        shaderNode.inputs = listOf(edge1)
        shaderNode.outputs = listOf(edge2)
        outputNode.inputs = listOf(edge2)
        println("  ✓ Pipeline connected\n")

        // Create execution order
        val executionOrder = listOf(inputNode, shaderNode, outputNode)

        // Create PathPlan
        val pathPlan = Pipeline.PathPlan(
            name = "redshift_test",
            executionOrder = executionOrder,
            sources = listOf(inputNode),
            targets = listOf(outputNode)
        )

        // Create Pipeline
        println("Creating pipeline...")
        val pipeline = Pipeline(
            pathPlans = mapOf("redshift_test" to pathPlan),
            allNodes = executionOrder,
            context = window.context
        )
        println("  ✓ Pipeline created\n")

        // Create test input data (solid gray color)
        println("Preparing test data...")
        val bufferSize = testFormat.width * testFormat.height * 4  // RGBA = 4 bytes per pixel
        val testByteBuffer = ByteBuffer.allocateDirect(bufferSize)

        // Fill with solid gray (R=100, G=100, B=100, A=255)
        // After redshift: R=150, G=100, B=50, A=255
        println("  Input color: R=100, G=100, B=100 (gray)")
        println("  Expected output: R=150, G=100, B=50 (reddish)\n")

        for (i in 0 until testFormat.width * testFormat.height) {
            testByteBuffer.put(100.toByte())  // R
            testByteBuffer.put(100.toByte())  // G
            testByteBuffer.put(100.toByte())  // B
            testByteBuffer.put(255.toByte())  // A (full opacity)
        }
        testByteBuffer.flip()

        val cpuData: CPUData<TextureData, ITextureFormat> = CPUData(testFormat, testByteBuffer)
        println("Test data prepared (${bufferSize} bytes)\n")

        // Run pipeline
        println("Running pipeline...")
        val result = pipeline.run("redshift_test") {
            inputBindings[inputNode] = { inputNode.setInput(cpuData) }
        }
        println("  ✓ Pipeline executed\n")

        // Submit frames for GPU processing
        println("Submitting frames for GPU processing...")
        window.context.frame(false)  // Frame 1: Upload input, execute shader, queue readback
        Thread.sleep(50)

        window.context.frame(false)  // Frame 2: Process readback request
        Thread.sleep(50)

        window.context.frame(false)  // Frame 3: Ensure readback complete
        Thread.sleep(50)
        println("  ✓ Frames submitted\n")

        // Get output
        println("Retrieving output...")
        val outputDeferred = result.getOutput(outputNode)

        runBlocking {
            // Poll events while waiting for GPU result
            while (!outputDeferred.isCompleted) {
                window.pollEvents()
                Thread.sleep(16)  // ~60 FPS polling
            }

            val outputData = outputDeferred.await()
            println("  ✓ Output received (${outputData.byteBuffer.capacity()} bytes)\n")

            // Verify redshift effect
            println("Verifying redshift effect...")
            val outBuf = outputData.byteBuffer
            outBuf.rewind()

            val r = outBuf.get().toUByte().toInt()
            val g = outBuf.get().toUByte().toInt()
            val b = outBuf.get().toUByte().toInt()
            val a = outBuf.get().toUByte().toInt()

            println("  First pixel: R=$r, G=$g, B=$b, A=$a")

            // Check if redshift was applied
            val redBoosted = r > 100  // Should be ~150
            val blueReduced = b < 100  // Should be ~50
            val greenUnchanged = g >= 95 && g <= 105  // Should be ~100

            if (redBoosted && blueReduced && greenUnchanged) {
                println("  ✓ Redshift effect verified!")
                println("    - Red channel boosted: $r (expected ~150)")
                println("    - Blue channel reduced: $b (expected ~50)")
                println("    - Green channel unchanged: $g (expected ~100)")
            } else {
                println("  ✗ Redshift effect NOT detected")
                println("    - Red boosted: $redBoosted (got $r, expected >100)")
                println("    - Blue reduced: $blueReduced (got $b, expected <100)")
                println("    - Green unchanged: $greenUnchanged (got $g, expected ~100)")
            }

            // Assert the redshift effect
            assertTrue(redBoosted, "Red channel should be boosted above 100, got $r")
            assertTrue(blueReduced, "Blue channel should be reduced below 100, got $b")
            assertTrue(greenUnchanged, "Green channel should be unchanged (~100), got $g")
        }

        println("\n=== Test completed! ===\n")

        // Cleanup
        println("Cleaning up resources...")
        shaderNode.destroy()
        shaderProgram.destroy()
        vertShader.destroy()
        fragShader.destroy()
        pipeline.close()
        FullscreenQuad.destroy()
        window.close()
        println("  ✓ Cleanup complete\n")

        println("All done!")
    }
}
