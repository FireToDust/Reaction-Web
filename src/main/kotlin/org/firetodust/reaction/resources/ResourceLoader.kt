package org.firetodust.reaction.resources

import kotlin.reflect.KClass

/**
 * Resource loader for loading assets from disk.
 *
 * Follows the chainable factory pattern (see docs/patterns/chainable-factory.md).
 * Uses reified generics for type-safe API without casts.
 *
 * Example usage:
 * ```kotlin
 * val loader = ResourceLoader.default()
 *     .with(MyCustomLoader())
 *
 * val shader: Shader = loader.load("shaders/basic.vert")
 * val texture: Texture = loader.load("textures/player.png")
 * ```
 *
 * Extensibility:
 * Users can add custom loaders via `with()` method.
 * Custom loaders are tried before default loaders.
 */
interface ResourceLoader {
    /**
     * Load a resource from disk.
     *
     * @param path Path to resource (relative to resources directory)
     * @param type Type token for the resource
     * @return Loaded resource
     * @throws UnsupportedOperationException if no loader supports this type
     * @throws RuntimeException if loading fails (file not found, invalid format, etc.)
     */
    fun <T : Any> load(path: String, type: KClass<T>): T

    /**
     * Create a new loader with an additional custom loader prepended.
     *
     * Custom loader is tried before existing loaders.
     *
     * @param loader Custom resource loader
     * @return New composite loader with custom loader added
     */
    fun with(loader: ResourceLoader): ResourceLoader {
        return CompositeResourceLoader(listOf(loader, this))
    }

    companion object {
        /**
         * Create default resource loader with standard loaders.
         *
         * Includes:
         * - ShaderLoader for BGFX shaders
         *
         * @return Default resource loader
         */
        fun default(): ResourceLoader {
            return CompositeResourceLoader(
                listOf(
                    ShaderLoader()
                )
            )
        }
    }
}

/**
 * Type-safe resource loading via reified generics.
 *
 * Avoids need for explicit type parameter:
 * ```kotlin
 * val shader: Shader = loader.load("shaders/basic.vert")  // No cast needed!
 * ```
 *
 * @param path Path to resource
 * @return Loaded resource of type T
 */
inline fun <reified T : Any> ResourceLoader.load(path: String): T {
    return load(path, T::class)
}

/**
 * Composite resource loader that tries multiple loaders in order.
 *
 * Implements chain of responsibility pattern.
 * Each loader throws UnsupportedOperationException if it can't handle the type.
 */
private class CompositeResourceLoader(
    private val loaders: List<ResourceLoader>
) : ResourceLoader {

    override fun <T : Any> load(path: String, type: KClass<T>): T {
        loaders.forEach { loader ->
            try {
                return loader.load(path, type)
            } catch (e: UnsupportedOperationException) {
                // Try next loader
            }
        }
        throw UnsupportedOperationException(
            "No resource loader supports type: ${type.simpleName}. " +
            "Available types: Shader. " +
            "Add a custom loader via ResourceLoader.default().with(yourLoader)"
        )
    }

    override fun with(loader: ResourceLoader): ResourceLoader {
        return CompositeResourceLoader(listOf(loader) + loaders)
    }
}
