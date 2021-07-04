import React from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import useFrameSlow from '../hooks/useFrameSlow'

export default function THREEScatterPlotTooltip({ is3d, name, points }) {
  const ref = React.useRef()
  let point3 = new THREE.Vector3()
  let point2 = new THREE.Vector2()
  useFrameSlow(0.1, ({ scene, camera, mouse }, delta) => {
    // get relevant nodes from scene
    let groupNode = scene.getObjectByName(name)
    let pointsNode = scene.getObjectByName(points)
    if (pointsNode === undefined || groupNode === undefined) return
    if (pointsNode.geometry === undefined || pointsNode.geometry.attributes === undefined) return
    // actually test points
    const pointPositions = pointsNode.geometry.attributes.position.array
    let closestPoint = undefined
    let closestDist = undefined
    let i = 0
    while (pointPositions[i] !== undefined) {
      let pointIndex = (i/3)|0
      const [x, y, z] = [pointPositions[i++], pointPositions[i++], pointPositions[i++]]
      point3.set(x, y, z)
      point3.project(camera)
      point2.set(point3.x, point3.y)
      const dist = point2.distanceToSquared(mouse)
      if (dist < Math.min(1.0, 1 / (camera.zoom * camera.zoom * (is3d ? 25 : 1)))
          && (closestDist === undefined || dist < closestDist)) {
        closestPoint = {
          index: pointIndex,
          x, y, z
        }
        closestDist = dist
      }
    }
    // update
    if (closestPoint !== undefined && pointsNode.geometry.userData.labels[closestPoint.index]) {
      groupNode.position.x = closestPoint.x
      groupNode.position.y = closestPoint.y
      groupNode.position.z = closestPoint.z
      ref.current.textContent = pointsNode.geometry.userData.labels[closestPoint.index]
      ref.current.style.display = 'block'
    } else {
      ref.current.style.display = 'none'
    }
  })
  return (
    <Html
      ref={ref}
      name={name}
      style={{
        backgroundColor: 'lightgrey',
        borderRadius: 5,
        opacity: 0.9,
        padding: 5,
        pointerEvents: 'none',
        whiteSpace: 'pre',
      }}
      position={[0,0,0]}
    />
  )
}