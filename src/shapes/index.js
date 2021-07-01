import React from 'react'
import { useAsset } from 'use-asset'
import loadSvg from './loadSvg'

// shapes as react components
export const shapes = {
  circle: React.lazy(() => import('../shapes/circle.svg')),
  cross: React.lazy(() => import('../shapes/cross.svg')),
  diamond: React.lazy(() => import('../shapes/diamond.svg')),
  square: React.lazy(() => import('../shapes/square.svg')),
  star: React.lazy(() => import('../shapes/star.svg')),
  triangle: React.lazy(() => import('../shapes/triangle.svg')),
  wye: React.lazy(() => import('../shapes/wye.svg')),
}

// shapes as THREE-compatible geometries
export function useShapeGeometry() {
  return {
    circle: useAsset(loadSvg, 'shapes/circle.svg'),
    cross: useAsset(loadSvg, 'shapes/cross.svg'),
    diamond: useAsset(loadSvg, 'shapes/diamond.svg'),
    square: useAsset(loadSvg, 'shapes/square.svg'),
    star: useAsset(loadSvg, 'shapes/star.svg'),
    triangle: useAsset(loadSvg, 'shapes/triangle.svg'),
    wye: useAsset(loadSvg, 'shapes/wye.svg'),
  }
}
