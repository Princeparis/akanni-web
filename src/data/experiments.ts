export const experiments = [
  {
    slug: 'flow-field',
    number: '01',
    title: 'Field notes',
    medium: 'Generative drawing',
    description: 'Hundreds of particles. One invisible field. Draw with forces instead of lines.',
    introduction:
      'A drawing instrument with a mind of its own. Let the particles wander, move through the field, and discover a composition that only exists once.',
    interaction:
      'Move your pointer or drag a finger across the canvas to bend the current. Change the field, then save a frame.',
    principle:
      'Each particle samples a direction from a continuous trigonometric field. Small changes in position create neighbouring paths that flow together. A gentle repulsive force lets your pointer interrupt that order. The canvas keeps a fading memory of every path.',
    equation: 'θ = sin(x · scale + t) + cos(y · scale − t)',
    code: 'const angle = Math.sin(x * scale + time)\n  + Math.cos(y * scale - time)\nx += Math.cos(angle * Math.PI) * speed\ny += Math.sin(angle * Math.PI) * speed',
    concepts: ['Vector fields', 'Particle advection', 'Canvas compositing'],
  },
  {
    slug: 'moire',
    number: '02',
    title: 'Between the lines',
    medium: 'Optical interference',
    description: 'Simple circles make surprisingly complex things when they disagree.',
    introduction:
      'An optical instrument made from two families of concentric circles. No textures, no images. Just lines, distance, and the patterns in between.',
    interaction:
      'Move or drag to reposition the second set of rings. Adjust spacing and separation to find new interference patterns.',
    principle:
      'Moiré patterns emerge when two repeating structures overlap with a slight difference in position. Your eye reads their alternating dark and light regions as larger waves. The apparent depth is an interference effect; every mark here is a flat circle.',
    equation: 'rₙ = n · spacing;  centre₂ = centre₁ + offset',
    code: 'for (let radius = spacing; radius < diagonal; radius += spacing) {\n  context.beginPath()\n  context.arc(centerX, centerY, radius, 0, Math.PI * 2)\n  context.stroke()\n}',
    concepts: ['Interference', 'Spatial frequency', 'Emergent geometry'],
  },
  {
    slug: 'spring-grid',
    number: '03',
    title: 'Soft systems',
    medium: 'Interactive physics',
    description: 'A quiet grid that stretches, ripples, and finds its way back home.',
    introduction:
      'A small material study. Every point has a home and a little inertia. Disturb the grid and watch a simple physical rule become something almost tactile.',
    interaction:
      'Move or drag to pull the points toward you. Tap or click to send a ripple through the grid. Tune its stiffness and damping.',
    principle:
      'Each point is attached to its original position by a virtual spring. Hooke’s law pulls it home; damping removes energy over time. Velocity is integrated in small time steps, so the same system can feel soft, bouncy, or almost rigid.',
    equation: 'force = −stiffness · displacement − damping · velocity',
    code: 'const acceleration = (home - position) * stiffness\nvelocity += acceleration * deltaTime\nvelocity *= Math.exp(-damping * deltaTime)\nposition += velocity * deltaTime',
    concepts: ['Hooke’s law', 'Damped oscillation', 'Numerical integration'],
  },
] as const

export type ExperimentSlug = (typeof experiments)[number]['slug']
