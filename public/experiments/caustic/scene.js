/* Caustic — original GPU wave/refraction instrument by Rayab. MIT. */
;(() => {
  'use strict'
  const S = window.RayabStudio
  const { $, clamp } = S
  S.mount(({ gl, canvas, wake, on, reduced, status }) => {
    if (!gl.getExtension('EXT_color_buffer_float'))
      throw new Error('Floating-point render targets unavailable')
    const N = 256
    const waveProgram = S.program(
      gl,
      S.fullscreenVertex,
      `#version 300 es
      precision highp float;
      uniform sampler2D field; uniform vec2 source; uniform float impulse; uniform float damping;
      in vec2 uv; out vec4 result;
      void main(){
        vec2 s=1./vec2(textureSize(field,0));
        vec2 hv=texture(field,uv).rg;
        float lap=texture(field,uv+vec2(s.x,0)).r+texture(field,uv-vec2(s.x,0)).r
          +texture(field,uv+vec2(0,s.y)).r+texture(field,uv-vec2(0,s.y)).r-4.*hv.r;
        float v=(hv.g+lap*.24)*damping;
        float d=distance(uv,source);
        float h=hv.r+v+impulse*exp(-d*d/0.00035);
        float edge=smoothstep(0.,.028,min(min(uv.x,uv.y),min(1.-uv.x,1.-uv.y)));
        result=vec4(clamp(h,-3.,3.)*edge,v*edge,0.,1.);
      }`,
    )
    const displayProgram = S.program(
      gl,
      S.fullscreenVertex,
      `#version 300 es
      precision highp float;
      uniform sampler2D field; uniform sampler2D poster;
      uniform float time; uniform float bend; uniform float split; uniform int palette;
      uniform vec2 light; uniform float aspect;
      in vec2 uv; out vec4 result;
      float height(vec2 p){
        float h=texture(field,clamp(p,0.,1.)).r;
        return h*.07+.008*sin(p.x*14.+sin(p.y*8.)+time*.5)*cos(p.y*13.-time*.3);
      }
      void main(){
        vec2 e=vec2(.0025,0.);
        vec2 slope=vec2(height(uv+e.xy)-height(uv-e.xy),height(uv+e.yx)-height(uv-e.yx))/.005;
        vec2 offset=clamp(slope,vec2(-1.5),vec2(1.5))*(.012+bend*.055);
        vec2 q=uv+offset;
        vec2 chroma=offset*(.01+split*.5)+vec2(.0006*split,0.);
        vec3 colour=vec3(texture(poster,q+chroma).r,texture(poster,q).g,texture(poster,q-chroma).b);
        vec3 normal=normalize(vec3(-slope*1.3,1.));
        vec3 lamp=normalize(vec3((light-.5)*2.,1.4));
        float spec=pow(max(dot(reflect(-lamp,normal),vec3(0.,0.,1.)),0.),70.);
        vec2 p=(uv-.5)*vec2(aspect,1.)*4.;
        float flow=sin(p.x*2.+sin(p.y*2.8+time*.18)+time*.18)*cos(p.y*2.-sin(p.x*1.8-time*.13));
        float caustic=pow(max(0.,1.-abs(flow+height(uv)*12.)),22.);
        vec3 tint=palette==0?vec3(.22,.66,.84):(palette==1?vec3(1.,.24,.11):vec3(.72,.38,.14));
        colour*=.86+.14*max(dot(normal,lamp),0.);
        colour+=tint*caustic*.32+spec*vec3(.84,.92,.75)*.72;
        float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
        colour+=(grain-.5)*.018;
        float vignette=1.-.2*length((uv-.5)*1.3);
        result=vec4(colour*vignette,1.);
      }`,
    )
    const uniforms = (program, names) =>
      Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(program, name)]))
    const wu = uniforms(waveProgram, ['field', 'source', 'impulse', 'damping'])
    const du = uniforms(displayProgram, [
      'field',
      'poster',
      'time',
      'bend',
      'split',
      'palette',
      'light',
      'aspect',
    ])
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const targets = []
    for (let i = 0; i < 2; i++) {
      const texture = gl.createTexture(),
        framebuffer = gl.createFramebuffer()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, N, N, 0, gl.RGBA, gl.HALF_FLOAT, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
        throw new Error('Wave framebuffer unavailable')
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      targets.push({ texture, framebuffer })
    }
    let current = 0,
      width = 1,
      height = 1,
      palette = 0,
      bend = 0.65,
      split = 0.45,
      damping = 0.987
    let posterTexture,
      pending = null,
      pointerDown = false,
      light = [0.7, 0.8],
      accumulator = 0,
      disposed = false
    const poster = document.createElement('canvas')
    const context = poster.getContext('2d')
    if (!context) throw new Error('Poster canvas unavailable')
    function repaint() {
      poster.width = 1536
      poster.height = Math.round((1536 * height) / width)
      const w = poster.width,
        h = poster.height
      const colours = [
        ['#0b1721', '#e4e7d6', '#336779'],
        ['#27140f', '#ffdfbf', '#863e2c'],
        ['#e9e4d6', '#172f34', '#b8a48e'],
      ][palette]
      context.fillStyle = colours[0]
      context.fillRect(0, 0, w, h)
      context.strokeStyle = colours[2]
      context.lineWidth = 1
      for (let x = 0; x < w; x += w / 20) {
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, h)
        context.stroke()
      }
      for (let y = 0; y < h; y += w / 20) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(w, y)
        context.stroke()
      }
      context.globalAlpha = 0.38
      for (let i = 0; i < 27; i++) {
        context.beginPath()
        context.ellipse(
          w * 0.52,
          h * 0.51,
          w * (0.15 + i * 0.014),
          h * (0.12 + i * 0.012),
          -0.4,
          0,
          Math.PI * 2,
        )
        context.stroke()
      }
      context.globalAlpha = 1
      const lines = ($('#words').value.trim() || 'LIGHT / IN / MOTION.')
        .split('/')
        .map((v) => v.trim())
        .filter(Boolean)
        .slice(0, 3)
      const blockHeight = h * 0.48
      const size = Math.min(w * 0.175, blockHeight / Math.max(lines.length, 1))
      context.fillStyle = colours[1]
      context.textBaseline = 'middle'
      context.textAlign = 'center'
      for (let i = 0; i < lines.length; i++) {
        let font = size
        context.font = `900 ${font}px Arial, sans-serif`
        const measured = context.measureText(lines[i]).width
        if (measured > w * 0.84) {
          font *= (w * 0.84) / measured
          context.font = `900 ${font}px Arial, sans-serif`
        }
        context.fillText(lines[i], w * 0.5, h * 0.5 + (i - (lines.length - 1) / 2) * size * 1.04)
      }
      context.textAlign = 'left'
      context.font = `${Math.round(w * 0.009)}px monospace`
      context.fillStyle = colours[2]
      context.fillText('RAYAB / OPTICAL STUDY 009', w * 0.08, h * 0.18)
      context.fillText('A SURFACE THAT REMEMBERS', w * 0.08, h * 0.84)
      if (posterTexture) gl.deleteTexture(posterTexture)
      posterTexture = S.texture(gl, poster)
      wake()
    }
    function step(source = [-2, -2], impulse = 0) {
      gl.useProgram(waveProgram)
      gl.bindVertexArray(vao)
      gl.bindFramebuffer(gl.FRAMEBUFFER, targets[1 - current].framebuffer)
      gl.viewport(0, 0, N, N)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, targets[current].texture)
      gl.uniform1i(wu.field, 0)
      gl.uniform2fv(wu.source, source)
      gl.uniform1f(wu.impulse, impulse)
      gl.uniform1f(wu.damping, damping)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      current = 1 - current
    }
    function disturb(x = 0.5, y = 0.5, amount = 0.65) {
      pending = { point: [x, y], amount }
      if (reduced() || canvas.dataset.playing === 'false') {
        step(pending.point, pending.amount)
        for (let i = 0; i < 18; i++) step()
        pending = null
      }
      wake()
    }
    function reset() {
      for (const target of targets) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
      }
      step([0.32, 0.55], 1.1)
      for (let i = 0; i < 28; i++) step()
      step([0.7, 0.35], -0.8)
      for (let i = 0; i < 14; i++) step()
      accumulator = 0
      wake()
    }
    const position = (event) => {
      const r = canvas.getBoundingClientRect()
      return [
        clamp((event.clientX - r.left) / r.width, 0, 1),
        clamp(1 - (event.clientY - r.top) / r.height, 0, 1),
      ]
    }
    on(canvas, 'pointerdown', (event) => {
      if (pointerDown) return
      pointerDown = true
      canvas.setPointerCapture(event.pointerId)
      light = position(event)
      disturb(...light, 0.9)
      canvas.focus({ preventScroll: true })
    })
    on(canvas, 'pointermove', (event) => {
      light = position(event)
      if (pointerDown) disturb(...light, 0.13)
      wake()
    })
    const release = () => {
      pointerDown = false
    }
    on(canvas, 'pointerup', release)
    on(canvas, 'pointercancel', release)
    on(canvas, 'lostpointercapture', release)
    on(canvas, 'keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'r', 'R'].includes(event.key))
        return
      event.preventDefault()
      if (event.key === 'ArrowLeft') light[0] = clamp(light[0] - 0.05, 0, 1)
      if (event.key === 'ArrowRight') light[0] = clamp(light[0] + 0.05, 0, 1)
      if (event.key === 'ArrowUp') light[1] = clamp(light[1] + 0.05, 0, 1)
      if (event.key === 'ArrowDown') light[1] = clamp(light[1] - 0.05, 0, 1)
      if (event.key === ' ') disturb(...light, 1.1)
      if (event.key.toLowerCase() === 'r') reset()
      wake()
    })
    document.querySelectorAll('[data-preset]').forEach((button) =>
      on(button, 'click', () => {
        palette = Number(button.dataset.preset)
        document
          .querySelectorAll('[data-preset]')
          .forEach((node) => node.setAttribute('aria-pressed', String(node === button)))
        repaint()
        disturb(0.5, 0.5, 0.8)
        status(`${button.textContent} atmosphere. Your words stay on the surface.`)
      }),
    )
    for (const id of ['bend', 'split', 'decay'])
      on($('#' + id), 'input', (event) => {
        const value = Number(event.target.value) / 100
        $('#' + id + '-value').value = `${Math.round(value * 100)}%`
        if (id === 'bend') bend = value
        if (id === 'split') split = value
        if (id === 'decay') damping = 0.96 + value * 0.039
        wake()
      })
    on($('#words'), 'input', repaint)
    on($('[data-drop]'), 'click', () => {
      disturb(0.3 + Math.random() * 0.4, 0.3 + Math.random() * 0.4, 1.2)
      status('A new ripple, travelling through the surface.')
    })
    on($('[data-reset]'), 'click', () => {
      reset()
      status('The waves are reset. Your atmosphere and words are preserved.')
    })
    reset()
    return {
      resize(w, h) {
        width = w
        height = h
        repaint()
      },
      frame(time, dt, playing) {
        if (disposed) return
        if (playing) {
          accumulator += Math.min(dt, 1 / 30)
          let steps = 0
          while (accumulator >= 1 / 60 && steps < 3) {
            step(pending?.point, pending?.amount || 0)
            pending = null
            accumulator -= 1 / 60
            steps++
          }
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, width, height)
        gl.useProgram(displayProgram)
        gl.bindVertexArray(vao)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, targets[current].texture)
        gl.uniform1i(du.field, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, posterTexture)
        gl.uniform1i(du.poster, 1)
        gl.uniform1f(du.time, time)
        gl.uniform1f(du.bend, bend)
        gl.uniform1f(du.split, split)
        gl.uniform1i(du.palette, palette)
        gl.uniform2fv(du.light, light)
        gl.uniform1f(du.aspect, width / height)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      },
      destroy() {
        disposed = true
        targets.forEach((t) => {
          gl.deleteTexture(t.texture)
          gl.deleteFramebuffer(t.framebuffer)
        })
        gl.deleteTexture(posterTexture)
        gl.deleteProgram(waveProgram)
        gl.deleteProgram(displayProgram)
        gl.deleteVertexArray(vao)
      },
    }
  })
})()
