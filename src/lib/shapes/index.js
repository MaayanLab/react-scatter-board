import React from 'react'
import circle from './circle.png'
import cross from './cross.png'
import diamond from './diamond.png'
import square from './square.png'
import star from './star.png'
import triangle from './triangle.png'
import wye from './wye.png'
const rcs = {
  circle,
  cross,
  diamond,
  square,
  star,
  triangle,
  wye,
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
