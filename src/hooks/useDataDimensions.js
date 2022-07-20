import React from 'react'
import * as THREE from 'three'

export default function useDataDimensions({ is3d, data }) {
  return React.useMemo(() => {
    let m = { min: {}, max: {}, mu: {}, std: {}, span: {}, center: {} }
    const dims = ['x', 'y']
    if (is3d) dims.push('z')
    for (const datum of data) {
      for (const dim of dims) {
        m.min[dim] = m.min[dim] === undefined ? datum[dim] : Math.min(m.min[dim], datum[dim])
        m.max[dim] = m.max[dim] === undefined ? datum[dim] : Math.max(m.max[dim], datum[dim])
        m.mu[dim] = m.mu[dim] === undefined ? datum[dim] : m.mu[dim] + datum[dim]
        m.std[dim] = m.std[dim] === undefined ? datum[dim] : m.std[dim] + datum[dim]*datum[dim]
      }
    }
    for (const dim of dims) {
      m.span[dim] = m.max[dim] - m.min[dim]
      m.center[dim] = ((m.max[dim] - m.min[dim]) / 2) | 0
      m.mu[dim] = m.mu[dim] / data.length
      m.std[dim] = Math.sqrt(m.std[dim])
    }
    return {
      center: new THREE.Vector3(m.center.x, m.center.y, is3d ? m.center.z : 1),
      size: new THREE.Vector3(m.span.x, m.span.y, is3d ? m.span.z : 1),
      mu: m.mu, std: m.std,
    }
  }, [is3d, data])
}