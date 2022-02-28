import React from 'react'

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

import { useAsset } from 'use-asset'
import loadMaterial from '../loaders/loadMaterial'

export function useShapeMaterial() {
  return {
    circle: useAsset(loadMaterial, require('./circle.png?url-loader').default),
    cross: useAsset(loadMaterial, require('./cross.png?url-loader').default),
    diamond: useAsset(loadMaterial, require('./diamond.png?url-loader').default),
    square: useAsset(loadMaterial, require('./square.png?url-loader').default),
    star: useAsset(loadMaterial, require('./star.png?url-loader').default),
    triangle: useAsset(loadMaterial, require('./triangle.png?url-loader').default),
    wye: useAsset(loadMaterial, require('./wye.png?url-loader').default),
  }
}
