import React, { useEffect } from 'react'
import * as THREE from 'three'
import EventEmitter from 'events'
import { Canvas, useThree } from '@react-three/fiber'
import {
  GizmoHelper,
  GizmoViewport,
  MapControls,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from '@react-three/drei'
import useDataDimensions from '../hooks/useDataDimensions'
import useFrameSlow from '../hooks/useFrameSlow'

const THREEFog = React.lazy(() => import('./THREEFog'))
const THREEScatterPlot = React.lazy(() => import('./THREEScatterPlot'))
const THREEScatterPlotTooltip = React.lazy(() => import('./THREEScatterPlotTooltip'))

const THREERef = React.forwardRef(({ is3d, points, onClick, onHover }, ref) => {
  ref.current = {
    three: useThree(),
    events: new EventEmitter(),
    closestPoint: undefined,
  }
  // maintain closestPoint
  let point3 = new THREE.Vector3()
  let point2 = new THREE.Vector2()
  useFrameSlow(0.1, ({ scene, camera, mouse }, delta) => {
    // get relevant nodes from scene
    let pointsNode = scene.getObjectByName(points)
    if (pointsNode === undefined) return
    if (pointsNode.geometry === undefined
      || pointsNode.geometry.attributes === undefined
      || !('position' in pointsNode.geometry.attributes)) return
    // actually test points
    const pointPositions = pointsNode.geometry.attributes.position.array
    let closestPoint = undefined
    let closestDist = undefined
    let i = 0
    while (pointPositions[i] !== undefined) {
      let pointIndex = (i / 3) | 0
      const [x, y, z] = [pointPositions[i++], pointPositions[i++], pointPositions[i++]]
      point3.set(x, y, z)
      point3.project(camera)
      point2.set(point3.x, point3.y)
      const dist = point2.distanceToSquared(mouse)
      if (dist < Math.min(1.0, 1 / (camera.zoom * camera.zoom * (is3d ? 25 : 1)))
        && (closestDist === undefined || dist < closestDist)) {
        closestPoint = {
          index: pointIndex,
          label: pointsNode.geometry.userData.labels[pointIndex],
          x, y, z
        }
        closestDist = dist
      }
    }
    // update
    if ((ref.current.closestPoint || {}).index !== (closestPoint||{}).index) {
      ref.current.closestPoint = closestPoint
      ref.current.events.emit('hover', closestPoint)
    }
  })
  useEffect(() => {
    if (onHover === undefined) return
    ref.current.events.on('hover', onHover)
    return () => {
      ref.current.events.off('hover', onHover)
    }
  }, [onHover])
  useEffect(() => {
    if (onClick === undefined) return
    ref.current.events.on('click', onClick)
    return () => {
      ref.current.events.off('click', onClick)
    }
  }, [onClick])
  return null
})

const ReactScatterPlot = React.forwardRef(({ is3d, scale, data, meta, onHover, onClick }, ref) => {
  const { center, size } = useDataDimensions({ is3d, data })
  if (scale === undefined) scale = Math.max(size.x, size.y, size.z)
  return (
    <Canvas>
      <THREERef
        ref={ref}
        points="three-scatter-points"
        is3d={is3d}
        onClick={onClick}
        onHover={onHover}
      />
      <THREEScatterPlot
        name="three-scatter-points"
        is3d={is3d}
        scale={scale}
        data={data}
        meta={meta}
        onClick={(evt) => {
          evt.stopPropagation()
          ref.current.events.emit('click', ref.current.closestPoint)
        }}
      />
      <THREEScatterPlotTooltip
        threeRef={ref}
        name="three-closest-point-controller"
      />
      {is3d ? (
        <>
          <THREEFog
            color="#ffffff"
            near={0}
            far={2 * Math.max(size.x, size.y, size.z)}
          />
          <PerspectiveCamera
            makeDefault
            fov={90}
            position={center}
            near={0.01}
            far={10 * Math.max(size.x, size.y, size.z)}
            zoom={1}
          />
          <OrbitControls
            enableZoom={true}
            enableDamping={true}
            dampingFactor={0.25}
            screenSpacePanning={true}
          />
          <GizmoHelper
            alignment="bottom-right" // widget alignment within scene
            margin={[80, 80]} // widget margins (X, Y)
            onTarget={evt => center}
          >
            <GizmoViewport
              axisColors={[
                '#ff8888',
                '#88ff88',
                '#8888ff'
              ]}
              labelColor="black"
            />
          </GizmoHelper>
        </>
      ) : (
        <>
          <OrthographicCamera
            makeDefault
            position={center}
            up={[0, 0, 1]}
            near={0.01}
            far={100}
            zoom={25}
          />
          <MapControls
            enableZoom={true}
            enableDamping={true}
            dampingFactor={0.25}
            screenSpacePanning={true}
            maxPolarAngle={0}
            minPolarAngle={0}
          />
        </>
      )}
    </Canvas>
  )
})

export default ReactScatterPlot
