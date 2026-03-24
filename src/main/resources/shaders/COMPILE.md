# Shader Compilation Instructions

BGFX requires pre-compiled binary shaders. Source files must be compiled using the `shaderc` tool.

## Getting shaderc

### Option 1: Build from Source
```bash
git clone https://github.com/bkaradzic/bgfx.git
cd bgfx
make shaderc
# Binary will be in .build/osx-x64/bin/shaderc
```

### Option 2: Download BGFX SDK
Download precompiled tools from BGFX releases:
https://github.com/bkaradzic/bgfx/releases

Look for `bgfx-macos` or similar package containing `shaderc` binary.

## Compiling Shaders for macOS (Metal)

From this directory (`src/main/resources/shaders/`):

```bash
# Compile vertex shader
shaderc -f redshift.vert \
    -o redshift.vert.metal.bin \
    --type vertex \
    --platform osx \
    -p metal \
    --varyingdef varying.def.sc

# Compile fragment shader
shaderc -f redshift.frag \
    -o redshift.frag.metal.bin \
    --type fragment \
    --platform osx \
    -p metal \
    --varyingdef varying.def.sc
```

## varying.def.sc

Create this file in the shaders directory:

```
vec2 v_texcoord0 : TEXCOORD0;
vec2 a_position  : POSITION;
vec2 a_texcoord0 : TEXCOORD0;
```

## For Other Platforms

### OpenGL
```bash
shaderc -f redshift.vert -o redshift.vert.opengl.bin --type vertex --platform linux -p 120
shaderc -f redshift.frag -o redshift.frag.opengl.bin --type fragment --platform linux -p 120
```

### Vulkan
```bash
shaderc -f redshift.vert -o redshift.vert.vulkan.bin --type vertex --platform linux -p spirv
shaderc -f redshift.frag -o redshift.frag.vulkan.bin --type fragment --platform linux -p spirv
```

### DirectX 11 (Windows)
```bash
shaderc -f redshift.vert -o redshift.vert.dx11.bin --type vertex --platform windows -p s_5_0
shaderc -f redshift.frag -o redshift.frag.dx11.bin --type fragment --platform windows -p s_5_0
```

## Verifying Compilation

After compilation, you should have:
- `redshift.vert.metal.bin` (vertex shader binary)
- `redshift.frag.metal.bin` (fragment shader binary)

These will be loaded by the ResourceLoader at runtime.

## bgfx_shader.sh Location

The shaders include `<bgfx_shader.sh>`. This file is part of the BGFX distribution:
- Located in `bgfx/src/` directory
- Pass include path to shaderc: `--include /path/to/bgfx/src`

## Full Compilation Example

```bash
# Set BGFX_DIR to your bgfx checkout
BGFX_DIR=/path/to/bgfx

# Compile with include path
$BGFX_DIR/.build/osx-x64/bin/shaderc \
    -f redshift.vert \
    -o redshift.vert.metal.bin \
    --type vertex \
    --platform osx \
    -p metal \
    --varyingdef varying.def.sc \
    -i $BGFX_DIR/src
```
