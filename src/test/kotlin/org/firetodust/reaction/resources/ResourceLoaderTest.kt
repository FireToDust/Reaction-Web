package org.firetodust.reaction.resources

import kotlin.test.Test
import kotlin.test.assertNotNull
import kotlin.test.assertFailsWith
import org.firetodust.reaction.window.Window
import org.firetodust.reaction.window.WindowConfig
import org.firetodust.reaction.window.RenderMode

/**
 * Tests for ResourceLoader system.
 *
 * This test demonstrates:
 * 1. Type-safe resource loading via reified generics
 * 2. Platform detection
 * 3. Extensibility via with() method
 *
 * NOTE: Shader loading requires pre-compiled shader binaries.
 * To test shader loading:
 * 1. Compile shaders using bgfx shaderc tool
 * 2. Place binaries in src/main/resources/shaders/
 * 3. Naming: <name>.<type>.<platform>.bin
 *    Example: basic.vert.opengl.bin
 */
class ResourceLoaderTest {

    @Test
    fun testResourceLoaderSystem() {
        println("=== ResourceLoader Test ===\n")

        // Create window to initialize BGFX (required for platform detection)
        println("Creating window with OpenGL renderer...")
        val window = Window(WindowConfig(
            width = 800,
            height = 600,
            title = "ResourceLoader Test",
            renderMode = RenderMode.OpenGL
        ))
        println("Window created successfully\n")

        // Test platform detection
        println("Testing platform detection...")
        val platform = Platform.detect()
        println("Detected platform: ${platform.name} (extension: ${platform.fileExtension})")
        println("Expected shader path mapping:")
        println("  Input: shaders/basic.vert")
        println("  Output: shaders/basic.vert.${platform.fileExtension}.bin\n")

        assertNotNull(platform)
        assertNotNull(platform.fileExtension)

        // Create resource loader
        println("Creating ResourceLoader...")
        val loader = ResourceLoader.default()
        println("ResourceLoader created with default loaders (ShaderLoader)\n")

        assertNotNull(loader)

        // Demonstrate extensibility
        println("Testing extensibility via with()...")
        val extendedLoader = loader.with(object : ResourceLoader {
            override fun <T : Any> load(path: String, type: kotlin.reflect.KClass<T>): T {
                println("  Custom loader called for: $path (type: ${type.simpleName})")
                throw UnsupportedOperationException("Custom loader doesn't support ${type.simpleName}")
            }
        })
        println("Extended loader created\n")

        assertNotNull(extendedLoader)

        // Test type-safe API (without actually loading - would require shader binaries)
        println("Type-safe API demonstration:")
        println("  Usage: val shader: Shader = loader.load(\"shaders/basic.vert\")")
        println("  - No type parameter needed (reified)")
        println("  - No casting needed")
        println("  - Compile-time type safety\n")

        // Test error handling
        println("Testing error handling (unsupported type)...")
        data class UnsupportedType(val value: String)
        assertFailsWith<UnsupportedOperationException> {
            loader.load<UnsupportedType>("test")
        }
        println("  ✓ Correctly threw UnsupportedOperationException\n")

        // Cleanup
        println("Cleaning up...")
        window.close()
        println("Window closed\n")

        println("=== Test Complete ===")
        println("\nNext steps to test shader loading:")
        println("1. Install BGFX shaderc tool")
        println("2. Compile test shaders:")
        println("   shaderc -f basic.vert -o basic.vert.opengl.bin --platform linux --type vertex")
        println("   shaderc -f basic.frag -o basic.frag.opengl.bin --platform linux --type fragment")
        println("3. Place binaries in src/main/resources/shaders/")
        println("4. Test loading:")
        println("   val vertShader: Shader = loader.load(\"shaders/basic.vert\")")
        println("   val fragShader: Shader = loader.load(\"shaders/basic.frag\")")
    }
}
