@group(0) @binding(0) var map: texture_storage_2d<r32uint, read>;
@group(0) @binding(1) var<uniform> cameraPos: vec4f;  // Camera position (world space). Zoom XY
@group(0) @binding(2) var<uniform> time: f32;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,  // Output UV to fragment shader
};


fn hash(p: vec2f, seed: vec2f) -> f32 {
    return fract(sin(dot(p, seed)) * 43758.5453);
}

fn random_gradient(p: vec2f) -> vec2f {
    let angle = hash(p, vec2f(127.1, 311.7)) * 6.2831853;
    return vec2f(cos(angle), sin(angle));
}

fn perlin_noise(uv: vec2f) -> f32 {
    let i = floor(uv);
    let f = fract(uv);

    let g00 = random_gradient(i);
    let g10 = random_gradient(i + vec2f(1.0, 0.0));
    let g01 = random_gradient(i + vec2f(0.0, 1.0));
    let g11 = random_gradient(i + vec2f(1.0, 1.0));

    let d00 = f - vec2f(0.0, 0.0);
    let d10 = f - vec2f(1.0, 0.0);
    let d01 = f - vec2f(0.0, 1.0);
    let d11 = f - vec2f(1.0, 1.0);

    let v00 = dot(g00, d00);
    let v10 = dot(g10, d10);
    let v01 = dot(g01, d01);
    let v11 = dot(g11, d11);

    let u = f * f * (vec2f(3.0) - 2.0 * f); // Smoothstep interpolation

    let noise = mix(mix(v00, v10, u.x), mix(v01, v11, u.x), u.y);
    return noise * 0.5 + 0.5; // Normalize to [0,1]
}

