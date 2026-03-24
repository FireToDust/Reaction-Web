package org.firetodust.reaction.gpu.pipeline

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertNotNull

/**
 * Unit tests for PipelineEdge typing system.
 * Tests verify that edge typing properly preserves GPU and Format types without unsafe casts.
 *
 * This test demonstrates the improved type safety after degeneralizing edges.
 */
class PipelineEdgeTypingTest {

    @Test
    fun testEdgeResourceTyping() {
        // Create test format
        val format = TestTextureFormat(width = 256, height = 256)

        // Create minimal output/input for testing
        val output = TextureInputNode(format)
        val input = TextureOutputNode(format)

        val edge = DefaultPipelineEdge(output, input, format)

        // Test resource assignment - should be properly typed as TextureData?
        assertNull(edge.allocatedResource)

        val textureData = TextureData(handle = 42.toShort())
        edge.allocatedResource = textureData

        // Verify type is preserved - no cast needed!
        assertNotNull(edge.allocatedResource)
        assertEquals(42.toShort(), edge.allocatedResource?.handle)

        edge.allocatedResource = null
        assertNull(edge.allocatedResource)
    }

    @Test
    fun testFormatPreservation() {
        // Create test format
        val format = TestTextureFormat(width = 512, height = 512)

        // Create minimal output/input for testing
        val output = TextureInputNode(format)
        val input = TextureOutputNode(format)

        val edge = DefaultPipelineEdge(output, input, format)

        // Verify format properties are accessible without casts
        assertEquals(512, edge.format.width)
        assertEquals(512, edge.format.height)
    }

    @Test
    fun testNoUnsafeCastsRequired() {
        // This test demonstrates that we can work with edge resources
        // without any unsafe casts or type gymnastics
        val format = TestTextureFormat(width = 128, height = 128)

        // Create minimal output/input for testing
        val output = TextureInputNode(format)
        val input = TextureOutputNode(format)

        val edge = DefaultPipelineEdge(output, input, format)

        // Allocate resource
        val resource = TextureData(handle = 1.toShort())
        edge.allocatedResource = resource

        // Access resource - properly typed, no casts!
        val retrievedResource: TextureData? = edge.allocatedResource
        assertNotNull(retrievedResource)
        assertEquals(1.toShort(), retrievedResource.handle)
    }

    @Test
    fun testDifferentEdgesPreserveTypes() {
        // Test that edges maintain separate type information
        val format1 = TestTextureFormat(width = 64, height = 64)
        val format2 = TestTextureFormat(width = 128, height = 128)

        val edge1 = DefaultPipelineEdge(
            TextureInputNode(format1),
            TextureOutputNode(format1),
            format1
        )

        val edge2 = DefaultPipelineEdge(
            TextureInputNode(format2),
            TextureOutputNode(format2),
            format2
        )

        // Assign different resources
        edge1.allocatedResource = TextureData(handle = 10.toShort())
        edge2.allocatedResource = TextureData(handle = 20.toShort())

        // Verify each edge maintains its own resource
        assertEquals(10.toShort(), edge1.allocatedResource?.handle)
        assertEquals(20.toShort(), edge2.allocatedResource?.handle)
    }
}
