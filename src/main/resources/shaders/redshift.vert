$input a_position, a_texcoord0
$output v_texcoord0

#include <bgfx_shader.sh>

void main()
{
    // Pass through position (already in NDC space from fullscreen quad)
    gl_Position = vec4(a_position.xy, 0.0, 1.0);

    // Pass through texture coordinates to fragment shader
    v_texcoord0 = a_texcoord0;
}
