/*
 * Liquid Glass optics and spring timing adapted from zanwei/glass-icon-reveal.
 * MIT License
 * Copyright (c) 2026 Zanwei Guo
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const vertex = `#version 300 es
out vec2 position;
void main() {
  vec2 triangle = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  position = triangle * 2.0 - 1.0;
  gl_Position = vec4(position, 0, 1);
}`;

const fragment = `#version 300 es
precision highp float;
in vec2 position;
uniform sampler2D logo;
uniform float aspect;
uniform float progress;
out vec4 pixel;

// The texture and every layer use premultiplied alpha, including the clear face.
vec4 sampleLogo(vec2 p, float size) {
  vec2 uv = p / (2.0 * size) * vec2(1.0 / aspect, -1.0) + 0.5;
  return texture(logo, uv);
}

float spring(float time, float period) {
  float v = 6.283185 * max(time, 0.0) / period;
  return 1.0 - exp(-v) * (1.0 + v);
}

float gaussian(float x) {
  return exp(-x * x);
}

void main() {
  float t = progress * 3.5;
  float grow = spring(t + 0.01, 0.42);
  float release = spring(t - 2.4, 0.95);
  // Widen the glass face while keeping its fading rim inside the canvas.
  float radius = mix(0.10, 0.92, grow) + 0.02 * release;
  float exponent = mix(2.0, 4.8, spring(t - 0.27, 0.4));
  vec2 a = max(abs(position / radius), vec2(0.00001));
  float field = pow(pow(a.x, exponent) + pow(a.y, exponent), 1.0 / exponent);
  vec2 gradient = sign(position) * pow(a, vec2(exponent - 1.0)) * pow(max(field, 0.00001), 1.0 - exponent);
  float distance = (field - 1.0) * radius / max(length(gradient), 0.00001);
  vec2 normal = gradient / max(length(gradient), 0.00001);
  float aa = max(fwidth(distance), 0.001);
  float inside = 1.0 - smoothstep(-aa, aa, distance);
  float across = clamp(-distance / (0.14 * radius), 0.0, 1.0);

  // Bend light across a quarter-round rim. Each wavelength has its own index.
  float angle = asin(clamp(1.0 - across, 0.0, 0.995));
  vec3 bend = tan(vec3(angle) - asin(sin(angle) / vec3(1.60, 1.50, 1.40)));
  float zoom = mix(2.3, 1.0, smoothstep(0.0, 2.3, t));
  float size = 0.60 * zoom;
  vec2 direction = normal * 0.27 * (1.0 - release);
  vec4 red = sampleLogo(position - direction * bend.r, size);
  vec4 green = sampleLogo(position - direction * bend.g, size);
  vec4 blue = sampleLogo(position - direction * bend.b, size);
  vec4 glass = vec4(red.r, green.g, blue.b, max(red.a, max(green.a, blue.a)));

  float rim = gaussian((distance + 0.017 * radius) / (0.036 * radius));
  float bevel = gaussian((distance + 0.13 * radius) / (0.015 * radius));
  float sweep = mix(-1.6, 1.6, smoothstep(0.9, 2.3, t));
  float sheen = gaussian((dot(position / radius, vec2(0.8, 0.6)) - sweep) / 0.17);
  float light = dot(normal, vec2(0.5, 0.866));
  float highlight = clamp(0.09 + rim * (0.54 + 0.3 * light) + bevel * 0.27 + sheen * 0.29, 0.0, 1.0);
  glass = mix(glass, vec4(1.0), highlight) * inside;
  float shadow = 0.14 * exp(-max(distance, 0.0) / 0.035) * (1.0 - inside);
  glass += vec4(vec3(0.18, 0.15, 0.17) * shadow, shadow);
  vec4 still = sampleLogo(position, 0.60);
  // Match the static PNG exactly at the handoff to the moving wordmark.
  pixel = mix(glass, still, max(smoothstep(0.0, 1.0, release), smoothstep(0.9, 1.0, progress)));
}`;

export function createProductsGlass(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  const dispose = () => gl.getExtension("WEBGL_lose_context")?.loseContext();
  try {
    const program = gl.createProgram()!;
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("Glass shader unavailable");
    gl.useProgram(program);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    if (gl.getError() !== gl.NO_ERROR || gl.isContextLost())
      throw new Error("Glass texture unavailable");
    gl.uniform1f(
      gl.getUniformLocation(program, "aspect"),
      image.naturalWidth / image.naturalHeight,
    );
    const time = gl.getUniformLocation(program, "progress");
    return {
      draw(progress: number) {
        const size = Math.max(1, Math.round(canvas.clientWidth * Math.min(devicePixelRatio, 2)));
        if (canvas.width !== size || canvas.height !== size) canvas.width = canvas.height = size;
        gl.viewport(0, 0, size, size);
        gl.uniform1f(time, progress);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose,
    };
  } catch {
    dispose();
    return null;
  }
}
