plugins {
    kotlin("jvm") version "2.2.0"
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

val lwjglVersion = "3.3.6"

// Detect platform for LWJGL natives
val lwjglNatives = when (org.gradle.internal.os.OperatingSystem.current()) {
    org.gradle.internal.os.OperatingSystem.LINUX -> "natives-linux"
    org.gradle.internal.os.OperatingSystem.MAC_OS -> "natives-macos"
    org.gradle.internal.os.OperatingSystem.WINDOWS -> "natives-windows"
    else -> throw GradleException("Unsupported platform: ${org.gradle.internal.os.OperatingSystem.current()}")
}

dependencies {
    testImplementation(kotlin("test"))
    // core LWJGL libraries
    implementation("org.lwjgl:lwjgl:$lwjglVersion")
    implementation("org.lwjgl:lwjgl-bgfx:$lwjglVersion")
    implementation("org.lwjgl:lwjgl-glfw:$lwjglVersion")
    implementation("org.lwjgl:lwjgl-nanovg:$lwjglVersion")
    implementation("org.lwjgl:lwjgl-nuklear:$lwjglVersion")
    implementation("org.lwjgl:lwjgl-openal:$lwjglVersion")
    implementation("org.lwjgl:lwjgl-opengl:$lwjglVersion")
    implementation("org.lwjgl:lwjgl-stb:$lwjglVersion")
    implementation("org.lwjgl:lwjgl-vulkan:$lwjglVersion")
    implementation("org.lwjgl:lwjgl-yoga:$lwjglVersion")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.0")
    implementation(kotlin("reflect"))

    // natives (runtime only)
    runtimeOnly("org.lwjgl:lwjgl:$lwjglVersion:$lwjglNatives")
    runtimeOnly("org.lwjgl:lwjgl-bgfx:$lwjglVersion:$lwjglNatives")
    runtimeOnly("org.lwjgl:lwjgl-glfw:$lwjglVersion:$lwjglNatives")
    runtimeOnly("org.lwjgl:lwjgl-nanovg:$lwjglVersion:$lwjglNatives")
    runtimeOnly("org.lwjgl:lwjgl-nuklear:$lwjglVersion:$lwjglNatives")
    runtimeOnly("org.lwjgl:lwjgl-openal:$lwjglVersion:$lwjglNatives")
    runtimeOnly("org.lwjgl:lwjgl-opengl:$lwjglVersion:$lwjglNatives")
    runtimeOnly("org.lwjgl:lwjgl-stb:$lwjglVersion:$lwjglNatives")
    runtimeOnly("org.lwjgl:lwjgl-yoga:$lwjglVersion:$lwjglNatives")
}


repositories {
    mavenCentral()
}

tasks.test {
    useJUnitPlatform()
    // On macOS, use glfw_async to work with BGFX without -XstartOnFirstThread
    // glfw_async handles Cocoa threading internally, allowing BGFX to have a main loop
    systemProperty("org.lwjgl.glfw.library.name", "glfw_async")

    // Fork a new JVM for each test class (BGFX can only be initialized once per JVM)
    forkEvery = 1
    maxParallelForks = 1
}

kotlin {
    jvmToolchain(24)
}