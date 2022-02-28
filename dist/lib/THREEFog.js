import React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
export default function THREEFog(_ref) {
  var color = _ref.color,
      near = _ref.near,
      far = _ref.far;

  var _useThree = useThree(),
      scene = _useThree.scene;

  React.useEffect(function () {
    if (!scene) return;
    scene.fog = new THREE.Fog(color, near, far);
    return function () {
      return scene.fog = null;
    };
  }, [scene, color, near, far]);
  return null;
}