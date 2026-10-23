/* Loom — original position-based typographic fabric by Rayab. MIT. */
;(() => {
  'use strict'
  const S = window.RayabStudio
  const { $, clamp } = S
  S.mount(({ gl, canvas, wake, on, reduced, status }) => {
    const NX = canvas.clientWidth < 600 ? 32 : 44,
      NY = 24,
      COUNT = (NX + 1) * (NY + 1)
    const W = 6.6,
      H = 3.8
    const pos = new Float32Array(COUNT * 3),
      old = new Float32Array(COUNT * 3),
      normals = new Float32Array(COUNT * 3)
    const home = new Float32Array(COUNT * 3),
      uvs = new Float32Array(COUNT * 2),
      pins = new Uint8Array(COUNT)
    const links = [],
      indices = []
    const index = (x, y) => y * (NX + 1) + x
    for (let y = 0; y <= NY; y++)
      for (let x = 0; x <= NX; x++) {
        const i = index(x, y)
        home[i * 3] = (x / NX - 0.5) * W
        home[i * 3 + 1] = 1.95 - (y / NY) * H
        home[i * 3 + 2] = 0
        uvs[i * 2] = x / NX
        uvs[i * 2 + 1] = 1 - y / NY
        if (x < NX) links.push([i, i + 1, W / NX, 1])
        if (y < NY) links.push([i, i + NX + 1, H / NY, 1])
        if (x < NX && y < NY) {
          links.push([i, i + NX + 2, Math.hypot(W / NX, H / NY), 0.55])
          links.push([i + 1, i + NX + 1, Math.hypot(W / NX, H / NY), 0.55])
          indices.push(i, i + NX + 1, i + 1, i + 1, i + NX + 1, i + NX + 2)
        }
        if (x < NX - 1) links.push([i, i + 2, (W / NX) * 2, 0.22])
        if (y < NY - 1) links.push([i, i + (NX + 1) * 2, (H / NY) * 2, 0.22])
      }
    const clothProgram = S.program(
      gl,
      `#version 300 es
      precision highp float;
      layout(location=0) in vec3 position; layout(location=1) in vec3 normal; layout(location=2) in vec2 texcoord;
      uniform mat4 projection; out vec2 uv; out vec3 n; out vec3 world;
      void main(){ uv=texcoord; n=normal; world=position; gl_Position=projection*vec4(position,1.); }`,
      `#version 300 es
      precision highp float; uniform sampler2D print; in vec2 uv; in vec3 n; in vec3 world; out vec4 result;
      void main(){
        vec3 normal=normalize(n)*(gl_FrontFacing?1.:-1.);
        vec3 light=normalize(vec3(-.4,.8,1.5));
        float diffuse=max(dot(normal,light),0.);
        float rim=pow(1.-abs(normal.z),3.);
        float spec=pow(max(dot(normal,normalize(vec3(-.3,.5,2.))),0.),45.);
        vec3 colour=texture(print,uv).rgb;
        float weave=sin(uv.x*2100.)*sin(uv.y*1100.);
        weave*=1.-smoothstep(1.,3.,max(fwidth(uv.x)*2100.,fwidth(uv.y)*1100.));
        colour*=.46+.54*diffuse;
        colour+=vec3(.13,.10,.07)*rim+spec*.13+weave*.022;
        result=vec4(colour,1.);
      }`,
    )
    const backgroundProgram = S.program(
      gl,
      S.fullscreenVertex,
      `#version 300 es
      precision highp float; in vec2 uv; out vec4 result; uniform float aspect;
      void main(){
        vec3 colour=mix(vec3(.85,.84,.79),vec3(.94,.92,.87),uv.y);
        float shadow=exp(-pow((uv.x-.52)*3.3,2.)-pow((uv.y-.23)*17.,2.));
        colour-=shadow*.16;
        vec2 grid=fract(uv*vec2(32.*aspect,32.));
        float point=step(length(grid-.5),.035);
        colour-=point*.16;
        float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.98,78.23)))*43758.54);
        colour+=(grain-.5)*.018;
        result=vec4(colour,1.);
      }`,
    )
    const projectionUniform = gl.getUniformLocation(clothProgram, 'projection'),
      printUniform = gl.getUniformLocation(clothProgram, 'print')
    const aspectUniform = gl.getUniformLocation(backgroundProgram, 'aspect')
    const vao = gl.createVertexArray(),
      bgVao = gl.createVertexArray(),
      buffers = []
    gl.bindVertexArray(vao)
    function attribute(location, data, size, dynamic) {
      const buffer = gl.createBuffer()
      buffers.push(buffer)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
      return buffer
    }
    const positionBuffer = attribute(0, pos, 3, true),
      normalBuffer = attribute(1, normals, 3, true)
    attribute(2, uvs, 2, false)
    const elementBuffer = gl.createBuffer()
    buffers.push(elementBuffer)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
    const projection = new Float32Array(16)
    let width = 1,
      height = 1,
      aspect = 1,
      distance = 9,
      form = 'banner',
      colour = 0,
      wind = 0.55,
      tension = 0.65,
      simulationTime = 0
    let selected = -1,
      target = [0, 0, 0],
      pointerId = null,
      texture,
      accumulator = 0,
      gust = 0,
      disposed = false
    const art = document.createElement('canvas')
    art.width = 2048
    art.height = 1180
    const ctx = art.getContext('2d')
    if (!ctx) throw new Error('Print canvas unavailable')
    function repaint() {
      const [base, ink] = [
        ['#d83d28', '#fff4db'],
        ['#1b4abf', '#eff3d9'],
        ['#d7ed63', '#202b1b'],
      ][colour]
      const w = art.width,
        h = art.height
      ctx.fillStyle = base
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = ink
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.23
      for (let x = 55; x < w; x += 64) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 50; y < h; y += 64) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.strokeRect(38, 38, w - 76, h - 76)
      const lines = ($('#words').value.trim() || 'MAKE / IT MOVE.')
        .split('/')
        .map((v) => v.trim())
        .filter(Boolean)
        .slice(0, 3)
      const lineHeight = Math.min(390, 750 / Math.max(1, lines.length)),
        size = lineHeight * 1.15
      ctx.fillStyle = ink
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let i = 0; i < lines.length; i++) {
        let font = size
        ctx.font = `900 ${font}px Arial,sans-serif`
        const measure = ctx.measureText(lines[i]).width
        if (measure > w - 210) {
          font *= (w - 210) / measure
          ctx.font = `900 ${font}px Arial,sans-serif`
        }
        ctx.fillText(lines[i], w * 0.5, h * 0.5 + (i - (lines.length - 1) / 2) * lineHeight)
      }
      ctx.textAlign = 'left'
      ctx.font = '20px monospace'
      ctx.fillText('RAYAB / TYPE UNDER TENSION', 84, 102)
      ctx.fillText('100% CODE. A LITTLE LESS CONTROL.', 84, h - 82)
      ctx.textAlign = 'right'
      ctx.fillText('EDITION 010', w - 84, 102)
      ctx.fillText('PULL AT THE THREAD ↗', w - 84, h - 82)
      if (texture) gl.deleteTexture(texture)
      texture = S.texture(gl, art)
      wake()
    }
    function anchor() {
      for (let i = 0; i < COUNT; i++)
        if (pins[i]) for (let k = 0; k < 3; k++) pos[i * 3 + k] = home[i * 3 + k]
      if (selected >= 0) for (let k = 0; k < 3; k++) pos[selected * 3 + k] = target[k]
    }
    function solve() {
      const iterations = Math.round(4 + tension * 5)
      for (let pass = 0; pass < iterations; pass++) {
        for (const [a, b, rest, weight] of links) {
          const ai = a * 3,
            bi = b * 3
          const dx = pos[bi] - pos[ai],
            dy = pos[bi + 1] - pos[ai + 1],
            dz = pos[bi + 2] - pos[ai + 2]
          const length = Math.hypot(dx, dy, dz) || 1
          const pa = pins[a] || a === selected,
            pb = pins[b] || b === selected
          if (pa && pb) continue
          const factor = ((length - rest) / length) * weight * (0.62 + tension * 0.38)
          const wa = pa ? 0 : pb ? 1 : 0.5,
            wb = pb ? 0 : pa ? 1 : 0.5
          pos[ai] += dx * factor * wa
          pos[ai + 1] += dy * factor * wa
          pos[ai + 2] += dz * factor * wa
          pos[bi] -= dx * factor * wb
          pos[bi + 1] -= dy * factor * wb
          pos[bi + 2] -= dz * factor * wb
        }
        anchor()
      }
    }
    function simulate(dt, forceWind = wind) {
      simulationTime += dt
      gust *= Math.exp(-dt * 1.8)
      const t = simulationTime
      for (let i = 0; i < COUNT; i++) {
        if (pins[i] || i === selected) continue
        const a = i * 3,
          x = pos[a],
          y = pos[a + 1]
        const windForce =
          forceWind *
            (Math.sin(t * 1.8 + x * 0.8) * 3.8 + Math.sin(t * 3.1 - y * 2.1) * 2.8 + 2.6) +
          gust * 5
        for (let k = 0; k < 3; k++) {
          const previous = pos[a + k]
          // A flag's wind travels away from its pole, with a smaller depth flutter.
          // The other anchor schemes receive wind through the hanging surface.
          const axial =
            form === 'flag'
              ? forceWind * (16 + Math.sin(t + y) * 2) + gust * 5
              : Math.sin(t + x) * forceWind * 0.5
          let acceleration =
            k === 1
              ? form === 'flag'
                ? -1.6
                : -5.6
              : k === 2
                ? windForce * (form === 'flag' ? 0.28 : 1)
                : axial
          if (k === 2) acceleration -= pos[a + 2] * 3.2
          pos[a + k] +=
            clamp((pos[a + k] - old[a + k]) * 0.985, -0.08, 0.08) + acceleration * dt * dt
          if (k === 2) pos[a + k] = clamp(pos[a + k], -1.8, 1.8)
          old[a + k] = previous
        }
      }
      anchor()
      solve()
    }
    function reset() {
      selected = -1
      pointerId = null
      canvas.dataset.grabbed = 'false'
      simulationTime = 0
      gust = 0
      accumulator = 0
      pos.set(home)
      old.set(home)
      pins.fill(0)
      if (form === 'banner') {
        pins[0] = 1
        pins[NX] = 1
      }
      if (form === 'flag') for (let y = 0; y <= NY; y++) pins[index(0, y)] = 1
      if (form === 'drape') for (let x = 0; x <= NX; x++) pins[index(x, 0)] = 1
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3 + 2] = Math.sin(uvs[i * 2] * 20) * Math.sin(uvs[i * 2 + 1] * Math.PI) * 0.13
        old[i * 3 + 2] = pos[i * 3 + 2]
      }
      for (let i = 0; i < 100; i++) simulate(1 / 90, form === 'flag' ? 0.5 : reduced() ? 0 : 0.28)
      wake()
    }
    function updateNormals() {
      for (let y = 0; y <= NY; y++)
        for (let x = 0; x <= NX; x++) {
          const i = index(x, y) * 3,
            l = index(Math.max(0, x - 1), y) * 3,
            r = index(Math.min(NX, x + 1), y) * 3
          const top = index(x, Math.max(0, y - 1)) * 3,
            bottom = index(x, Math.min(NY, y + 1)) * 3
          const ax = pos[r] - pos[l],
            ay = pos[r + 1] - pos[l + 1],
            az = pos[r + 2] - pos[l + 2]
          const bx = pos[top] - pos[bottom],
            by = pos[top + 1] - pos[bottom + 1],
            bz = pos[top + 2] - pos[bottom + 2]
          const nx = ay * bz - az * by,
            ny = az * bx - ax * bz,
            nz = ax * by - ay * bx,
            mag = Math.hypot(nx, ny, nz) || 1
          normals[i] = nx / mag
          normals[i + 1] = ny / mag
          normals[i + 2] = nz / mag
        }
    }
    const F = 1 / Math.tan(0.72 / 2)
    function screen(i) {
      const a = i * 3,
        d = distance - pos[a + 2]
      return [(pos[a] * F) / aspect / d, ((pos[a + 1] + 0.25) * F) / d]
    }
    function pointer(event) {
      const r = canvas.getBoundingClientRect()
      return [
        ((event.clientX - r.left) / r.width) * 2 - 1,
        1 - ((event.clientY - r.top) / r.height) * 2,
      ]
    }
    function moveTarget(point) {
      target[0] = clamp((point[0] * (distance - target[2]) * aspect) / F, -4.2, 4.2)
      target[1] = clamp((point[1] * (distance - target[2])) / F - 0.25, -3.2, 3.1)
      if (reduced() || canvas.dataset.playing === 'false') {
        anchor()
        solve()
        old.set(pos)
      }
      wake()
    }
    on(canvas, 'pointerdown', (event) => {
      if (pointerId !== null) return
      const point = pointer(event),
        r = canvas.getBoundingClientRect()
      let nearest = -1,
        best = 55
      for (let i = 0; i < COUNT; i++)
        if (!pins[i]) {
          const p = screen(i),
            d = Math.hypot((p[0] - point[0]) * r.width * 0.5, (p[1] - point[1]) * r.height * 0.5)
          if (d < best) {
            best = d
            nearest = i
          }
        }
      if (nearest < 0) return
      selected = nearest
      target = [pos[nearest * 3], pos[nearest * 3 + 1], clamp(pos[nearest * 3 + 2] + 0.5, -0.7, 2)]
      pointerId = event.pointerId
      canvas.setPointerCapture(pointerId)
      canvas.dataset.grabbed = 'true'
      canvas.focus({ preventScroll: true })
      moveTarget(point)
    })
    on(canvas, 'pointermove', (event) => {
      if (event.pointerId === pointerId) moveTarget(pointer(event))
    })
    const release = () => {
      if (selected >= 0) {
        old.set(pos)
        selected = -1
        pointerId = null
        canvas.dataset.grabbed = 'false'
        wake()
      }
    }
    on(canvas, 'pointerup', release)
    on(canvas, 'pointercancel', release)
    on(canvas, 'lostpointercapture', release)
    function sendGust() {
      gust = 1.6
      if (reduced() || canvas.dataset.playing === 'false') {
        for (let i = 0; i < COUNT; i++)
          if (!pins[i])
            pos[i * 3 + 2] +=
              Math.sin(uvs[i * 2] * Math.PI) * Math.sin(uvs[i * 2 + 1] * Math.PI) * 0.8
        solve()
        old.set(pos)
      }
      wake()
      status('A gust through the weave. The anchors hold; everything else can move.')
    }
    on(canvas, 'keydown', (event) => {
      if (
        ![
          'Enter',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Escape',
          ' ',
          'r',
          'R',
        ].includes(event.key)
      )
        return
      event.preventDefault()
      if (event.key === 'Enter') {
        selected = index(Math.floor(NX / 2), Math.floor(NY / 2))
        target = [pos[selected * 3], pos[selected * 3 + 1], pos[selected * 3 + 2] + 0.3]
        canvas.dataset.grabbed = 'true'
        status('Centre of the fabric grabbed. Use the arrow keys to pull; Escape releases it.')
      }
      if (event.key === 'Escape') release()
      if (event.key === ' ') sendGust()
      if (event.key.toLowerCase() === 'r') reset()
      if (selected >= 0 && event.key.startsWith('Arrow')) {
        if (event.key === 'ArrowLeft') target[0] = Math.max(-4.2, target[0] - 0.2)
        if (event.key === 'ArrowRight') target[0] = Math.min(4.2, target[0] + 0.2)
        if (event.key === 'ArrowUp') target[1] = Math.min(3.1, target[1] + 0.2)
        if (event.key === 'ArrowDown') target[1] = Math.max(-3.2, target[1] - 0.2)
      }
      if (reduced() || canvas.dataset.playing === 'false') {
        anchor()
        solve()
        old.set(pos)
      }
      wake()
    })
    document.querySelectorAll('[data-form]').forEach((button) =>
      on(button, 'click', () => {
        form = button.dataset.form
        document
          .querySelectorAll('[data-form]')
          .forEach((node) => node.setAttribute('aria-pressed', String(node === button)))
        reset()
        status(`${button.textContent} anchors. Grab the fabric to feel the difference.`)
      }),
    )
    document.querySelectorAll('[data-colour]').forEach((button) =>
      on(button, 'click', () => {
        colour = Number(button.dataset.colour)
        document
          .querySelectorAll('[data-colour]')
          .forEach((node) => node.setAttribute('aria-pressed', String(node === button)))
        repaint()
        status(`${button.textContent.trim()} print, on the same moving fabric.`)
      }),
    )
    on($('#words'), 'input', repaint)
    for (const id of ['wind', 'tension'])
      on($('#' + id), 'input', (event) => {
        const value = Number(event.target.value) / 100
        $('#' + id + '-value').value = `${Math.round(value * 100)}%`
        if (id === 'wind') wind = value
        else tension = value
        if (!canvas.dataset.playing || canvas.dataset.playing === 'false') {
          solve()
          old.set(pos)
        }
        wake()
      })
    on($('[data-gust]'), 'click', sendGust)
    on($('[data-reset]'), 'click', () => {
      reset()
      status('The fabric is reset. Your print and words are preserved.')
    })
    repaint()
    reset()
    return {
      resize(w, h) {
        width = w
        height = h
        aspect = w / h
        distance = Math.max(8.7, 10.1 / aspect)
        const near = 0.1,
          far = 50,
          A = (far + near) / (near - far),
          B = (2 * far * near) / (near - far)
        projection.fill(0)
        projection[0] = F / aspect
        projection[5] = F
        projection[10] = A
        projection[11] = -1
        projection[13] = F * 0.25
        projection[14] = -distance * A + B
        projection[15] = distance
      },
      frame(_time, dt, playing) {
        if (disposed) return
        if (playing) {
          accumulator += Math.min(dt, 1 / 30)
          let steps = 0
          while (accumulator >= 1 / 90 && steps < 3) {
            simulate(1 / 90)
            accumulator -= 1 / 90
            steps++
          }
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, width, height)
        gl.disable(gl.DEPTH_TEST)
        gl.useProgram(backgroundProgram)
        gl.bindVertexArray(bgVao)
        gl.uniform1f(aspectUniform, aspect)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        gl.enable(gl.DEPTH_TEST)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.disable(gl.CULL_FACE)
        updateNormals()
        gl.bindVertexArray(vao)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos)
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, normals)
        gl.useProgram(clothProgram)
        gl.uniformMatrix4fv(projectionUniform, false, projection)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform1i(printUniform, 0)
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
      },
      destroy() {
        disposed = true
        buffers.forEach((buffer) => gl.deleteBuffer(buffer))
        gl.deleteTexture(texture)
        gl.deleteVertexArray(vao)
        gl.deleteVertexArray(bgVao)
        gl.deleteProgram(clothProgram)
        gl.deleteProgram(backgroundProgram)
      },
    }
  })
})()
