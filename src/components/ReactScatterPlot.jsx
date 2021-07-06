import React from 'react'
import { Canvas } from '@react-three/fiber'
import {
  GizmoHelper,
  GizmoViewport,
  MapControls,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from '@react-three/drei'
import useDataDimensions from '../hooks/useDataDimensions'

const THREEFog = React.lazy(() => import('./THREEFog'))
const THREEScatterPlot = React.lazy(() => import('./THREEScatterPlot'))
const THREEScatterPlotTooltip = React.lazy(() => import('./THREEScatterPlotTooltip'))

export default function ReactScatterPlot({ is3d, data, meta }) {
  const { center, size } = useDataDimensions({ is3d, data })
  return (
    <Canvas>
      <THREEScatterPlot
        name="three-scatter-points"
        is3d={is3d}
        scale={Math.max(size.x, size.y, size.z)}
        data={data}
        meta={meta}
      />
      <THREEScatterPlotTooltip
        name="three-closest-point-controller"
        points="three-scatter-points"
        is3d={is3d}
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
}
