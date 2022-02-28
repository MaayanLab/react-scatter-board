import React from 'react'
import * as THREE from 'three'

export default function useDataDimensions({ is3d, data }) {
  return React.useMemo(() => {
    let minX, minY, minZ,
      maxX, maxY, maxZ
    for (const { x, y, z } of data) {
      minX = minX === undefined ? x : Math.min(minX, x)
      maxX = maxX === undefined ? x : Math.max(maxX, x)
      minY = minY === undefined ? y : Math.min(minY, y)
      maxY = maxY === undefined ? y : Math.max(maxY, y)
      if (is3d === true) {
        minZ = minZ === undefined ? z : Math.min(minZ, z)
        maxZ = maxZ === undefined ? z : Math.max(maxZ, z)
      }
    }
    let spanX, spanY, spanZ
    spanX = maxX - minX
    spanY = maxY - minY
    if (is3d) spanZ = maxZ - minZ
    let centerX, centerY, centerZ
    centerX = ((maxX - minX) / 2) | 0
    centerY = ((maxY - minY) / 2) | 0
    if (is3d === true) {
      centerZ = ((maxZ - minZ) / 2) | 0
    }
    return {
      center: new THREE.Vector3(centerX, centerY, is3d ? centerZ : 1),
      size: new THREE.Vector3(spanX, spanY, is3d ? spanZ : 1),
    }
  }, [is3d, data])
}