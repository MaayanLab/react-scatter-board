import React from 'react'
import * as THREE from 'three'
import { shapes, useShapeMaterial } from '../shapes'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export default function THREEScatterPlot({ name, scale, mu, std, is3d, data, meta }) {
  const shapeMaterials = useShapeMaterial()
  if (data.length === 0 || meta.length === 0) return null
  const { geometry, material } = React.useMemo(() => {
    const groups = {}
    const color = new THREE.Color()
    const pointScale = scale
    const max_std = Math.max(std.x, std.y, std.z)
    for (let i = 0; i < data.length; i++) {
      const d = { ...data[i], ...meta[i] }
      let shape
      if (!(d.shape in shapes)) {
        console.warn(`Invalid shape: ${d.shape}`)
        shape = 'circle'
      } else {
        shape = d.shape
      }
      if (!(shape in groups)) groups[shape] = {
        n: 0,
        labels: [],
        positions: [],
        colors: [],
        sizes: [],
      }
      groups[shape].labels.push(d.label)
      
      groups[shape].positions.push((d.x - mu.x)/max_std)
      groups[shape].positions.push((d.y - mu.y)/max_std)
      groups[shape].positions.push(is3d ? ((d.z - mu.z)/max_std) : 0)

      color.set(d.color || '#002288')
      groups[shape].colors.push(color.r)
      groups[shape].colors.push(color.g)
      groups[shape].colors.push(color.b)
      groups[shape].colors.push(d.opacity)

      groups[shape].sizes.push(pointScale * (d.size || 1))

      groups[shape].n++
    }

    const geometries = []
    const materials = []
    const labels = []
    for (const shape in groups) {
      const geometry = new THREE.BufferGeometry()
      labels.push(...groups[shape].labels)
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(groups[shape].positions, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(groups[shape].colors, 4))
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(groups[shape].sizes, 1))
      geometry.computeBoundingSphere()
      geometries.push(geometry)
      materials.push(shapeMaterials[shape])
    }
    const mergedGeometries = BufferGeometryUtils.mergeBufferGeometries(geometries, true)
    mergedGeometries.userData.labels = labels
    return { geometry: mergedGeometries, material: materials }
  }, [is3d, scale, data, meta])
  return (
    <points
      name={name}
      geometry={geometry}
      material={material}
    />
  )
}
