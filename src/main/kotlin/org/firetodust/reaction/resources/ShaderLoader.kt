package org.firetodust.reaction.resources

import org.lwjgl.bgfx.BGFX.*
import java.io.File
import java.nio.ByteBuffer
import java.nio.file.Files
import java.nio.file.Paths
import kotlin.reflect.KClass

/**
 * BGFX invalid handle constant.
 */
private const val BGFX_INVALID_HANDLE: Short = -1

/**
 * Resource loader for BGFX pre-compiled shader binaries.
 *
 * BGFX requires platform-specific binary shaders compiled offline with shaderc tool.
 *
 * Path resolution:
 * - Input: `"shaders/basic.vert"`
 * - Platform detection: `Platform.detect()` → e.g., OpenGL
 * - Resolved: `"shaders/basic.vert.opengl.bin"`
 *
 * Shader type detection:
 * - `.vert` extension → VERTEX shader
 * - `.frag` extension → FRAGMENT shader
 *
 * Example:
 * ```kotlin
 * val loader = ResourceLoader.default()
 * val vertShader: Shader = loader.load("shaders/basic.vert")
 * val fragShader: Shader = loader.load("shaders/basic.frag")
 * ```
 */
class ShaderLoader : ResourceLoader {

    override fun <T : Any> load(path: String, type: KClass<T>): T {
        if (type != Shader::class) {
            throw UnsupportedOperationException("ShaderLoader only supports Shader type")
        }

        @Suppress("UNCHECKED_CAST")
        return loadShader(path) as T
    }

    private fun loadShader(path: String): Shader {
        // Determine shader type from file extension
        val shaderType = when {
            path.endsWith(".vert") -> ShaderType.VERTEX
            path.endsWith(".frag") -> ShaderType.FRAGMENT
            else -> throw IllegalArgumentException(
                "Unknown shader type for path: $path. " +
                "Expected .vert (vertex) or .frag (fragment) extension."
            )
        }

        // Detect current platform
        val platform = Platform.detect()

        // Build platform-specific path: "shaders/basic.vert" -> "shaders/basic.vert.opengl.bin"
        val platformPath = "$path.${platform.fileExtension}.bin"

        // Load shader binary from disk
        val shaderBinary = loadBinaryFile(platformPath)

        // Create BGFX shader from memory
        val memory = bgfx_make_ref(shaderBinary)
            ?: throw RuntimeException("Failed to create memory reference for shader: $platformPath")

        val handle = bgfx_create_shader(memory)

        if (handle == BGFX_INVALID_HANDLE) {
            throw RuntimeException(
                "Failed to create BGFX shader from binary: $platformPath\n" +
                "Original path: $path\n" +
                "Platform: ${platform.name} (${platform.fileExtension})\n" +
                "This may be due to:\n" +
                "  - Corrupted shader binary\n" +
                "  - Wrong platform binary (expected ${platform.fileExtension})\n" +
                "  - Incompatible shader version\n" +
                "  - GPU driver issues"
            )
        }

        return Shader(handle, shaderType, path)
    }

    /**
     * Load binary file from resources directory.
     *
     * Searches in:
     * 1. Project resources: `src/main/resources/<path>`
     * 2. Classpath resources (for JAR deployment)
     *
     * @param path Path relative to resources directory
     * @return ByteBuffer containing file contents
     * @throws RuntimeException if file not found or cannot be read
     */
    private fun loadBinaryFile(path: String): ByteBuffer {
        // Try loading from filesystem (development)
        val resourcePath = Paths.get("src/main/resources", path)
        if (Files.exists(resourcePath)) {
            return try {
                val bytes = Files.readAllBytes(resourcePath)
                ByteBuffer.allocateDirect(bytes.size).apply {
                    put(bytes)
                    flip()
                }
            } catch (e: Exception) {
                throw RuntimeException("Failed to read shader file: $resourcePath", e)
            }
        }

        // Try loading from classpath (JAR deployment)
        val classLoader = ShaderLoader::class.java.classLoader
        val inputStream = classLoader.getResourceAsStream(path)
            ?: throw RuntimeException(
                "Shader file not found: $path\n" +
                "Searched in:\n" +
                "  - File system: $resourcePath\n" +
                "  - Classpath: $path\n" +
                "Ensure shader binaries are compiled and placed in src/main/resources/"
            )

        return try {
            inputStream.use { stream ->
                val bytes = stream.readAllBytes()
                ByteBuffer.allocateDirect(bytes.size).apply {
                    put(bytes)
                    flip()
                }
            }
        } catch (e: Exception) {
            throw RuntimeException("Failed to read shader from classpath: $path", e)
        }
    }
}
