// The lens is rendered from a bounded page texture, not a CSS backdrop/filter.
const vertex = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
  gl_Position = vec4(position, 0.0, 1.0);
}`

const fragment = `
precision highp float;
uniform sampler2D scene;
uniform vec2 size;
uniform vec2 sceneSize;
uniform vec2 light;
uniform float radius;
uniform float padding;
uniform float strength;
varying vec2 uv;

float roundedBox(vec2 p) {
  vec2 q = abs(p) - size * 0.5 + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

vec3 soften(vec2 p, float r) {
  vec2 d = vec2(r) / sceneSize;
  vec3 c = texture2D(scene, p).rgb * 0.20;
  c += texture2D(scene, p + vec2(d.x, 0.0)).rgb * 0.12;
  c += texture2D(scene, p - vec2(d.x, 0.0)).rgb * 0.12;
  c += texture2D(scene, p + vec2(0.0, d.y)).rgb * 0.12;
  c += texture2D(scene, p - vec2(0.0, d.y)).rgb * 0.12;
  c += texture2D(scene, p + d * 0.7071).rgb * 0.08;
  c += texture2D(scene, p - d * 0.7071).rgb * 0.08;
  c += texture2D(scene, p + vec2(d.x, -d.y) * 0.7071).rgb * 0.08;
  c += texture2D(scene, p + vec2(-d.x, d.y) * 0.7071).rgb * 0.08;
  return c;
}

void main() {
  vec2 p = (uv - 0.5) * size;
  float sdf = roundedBox(p);
  float coverage = 1.0 - smoothstep(-0.8, 0.8, sdf);
  if (coverage < 0.001) discard;
  float depth = max(-sdf, 0.0);
  vec2 edgeNormal = normalize(vec2(
    roundedBox(p + vec2(0.5, 0.0)) - roundedBox(p - vec2(0.5, 0.0)),
    roundedBox(p + vec2(0.0, 0.5)) - roundedBox(p - vec2(0.0, 0.5))
  ) + vec2(0.00001));

  // An analytic bevel/thickness profile supplies the normals for Snell refraction.
  float bevel = exp(-depth / 7.0);
  vec3 normal = normalize(vec3(edgeNormal * bevel * 1.65, 1.0));
  vec3 ray = refract(vec3(0.0, 0.0, -1.0), normal, 1.0 / 1.47);
  vec2 refraction = ray.xy / max(abs(ray.z), 0.2) * (22.0 * strength);
  vec2 base = (p * (1.0 - 0.012 * strength) + size * 0.5 + padding) / sceneSize;
  vec2 samplePoint = base + refraction / sceneSize;
  vec3 color = soften(samplePoint, 3.5 + 2.0 * (1.0 - bevel));

  // Different wavelengths bend by slightly different amounts near the rim.
  vec2 dispersion = edgeNormal * bevel * strength * 1.15 / sceneSize;
  color.r = mix(color.r, soften(samplePoint + dispersion, 3.5).r, bevel * 0.55);
  color.b = mix(color.b, soften(samplePoint - dispersion, 3.5).b, bevel * 0.55);

  // A neutral optical tint preserves white navigation contrast over bright artwork.
  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color *= mix(0.88, 0.34, smoothstep(0.12, 0.85, luminance));
  color += vec3(0.022, 0.027, 0.032);

  vec2 illumination = normalize(vec2(-0.65, -0.85) + light * 0.28);
  float facing = dot(edgeNormal, illumination);
  float fresnel = 0.036 + 0.964 * pow(1.0 - normal.z, 5.0);
  float rim = exp(-pow((depth - 1.1) / 0.9, 2.0));
  float caustic = exp(-pow((depth - 5.0) / 2.2, 2.0));
  color += vec3(0.77, 0.86, 0.95) * rim * (0.055 + 0.32 * max(facing, 0.0));
  color += vec3(0.55, 0.69, 0.80) * caustic * max(-facing, 0.0) * 0.075;
  color += vec3(0.32, 0.38, 0.43) * fresnel * 0.30;
  gl_FragColor = vec4(color * coverage, coverage);
}`

export type LensFrame = {
  width: number
  height: number
  density: number
  padding: number
  radius: number
  strength: number
  light: [number, number]
}

export function createOptics(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  })
  if (!gl) return null
  // Band-limit the input before optical sampling. Sparse shader taps alone alias
  // one-pixel text/lines instead of producing the soft transmission of glass.
  const transmission = document.createElement('canvas')
  const lowpass = transmission.getContext('2d')
  if (!lowpass) return null

  const shaders: WebGLShader[] = []
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) throw new Error('Glass shader allocation failed')
    shaders.push(shader)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error('Glass shader compilation failed')
    return shader
  }
  const program = gl.createProgram()
  const buffer = gl.createBuffer()
  const texture = gl.createTexture()
  if (!program || !buffer || !texture) {
    gl.deleteProgram(program)
    gl.deleteBuffer(buffer)
    gl.deleteTexture(texture)
    return null
  }
  const dispose = () => {
    gl.deleteTexture(texture)
    gl.deleteBuffer(buffer)
    gl.deleteProgram(program)
    shaders.forEach((shader) => gl.deleteShader(shader))
  }
  try {
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error('Glass shader link failed')
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(gl.getUniformLocation(program, 'scene'), 0)
    const uniforms = Object.fromEntries(
      ['size', 'sceneSize', 'light', 'radius', 'padding', 'strength'].map((name) => [
        name,
        gl.getUniformLocation(program, name),
      ]),
    )
    return {
      draw(source: HTMLCanvasElement, frame: LensFrame) {
        if (gl.isContextLost()) return false
        const w = Math.round(frame.width * frame.density)
        const h = Math.round(frame.height * frame.density)
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w
          canvas.height = h
        }
        gl.viewport(0, 0, w, h)
        gl.useProgram(program)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        const tw = Math.max(1, Math.round(source.width / 2))
        const th = Math.max(1, Math.round(source.height / 2))
        if (transmission.width !== tw || transmission.height !== th) {
          transmission.width = tw
          transmission.height = th
        }
        lowpass.imageSmoothingEnabled = true
        lowpass.imageSmoothingQuality = 'high'
        lowpass.drawImage(source, 0, 0, tw, th)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, transmission)
        gl.uniform2f(uniforms.size, frame.width, frame.height)
        gl.uniform2f(
          uniforms.sceneSize,
          frame.width + 2 * frame.padding,
          frame.height + 2 * frame.padding,
        )
        gl.uniform2f(uniforms.light, ...frame.light)
        gl.uniform1f(uniforms.radius, frame.radius)
        gl.uniform1f(uniforms.padding, frame.padding)
        gl.uniform1f(uniforms.strength, frame.strength)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        return true
      },
      dispose,
    }
  } catch {
    dispose()
    return null
  }
}

export function drawSoftFallback(
  canvas: HTMLCanvasElement,
  source: HTMLCanvasElement,
  frame: LensFrame,
  small: HTMLCanvasElement,
) {
  const ctx = canvas.getContext('2d')
  const soft = small.getContext('2d')
  if (!ctx || !soft) return
  canvas.width = Math.round(frame.width * frame.density)
  canvas.height = Math.round(frame.height * frame.density)
  small.width = Math.max(1, Math.round(source.width / 10))
  small.height = Math.max(1, Math.round(source.height / 10))
  soft.drawImage(source, 0, 0, small.width, small.height)
  ctx.scale(frame.density, frame.density)
  ctx.beginPath()
  ctx.roundRect(0, 0, frame.width, frame.height, frame.radius)
  ctx.clip()
  const ratio = small.width / (frame.width + frame.padding * 2)
  ctx.drawImage(
    small,
    frame.padding * ratio,
    frame.padding * ratio,
    frame.width * ratio,
    frame.height * ratio,
    0,
    0,
    frame.width,
    frame.height,
  )
  ctx.fillStyle = 'rgba(8, 12, 16, 0.45)'
  ctx.fillRect(0, 0, frame.width, frame.height)
  const edge = ctx.createLinearGradient(0, 0, frame.width, frame.height)
  edge.addColorStop(0, 'rgba(235, 247, 255, 0.32)')
  edge.addColorStop(0.3, 'rgba(235, 247, 255, 0.03)')
  edge.addColorStop(0.7, 'rgba(235, 247, 255, 0.02)')
  edge.addColorStop(1, 'rgba(195, 220, 245, 0.18)')
  ctx.strokeStyle = edge
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(0.5, 0.5, frame.width - 1, frame.height - 1, frame.radius)
  ctx.stroke()
}
