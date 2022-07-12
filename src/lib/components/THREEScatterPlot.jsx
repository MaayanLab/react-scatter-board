import React from 'react'
import * as THREE from 'three'
import { shapes, useShapeMaterial } from '../shapes'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export default function THREEScatterPlot({ name, scale, is3d, data, meta, onClick }) {
  const pointsRef = React.useRef()
  const [pointsProps, setPointsProps] = React.useState({})
  const shapeMaterials = useShapeMaterial()
  React.useEffect(() => {
    if (data.length === 0 || meta.length === 0) {
      setPointsProps({})
      return
    }
    const groups = {}
    const color = new THREE.Color()
    const pointScale = (
      10 * scale
      / Math.log10(data.length)
      / Math.log(8)
      / (is3d ? 15 : 1)
    )
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
        index: [],
        labels: [],
        positions: [],
        colors: [],
        sizes: [],
      }
      groups[shape].index.push(i)
      groups[shape].labels.push(d.label)
      
      groups[shape].positions.push(d.x)
      groups[shape].positions.push(d.y)
      groups[shape].positions.push(is3d ? d.z : 0)

      color.set(d.color || '#002288')
      color.convertSRGBToLinear();
      groups[shape].colors.push(color.r)
      groups[shape].colors.push(color.g)
      groups[shape].colors.push(color.b)
      groups[shape].colors.push(d.opacity)

      groups[shape].sizes.push(pointScale * (d.size || 1.))

      groups[shape].n++
    }

    const geometries = []
    const materials = []
    const index = []
    const labels = []
    for (const shape in groups) {
      const geometry = new THREE.BufferGeometry()
      index.push(...groups[shape].index)
      labels.push(...groups[shape].labels)
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(groups[shape].positions, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(groups[shape].colors, 4))
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(groups[shape].sizes, 1))
      geometry.computeBoundingSphere()
      geometries.push(geometry)
      materials.push(shapeMaterials[shape])
    }
    const mergedGeometries = BufferGeometryUtils.mergeBufferGeometries(geometries, true)
    mergedGeometries.userData.index = index
    mergedGeometries.userData.labels = labels
    mergedGeometries.dynamic = true
    setPointsProps({ geometry: mergedGeometries, material: materials })
  }, [is3d, data])
  React.useEffect(() => {
    if (
      !pointsRef
      || !pointsRef.current
      || !meta
      || meta.length === 0
      || pointsRef.current.geometry === undefined
      || pointsRef.current.geometry.attributes === undefined
      || !('color' in pointsRef.current.geometry.attributes)
    ) return
    const geom = pointsRef.current.geometry
    const pointScale = (
      10. * scale
      / Math.log10(data.length)
      / Math.log(8)
      / (is3d ? 15 : 1)
    )
    const color = new THREE.Color()
    for (let i = 0; i < geom.userData.index.length; i++) {
      const j = geom.userData.index[i]
      const d = {...data[j], ...meta[j]}
      color.set(d.color || '#002288')
      color.convertSRGBToLinear();
      geom.attributes.color.array[(i*4) + 0] = color.r
      geom.attributes.color.array[(i*4) + 1] = color.g
      geom.attributes.color.array[(i*4) + 2] = color.b
      geom.attributes.color.array[(i*4) + 3] = d.opacity
      geom.attributes.size.array[i] = pointScale * (d.size || 1)
    }
    geom.attributes.color.needsUpdate = true
    geom.attributes.size.needsUpdate = true
  }, [pointsRef.current, scale, meta])
  // onPointerDown/onPointerUp are hacks just to emulate standard onClick
  return (
    <points
      ref={pointsRef}
      name={name}
      onPointerDown={evt => {
        const _pointerEvent = {
          state: 'down',
          timeStamp: evt.nativeEvent.timeStamp,
          clientX: evt.nativeEvent.clientX,
          clientY: evt.nativeEvent.clientY,
        }
        Object.assign(pointsRef.current, { _pointerEvent })
      }}
      onPointerUp={evt => {
        const _pointerEvent = {
          state: 'up',
          timeStamp: evt.nativeEvent.timeStamp,
          clientX: evt.nativeEvent.clientX,
          clientY: evt.nativeEvent.clientY,
        }
        if ('_pointerEvent' in pointsRef.current) {
          const _prevPointerEvent = pointsRef.current._pointerEvent
          if (
            _prevPointerEvent.state === 'down'
            && (_pointerEvent.timeStamp - _prevPointerEvent.timeStamp) < 500
            && Math.abs(_pointerEvent.clientX - _prevPointerEvent.clientX) < 5
            && Math.abs(_pointerEvent.clientY - _prevPointerEvent.clientY) < 5
          ) {
            onClick(evt)
          }
          delete pointsRef.current._pointerEvent
        }
      }}
      {...pointsProps}
    />
  )
}
