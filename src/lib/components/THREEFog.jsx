import React from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

export default function THREEFog({ color, near, far }) {
  const { scene } = useThree()
  React.useEffect(() => {
    if (!scene) return
    scene.fog = new THREE.Fog(color, near, far)
    return () => scene.fog = null
  }, [scene, color, near, far])
  return null
}
