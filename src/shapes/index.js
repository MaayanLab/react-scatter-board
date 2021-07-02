import React from 'react'
import { useAsset } from 'use-asset'
import loadSvg from './loadSvg'

import circle from './circle.svg?url-loader'
import cross from './cross.svg?url-loader'
import diamond from './diamond.svg?url-loader'
import square from './square.svg?url-loader'
import star from './star.svg?url-loader'
import triangle from './triangle.svg?url-loader'
import wye from './wye.svg?url-loader'

// shapes as react components
export const shapes = {
  circle: React.lazy(() => import('./circle.svg?svgr')),
  cross: React.lazy(() => import('./cross.svg?svgr')),
  diamond: React.lazy(() => import('./diamond.svg?svgr')),
  square: React.lazy(() => import('./square.svg?svgr')),
  star: React.lazy(() => import('./star.svg?svgr')),
  triangle: React.lazy(() => import('./triangle.svg?svgr')),
  wye: React.lazy(() => import('./wye.svg?svgr')),
}

// shapes as THREE-compatible geometries
export function useShapeGeometry() {
  return {
    circle: useAsset(loadSvg, circle),
    cross: useAsset(loadSvg, cross),
    diamond: useAsset(loadSvg, diamond),
    square: useAsset(loadSvg, square),
    star: useAsset(loadSvg, star),
    triangle: useAsset(loadSvg, triangle),
    wye: useAsset(loadSvg, wye),
  }
}
