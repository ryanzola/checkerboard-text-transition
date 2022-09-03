// Varyings
#include <three_msdf_varyings>

// Uniforms
#include <three_msdf_common_uniforms>
#include <three_msdf_strokes_uniforms>
uniform float uProgress1;
uniform float uProgress2;
uniform float uProgress3;
uniform float uProgress4;
uniform float uTime;

// Utils
#include <three_msdf_median>

float rand(float n){return fract(sin(n) * 43758.5453123);}
float rand(vec2 n) { 
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(float p){
  float fl = floor(p);
  float fc = fract(p);
  return mix(rand(fl), rand(fl + 1.0), fc);
}
  
float noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
    // Common
    #include <three_msdf_common>

    // Strokes
    #include <three_msdf_strokes>

    // Alpha Test
    // #include <three_msdf_alpha_test>

    // Outputs
    #include <three_msdf_strokes_output>

    // vec3 pink = vec3(0.834, 0.066, 0.780);
    vec3 pink = vec3(0.000, 0.25, 0.5);

    vec4 l1 = vec4(1.0, 1.0, 1.0, border);
    vec4 l2 = vec4(pink, border);
    vec4 l3 = vec4(pink, outset);
    vec4 l4 = vec4(vec3(1.0), outset);

    float w = 2.0;
    float x = floor(vLayoutUv.x * 10.0 * 4.4);
    float y = floor(vLayoutUv.y * 10.0);
    float pattern = noise(vec2(x, y));
    // float pattern = noise(vec2(x * uTime * 0.1, y * uTime * 0.01));
    // float pattern1 = noise(vec2(x + uTime *2., y));
    // float pattern2 = noise(vec2(x * uTime, y * uTime * 0.005));
    // float pattern3 = noise(vec2(x * uTime * uTime * 0.005, y * uTime));
    // float pattern4 = noise(vec2(x * uTime * 0.0025, y * uTime * 0.0025));

    // Mix
    // 1
    float p1 = uProgress1;
    p1 = map(p1, 0.0, 1.0, -w, 1.0);
    p1 = smoothstep(p1, p1 + w, vLayoutUv.x);
    float mix1 = 2.0 * p1 - pattern;
    mix1 = clamp(mix1, 0.0, 1.0);

    // 2
    float p2 = uProgress2;
    p2 = map(p2, 0.0, 1.0, -w, 1.0);
    p2 = smoothstep(p2, p2 + w, vLayoutUv.x);
    float mix2 = 2.0 * p2 - pattern;
    mix2 = clamp(mix2, 0.0, 1.0);

    // 3
    float p3 = uProgress3;
    p3 = map(p3, 0.0, 1.0, -w, 1.0);
    p3 = smoothstep(p3, p3 + w, vLayoutUv.x);
    float mix3 = 2.0 * p3 - pattern;
    mix3 = clamp(mix3, 0.0, 1.0);

    // 4
    float p4 = uProgress4;
    p4 = map(p4, 0.0, 1.0, -w, 1.0);
    p4 = smoothstep(p4, p4 + w, vLayoutUv.x);
    float mix4 = 2.0 * p4 - pattern;
    mix4 = clamp(mix4, 0.0, 1.0);

    // Layers
    vec4 layer1 = mix(vec4(0.0), l1, 1.0 - mix1);
    vec4 layer2 = mix(layer1, l2, 1.0 - mix2);
    vec4 layer3 = mix(layer2, l3, 1.0 - mix3);
    vec4 layer4 = mix(layer3, l4, 1.0 - mix4);

    vec4 layerFinal = layer4;

    gl_FragColor = layerFinal;
}