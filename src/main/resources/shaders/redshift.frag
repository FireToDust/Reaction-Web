$input v_texcoord0

#include <bgfx_shader.sh>

SAMPLER2D(s_texColor, 0);

void main()
{
    // Sample input texture
    vec4 color = texture2D(s_texColor, v_texcoord0);

    // Apply redshift effect
    // Boost red channel by 50%
    color.r = min(color.r * 1.5, 1.0);

    // Reduce blue channel by 50%
    color.b = color.b * 0.5;

    // Keep green and alpha unchanged
    // This creates a warm, red-shifted image

    gl_FragColor = color;
}
