/* Rayab Studio — dependency-free WebGL and lifecycle utilities. MIT licensed. */
;(() => {
  'use strict'
  const $ = (selector) => document.querySelector(selector)
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
  // Inline vectors keep the offline edition independent of icon fonts.
  function icons(root) {
    const paths = {
      '↗': 'M3 13 13 3M3 3h10v10',
      '↖': 'M13 13 3 3M3 13V3h10',
      '↙': 'M13 3 3 13M3 3v10h10',
      '↓': 'M8 2v12M3 9l5 5 5-5',
      '↺': 'M3 7a5 5 0 1 1 0 4M3 2v5h5',
      '↝': 'M1 8c3-9 5 9 8 0s5 0 6 0M11 4l4 4-4 4',
      Ⅱ: 'M5 3v10M11 3v10',
      '✳': 'M8 1v14M1 8h14M3 3l10 10M3 13 13 3',
      '⛶': 'M6 2H2v4M10 2h4v4M2 10v4h4M14 10v4h-4',
      '◎': 'M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0M10 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
    }
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const nodes = []
    while (walk.nextNode()) nodes.push(walk.currentNode)
    for (const node of nodes) {
      if (!/[↗↖↙↓↺↝Ⅱ✳⛶◎]/u.test(node.nodeValue)) continue
      const fragment = document.createDocumentFragment()
      for (const character of node.nodeValue) {
        if (!paths[character]) {
          fragment.append(character)
          continue
        }
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('viewBox', '0 0 16 16')
        svg.setAttribute('width', '14')
        svg.setAttribute('height', '14')
        svg.setAttribute('fill', 'none')
        svg.setAttribute('stroke', 'currentColor')
        svg.setAttribute('stroke-width', '1.2')
        svg.setAttribute('aria-hidden', 'true')
        svg.setAttribute('focusable', 'false')
        const path = document.createElementNS(svg.namespaceURI, 'path')
        path.setAttribute('d', paths[character])
        svg.append(path)
        fragment.append(svg)
      }
      node.replaceWith(fragment)
    }
  }
  document.querySelectorAll('a,button,summary,.control-title > span:last-child').forEach(icons)
  const status = (message) => {
    $('[role="status"]').textContent = message
  }
  const save = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }
  const program = (gl, vertex, fragment) => {
    const shaders = []
    const result = gl.createProgram()
    try {
      for (const [type, code] of [
        [gl.VERTEX_SHADER, vertex],
        [gl.FRAGMENT_SHADER, fragment],
      ]) {
        const shader = gl.createShader(type)
        shaders.push(shader)
        gl.shaderSource(shader, code)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw new Error(gl.getShaderInfoLog(shader))
        gl.attachShader(result, shader)
      }
      gl.linkProgram(result)
      if (!gl.getProgramParameter(result, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(result))
      return result
    } catch (error) {
      gl.deleteProgram(result)
      throw error
    } finally {
      shaders.forEach((shader) => gl.deleteShader(shader))
    }
  }
  const texture = (gl, source) => {
    const value = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, value)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    return value
  }
  const fullscreenVertex = `#version 300 es
    out vec2 uv;
    void main(){ vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2); uv=p; gl_Position=vec4(p*2.-1.,0.,1.); }`

  function mount(createScene) {
    const canvas = $('#art')
    const viewport = $('.viewport')
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let scene,
      gl,
      raf = 0,
      last = 0,
      elapsed = 0,
      visible = true,
      disposed = false
    let playing = !motion.matches
    let failed = false
    let dirty = true
    const removers = []
    const on = (target, event, handler, options) => {
      target.addEventListener(event, handler, options)
      removers.push(() => target.removeEventListener(event, handler, options))
    }
    function fail() {
      failed = true
      cancelAnimationFrame(raf)
      raf = 0
      $('.fallback').hidden = false
      canvas.dataset.ready = 'false'
      document.querySelectorAll('[data-gpu-control]').forEach((node) => {
        node.disabled = true
      })
      status(
        'The visual needs WebGL 2 and hardware acceleration. The complete source is still available below.',
      )
    }
    const draw = (now) => {
      raf = 0
      if (disposed || failed || !scene || !visible || document.hidden) return
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60
      last = now
      if (playing) elapsed += dt
      if (playing || dirty) {
        try {
          scene.frame(elapsed, dt, playing)
        } catch {
          fail()
          return
        }
      }
      dirty = false
      canvas.dataset.frames = String((Number(canvas.dataset.frames) || 0) + 1)
      if (playing) raf = requestAnimationFrame(draw)
    }
    const wake = () => {
      dirty = true
      if (!raf && scene && !disposed && !failed && visible && !document.hidden)
        raf = requestAnimationFrame(draw)
    }
    const refreshPlay = () => {
      const button = $('[data-play]')
      button.textContent = playing ? 'Ⅱ Pause motion' : '↗ Resume motion'
      icons(button)
      button.setAttribute('aria-pressed', String(playing))
      canvas.dataset.playing = String(playing)
    }
    try {
      gl = canvas.getContext('webgl2', {
        alpha: false,
        antialias: true,
        preserveDrawingBuffer: true,
      })
      if (!gl) throw new Error('WebGL 2 unavailable')
      scene = createScene({ gl, canvas, wake, on, reduced: () => motion.matches, status })
      canvas.dataset.ready = 'true'
      canvas.dataset.playing = String(playing)
      $('.fallback').hidden = true
      refreshPlay()
      const resize = () => {
        const rect = canvas.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        const ratio = Math.min(
          devicePixelRatio || 1,
          rect.width < 600 ? 1.5 : 1.75,
          1600 / rect.width,
        )
        canvas.width = Math.round(rect.width * ratio)
        canvas.height = Math.round(rect.height * ratio)
        scene.resize(canvas.width, canvas.height)
        wake()
      }
      const observer = new ResizeObserver(resize)
      observer.observe(canvas)
      removers.push(() => observer.disconnect())
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        last = 0
        if (!visible) {
          cancelAnimationFrame(raf)
          raf = 0
        } else wake()
      })
      intersection.observe(canvas)
      removers.push(() => intersection.disconnect())
      on(document, 'visibilitychange', () => {
        last = 0
        if (document.hidden) {
          cancelAnimationFrame(raf)
          raf = 0
        } else wake()
      })
      on(motion, 'change', () => {
        playing = !motion.matches
        refreshPlay()
        wake()
      })
      on($('[data-play]'), 'click', () => {
        playing = !playing
        last = 0
        refreshPlay()
        wake()
        status(
          playing
            ? 'Motion resumed.'
            : 'Motion paused. You can still change the composition and save a frame.',
        )
      })
      on(canvas, 'webglcontextlost', (event) => {
        event.preventDefault()
        fail()
      })
      on($('[data-capture]'), 'click', async () => {
        const button = $('[data-capture]')
        button.disabled = true
        try {
          scene.frame(elapsed, 0, false)
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
          if (!blob) throw new Error('No pixels')
          save(blob, `${document.body.dataset.experiment}-${Date.now()}.png`)
          status('Your composition is saved as a PNG. The source ZIP is a separate download.')
        } catch {
          status('The frame could not be saved. Please retry or reload the studio.')
        } finally {
          button.disabled = canvas.dataset.ready !== 'true'
        }
      })
      resize()
    } catch (error) {
      console.error('[studio]', error instanceof Error ? error.message : 'Renderer failed')
      scene?.destroy()
      scene = undefined
      fail()
    }
    on($('[data-retry]'), 'click', () => location.reload())
    on($('[data-fullscreen]'), 'click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen()
        else if (viewport.requestFullscreen) await viewport.requestFullscreen()
        else status('Fullscreen is unavailable here. The studio still works in this view.')
      } catch {
        status('Fullscreen is unavailable here. The studio still works in this view.')
      }
    })
    if (location.protocol === 'file:') {
      document.querySelectorAll('[data-home]').forEach((a) => {
        a.href = '#main'
        a.removeAttribute('target')
        a.textContent = '↖ Rayab / Source edition'
      })
      document.querySelectorAll('[data-next]').forEach((a) => {
        a.hidden = true
      })
      document.querySelectorAll('[data-source]').forEach((a) => {
        a.href = '#notes'
        a.removeAttribute('download')
        a.textContent = 'The code is yours ↙'
      })
      document.querySelectorAll('a').forEach(icons)
    }
    function destroy() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(raf)
      removers.forEach((remove) => remove())
      scene?.destroy()
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    }
    on(window, 'pagehide', (event) => {
      if (!event.persisted) destroy()
    })
    return destroy
  }
  window.RayabStudio = { $, clamp, status, save, program, texture, fullscreenVertex, mount }
})()
