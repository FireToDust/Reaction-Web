# Chainable Factory Pattern

## Overview

A pattern used throughout the codebase for creating extensible, immutable factory registries. Allows users to add custom factories without modifying library code.

## Core Concept

```kotlin
interface Factory {
    fun create(input: Input): Output

    fun with(factory: Factory): Factory {
        return CompositeFactory(listOf(factory, this))
    }
}

private class CompositeFactory(
    private val factories: List<Factory>
) : Factory {
    override fun create(input: Input): Output {
        factories.forEach { factory ->
            try {
                return factory.create(input)
            } catch (e: UnsupportedOperationException) {
                // Try next factory
            }
        }
        throw UnsupportedOperationException("No factory supports input: $input")
    }

    override fun with(factory: Factory): Factory {
        return CompositeFactory(listOf(factory) + factories)
    }
}
```

## Key Characteristics

1. **Immutability**: Each `with()` call returns a new composite, preserving the original
2. **Chain of Responsibility**: Tries each factory in order until one succeeds
3. **UnsupportedOperationException**: Signal to try next factory (not an error)
4. **Extensibility**: Users add custom factories via `with()`
5. **Default Implementation**: Companion object provides sensible defaults

## Type Safety Options

### Option A: Type-Erased (BufferAllocator pattern)

**Use when**: Return type varies based on input type

```kotlin
interface BufferAllocator {
    fun allocate(format: IFormat<*>): Any  // Returns different GPU types
    fun with(allocator: BufferAllocator): BufferAllocator
}
```

**Trade-offs**:
- ✅ Flexible - can return any type
- ❌ Requires casts at call site
- ❌ No compile-time type safety

**Example**:
```kotlin
val buffer = allocator.allocate(textureFormat) as TextureData  // Cast required
```

### Option B: Generic-Preserving (NodeFactory pattern)

**Use when**: Can preserve type information through generics

```kotlin
interface NodeFactory {
    fun <GPU, F: IFormat<GPU>> createNode(format: F): InputNode<GPU, F>
    fun with(factory: NodeFactory): NodeFactory
}
```

**Trade-offs**:
- ✅ Fully type-safe
- ✅ No casts needed
- ✅ Compile-time verification
- ⚠️ More complex signature

**Example**:
```kotlin
val node: InputNode<TextureData, ITextureFormat> = factory.createNode(textureFormat)  // No cast!
```

### Option C: Reified (ResourceLoader pattern)

**Use when**: Need runtime type information with type-safe API

```kotlin
interface ResourceLoader {
    fun <T : Any> load(path: String, type: KClass<T>): T
    fun with(loader: ResourceLoader): ResourceLoader
}

// With reified helper:
inline fun <reified T : Any> ResourceLoader.load(path: String): T {
    return load(path, T::class)
}
```

**Trade-offs**:
- ✅ Type-safe API via reified
- ✅ Runtime type checking
- ⚠️ Requires inline functions
- ⚠️ Can't be used in all contexts

**Example**:
```kotlin
val shader: Shader = loader.load("shaders/basic.vert")  // Type-safe, no cast!
```

## Existing Implementations

### BufferAllocator
**Location**: `src/main/kotlin/org/firetodust/reaction/gpu/pipeline/BufferAllocator.kt`
**Type Strategy**: Type-erased (Option A)
**Purpose**: Allocate GPU buffers based on format type

### NodeFactory
**Location**: `src/main/kotlin/org/firetodust/reaction/gpu/pipeline/NodeFactory.kt`
**Type Strategy**: Generic-preserving (Option B)
**Purpose**: Create pipeline nodes from formats

### ResourceLoader
**Location**: TBD
**Type Strategy**: Reified (Option C)
**Purpose**: Load resources from disk (shaders, textures, etc.)

## Implementation Template

When creating a new chainable factory:

1. **Choose type strategy** based on use case (see options above)
2. **Define public interface** with `create()` and `with()` methods
3. **Create private composite** that implements chain of responsibility
4. **Override `with()` in composite** to prepend new factory
5. **Provide default factories** in companion object

## Anti-Pattern: Forced Abstraction

**Don't do this**:
```kotlin
interface ChainableFactory<Input, Output> {
    fun create(input: Input): Output
    fun with(factory: ChainableFactory<Input, Output>): ChainableFactory<Input, Output>
}
```

**Why**: Forces type erasure for cases that need generics or reified, loses compile-time safety, adds unnecessary casts.

**Instead**: Copy the pattern with appropriate type strategy for each use case.

## Pattern Evolution

If you find yourself implementing this pattern more than 3-4 times, consider:
1. Are all uses truly the same pattern, or are some different?
2. Can they all use the same type strategy?
3. If yes to both, then consider abstraction
4. If no, keep them separate and refer to this documentation