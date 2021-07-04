import React from 'react'
import * as THREE from 'three'
import { shapes, useShapeMaterial } from '../shapes'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export default function THREEScatterPlot({ is3d, data, meta }) {
  const shapeMaterials = useShapeMaterial()
  if (data.length === 0 || meta.length === 0) return null
  const { geometry, material } = React.useMemo(() => {
    const groups = {}
    const color = new THREE.Color()
    const scale = (
      200
      / Math.log(data.length)
      / Math.log(8)
      / (is3d ? 15 : 1)
    )
    for (let i = 0;i < data.length;i++) {
      const d = { ...data[i], ...meta[i] }
      if (!(d.shape in shapes)) console.warn('Invalid shape')
      if (!(d.shape in groups)) groups[d.shape] = {
        n: 0,
        positions: [],
        colors: [],
        sizes: [],
      }
      groups[d.shape].positions.push(d.x)
      groups[d.shape].positions.push(d.y)
      groups[d.shape].positions.push(is3d ? d.z : 0)

      color.set(d.color || '#002288')
      groups[d.shape].colors.push(color.r)
      groups[d.shape].colors.push(color.g)
      groups[d.shape].colors.push(color.b)
      groups[d.shape].colors.push(d.opacity)

      groups[d.shape].sizes.push(scale * (d.size || 1))

      groups[d.shape].n++
    }

    const geometries = []
    const materials = []
    for (const shape in groups) {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(groups[shape].positions, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(groups[shape].colors, 4))
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(groups[shape].sizes, 1))
      geometry.computeBoundingSphere()
      geometries.push(geometry)
      materials.push(shapeMaterials[shape])
    }
    const mergedGeometries = BufferGeometryUtils.mergeBufferGeometries(geometries, true)
    return { geometry: mergedGeometries, material: materials }
  }, [is3d, data, meta])
  return <points geometry={geometry} material={material} />
}
