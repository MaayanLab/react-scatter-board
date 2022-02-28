import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import useFrameSlow from '../hooks/useFrameSlow';
export default function THREEScatterPlotTooltip(_ref) {
  var is3d = _ref.is3d,
      name = _ref.name,
      points = _ref.points;
  var ref = React.useRef();
  var point3 = new THREE.Vector3();
  var point2 = new THREE.Vector2();
  useFrameSlow(0.1, function (_ref2, delta) {
    var scene = _ref2.scene,
        camera = _ref2.camera,
        mouse = _ref2.mouse;
    // get relevant nodes from scene
    var groupNode = scene.getObjectByName(name);
    var pointsNode = scene.getObjectByName(points);
    if (pointsNode === undefined || groupNode === undefined) return;
    if (pointsNode.geometry === undefined || pointsNode.geometry.attributes === undefined || !('position' in pointsNode.geometry.attributes)) return; // actually test points

    var pointPositions = pointsNode.geometry.attributes.position.array;
    var closestPoint = undefined;
    var closestDist = undefined;
    var i = 0;

    while (pointPositions[i] !== undefined) {
      var pointIndex = i / 3 | 0;
      var _ref3 = [pointPositions[i++], pointPositions[i++], pointPositions[i++]],
          x = _ref3[0],
          y = _ref3[1],
          z = _ref3[2];
      point3.set(x, y, z);
      point3.project(camera);
      point2.set(point3.x, point3.y);
      var dist = point2.distanceToSquared(mouse);

      if (dist < Math.min(1.0, 1 / (camera.zoom * camera.zoom * (is3d ? 25 : 1))) && (closestDist === undefined || dist < closestDist)) {
        closestPoint = {
          index: pointIndex,
          x: x,
          y: y,
          z: z
        };
        closestDist = dist;
      }
    } // update


    if (closestPoint !== undefined && pointsNode.geometry.userData.labels[closestPoint.index]) {
      groupNode.position.x = closestPoint.x;
      groupNode.position.y = closestPoint.y;
      groupNode.position.z = closestPoint.z;
      ref.current.textContent = pointsNode.geometry.userData.labels[closestPoint.index];
      ref.current.style.display = 'block';
    } else {
      ref.current.style.display = 'none';
    }
  });
  return /*#__PURE__*/React.createElement(Html, {
    ref: ref,
    name: name,
    zIndexRange: [5, 0],
    style: {
      display: 'none',
      backgroundColor: 'lightgrey',
      borderRadius: 5,
      opacity: 0.9,
      padding: 5,
      pointerEvents: 'none',
      whiteSpace: 'pre'
    },
    position: [0, 0, 0]
  });
}