fn fbm(p: vec2<f32>) -> f32 {
    var value: f32 = 0.0;
    var amplitude: f32 = 0.5;
    var frequency: f32 = 2.0;
    
    for (var i = 0; i < 4; i++) {
        value += amplitude * perlin_noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

@vertex
fn vs_main(@builtin(vertex_index) vertIndex: u32) -> VertexOutput {
    var pos = array<vec2f, 4>(
        vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(1.0, 1.0)
    );
    
    var output: VertexOutput;
    output.position = vec4f(pos[vertIndex], 0.0, 1.0);
    
    // Pass the UV coordinate to the fragment shader (here just mapping from [-1, 1] to [0, 1])
    output.uv = (pos[vertIndex] + vec2f(1.0, 1.0)) * 0.5;  // Convert from NDC to UV space

    return output;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    let tex_dims = vec2f(textureDimensions(map));

    // Transform UVs by world position and zoom
    let worldUV = (in.uv - 0.5) / cameraPos.zw + cameraPos.xy;  // Center view at cameraPos

    let distortion = vec2(perlin_noise(worldUV*5.0)/3.0+perlin_noise(worldUV)/2, perlin_noise(worldUV*5.0)/3.0+perlin_noise(worldUV)/2)/2-0.25;

    let distortedUV = worldUV+distortion;

    // Convert worldUV to texture coordinates
    let check_pos_x = i32((distortedUV.x % tex_dims.x + tex_dims.x) % tex_dims.x);
    let check_pos_y = i32((distortedUV.y % tex_dims.y + tex_dims.y) % tex_dims.y);
    let texCoords = vec2<i32>(check_pos_x, check_pos_y);
    
    let tileUV = (distortedUV%1.0 + 1)%1;

   

    // Sample the texture
    let texel = textureLoad(map, texCoords).r;

    var color = vec3f(0.5);
    switch (texel){
      case 0{
        let pos = in.uv * 100.0; // Scale world position
      
        let height = fbm(pos+vec2(time, -time)/5.0); // Mountain height map
        
        // Apply a stepped contour effect for a cartoony look
        let contour = smoothstep(0.00, 1, fract(height*5.0));
        
        // Color palette for mountains
        let baseColor = vec3(0.8, 0.0, 0.8); // Base brown
        let highlight = vec3(0.0, 0.0, 0.0)/(height+0.3); // Lighter brown

        color = mix(baseColor, highlight, contour);
      }
      case 1{
        // Wave Movement - Multiple Directions
        let wave1 = sin(worldUV.x * 3.2 + time * 1.03) * 0.5;
        let wave2 = sin(worldUV.y * 14.0 - time * 1.3) * 0.25;
        let wave3 = sin(worldUV.y * 8.3 + time * 1.5) * 0.25;
        let wave4 = sin((worldUV.x + worldUV.y) * 13.7 - time * 0.8) * 0.15;
        let wave5 = sin((2.43 * worldUV.x + 3.0 * worldUV.y) * 15.5 - time * 1.2) * 0.12; 
        let wave6 = sin((worldUV.x - 1.3 * worldUV.y) * 16.7 - time * 0.7) * 0.1;
        
        let height = wave1 + wave2 + wave3 + wave4 + wave5 + wave6;

        // Base Water Colors
        let deepColor = vec3(0.0, 0.6, 1.0);  // #0099CC (Bright Blue)
        let lightColor = vec3(0.2, 0.8, 1.0); // #33CCFF (Cyan)

        // Highlights (Brighter areas on peaks)
        let highlight = smoothstep(0, 1, height-0.3); // Boost on peaks
        let highlightColor = vec3(1.0, 1.0, 1.0); // White foam

        // Final Color Mix
        let waterColor = mix(deepColor, lightColor, height/2.0 + 0.5);
        color = mix(waterColor, highlightColor, highlight/2);
      }
      case 2{
        // Wave Movement - Multiple Directions
        let wave1 = sin(worldUV.x * 3.2 + time * 1.03) * 0.5;
        let wave2 = sin(worldUV.y * 14.0 - time * 1.3) * 0.25;
        let wave3 = sin(worldUV.y * 8.3 + time * 1.5) * 0.25;
        let wave4 = sin((worldUV.x + worldUV.y) * 13.7 - time * 0.8) * 0.15;
        
        let height = wave1 + wave2 + wave3 + wave4;

        // Base Water Colors
        let deepColor = vec3(1, 0.2, 0);  // #0099CC (Bright Blue)
        let lightColor = vec3(1, 0.8, 0.5); // #33CCFF (Cyan)

        // Highlights (Brighter areas on peaks)
        let highlight = smoothstep(0, 1, height-0.3); // Boost on peaks
        let highlightColor = vec3(1.0, 0.5, 1.0); // White foam

        // Final Color Mix
        let waterColor = mix(deepColor, lightColor, height/2.0 + 0.5);
        color = mix(waterColor, highlightColor, highlight/2);
      }
      case 3{
        // Wave Movement - Multiple Directions
        let wave1 = sin(worldUV.x * 3.2 + time * 1.03) * 0.5;
        let wave2 = sin(worldUV.y * 14.0 - time * 1.3) * 0.25;
        let wave3 = sin(worldUV.y * 8.3 + time * 1.5) * 0.25;
        let wave4 = sin((worldUV.x + worldUV.y) * 13.7 - time * 0.8) * 0.15;
        let wave5 = sin((2.43 * worldUV.x + 3.0 * worldUV.y) * 15.5 - time * 1.2) * 0.12; 
        let wave6 = sin((worldUV.x - 1.3 * worldUV.y) * 16.7 - time * 0.7) * 0.1;
        
        let height = wave1 + wave2 + wave3 + wave4 + wave5 + wave6;

        // Base Water Colors
        let deepColor = vec3(0.8, 0.5, 1.0);  // #0099CC (Bright Blue)
        let lightColor = vec3(0.5, 1.0, 0.7); // #33CCFF (Cyan)

        // Highlights (Brighter areas on peaks)
        let highlight = smoothstep(0, 1, height-0.3); // Boost on peaks
        let highlightColor = vec3(1.0, 1.0, 1.0); // White foam

        // Final Color Mix
        let waterColor = mix(deepColor, lightColor, height/2.0 + 0.5);
        color = mix(waterColor, highlightColor, highlight/2);
      }
      case 4{
        // Wave Movement - Multiple Directions

        let bladepos = vec2((worldUV.x*10 + sin(time + worldUV.y * 2))%1, ((worldUV.y*2) % 1)*2 - 1);
        let bladepos2 = vec2((worldUV.x*10 + sin(time + worldUV.y * 2))%1, (((worldUV.y + 0.5)*2) % 1)*2 - 1);
        
        
        var height = 0.0;
        var height3 = 0.0;
        let stuff1 = 1-(abs(bladepos.x-0.5 )*2);
        if (stuff1 > bladepos.y){
          height = bladepos.y;
        }
        
        let height2 = (1-abs(stuff1 - bladepos.y))*bladepos.y;
        

        let stuff2 = 1-(abs(bladepos2.x-0.5)*2);
        
        if (stuff2 > bladepos2.y){
          height3 = bladepos2.y;
        }
        
        let height4 = (1-abs(stuff2 - bladepos2.y))*bladepos2.y;
        
      
        height = max(max(height, height2), max(height3, height4));

        // Base Water Colors
        let deepColor = vec3(0.1, 0.3, 0.2);  // #0099CC (Bright Blue)
        let lightColor = vec3(0.1, 1.0, 0.1); // #33CCFF (Cyan)

        // Highlights (Brighter areas on peaks)
        let highlight = smoothstep(0, 1, height); // Boost on peaks
        let highlightColor = vec3(1.0, 1.0, 1.0); // White foam

        // Final Color Mix
        let waterColor = mix(deepColor, lightColor, height);
        color = mix(waterColor, highlightColor, highlight/2);
        //color = vec3(height);
      }
      case default{
        color = vec3f(f32(texel)/32.0);
      }
    }
    

    let square_dist = max(abs(tileUV.x-0.5), abs(tileUV.y-0.5))*2 -0.2;

    return vec4f(color * (1-pow(square_dist, 6.0)), 1.0);
}
