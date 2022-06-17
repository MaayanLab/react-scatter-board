import React, { useEffect } from 'react'
import { Html } from '@react-three/drei'

export default function THREEScatterPlotTooltip({ name, threeRef }) {
  const ref = React.useRef()
  useEffect(() => {
    if (!threeRef.current || !ref.current) return
    let groupNode = threeRef.current.three.scene.getObjectByName(name)
    const listener = (closestPoint) => {
      if (closestPoint !== undefined && closestPoint.label) {
        groupNode.position.x = closestPoint.x
        groupNode.position.y = closestPoint.y
        groupNode.position.z = closestPoint.z
        ref.current.textContent = closestPoint.label
        ref.current.style.display = 'block'
      } else {
        ref.current.style.display = 'none'
      }
    }
    threeRef.current.events.on('hover', listener)
    return () => {
      threeRef.current.events.off('hover', listener)
    }
  }, [ref.current, threeRef.current])
  return (
    <Html
      ref={ref}
      name={name}
      zIndexRange={[5, 0]}
      style={{
        display: 'none',
        backgroundColor: 'lightgrey',
        borderRadius: 5,
        opacity: 0.9,
        padding: 5,
        pointerEvents: 'none',
        whiteSpace: 'pre',
      }}
      position={[0, 0, 0]}
    />
  )
}