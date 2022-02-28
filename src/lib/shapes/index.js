import React from 'react'

const rcs = {
  circle: require('./circle.png').default,
  cross: require('./cross.png').default,
  diamond: require('./diamond.png').default,
  square: require('./square.png').default,
  star: require('./star.png').default,
  triangle: require('./triangle.png').default,
  wye: require('./wye.png').default,
}

function ImageFactory(src) {
  function Image({ style, ...props }) {
    return (
      <img
        src={src}
        style={{ filter: 'invert(100%)', ...style }}
        {...props}
      />
    )
  }
  return Image
}

export const shapes = {}
for (const shape in rcs) {
  shapes[shape] = ImageFactory(rcs[shape])
}

import { useAsset } from 'use-asset'
import loadMaterial from '../loaders/loadMaterial'

export function useShapeMaterial() {
  const materials = {}
  for (const shape in rcs) {
    materials[shape] = useAsset(loadMaterial, rcs[shape])
  }
  return materials
}
